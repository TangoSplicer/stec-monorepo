import { describe, expect, it } from 'vitest';
import { hashAuditEvent, verifyAuditChain, type AuditChainEntry } from './auditChain';

async function entry(overrides: Partial<Omit<AuditChainEntry, 'entry_hash'>> = {}): Promise<AuditChainEntry> {
  const value = {
    id: 'audit-1',
    timestamp: '2026-08-13T00:00:00.000Z',
    user_id: 'ADMIN',
    action: 'CREATE_CASE',
    target_id: 'case-1',
    details: 'Created OP-001',
    prev_hash: null,
    ...overrides,
  };
  return { ...value, entry_hash: await hashAuditEvent(value) };
}

describe('audit chain verification', () => {
  it('accepts a continuous chain with valid entry hashes', async () => {
    const first = await entry();
    const second = await entry({
      id: 'audit-2',
      timestamp: '2026-08-13T00:01:00.000Z',
      action: 'ADD_NODE',
      target_id: 'node-1',
      details: 'Added person: Alice',
      prev_hash: first.entry_hash,
    });

    await expect(verifyAuditChain([first, second])).resolves.toEqual({ valid: true, checked: 2 });
  });

  it('rejects altered event details', async () => {
    const first = await entry();
    const altered = { ...first, details: 'Modified after recording' };

    await expect(verifyAuditChain([altered])).resolves.toEqual({ valid: false, checked: 0, failed_entry_id: 'audit-1' });
  });

  it('rejects a broken previous-hash link', async () => {
    const first = await entry();
    const second = await entry({ id: 'audit-2', prev_hash: 'not-the-previous-hash' });

    await expect(verifyAuditChain([first, second])).resolves.toEqual({ valid: false, checked: 1, failed_entry_id: 'audit-2' });
  });
});
