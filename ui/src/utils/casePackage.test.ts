import { describe, expect, it } from 'vitest';
import { createCasePackage, parseCasePackage } from './casePackage';

const content = {
  metadata: { exported_at: '2026-08-13T00:00:00.000Z', system: 'CrimeGraph 2.0' },
  case: { reference_number: 'OP-001', title: 'Test Operation', case_type: 'operation', classification: 'OFFICIAL' },
  intelligence_nodes: [
    { data: { id: 'node-1', label: 'Alice', type: 'person', confidence: 4, attributes: { source: 'statement' } } },
    { data: { id: 'node-2', label: 'Vehicle', type: 'vehicle', confidence: 3 } },
  ],
  relationships: [
    { data: { id: 'edge-1', source: 'node-1', target: 'node-2', label: 'operates' } },
  ],
  notes: [{ id: 'note-1', content: 'Initial corroborated intelligence.', linked_nodes: ['node-1'] }],
};

describe('case packages', () => {
  it('creates and verifies an integrity-protected package', async () => {
    const packageValue = await createCasePackage(content);
    const parsed = await parseCasePackage(JSON.stringify(packageValue));

    expect(parsed.verification).toBe('verified');
    expect(parsed.case.reference_number).toBe('OP-001');
    expect(parsed.relationships).toHaveLength(1);
  });

  it('rejects an altered package even when its JSON structure remains valid', async () => {
    const packageValue = await createCasePackage(content);
    packageValue.case.title = 'Tampered Operation';

    await expect(parseCasePackage(JSON.stringify(packageValue))).rejects.toThrow('integrity verification failed');
  });

  it('rejects relationships that point outside the declared graph', async () => {
    const malformed = {
      ...content,
      intelligence_nodes: content.intelligence_nodes.slice(0, 1),
      relationships: content.relationships,
    };
    await expect(createCasePackage(malformed)).rejects.toThrow('invalid relationship');
  });

  it('labels recoverable legacy exports as unverified', async () => {
    const legacy = {
      metadata: { reference: 'OP-LEGACY', title: 'Legacy Operation', classification: 'OFFICIAL', exported_at: '2026-08-13T00:00:00.000Z' },
      intelligence_nodes: content.intelligence_nodes,
      relationships: content.relationships,
      notes: content.notes,
    };
    await expect(parseCasePackage(JSON.stringify(legacy))).resolves.toMatchObject({ verification: 'legacy-unverified' });
  });

  it('rejects duplicate graph identifiers and self-referential relationships', async () => {
    const duplicateNodes = {
      ...content,
      intelligence_nodes: [content.intelligence_nodes[0], { data: { ...content.intelligence_nodes[0].data } }],
      relationships: [],
    };
    await expect(createCasePackage(duplicateNodes)).rejects.toThrow('duplicate node identifiers');

    const selfReferentialRelationship = {
      ...content,
      relationships: [{ data: { id: 'edge-self', source: 'node-1', target: 'node-1', label: 'invalid' } }],
    };
    await expect(createCasePackage(selfReferentialRelationship)).rejects.toThrow('invalid relationship');
  });

  it('rejects malformed JSON and oversized text before import', async () => {
    await expect(parseCasePackage('{not-json')).rejects.toThrow('not valid JSON');
    await expect(createCasePackage({ ...content, case: { ...content.case, title: 'x'.repeat(10_001) } })).rejects.toThrow('case title');
  });
});
