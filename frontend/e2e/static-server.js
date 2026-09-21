// Minimální statický server pro e2e: servíruje build/ a na neznámé cesty
// vrací index.html, aby fungoval přímý vstup na /rezervace (jako Vercel rewrite).
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'build');
const PORT = Number(process.env.PORT || 4321);
const MIME = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml',
  '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain' };
http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(ROOT, p);
  if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    const idx = path.join(f, 'index.html');
    f = fs.existsSync(idx) && fs.statSync(f).isDirectory() ? idx : path.join(ROOT, 'index.html');
  }
  res.setHeader('Content-Type', MIME[path.extname(f)] || 'application/octet-stream');
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log('e2e server na http://127.0.0.1:' + PORT));
