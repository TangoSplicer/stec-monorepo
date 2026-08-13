import initSqlJs from 'sql.js';
import type { Database as SqlJsDatabase, SqlJsStatic } from 'sql.js';

export interface DatabaseQueryResult {
  // SQLite row shapes are determined by the caller's SELECT projection, matching Capacitor's query API.
  values?: any[];
}

export interface DatabaseConnection {
  open(): Promise<void>;
  close(): Promise<void>;
  isDBOpen(): Promise<{ result?: boolean }>;
  execute(statement: string): Promise<unknown>;
  run(statement: string, values?: unknown[]): Promise<unknown>;
  query(statement: string, values?: unknown[]): Promise<DatabaseQueryResult>;
}

interface StoredDatabase {
  key: string;
  bytes: ArrayBuffer;
}

const STORAGE_DATABASE_NAME = 'crimegraph-browser-workspace';
const STORAGE_OBJECT_STORE = 'sqlite-databases';
const STORAGE_KEY = 'crimegraph.db';
const WASM_PATH = '/assets/sql-wasm.wasm';

let sqlRuntime: Promise<SqlJsStatic> | null = null;

function getSqlRuntime(): Promise<SqlJsStatic> {
  if (!sqlRuntime) {
    sqlRuntime = initSqlJs({
      locateFile: (fileName) => (fileName.endsWith('.wasm') ? WASM_PATH : fileName),
    });
  }
  return sqlRuntime;
}

function openStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_DATABASE_NAME, 1);
    request.onerror = () => reject(request.error ?? new Error('Browser evidence storage could not be opened.'));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORAGE_OBJECT_STORE)) {
        database.createObjectStore(STORAGE_OBJECT_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function readStoredDatabase(): Promise<Uint8Array | undefined> {
  const storage = await openStorage();
  try {
    return await new Promise<Uint8Array | undefined>((resolve, reject) => {
      const request = storage.transaction(STORAGE_OBJECT_STORE, 'readonly').objectStore(STORAGE_OBJECT_STORE).get(STORAGE_KEY);
      request.onerror = () => reject(request.error ?? new Error('Browser evidence storage could not be read.'));
      request.onsuccess = () => {
        const stored = request.result as StoredDatabase | undefined;
        resolve(stored?.bytes ? new Uint8Array(stored.bytes) : undefined);
      };
    });
  } finally {
    storage.close();
  }
}

async function writeStoredDatabase(bytes: Uint8Array): Promise<void> {
  const storage = await openStorage();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = storage.transaction(STORAGE_OBJECT_STORE, 'readwrite');
      transaction.onerror = () => reject(transaction.error ?? new Error('Browser evidence storage could not be written.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Browser evidence storage transaction was aborted.'));
      transaction.oncomplete = () => resolve();
      const copiedBytes = bytes.slice();
      transaction.objectStore(STORAGE_OBJECT_STORE).put({
        key: STORAGE_KEY,
        bytes: copiedBytes.buffer,
      } satisfies StoredDatabase);
    });
  } finally {
    storage.close();
  }
}

export class BrowserDatabaseConnection implements DatabaseConnection {
  private database: SqlJsDatabase | null = null;

  async open(): Promise<void> {
    if (this.database) return;
    const [sql, storedBytes] = await Promise.all([getSqlRuntime(), readStoredDatabase()]);
    this.database = new sql.Database(storedBytes);
  }

  async close(): Promise<void> {
    if (!this.database) return;
    await this.persist();
    this.database.close();
    this.database = null;
  }

  async isDBOpen(): Promise<{ result?: boolean }> {
    return { result: this.database !== null };
  }

  async execute(statement: string): Promise<void> {
    this.requireDatabase().run(statement);
    await this.persist();
  }

  async run(statement: string, values: unknown[] = []): Promise<{ changes: { changes: number } }> {
    const database = this.requireDatabase();
    database.run(statement, values as never);
    const changes = database.getRowsModified();
    await this.persist();
    return { changes: { changes } };
  }

  async query(statement: string, values: unknown[] = []): Promise<DatabaseQueryResult> {
    const result = this.requireDatabase().exec(statement, values as never)[0];
    if (!result) return { values: [] };
    return {
      values: result.values.map((row) => Object.fromEntries(result.columns.map((column, index) => [column, row[index]]))),
    };
  }

  private requireDatabase(): SqlJsDatabase {
    if (!this.database) throw new Error('Browser evidence database is not open.');
    return this.database;
  }

  private async persist(): Promise<void> {
    await writeStoredDatabase(this.requireDatabase().export());
  }
}
