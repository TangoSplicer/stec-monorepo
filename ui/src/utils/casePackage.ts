export const CASE_PACKAGE_FORMAT = 'crimegraph.case-package';
export const CASE_PACKAGE_VERSION = 1;

export interface PackageNode {
  data: {
    id: string;
    label: string;
    type: string;
    confidence?: number;
    created_at?: string;
    attributes?: Record<string, string>;
  };
}

export interface PackageRelationship {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
    created_at?: string;
  };
}

export interface PackageNote {
  id: string;
  content: string;
  linked_nodes: string[];
  created_at?: string;
}

export interface CasePackageContent {
  format: typeof CASE_PACKAGE_FORMAT;
  version: typeof CASE_PACKAGE_VERSION;
  metadata: {
    exported_at: string;
    system: string;
  };
  case: {
    reference_number: string;
    title: string;
    case_type: string;
    classification: string;
  };
  intelligence_nodes: PackageNode[];
  relationships: PackageRelationship[];
  notes: PackageNote[];
}

export interface CasePackage extends CasePackageContent {
  integrity: {
    algorithm: 'SHA-256';
    content_hash: string;
  };
}

export interface ImportedCasePackage extends CasePackageContent {
  verification: 'verified' | 'legacy-unverified';
}

const MAX_PACKAGE_ITEMS = 20_000;
const MAX_TEXT_LENGTH = 10_000;
const MAX_ATTRIBUTE_KEYS = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireText(value: unknown, field: string, maximum = MAX_TEXT_LENGTH): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maximum) {
    throw new Error(`Invalid ${field}.`);
  }
  return value;
}

function optionalText(value: unknown, field: string, maximum = MAX_TEXT_LENGTH): string | undefined {
  if (value === undefined || value === null) return undefined;
  return requireText(value, field, maximum);
}

function requireArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value) || value.length > MAX_PACKAGE_ITEMS) throw new Error(`Invalid ${field}.`);
  return value;
}

function validateAttributes(value: unknown): Record<string, string> | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value) || Object.keys(value).length > MAX_ATTRIBUTE_KEYS) throw new Error('Invalid node attributes.');
  const attributes: Record<string, string> = {};
  for (const [key, attributeValue] of Object.entries(value)) {
    attributes[requireText(key, 'attribute key', 128)] = requireText(attributeValue, 'attribute value');
  }
  return attributes;
}

function validateNode(value: unknown): PackageNode {
  if (!isRecord(value) || !isRecord(value.data)) throw new Error('Invalid node.');
  const data = value.data;
  const confidence = data.confidence;
  if (confidence !== undefined && (typeof confidence !== 'number' || !Number.isInteger(confidence) || confidence < 1 || confidence > 5)) {
    throw new Error('Invalid node confidence.');
  }
  return {
    data: {
      id: requireText(data.id, 'node identifier', 256),
      label: requireText(data.label, 'node label'),
      type: requireText(data.type, 'node type', 128),
      confidence: confidence as number | undefined,
      created_at: optionalText(data.created_at, 'node created_at', 64),
      attributes: validateAttributes(data.attributes),
    },
  };
}

function validateRelationship(value: unknown): PackageRelationship {
  if (!isRecord(value) || !isRecord(value.data)) throw new Error('Invalid relationship.');
  const data = value.data;
  return {
    data: {
      id: requireText(data.id, 'relationship identifier', 256),
      source: requireText(data.source, 'relationship source', 256),
      target: requireText(data.target, 'relationship target', 256),
      label: requireText(data.label, 'relationship label', 256),
      created_at: optionalText(data.created_at, 'relationship created_at', 64),
    },
  };
}

function validateNote(value: unknown): PackageNote {
  if (!isRecord(value)) throw new Error('Invalid note.');
  const linkedNodes = requireArray(value.linked_nodes, 'note linked nodes').map((nodeId) => requireText(nodeId, 'linked node identifier', 256));
  return {
    id: requireText(value.id, 'note identifier', 256),
    content: requireText(value.content, 'note content'),
    linked_nodes: linkedNodes,
    created_at: optionalText(value.created_at, 'note created_at', 64),
  };
}

function canonicalise(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalise).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).filter((key) => value[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${canonicalise(value[key])}`).join(',')}}`;
  }
  throw new Error('Package contains an unsupported value.');
}

async function sha256Hex(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Secure cryptography is unavailable on this device.');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function validateContent(value: unknown): CasePackageContent {
  if (!isRecord(value)) throw new Error('Package must be an object.');
  if (value.format !== CASE_PACKAGE_FORMAT || value.version !== CASE_PACKAGE_VERSION) {
    throw new Error('Unsupported case package format.');
  }
  if (!isRecord(value.metadata) || !isRecord(value.case)) throw new Error('Package metadata is missing.');
  const nodes = requireArray(value.intelligence_nodes, 'nodes').map(validateNode);
  const relationships = requireArray(value.relationships, 'relationships').map(validateRelationship);
  const notes = requireArray(value.notes, 'notes').map(validateNote);
  const nodeIds = new Set(nodes.map((node) => node.data.id));
  if (nodeIds.size !== nodes.length) throw new Error('Package contains duplicate node identifiers.');
  for (const relationship of relationships) {
    if (relationship.data.source === relationship.data.target || !nodeIds.has(relationship.data.source) || !nodeIds.has(relationship.data.target)) {
      throw new Error('Package contains an invalid relationship.');
    }
  }
  return {
    format: CASE_PACKAGE_FORMAT,
    version: CASE_PACKAGE_VERSION,
    metadata: {
      exported_at: requireText(value.metadata.exported_at, 'export timestamp', 64),
      system: requireText(value.metadata.system, 'export system', 128),
    },
    case: {
      reference_number: requireText(value.case.reference_number, 'case reference', 256),
      title: requireText(value.case.title, 'case title'),
      case_type: requireText(value.case.case_type, 'case type', 128),
      classification: requireText(value.case.classification, 'case classification', 128),
    },
    intelligence_nodes: nodes,
    relationships,
    notes,
  };
}

export async function createCasePackage(content: Omit<CasePackageContent, 'format' | 'version'>): Promise<CasePackage> {
  const validated = validateContent({ ...content, format: CASE_PACKAGE_FORMAT, version: CASE_PACKAGE_VERSION });
  return {
    ...validated,
    integrity: {
      algorithm: 'SHA-256',
      content_hash: await sha256Hex(canonicalise(validated)),
    },
  };
}

/** Parses and verifies a current package. Legacy packages are normalized but explicitly marked unverified. */
export async function parseCasePackage(json: string): Promise<ImportedCasePackage> {
  if (json.length > 25_000_000) throw new Error('Package exceeds the supported import size.');
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error('Package is not valid JSON.');
  }
  if (!isRecord(raw)) throw new Error('Package must be an object.');

  if (raw.format === undefined) {
    const legacy = validateContent({
      format: CASE_PACKAGE_FORMAT,
      version: CASE_PACKAGE_VERSION,
      metadata: { exported_at: raw.metadata && isRecord(raw.metadata) ? raw.metadata.exported_at : undefined, system: raw.metadata && isRecord(raw.metadata) ? raw.metadata.system ?? 'CrimeGraph legacy export' : undefined },
      case: {
        reference_number: raw.metadata && isRecord(raw.metadata) ? raw.metadata.reference : undefined,
        title: raw.metadata && isRecord(raw.metadata) ? raw.metadata.title : undefined,
        case_type: 'operation',
        classification: raw.metadata && isRecord(raw.metadata) ? raw.metadata.classification ?? 'OFFICIAL' : undefined,
      },
      intelligence_nodes: raw.intelligence_nodes,
      relationships: raw.relationships,
      notes: raw.notes ?? [],
    });
    return { ...legacy, verification: 'legacy-unverified' };
  }

  const content = validateContent(raw);
  if (!isRecord(raw.integrity) || raw.integrity.algorithm !== 'SHA-256') throw new Error('Package integrity metadata is missing.');
  const suppliedHash = requireText(raw.integrity.content_hash, 'package content hash', 128);
  const actualHash = await sha256Hex(canonicalise(content));
  if (suppliedHash !== actualHash) throw new Error('Package integrity verification failed.');
  return { ...content, verification: 'verified' };
}
