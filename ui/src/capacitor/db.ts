import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, type CapacitorSQLitePlugin, type SQLiteDBConnection } from '@capacitor-community/sqlite';

const DATABASE_NAME = 'crimegraph_db';
const SCHEMA_VERSION = 2;
const NATIVE_ENCRYPTION_MODE = 'secret';
const sqlite: CapacitorSQLitePlugin = CapacitorSQLite;
const sqliteConnection = new SQLiteConnection(sqlite);
let dbInstance: SQLiteDBConnection | null = null;

export class PlaintextDatabaseMigrationRequiredError extends Error {
  constructor() {
    super('An existing plaintext local store was detected. Back up and migrate it using the controlled native migration procedure before opening this release.');
    this.name = 'PlaintextDatabaseMigrationRequiredError';
  }
}

const USERS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    badge TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'analyst')),
    biometric_enabled INTEGER NOT NULL DEFAULT 0 CHECK (biometric_enabled IN (0, 1)),
    created_at TEXT NOT NULL,
    last_login TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
  );
`;

const CORE_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    case_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    lead_officer_id TEXT,
    classification TEXT NOT NULL DEFAULT 'OFFICIAL',
    description TEXT,
    date_opened TEXT NOT NULL,
    date_closed TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL,
    confidence INTEGER NOT NULL DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),
    created_at TEXT NOT NULL,
    attributes TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY(source) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY(target) REFERENCES nodes(id) ON DELETE CASCADE,
    CHECK (source <> target)
  );
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    content TEXT NOT NULL,
    linked_nodes TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details TEXT NOT NULL,
    prev_hash TEXT,
    entry_hash TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_cases_status_opened ON cases(status, date_opened DESC);
  CREATE INDEX IF NOT EXISTS idx_nodes_case_created ON nodes(case_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_edges_case_created ON edges(case_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_notes_case_created ON notes(case_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
`;

function isNativeRuntime(): boolean {
  return Capacitor.isNativePlatform();
}

function createDatabaseSecret(): string {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Secure random generation is unavailable on this device.');
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function prepareNativeEncryption(): Promise<void> {
  const existingDatabase = await sqliteConnection.isDatabase(DATABASE_NAME);
  if (existingDatabase.result) {
    const encryptionState = await sqliteConnection.isDatabaseEncrypted(DATABASE_NAME);
    if (!encryptionState.result) throw new PlaintextDatabaseMigrationRequiredError();
  }

  const storedSecret = await sqliteConnection.isSecretStored();
  if (!storedSecret.result) {
    // The plugin stores this one-time random secret in Android Keystore-backed encrypted preferences.
    // It is intentionally never copied to web storage, logs, exports, or application preferences.
    await sqliteConnection.setEncryptionSecret(createDatabaseSecret());
  }
}

async function tableColumns(db: SQLiteDBConnection, table: string): Promise<Set<string>> {
  const result = await db.query(`PRAGMA table_info(${table})`);
  return new Set((result.values ?? []).map((column: Record<string, unknown>) => String(column.name)));
}

async function migrateUsers(db: SQLiteDBConnection): Promise<void> {
  const columns = await tableColumns(db, 'users');
  if (columns.size === 0 || ['id', 'badge', 'display_name', 'password_hash', 'role', 'biometric_enabled', 'created_at', 'is_active'].every((column) => columns.has(column))) {
    await db.execute(USERS_TABLE_SQL);
    return;
  }

  // Pre-v2 credentials used either a fast unsalted hash or a different table layout.
  // They are intentionally not carried forward as valid credentials: local administrators
  // must re-provision secure credentials after this migration.
  await db.execute('ALTER TABLE users RENAME TO users_legacy_v1;');
  await db.execute(USERS_TABLE_SQL);
  await db.run('INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)', [1, new Date().toISOString()]);
}

async function migrateSchema(db: SQLiteDBConnection): Promise<void> {
  await db.execute('PRAGMA foreign_keys = ON;');
  await db.execute('PRAGMA secure_delete = ON;');
  await db.execute('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);');
  await migrateUsers(db);
  await db.execute(CORE_SCHEMA_SQL);
  await db.run('INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)', [SCHEMA_VERSION, new Date().toISOString()]);
}

export async function getDb(): Promise<SQLiteDBConnection> {
  if (dbInstance) return dbInstance;
  return initDatabase();
}

export async function initDatabase(): Promise<SQLiteDBConnection> {
  try {
    const nativeRuntime = isNativeRuntime();
    if (nativeRuntime) await prepareNativeEncryption();

    const existing = await sqliteConnection.isConnection(DATABASE_NAME, false);
    const db = existing.result
      ? await sqliteConnection.retrieveConnection(DATABASE_NAME, false)
      : await sqliteConnection.createConnection(
        DATABASE_NAME,
        nativeRuntime,
        nativeRuntime ? NATIVE_ENCRYPTION_MODE : 'no-encryption',
        SCHEMA_VERSION,
        false,
      );
    await db.open();
    await migrateSchema(db);
    dbInstance = db;
    return db;
  } catch (error) {
    if (error instanceof PlaintextDatabaseMigrationRequiredError) throw error;
    console.error('Database initialization failed.', error);
    throw new Error('Local evidence store could not be initialized.');
  }
}

export async function closeDatabase(): Promise<void> {
  const current = dbInstance;
  dbInstance = null;
  if (!current) return;
  try {
    if (await current.isDBOpen()) await current.close();
  } finally {
    await sqliteConnection.closeConnection(DATABASE_NAME, false).catch(() => undefined);
  }
}
