import { access, copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const source = resolve(projectDirectory, 'node_modules/sql.js/dist/sql-wasm.wasm');
const destination = resolve(projectDirectory, 'public/assets/sql-wasm.wasm');

try {
  await access(source);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
  console.log(`Prepared browser SQL.js WebAssembly asset at ${destination}`);
} catch (error) {
  console.error(`Unable to prepare SQL.js WebAssembly asset from ${source}.`, error);
  process.exitCode = 1;
}
