import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const files = [];
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) await walk(full); else files.push(full);
  }
}
await walk(dist);
for (const file of files.filter((name) => name.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  for (const required of ['<!doctype html>', '<meta name="viewport"', '<meta name="color-scheme" content="light dark">', 'id="inhoud"', 'class="wordmark"', '/assets/site.css?v=']) {
    if (!html.includes(required)) throw new Error(`${path.relative(dist, file)} mist ${required}`);
  }
}
const cssFile = files.find((file) => file.endsWith('assets\\site.css') || file.endsWith('assets/site.css'));
if (!cssFile) throw new Error('CSS ontbreekt');
const css = await readFile(cssFile, 'utf8');
if (!css.includes('@media (prefers-color-scheme: dark)')) throw new Error('Automatische donkere modus ontbreekt');
console.log(`Controle geslaagd: ${files.length} bestanden, ${files.filter((f) => f.endsWith('.html')).length} pagina('s).`);
