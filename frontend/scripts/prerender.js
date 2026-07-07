/**
 * Statický prerender SPA do HTML snapshotů pro každou veřejnou routu.
 *
 * Proč: Seznambot (a zčásti i Googlebot) nerenderuje JavaScript spolehlivě.
 * Tento skript po buildu vykreslí každou stránku v headless prohlížeči a uloží
 * hotové HTML do build/<route>/index.html. Vercel servíruje tyto fyzické
 * soubory dřív než SPA rewrite, takže roboti dostanou plný obsah i meta tagy,
 * zatímco uživatelé dál dostanou plnohodnotnou React aplikaci (skripty zůstávají).
 *
 * Bezpečné selhání: skript NIKDY neshodí build – případnou chybu jen zaloguje
 * a skončí s kódem 0 (postbuild ho navíc volá s "|| true").
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const PORT = 45678;

// Veřejné, staticky vykreslitelné routy (bez /admin a bez dynamických detailů
// z databáze – ty se renderují klientsky proti API).
const ROUTES = [
  '/',
  '/sluzby',
  '/cenik',
  '/rezervace',
  '/o-nas',
  '/kontakt',
  '/nase-prace',
  '/blog',
  '/strihani-keru-kaceni-stromu',
  '/realizace-zahrad',
  '/pokladani-travniku',
  '/sekani-travy-hradec-kralove',
  '/sekani-travy-trutnov',
  '/sekani-travy-vrchlabi',
  '/sekani-travy-jaromer',
  '/sekani-travy-nachod',
  '/sekani-travy-hostinne',
];

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(BUILD_DIR, urlPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(BUILD_DIR, 'index.html'); // SPA fallback
      }
      res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function run() {
  if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
    console.warn('[prerender] build/index.html nenalezen – přeskakuji.');
    return;
  }

  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.warn('[prerender] puppeteer není dostupný – přeskakuji prerender.', e.message);
    return;
  }

  const server = await startServer();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    let ok = 0;
    for (const route of ROUTES) {
      try {
        const page = await browser.newPage();
        // Nečekáme na backend/analytics – ať prerender nevisí.
        await page.setRequestInterception(true);
        page.on('request', (r) => {
          const u = r.url();
          if (/\/api\//.test(u) || /google-analytics|googletagmanager|vercel\.live|vitals\.vercel/.test(u)) {
            return r.abort();
          }
          return r.continue();
        });

        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle2', timeout: 20000 });
        // Počkej, až React vyrenderuje obsah do #root.
        await page.waitForFunction(
          () => { const r = document.getElementById('root'); return r && r.children.length > 0; },
          { timeout: 10000 }
        ).catch(() => {});
        await new Promise((r) => setTimeout(r, 600)); // doběh helmetu / animací

        const html = await page.evaluate(() => {
          // Deduplikace hlavičky: statické tagy z index.html (homepage defaults)
          // a react-helmet-async se v prerenderu sčítají → konfliktní canonical/og.
          // Helmet aplikuje korektní per-page hodnotu jako poslední, proto u
          // každého klíče (meta name/property, canonical) ponecháme jen POSLEDNÍ výskyt.
          const keyFor = (el) => {
            if (el.tagName === 'META') {
              if (el.getAttribute('name')) return 'name:' + el.getAttribute('name');
              if (el.getAttribute('property')) return 'prop:' + el.getAttribute('property');
            }
            if (el.tagName === 'LINK' && el.getAttribute('rel') === 'canonical') return 'canonical';
            return null;
          };
          const byKey = {};
          document.querySelectorAll('head meta[name], head meta[property], head link[rel="canonical"]')
            .forEach((el) => {
              const k = keyFor(el);
              if (!k) return;
              (byKey[k] = byKey[k] || []).push(el);
            });
          Object.values(byKey).forEach((list) => {
            list.slice(0, -1).forEach((el) => el.remove()); // smaž vše kromě posledního
          });
          return '<!doctype html>\n' + document.documentElement.outerHTML;
        });
        await page.close();

        const outDir = route === '/' ? BUILD_DIR : path.join(BUILD_DIR, route);
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
        ok += 1;
        console.log(`[prerender] ✓ ${route}`);
      } catch (err) {
        console.warn(`[prerender] ✗ ${route}: ${err.message}`);
      }
    }
    console.log(`[prerender] Hotovo: ${ok}/${ROUTES.length} stránek.`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.close();
  }
}

run().catch((e) => {
  console.warn('[prerender] Přeskočeno kvůli chybě:', e.message);
  // Nikdy nevracíme nenulový kód – build nesmí spadnout kvůli prerenderu.
  process.exit(0);
});
