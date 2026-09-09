/**
 * Statický prerender SPA do HTML snapshotů pro každou veřejnou routu.
 *
 * Proč: Seznambot (a zčásti i Googlebot) nerenderuje JavaScript spolehlivě.
 * Tento skript po buildu vykreslí každou stránku v headless prohlížeči a uloží
 * hotové HTML do build/<route>/index.html. Vercel servíruje tyto fyzické
 * soubory dřív než SPA rewrite, takže roboti dostanou plný obsah i meta tagy,
 * zatímco uživatelé dál dostanou plnohodnotnou React aplikaci (skripty zůstávají).
 *
 * DVĚ ÚROVNĚ OCHRANY (dřív tu byla jen jedna a selhávala potichu):
 *  1) plný prerender headless prohlížečem – ideální stav (obsah + meta),
 *  2) když prohlížeč není k dispozici, běží ZÁLOŽNÍ režim bez prohlížeče:
 *     pro každou routu se z index.html vyrobí kopie se správným title,
 *     description, canonical a og:* podle seo-snapshot.json.
 *
 * Bez zálohy platilo: chybí Chrome → nevznikne ani jeden HTML soubor → Vercel
 * na KAŽDÉ URL servíruje homepage fallback → všechny stránky mají stejný title
 * i description a jsou pro Google/Seznam duplicitní. A protože se chyba jen
 * zalogovala, nebylo to na buildu vůbec vidět.
 *
 * seo-snapshot.json se automaticky přepisuje po každém úspěšném prerenderu,
 * takže záloha zůstává v souladu s tím, co reálně generuje aplikace.
 *
 * Build nikdy neshodíme (Vercel deploy musí projít), ale do logu píšeme
 * jednoznačné VAROVÁNÍ, ať je případný problém okamžitě vidět.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const SNAPSHOT_PATH = path.join(__dirname, 'seo-snapshot.json');
const PORT = 45678;

// Veřejné, staticky vykreslitelné routy (bez /admin a bez dynamických detailů
// z databáze – ty se renderují klientsky proti API).
// Pořadí = priorita prerenderu. Statické SEO stránky (služby, města) první,
// datově náročné /nase-prace a /blog až na konec – kdyby některá zdržovala,
// důležité stránky už jsou hotové.
const ROUTES = [
  '/',
  '/sluzby',
  '/cenik',
  '/rezervace',
  '/o-nas',
  '/kontakt',
  // Služby (samostatné SEO landing stránky)
  '/likvidace-pozemku',
  '/sekani-prerostle-travy',
  '/strihani-keru-kaceni-stromu',
  '/vertikutace-travniku',
  '/realizace-zahrad',
  '/pokladani-travniku',
  '/udrzba-zahrady',
  '/odvoz-bioodpadu',
  // Města
  '/sekani-travy-hradec-kralove',
  '/sekani-travy-trutnov',
  '/sekani-travy-vrchlabi',
  '/sekani-travy-jaromer',
  '/sekani-travy-nachod',
  '/sekani-travy-hostinne',
  // Datově náročné (fetch z backendu) – až na konec
  '/nase-prace',
  '/blog',
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

function writeRoute(route, html) {
  const outDir = route === '/' ? BUILD_DIR : path.join(BUILD_DIR, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
}

// ─── Záložní režim bez prohlížeče ────────────────────────────────────────────
// Nevyrobí sice vykreslený obsah, ale zajistí to nejdůležitější pro SEO:
// každá URL má vlastní title, description, canonical a og:*. Tím nikdy
// nevznikne stav "všechny stránky jsou duplicitní homepage".

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function setMeta(html, selectorAttr, name, value) {
  const re = new RegExp(`(<meta[^>]*${selectorAttr}="${name}"[^>]*content=")[^"]*(")`, 'i');
  if (re.test(html)) return html.replace(re, `$1${escAttr(value)}$2`);
  const tag = `<meta ${selectorAttr}="${name}" content="${escAttr(value)}" />`;
  return html.replace(/<\/head>/i, `    ${tag}\n</head>`);
}

// Vyprázdní <div id="root"> (počítá zanoření, takže si poradí i s vykreslenou
// stránkou). Pojistka pro případ, že by šablona nebyla čerstvá z CRA buildu –
// jinak by se do všech záložních stránek propsal obsah homepage.
function emptyRoot(html) {
  const open = html.match(/<div[^>]*id="root"[^>]*>/i);
  if (!open) return html;
  const start = html.indexOf(open[0]) + open[0].length;
  const re = /<div\b[^>]*>|<\/div>/gi;
  re.lastIndex = start;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + html.slice(m.index);
  }
  return html;
}

function applyFallbackMeta(shellHtml, route, meta) {
  let html = emptyRoot(shellHtml);
  if (meta.title) {
    html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escHtml(meta.title)}</title>`);
  }
  if (meta.description) {
    html = setMeta(html, 'name', 'description', meta.description);
    html = setMeta(html, 'property', 'og:description', meta.description);
  }
  if (meta.title) html = setMeta(html, 'property', 'og:title', meta.title);
  if (meta.canonical) {
    html = setMeta(html, 'property', 'og:url', meta.canonical);
    const linkRe = /<link[^>]*rel="canonical"[^>]*>/i;
    const link = `<link rel="canonical" href="${escAttr(meta.canonical)}" />`;
    html = linkRe.test(html) ? html.replace(linkRe, link)
                             : html.replace(/<\/head>/i, `    ${link}\n</head>`);
  }

  // Noscript blok ze šablony popisuje homepage. Na podstránce by robot bez JS
  // četl cizí H1 a cizí text → nahradíme ho krátkým obsahem té konkrétní stránky.
  const block = [
    '<noscript>',
    '<div style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:20px">',
    `<h1>${escHtml(meta.h1 || meta.title || '')}</h1>`,
    meta.intro ? `<p>${escHtml(meta.intro)}</p>` : '',
    meta.description ? `<p>${escHtml(meta.description)}</p>` : '',
    '<p>Telefon <a href="tel:+420730588372">730 588 372</a> · <a href="/">SeknuTo.cz</a></p>',
    '</div>',
    '</noscript>',
  ].filter(Boolean).join('\n');
  // Pozor: v šabloně je víc noscript bloků (např. fallback pro fonty). Nahradit
  // smíme jen ten se SEO obsahem – poznáme ho podle toho, že obsahuje <h1>.
  const seoBlockRe = /<noscript>(?:(?!<\/noscript>)[\s\S])*?<h1[\s\S]*?<\/noscript>/i;
  html = seoBlockRe.test(html)
    ? html.replace(seoBlockRe, block)
    : html.replace(/(<div id="root">)/i, `${block}\n$1`);
  return html;
}

// Čistá šablona (build/index.html PŘED prerenderem). Musíme si ji zapamatovat:
// jakmile se prerenderuje '/', je v build/index.html vykreslená homepage a ta by
// se do záložních stránek propsala jako cizí obsah.
let PRISTINE_SHELL = null;

function runFallback(routes, reason) {
  const indexPath = path.join(BUILD_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) return 0;
  let snapshot = {};
  try {
    snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
  } catch (e) {
    console.warn(`[prerender] VAROVÁNÍ: seo-snapshot.json chybí nebo je poškozený (${e.message}).`);
    console.warn('[prerender] VAROVÁNÍ: podstránky dostanou meta tagy homepage → riziko duplicitního obsahu.');
    return 0;
  }
  const indexHtml = PRISTINE_SHELL || fs.readFileSync(indexPath, 'utf8');
  let done = 0;
  for (const route of routes) {
    const meta = snapshot[route];
    if (!meta) { console.warn(`[prerender] ✗ záloha: ${route} není ve snapshotu`); continue; }
    if (route === '/') continue; // homepage = původní index.html, ten je správně
    try {
      writeRoute(route, applyFallbackMeta(indexHtml, route, meta));
      done += 1;
    } catch (err) {
      console.warn(`[prerender] ✗ záloha ${route}: ${err.message}`);
    }
  }
  console.warn(`[prerender] VAROVÁNÍ: plný prerender neproběhl (${reason}).`);
  console.warn(`[prerender] Použit ZÁLOŽNÍ režim: ${done} stránek má vlastní meta tagy, ale bez vykresleného obsahu.`);
  console.warn('[prerender] Oprava: zajistit v build prostředí Chrome pro puppeteer (např. PUPPETEER_EXECUTABLE_PATH).');
  return done;
}

async function run() {
  const indexPath = path.join(BUILD_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.warn('[prerender] build/index.html nenalezen – přeskakuji.');
    return;
  }
  PRISTINE_SHELL = fs.readFileSync(indexPath, 'utf8');

  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    runFallback(ROUTES, `puppeteer není nainstalovaný: ${e.message}`);
    return;
  }

  const server = await startServer();
  let browser;
  try {
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    } catch (e) {
      runFallback(ROUTES, `prohlížeč se nepodařilo spustit: ${e.message}`);
      return;
    }

    let ok = 0;
    const failed = [];
    const snapshot = {};
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

        const result = await page.evaluate((isHome) => {
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

          // Noscript blok z index.html nese H1 a text homepage. Na prerenderované
          // stránce je obsah už vykreslený v #root, takže je blok nadbytečný – a na
          // podstránkách přímo škodí (robot bez JS by četl cizí H1 jako první).
          // Jen blok se SEO obsahem (má H1) – ostatní noscripty (fallback pro
          // fonty apod.) musí zůstat.
          if (!isHome) {
            document.querySelectorAll('body > noscript').forEach((el) => {
              if (/<h1[\s>]/i.test(el.textContent || '')) el.remove();
            });
          }

          const attr = (sel, a) => { const el = document.querySelector(sel); return el ? el.getAttribute(a) : ''; };
          // H1 a úvodní odstavec si uložíme do snapshotu – z nich pak umí záložní
          // režim (bez prohlížeče) postavit krátký, ale pro danou stránku správný obsah.
          const root = document.getElementById('root');
          const h1El = root ? root.querySelector('h1') : null;
          const pEl = root
            ? Array.from(root.querySelectorAll('p')).find((e) => (e.textContent || '').trim().length > 60)
            : null;
          return {
            html: '<!doctype html>\n' + document.documentElement.outerHTML,
            meta: {
              title: document.title || '',
              description: attr('head meta[name="description"]', 'content') || '',
              canonical: attr('head link[rel="canonical"]', 'href') || '',
              h1: h1El ? (h1El.textContent || '').trim().slice(0, 160) : '',
              intro: pEl ? (pEl.textContent || '').trim().slice(0, 320) : '',
            },
          };
        }, route === '/');
        await page.close();

        writeRoute(route, result.html);
        snapshot[route] = result.meta;
        ok += 1;
        console.log(`[prerender] ✓ ${route}`);
      } catch (err) {
        failed.push(route);
        console.warn(`[prerender] ✗ ${route}: ${err.message}`);
      }
    }

    // Snapshot slouží jako záloha pro build, kde nepůjde spustit prohlížeč.
    if (ok > 0) {
      try {
        fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
      } catch (e) {
        console.warn(`[prerender] snapshot se nepodařilo uložit: ${e.message}`);
      }
    }

    if (failed.length) runFallback(failed, `${failed.length} stránek se nevykreslilo`);

    console.log(`[prerender] Hotovo: ${ok}/${ROUTES.length} stránek.`);
    if (ok < ROUTES.length) {
      console.warn(`[prerender] VAROVÁNÍ: ${ROUTES.length - ok} stránek nemá plný prerender: ${failed.join(', ')}`);
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.close();
  }
}

run().catch((e) => {
  console.warn('[prerender] VAROVÁNÍ: prerender selhal:', e.message);
  try { runFallback(ROUTES, e.message); } catch (_) { /* záloha je best-effort */ }
  // Nikdy nevracíme nenulový kód – build nesmí spadnout kvůli prerenderu.
  process.exit(0);
});
