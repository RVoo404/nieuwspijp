import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const types = { '.css': 'text/css', '.js': 'text/javascript', '.html': 'text/html', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let target = path.join(root, pathname);
    if (!(await stat(target).catch(() => null))?.isFile()) target = path.join(target, 'index.html');
    if (!target.startsWith(root)) throw new Error('Ongeldig pad');
    response.setHeader('Content-Type', `${types[path.extname(target)] || 'application/octet-stream'}; charset=utf-8`);
    response.end(await readFile(target));
  } catch { response.statusCode = 404; response.end('Niet gevonden'); }
});
server.listen(4173, '127.0.0.1', () => console.log('Nieuwspijp is lokaal te bekijken op http://127.0.0.1:4173'));
