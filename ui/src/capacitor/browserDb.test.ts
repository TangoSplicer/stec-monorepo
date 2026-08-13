import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let lastWasmLocator: ((fileName: string) => string) | undefined;

class TestSqlDatabase {
  private rows: Array<{ id: string; value: string }>;
  private modifiedRows = 0;

  constructor(bytes?: ArrayLike<number> | null) {
    this.rows = bytes && bytes.length > 0
      ? JSON.parse(new TextDecoder().decode(new Uint8Array(bytes))) as Array<{ id: string; value: string }>
      : [];
  }

  run(statement: string, values: unknown[] = []): TestSqlDatabase {
    if (/^INSERT/i.test(statement.trim())) {
      this.rows.push({ id: String(values[0]), value: String(values[1]) });
      this.modifiedRows = 1;
    } else {
      this.modifiedRows = 0;
    }
    return this;
  }

  getRowsModified(): number {
    return this.modifiedRows;
  }

  exec(statement: string, values: unknown[] = []): Array<{ columns: string[]; values: unknown[][] }> {
    if (!/^SELECT/i.test(statement.trim())) return [];
    const requestedId = values[0] === undefined ? undefined : String(values[0]);
    const rows = requestedId ? this.rows.filter((row) => row.id === requestedId) : this.rows;
    return [{ columns: ['id', 'value'], values: rows.map((row) => [row.id, row.value]) }];
  }

  export(): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(this.rows));
  }

  close(): void {}
}

vi.mock('sql.js', () => ({
  default: vi.fn(async (config: { locateFile: (fileName: string) => string }) => {
    lastWasmLocator = config.locateFile;
    return { Database: TestSqlDatabase };
  }),
}));

async function clearBrowserWorkspace(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('crimegraph-browser-workspace');
    request.onerror = () => reject(request.error ?? new Error('Unable to clear test IndexedDB workspace.'));
    request.onsuccess = () => resolve();
  });
}

describe('browser evidence database adapter', () => {
  beforeEach(async () => {
    lastWasmLocator = undefined;
    await clearBrowserWorkspace();
  });

  it('opens a clean browser workspace without requiring a Jeep component or native plugin', async () => {
    const { BrowserDatabaseConnection } = await import('./browserDb');
    const database = new BrowserDatabaseConnection();

    await database.open();

    await expect(database.isDBOpen()).resolves.toEqual({ result: true });
    expect(lastWasmLocator?.('sql-wasm.wasm')).toBe('/assets/sql-wasm.wasm');
    await database.close();
  });

  it('persists browser mutations across connection lifecycle boundaries', async () => {
    const { BrowserDatabaseConnection } = await import('./browserDb');
    const firstConnection = new BrowserDatabaseConnection();
    await firstConnection.open();
    await firstConnection.execute('CREATE TABLE test_rows (id TEXT PRIMARY KEY, value TEXT NOT NULL);');
    await firstConnection.run('INSERT INTO test_rows (id, value) VALUES (?, ?)', ['row-1', 'persisted evidence']);
    await firstConnection.close();

    const restoredConnection = new BrowserDatabaseConnection();
    await restoredConnection.open();
    await expect(restoredConnection.query('SELECT id, value FROM test_rows WHERE id = ?', ['row-1'])).resolves.toEqual({
      values: [{ id: 'row-1', value: 'persisted evidence' }],
    });
    await restoredConnection.close();
  });
});
