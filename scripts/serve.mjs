import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Local preview only; publish the dist directory with a static hosting service.
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2'
};
const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    if ((await fs.stat(file)).isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        response.writeHead(301, { Location: url.pathname + '/' + url.search });
        response.end(); return;
      }
      file = path.join(file, 'index.html');
    }
    const body = await fs.readFile(file);
    response.writeHead(200, {
      'Content-Type': types[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': body.length, 'Cache-Control': 'no-cache'
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    const status = error instanceof URIError ? 400 :
      ['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : 500;
    response.writeHead(status);
    response.end(status === 404 ? 'Not found' : 'Unable to serve request');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is in use. Stop the other preview or set PORT to another number.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Local preview: http://127.0.0.1:${server.address().port}/`);
});
