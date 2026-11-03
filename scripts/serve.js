#!/usr/bin/env node
// Tiny zero-dependency static server for local preview: node scripts/serve.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const port = Number(process.argv[2] || process.env.PORT || 8000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml' };

try { execFileSync('node', [path.join(__dirname, 'build-participants.js')], { stdio: 'inherit' }); } catch (e) { /* keep going */ }

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(root, p));
  if (!file.startsWith(root) || file.includes(`${path.sep}.git${path.sep}`)) { res.writeHead(403).end('Forbidden'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
}).listen(port, () => console.log(`GitHub Playground running at http://localhost:${port}  (Ctrl+C to stop)`));
