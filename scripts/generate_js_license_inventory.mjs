#!/usr/bin/env node
// Produces a non-sensitive inventory of installed JavaScript packages and declared licenses.
// The CycloneDX SBOM remains the complete machine-readable component record.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const rootDir = resolve(new URL('..', import.meta.url).pathname);
const modulesDir = resolve(process.argv[2] ?? join(rootDir, 'ui', 'node_modules'));
const outputFile = resolve(process.argv[3] ?? join(rootDir, 'android', 'app', 'build', 'outputs', 'JS_LICENSE_INVENTORY.json'));

async function packageDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === '.bin') continue;
    const entryPath = join(directory, entry.name);
    if (entry.name.startsWith('@')) {
      for (const scopedEntry of await readdir(entryPath, { withFileTypes: true })) {
        if (scopedEntry.isDirectory()) result.push(join(entryPath, scopedEntry.name));
      }
    } else {
      result.push(entryPath);
    }
  }
  return result;
}

function normaliseLicense(value) {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object' && typeof value.type === 'string' && value.type.trim()) return value.type.trim();
  return 'UNKNOWN';
}

async function main() {
  const packages = [];
  for (const directory of await packageDirectories(modulesDir)) {
    try {
      const metadata = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
      if (typeof metadata.name !== 'string' || typeof metadata.version !== 'string') continue;
      packages.push({
        name: metadata.name,
        version: metadata.version,
        license: normaliseLicense(metadata.license ?? metadata.licenses?.[0]),
        path: relative(rootDir, directory),
      });
    } catch {
      // A package without a readable manifest is omitted; the SBOM job provides the wider audit surface.
    }
  }

  packages.sort((left, right) => left.name.localeCompare(right.name) || left.version.localeCompare(right.version));
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify({
    schema_version: 1,
    generated_at_utc: new Date().toISOString(),
    source: relative(rootDir, modulesDir),
    package_count: packages.length,
    packages,
  }, null, 2)}\n`);

  const unknownCount = packages.filter((entry) => entry.license === 'UNKNOWN').length;
  console.log(`js-license-inventory: wrote ${relative(rootDir, outputFile)} for ${packages.length} packages (${unknownCount} unknown licenses)`);
}

main().catch((error) => {
  console.error(`js-license-inventory: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
