import { create } from 'zustand';
import { closeDatabase, getDb, PlaintextDatabaseMigrationRequiredError } from '../capacitor/db';
import { authenticateWithBiometrics, isBiometricAvailable } from '../capacitor/biometrics';
import { hashPassword, MINIMUM_SECRET_LENGTH, verifyPassword } from '../capacitor/crypto';

const LAST_USER_KEY = 'crimegraph_last_user_id';

export interface User {
  id: string;
  badge: string;
  name: string;
  role: 'admin' | 'analyst';
  biometric_enabled?: number;
}

interface AuthState {
  currentUser: User | null;
  isFirstBoot: boolean;
  isAppReady: boolean;
  storageError: string | null;
  intentionalBackground: boolean;
  setIntentionalBackground: (state: boolean) => void;
  initializeAuth: () => Promise<void>;
  setupMasterAdmin: (password: string) => Promise<void>;
  login: (badge: string, password: string) => Promise<boolean>;
  biometricLogin: () => Promise<boolean>;
  adminLogin: (password: string) => Promise<boolean>;
  addAnalyst: (badge: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

function createId(prefix: string): string {
  if (!globalThis.crypto?.randomUUID) throw new Error('Secure identifier generation is unavailable on this device.');
  return `${prefix}_${globalThis.crypto.randomUUID()}`;
}

function normaliseBadge(badge: string): string {
  const value = badge.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9-]{2,31}$/.test(value)) {
    throw new Error('Badge must contain 3–32 letters, numbers, or hyphens.');
  }
  return value;
}

function normaliseName(name: string): string {
  const value = name.trim();
  if (value.length < 2 || value.length > 128) throw new Error('Operator name must contain 2–128 characters.');
  return value;
}

function assertStrongSecret(secret: string): void {
  if (secret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error(`Password must contain at least ${MINIMUM_SECRET_LENGTH} characters.`);
  }
}

function mapUser(row: Record<string, unknown>): User {
  if (typeof row.id !== 'string' || typeof row.badge !== 'string' || typeof row.name !== 'string' || (row.role !== 'admin' && row.role !== 'analyst')) {
    throw new Error('Stored user record is invalid.');
  }
  return {
    id: row.id,
    badge: row.badge,
    name: row.name,
    role: row.role,
    biometric_enabled: typeof row.biometric_enabled === 'number' ? row.biometric_enabled : 0,
  };
}

async function readUserByBadge(badge: string, role: User['role']): Promise<{ user: User; passwordHash: string } | null> {
  const db = await getDb();
  const result = await db.query(
    'SELECT id, badge, display_name AS name, role, password_hash, biometric_enabled FROM users WHERE badge = ? AND role = ? AND is_active = 1 LIMIT 1',
    [badge, role],
  );
  const row = result.values?.[0] as Record<string, unknown> | undefined;
  if (!row || typeof row.password_hash !== 'string') return null;
  return { user: mapUser(row), passwordHash: row.password_hash };
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isFirstBoot: true,
  isAppReady: false,
  storageError: null,
  intentionalBackground: false,

  setIntentionalBackground: (state) => set({ intentionalBackground: state }),

  initializeAuth: async () => {
    try {
      const db = await getDb();
      const result = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND is_active = 1");
      const count = Number((result.values?.[0] as Record<string, unknown> | undefined)?.count ?? 0);
      set({ isFirstBoot: count === 0, isAppReady: true });
    } catch (error) {
      const message = error instanceof PlaintextDatabaseMigrationRequiredError
        ? 'A legacy plaintext evidence store requires a controlled encrypted migration before this release can open it.'
        : 'The local encrypted evidence store could not be opened.';
      set({ isFirstBoot: false, storageError: message, isAppReady: true });
    }
  },

  setupMasterAdmin: async (password: string) => {
    assertStrongSecret(password);
    const db = await getDb();
    const existing = await db.query("SELECT id FROM users WHERE role = 'admin' AND is_active = 1 LIMIT 1");
    if (existing.values?.length) throw new Error('A master administrator already exists.');
    const now = new Date().toISOString();
    await db.run(
      'INSERT INTO users (id, badge, display_name, password_hash, role, biometric_enabled, created_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [createId('admin'), 'ADMIN', 'Master Administrator', await hashPassword(password), 'admin', 0, now, 1],
    );
    set({ isFirstBoot: false });
  },

  login: async (badge: string, password: string) => {
    try {
      const record = await readUserByBadge(normaliseBadge(badge), 'analyst');
      if (!record || !(await verifyPassword(password, record.passwordHash))) return false;
      const db = await getDb();
      await db.run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), record.user.id]);
      localStorage.setItem(LAST_USER_KEY, record.user.id);
      set({ currentUser: record.user });
      return true;
    } catch {
      return false;
    }
  },

  biometricLogin: async () => {
    try {
      const userId = localStorage.getItem(LAST_USER_KEY);
      if (!userId || !(await isBiometricAvailable())) return false;
      if (!(await authenticateWithBiometrics('Verify your identity to unlock CrimeGraph.'))) return false;
      const db = await getDb();
      const result = await db.query(
        "SELECT id, badge, display_name AS name, role, biometric_enabled FROM users WHERE id = ? AND role = 'analyst' AND is_active = 1 LIMIT 1",
        [userId],
      );
      const row = result.values?.[0] as Record<string, unknown> | undefined;
      if (!row || Number(row.biometric_enabled) !== 1) return false;
      set({ currentUser: mapUser(row) });
      return true;
    } catch {
      return false;
    }
  },

  adminLogin: async (password: string) => {
    try {
      const db = await getDb();
      const result = await db.query(
        "SELECT id, badge, display_name AS name, role, password_hash, biometric_enabled FROM users WHERE role = 'admin' AND is_active = 1 LIMIT 1",
      );
      const row = result.values?.[0] as Record<string, unknown> | undefined;
      if (!row || typeof row.password_hash !== 'string' || !(await verifyPassword(password, row.password_hash))) return false;
      const user = mapUser(row);
      await db.run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), user.id]);
      set({ currentUser: user });
      return true;
    } catch {
      return false;
    }
  },

  addAnalyst: async (badge: string, name: string, password: string) => {
    assertStrongSecret(password);
    const db = await getDb();
    const now = new Date().toISOString();
    await db.run(
      'INSERT INTO users (id, badge, display_name, password_hash, role, biometric_enabled, created_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [createId('user'), normaliseBadge(badge), normaliseName(name), await hashPassword(password), 'analyst', 0, now, 1],
    );
  },

  logout: () => {
    void closeDatabase();
    set({ currentUser: null, intentionalBackground: false });
  },
}));
