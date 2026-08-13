export interface AuditChainEntry {
  id: string;
  timestamp: string;
  user_id: string;
  action: string;
  target_id: string | null;
  details: string;
  prev_hash: string | null;
  entry_hash: string;
}

export interface AuditVerificationResult {
  valid: boolean;
  checked: number;
  failed_entry_id?: string;
}

function canonicalAuditEvent(entry: Omit<AuditChainEntry, 'entry_hash'>): string {
  const values: Record<string, string | null> = {
    action: entry.action,
    details: entry.details,
    id: entry.id,
    prev_hash: entry.prev_hash,
    target_id: entry.target_id,
    timestamp: entry.timestamp,
    user_id: entry.user_id,
  };
  return JSON.stringify(Object.keys(values).sort().reduce<Record<string, string | null>>((result, key) => {
    result[key] = values[key];
    return result;
  }, {}));
}

async function sha256Hex(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Secure cryptography is unavailable on this device.');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashAuditEvent(entry: Omit<AuditChainEntry, 'entry_hash'>): Promise<string> {
  return sha256Hex(canonicalAuditEvent(entry));
}

/** Verifies a ledger in chronological order and identifies the first invalid record. */
export async function verifyAuditChain(entries: AuditChainEntry[]): Promise<AuditVerificationResult> {
  let previousHash: string | null = null;
  for (const entry of entries) {
    if (entry.prev_hash !== previousHash) {
      return { valid: false, checked: entries.indexOf(entry), failed_entry_id: entry.id };
    }
    const calculatedHash = await hashAuditEvent({
      id: entry.id,
      timestamp: entry.timestamp,
      user_id: entry.user_id,
      action: entry.action,
      target_id: entry.target_id,
      details: entry.details,
      prev_hash: entry.prev_hash,
    });
    if (entry.entry_hash !== calculatedHash) {
      return { valid: false, checked: entries.indexOf(entry), failed_entry_id: entry.id };
    }
    previousHash = entry.entry_hash;
  }
  return { valid: true, checked: entries.length };
}
