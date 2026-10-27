import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('All named imports used by UI resolve to module exports', async () => {
  const source = await readFile(resolve(srcDir, 'main.js'), 'utf8');
  const imports = [...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"](\.\/lib\/[^'"]+)['"];?/g)];
  assert.equal(imports.length, 4, 'Main interface must list its four library imports');
  for (const [, listed, specifier] of imports) {
    const module = await import(pathToFileURL(resolve(srcDir, specifier)).href);
    for (const raw of listed.split(',')) {
      const exportedName = raw.trim().split(/\s+as\s+/)[0];
      assert.ok(Object.hasOwn(module, exportedName), `Missing export ${exportedName} from ${specifier}`);
    }
  }
});

test('Codex and Settings explicitly import CATEGORIES, and tutorial is launchable', async () => {
  const main = await readFile(resolve(srcDir, 'main.js'), 'utf8');
  const modelImport = main.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/lib\/model\.js['"]/);
  assert.ok(modelImport, 'Model import missing');
  assert.ok(modelImport[1].split(',').map(x => x.trim()).includes('CATEGORIES'), 'CATEGORIES must be imported to render Codex and Settings');
  assert.match(main, /data-action=\"start-tour\"/, 'Tutorial must be accessible from header');
  assert.match(main, /!data\.settings\.tutorialSeen&&TYPES\.every/, 'First-run tutorial must start for empty archive');
});
