const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUB = __dirname;
const GAME = fs.readFileSync(path.join(PUB, 'game.html'), 'utf8');
const TYPES = { '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

function origin(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  return proto + '://' + req.headers.host;
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname.replace(/\/+$/, '') || '/';
  if (p === '/' || p === '/embed') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(GAME.split('__ORIGIN__').join(origin(req)));
  }
  const file = path.join(PUB, path.normalize(p).replace(/^(\.\.[\/\\])+/, ''));
  if (file.startsWith(PUB) && TYPES[path.extname(file)] && fs.existsSync(file)) {
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)], 'Cache-Control': 'public, max-age=86400' });
    return fs.createReadStream(file).pipe(res);
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}).listen(PORT, () => console.log('Doomscroll on port ' + PORT));
