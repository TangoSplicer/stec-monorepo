import { create } from 'zustand';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getDb } from '../capacitor/db';
import { decryptPackage, encryptPackage } from '../capacitor/crypto';
import { createCasePackage, parseCasePackage, type PackageNote } from '../utils/casePackage';
import { hashAuditEvent, verifyAuditChain, type AuditVerificationResult } from '../utils/auditChain';
import { useAuthStore } from './authStore';

export interface Case { id: string; reference_number: string; title: string; case_type: string; status: string; classification: string; date_opened: string; }
export interface GraphElement { data: { id: string; label: string; type?: string; source?: string; target?: string; confidence?: number; created_at?: string; attributes?: Record<string, string>; }; }
export interface AuditLog { id: string; timestamp: string; user_id: string; action: string; target_id: string | null; details: string; prev_hash?: string | null; entry_hash?: string; }
export interface IntelNote { id: string; case_id: string; content: string; linked_nodes: string[]; created_at: string; }

interface CaseState {
  cases: Case[]; activeCaseId: string | null; graphElements: GraphElement[]; auditLogs: AuditLog[]; notes: IntelNote[];
  selectedNodeId: string | null; selectedEdgeId: string | null; connectingFromId: string | null; hiddenNodeTypes: string[];
  loadCases: () => Promise<void>; setActiveCase: (id: string) => void;
  addCase: (title: string, refNumber: string, caseType: string, classification: string) => Promise<void>;
  archiveCase: (caseId: string) => Promise<void>; restoreCase: (caseId: string) => Promise<void>;
  loadGraphElements: (caseId: string) => Promise<void>;
  addNode: (nodeType: string, label: string, confidence: number, attributes?: Record<string, string>) => Promise<void>;
  updateNode: (id: string, label: string, confidence: number, attributes: Record<string, string>) => Promise<void>;
  addEdge: (sourceId: string, targetId: string, relationshipType: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>; deleteEdge: (edgeId: string) => Promise<void>;
  setSelectedNodeId: (id: string | null) => void; setSelectedEdgeId: (id: string | null) => void; setConnectingFromId: (id: string | null) => void;
  exportActiveCase: () => Promise<void>; importCase: (encryptedData: string) => Promise<void>;
  loadAuditLogs: () => Promise<void>; verifyAuditLog: () => Promise<AuditVerificationResult>; wipeDatabase: () => Promise<void>; toggleFilter: (nodeType: string) => void;
  loadNotes: (caseId: string) => Promise<void>; addNote: (content: string, linkedNodeIds: string[]) => Promise<void>; deleteNote: (noteId: string) => Promise<void>;
}

function createId(prefix: string): string {
  if (!globalThis.crypto?.randomUUID) throw new Error('Secure identifier generation is unavailable on this device.');
  return `${prefix}_${globalThis.crypto.randomUUID()}`;
}

function requireNonEmpty(value: string, field: string, maximum = 10_000): string {
  const result = value.trim();
  if (!result || result.length > maximum) throw new Error(`Invalid ${field}.`);
  return result;
}

async function logAudit(action: string, targetId: string, details: string): Promise<void> {
  const db = await getDb();
  const previous = await db.query('SELECT entry_hash FROM audit_logs WHERE entry_hash IS NOT NULL ORDER BY timestamp DESC, id DESC LIMIT 1');
  const prevHash = typeof previous.values?.[0]?.entry_hash === 'string' ? previous.values[0].entry_hash : null;
  const event = {
    id: createId('audit'),
    timestamp: new Date().toISOString(),
    user_id: useAuthStore.getState().currentUser?.badge ?? 'SYSTEM',
    action,
    target_id: targetId,
    details,
    prev_hash: prevHash,
  };
  const entryHash = await hashAuditEvent(event);
  await db.run(
    'INSERT INTO audit_logs (id, timestamp, user_id, action, target_id, details, prev_hash, entry_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [event.id, event.timestamp, event.user_id, event.action, event.target_id, event.details, event.prev_hash, entryHash],
  );
}

function requireAdmin(): void {
  if (useAuthStore.getState().currentUser?.role !== 'admin') throw new Error('Administrator access is required for this operation.');
}

function parseNote(row: Record<string, unknown>): IntelNote {
  let linkedNodes: string[] = [];
  try {
    const raw = JSON.parse(typeof row.linked_nodes === 'string' ? row.linked_nodes : '[]');
    if (Array.isArray(raw) && raw.every((id) => typeof id === 'string')) linkedNodes = raw;
  } catch {
    // A malformed legacy note is preserved without links rather than breaking the case workspace.
  }
  return {
    id: String(row.id),
    case_id: String(row.case_id),
    content: String(row.content),
    linked_nodes: linkedNodes,
    created_at: String(row.created_at),
  };
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: [], activeCaseId: null, graphElements: [], auditLogs: [], notes: [], selectedNodeId: null, selectedEdgeId: null, connectingFromId: null, hiddenNodeTypes: [],

  loadCases: async () => {
    const db = await getDb();
    const result = await db.query('SELECT id, reference_number, title, case_type, status, classification, date_opened FROM cases ORDER BY date_opened DESC');
    set({ cases: (result.values ?? []) as Case[] });
  },

  setActiveCase: (id) => {
    set({ activeCaseId: id, hiddenNodeTypes: [], selectedNodeId: null, selectedEdgeId: null, connectingFromId: null });
    void get().loadGraphElements(id);
    void get().loadNotes(id);
  },

  addCase: async (title, refNumber, caseType, classification) => {
    const reference = requireNonEmpty(refNumber, 'case reference', 256).toUpperCase();
    const now = new Date().toISOString();
    const id = createId('case');
    const db = await getDb();
    await db.run(
      'INSERT INTO cases (id, reference_number, title, case_type, status, classification, date_opened, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, reference, requireNonEmpty(title, 'case title'), requireNonEmpty(caseType, 'case type', 128), 'active', requireNonEmpty(classification, 'classification', 128), now, now, now],
    );
    await logAudit('CREATE_CASE', id, `Created ${reference}`);
    await get().loadCases();
  },

  archiveCase: async (caseId) => {
    const db = await getDb();
    await db.run("UPDATE cases SET status = 'archived', updated_at = ? WHERE id = ?", [new Date().toISOString(), caseId]);
    await logAudit('ARCHIVE_CASE', caseId, 'Archived case');
    await get().loadCases();
  },

  restoreCase: async (caseId) => {
    const db = await getDb();
    await db.run("UPDATE cases SET status = 'active', updated_at = ? WHERE id = ?", [new Date().toISOString(), caseId]);
    await logAudit('RESTORE_CASE', caseId, 'Restored case');
    await get().loadCases();
  },

  loadGraphElements: async (caseId) => {
    const db = await getDb();
    const nodesResult = await db.query('SELECT id, label, type, confidence, created_at, attributes FROM nodes WHERE case_id = ? ORDER BY created_at ASC', [caseId]);
    const edgesResult = await db.query('SELECT id, source, target, label, created_at FROM edges WHERE case_id = ? ORDER BY created_at ASC', [caseId]);
    const nodes: GraphElement[] = (nodesResult.values ?? []).map((node: Record<string, unknown>) => {
      let attributes: Record<string, string> = {};
      try {
        const parsed = JSON.parse(typeof node.attributes === 'string' ? node.attributes : '{}');
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) attributes = parsed as Record<string, string>;
      } catch {
        // Retain the node even if a legacy attributes value cannot be parsed.
      }
      return { data: { id: String(node.id), label: String(node.label), type: String(node.type), confidence: Number(node.confidence), created_at: String(node.created_at), attributes } };
    });
    const edges: GraphElement[] = (edgesResult.values ?? []).map((edge: Record<string, unknown>) => ({
      data: { id: String(edge.id), source: String(edge.source), target: String(edge.target), label: String(edge.label), created_at: String(edge.created_at) },
    }));
    set({ graphElements: [...nodes, ...edges] });
  },

  addNode: async (nodeType, label, confidence, attributes = {}) => {
    const { activeCaseId, graphElements } = get();
    if (!activeCaseId) throw new Error('Select a case before adding an entity.');
    if (!Number.isInteger(confidence) || confidence < 1 || confidence > 5) throw new Error('Confidence must be between 1 and 5.');
    const id = createId('node');
    const now = new Date().toISOString();
    const safeLabel = requireNonEmpty(label, 'node label');
    const safeType = requireNonEmpty(nodeType, 'node type', 128);
    const db = await getDb();
    await db.run('INSERT INTO nodes (id, case_id, label, type, confidence, created_at, attributes) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, activeCaseId, safeLabel, safeType, confidence, now, JSON.stringify(attributes)]);
    await logAudit('ADD_NODE', id, `Added ${safeType}: ${safeLabel}`);
    set({ graphElements: [...graphElements, { data: { id, label: safeLabel, type: safeType, confidence, created_at: now, attributes } }] });
  },

  updateNode: async (id, label, confidence, attributes) => {
    const { activeCaseId, graphElements } = get();
    if (!activeCaseId) throw new Error('Select a case before editing an entity.');
    if (!Number.isInteger(confidence) || confidence < 1 || confidence > 5) throw new Error('Confidence must be between 1 and 5.');
    const safeLabel = requireNonEmpty(label, 'node label');
    const db = await getDb();
    await db.run('UPDATE nodes SET label = ?, confidence = ?, attributes = ? WHERE id = ? AND case_id = ?', [safeLabel, confidence, JSON.stringify(attributes), id, activeCaseId]);
    await logAudit('UPDATE_NODE', id, `Updated entity: ${safeLabel}`);
    set({ graphElements: graphElements.map((element) => element.data.id === id ? { ...element, data: { ...element.data, label: safeLabel, confidence, attributes } } : element) });
  },

  addEdge: async (sourceId, targetId, relationshipType) => {
    const { activeCaseId, graphElements } = get();
    if (!activeCaseId) throw new Error('Select a case before adding a relationship.');
    if (sourceId === targetId) throw new Error('An entity cannot be related to itself.');
    const nodeIds = new Set(graphElements.filter((element) => !element.data.source).map((element) => element.data.id));
    if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) throw new Error('Both relationship endpoints must be entities in the active case.');
    if (graphElements.some((element) => element.data.source === sourceId && element.data.target === targetId)) throw new Error('This relationship already exists.');
    const id = createId('edge');
    const now = new Date().toISOString();
    const label = requireNonEmpty(relationshipType, 'relationship type', 256);
    const db = await getDb();
    await db.run('INSERT INTO edges (id, case_id, source, target, label, created_at) VALUES (?, ?, ?, ?, ?, ?)', [id, activeCaseId, sourceId, targetId, label, now]);
    await logAudit('ADD_EDGE', id, `Connected ${sourceId} to ${targetId}`);
    set({ graphElements: [...graphElements, { data: { id, source: sourceId, target: targetId, label, created_at: now } }] });
  },

  deleteNode: async (nodeId) => {
    const { activeCaseId, graphElements } = get();
    if (!activeCaseId) throw new Error('Select a case before deleting an entity.');
    const db = await getDb();
    await db.run('DELETE FROM nodes WHERE id = ? AND case_id = ?', [nodeId, activeCaseId]);
    await logAudit('DELETE_NODE', nodeId, 'Deleted entity and its relationships');
    set({ graphElements: graphElements.filter((element) => element.data.id !== nodeId && element.data.source !== nodeId && element.data.target !== nodeId), selectedNodeId: null, selectedEdgeId: null });
  },

  deleteEdge: async (edgeId) => {
    const { activeCaseId, graphElements } = get();
    if (!activeCaseId) throw new Error('Select a case before deleting a relationship.');
    const db = await getDb();
    await db.run('DELETE FROM edges WHERE id = ? AND case_id = ?', [edgeId, activeCaseId]);
    await logAudit('DELETE_EDGE', edgeId, 'Deleted relationship');
    set({ graphElements: graphElements.filter((element) => element.data.id !== edgeId), selectedEdgeId: null });
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  setConnectingFromId: (id) => set({ connectingFromId: id }),
  toggleFilter: (nodeType) => set((state) => ({ hiddenNodeTypes: state.hiddenNodeTypes.includes(nodeType) ? state.hiddenNodeTypes.filter((type) => type !== nodeType) : [...state.hiddenNodeTypes, nodeType] })),

  loadNotes: async (caseId) => {
    const db = await getDb();
    const result = await db.query('SELECT id, case_id, content, linked_nodes, created_at FROM notes WHERE case_id = ? ORDER BY created_at DESC', [caseId]);
    set({ notes: (result.values ?? []).map((row: Record<string, unknown>) => parseNote(row)) });
  },

  addNote: async (content, linkedNodeIds) => {
    const { activeCaseId, notes, graphElements } = get();
    if (!activeCaseId) throw new Error('Select a case before adding a note.');
    const nodeIds = new Set(graphElements.filter((element) => !element.data.source).map((element) => element.data.id));
    if (!linkedNodeIds.every((nodeId) => nodeIds.has(nodeId))) throw new Error('Notes may only reference entities in the active case.');
    const id = createId('note');
    const now = new Date().toISOString();
    const safeContent = requireNonEmpty(content, 'note content');
    const db = await getDb();
    await db.run('INSERT INTO notes (id, case_id, content, linked_nodes, created_at) VALUES (?, ?, ?, ?, ?)', [id, activeCaseId, safeContent, JSON.stringify(linkedNodeIds), now]);
    await logAudit('ADD_NOTE', id, 'Recorded intelligence note');
    set({ notes: [{ id, case_id: activeCaseId, content: safeContent, linked_nodes: linkedNodeIds, created_at: now }, ...notes] });
  },

  deleteNote: async (noteId) => {
    const { activeCaseId, notes } = get();
    if (!activeCaseId) throw new Error('Select a case before deleting a note.');
    const db = await getDb();
    await db.run('DELETE FROM notes WHERE id = ? AND case_id = ?', [noteId, activeCaseId]);
    await logAudit('DELETE_NOTE', noteId, 'Deleted intelligence note');
    set({ notes: notes.filter((note) => note.id !== noteId) });
  },

  exportActiveCase: async () => {
    const { activeCaseId, cases, graphElements, notes } = get();
    if (!activeCaseId) throw new Error('Select a case before exporting.');
    const activeCase = cases.find((caseRecord) => caseRecord.id === activeCaseId);
    if (!activeCase) throw new Error('Active case metadata is unavailable.');
    const password = window.prompt('SECURE EXPORT: Enter a password of at least 12 characters.');
    if (!password) return;
    const casePackage = await createCasePackage({
      metadata: { exported_at: new Date().toISOString(), system: 'CrimeGraph 2.0' },
      case: { reference_number: activeCase.reference_number, title: activeCase.title, case_type: activeCase.case_type, classification: activeCase.classification },
      intelligence_nodes: graphElements.filter((element) => !element.data.source).map((element) => ({ data: { id: element.data.id, label: element.data.label, type: element.data.type ?? 'unknown', confidence: element.data.confidence, created_at: element.data.created_at, attributes: element.data.attributes } })),
      relationships: graphElements.filter((element) => element.data.source).map((element) => ({ data: { id: element.data.id, source: element.data.source ?? '', target: element.data.target ?? '', label: element.data.label, created_at: element.data.created_at } })),
      notes: notes.map((note) => ({ id: note.id, content: note.content, linked_nodes: note.linked_nodes, created_at: note.created_at })),
    });
    const encryptedPayload = await encryptPackage(JSON.stringify(casePackage), password);
    const fileName = `crimegraph_${activeCase.reference_number.replace(/[^A-Z0-9_-]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.cgx`;
    const fileResult = await Filesystem.writeFile({ path: fileName, data: encryptedPayload, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await logAudit('EXPORT_CASE', activeCaseId, `Exported verified package ${fileName}`);
    useAuthStore.getState().setIntentionalBackground(true);
    const canShare = await Share.canShare();
    if (!canShare.value) throw new Error('Secure sharing is unavailable on this device.');
    await Share.share({ title: `Encrypted Case: ${activeCase.reference_number}`, text: 'CrimeGraph encrypted case package', url: fileResult.uri, dialogTitle: 'Export encrypted case' });
  },

  importCase: async (encryptedData) => {
    const password = window.prompt('SECURE IMPORT: Enter the package password.');
    if (!password) return;
    const imported = await parseCasePackage(await decryptPackage(encryptedData, password));
    const db = await getDb();
    const now = new Date().toISOString();
    const newCaseId = createId('case');
    const reference = `${imported.case.reference_number}-IMP-${now.slice(0, 10).replace(/-/g, '')}`;
    await db.run(
      'INSERT INTO cases (id, reference_number, title, case_type, status, classification, date_opened, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newCaseId, reference, `${imported.case.title} (Imported)`, imported.case.case_type, 'active', imported.case.classification, now, now, now],
    );
    const idMap = new Map<string, string>();
    for (const node of imported.intelligence_nodes) {
      const newNodeId = createId('node');
      idMap.set(node.data.id, newNodeId);
      await db.run('INSERT INTO nodes (id, case_id, label, type, confidence, created_at, attributes) VALUES (?, ?, ?, ?, ?, ?, ?)', [newNodeId, newCaseId, node.data.label, node.data.type, node.data.confidence ?? 3, node.data.created_at ?? now, JSON.stringify(node.data.attributes ?? {})]);
    }
    for (const edge of imported.relationships) {
      const source = idMap.get(edge.data.source);
      const target = idMap.get(edge.data.target);
      if (source && target) await db.run('INSERT INTO edges (id, case_id, source, target, label, created_at) VALUES (?, ?, ?, ?, ?, ?)', [createId('edge'), newCaseId, source, target, edge.data.label, edge.data.created_at ?? now]);
    }
    for (const note of imported.notes as PackageNote[]) {
      await db.run('INSERT INTO notes (id, case_id, content, linked_nodes, created_at) VALUES (?, ?, ?, ?, ?)', [createId('note'), newCaseId, note.content, JSON.stringify(note.linked_nodes.map((nodeId) => idMap.get(nodeId)).filter(Boolean)), note.created_at ?? now]);
    }
    await logAudit(imported.verification === 'verified' ? 'IMPORT_CASE_VERIFIED' : 'IMPORT_CASE_LEGACY_UNVERIFIED', newCaseId, `Imported ${imported.case.reference_number}`);
    await get().loadCases();
  },

  loadAuditLogs: async () => {
    requireAdmin();
    const db = await getDb();
    const result = await db.query('SELECT id, timestamp, user_id, action, target_id, details, prev_hash, entry_hash FROM audit_logs ORDER BY timestamp DESC LIMIT 500');
    set({ auditLogs: (result.values ?? []) as AuditLog[] });
  },

  verifyAuditLog: async () => {
    requireAdmin();
    const db = await getDb();
    const result = await db.query('SELECT id, timestamp, user_id, action, target_id, details, prev_hash, entry_hash FROM audit_logs ORDER BY timestamp ASC, id ASC');
    return verifyAuditChain((result.values ?? []) as Parameters<typeof verifyAuditChain>[0]);
  },

  wipeDatabase: async () => {
    requireAdmin();
    const db = await getDb();
    await db.execute('DELETE FROM cases;');
    await logAudit('SYSTEM_WIPE', 'ALL_CASE_DATA', 'Administrator wiped all local case data; audit ledger retained.');
    set({ cases: [], graphElements: [], activeCaseId: null, notes: [], selectedNodeId: null, selectedEdgeId: null });
    await get().loadAuditLogs();
  },
}));
