#!/usr/bin/env node
/**
 * Regenerate social share images into public/og/.
 *
 *   npm run og
 *
 * 1. Builds the hidden card pages (src/pages/og/[slug].astro) with `--mode og`.
 * 2. Serves that build locally and screenshots each card at 1200 × 630 with a
 *    headless Chromium browser (Edge or Chrome), driven over the DevTools
 *    protocol using Node's built-in WebSocket. No extra dependencies.
 *
 * Set BROWSER_PATH if Edge/Chrome isn't found automatically.
 * Re-run whenever names, titles or case-study metrics change.
 */
import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BUILD = join(ROOT, '.og-build');
const OUT = join(ROOT, 'public', 'og');
const BASE = '/my-portfolio'; // keep in sync with `base` in astro.config.mjs
const PORT = 4339;
const DEBUG_PORT = 9339;

const browserPath = [
  process.env.BROWSER_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p));
if (!browserPath) throw new Error('No Edge/Chrome found. Set BROWSER_PATH.');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. Build the card pages.
console.log('Building card pages…');
// Run Astro's CLI through Node directly (no shell), so paths with spaces stay intact.
const build = spawnSync(
  process.execPath,
  [
    join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs'),
    'build',
    '--mode',
    'og',
    '--outDir',
    BUILD,
  ],
  { cwd: ROOT, stdio: 'inherit' },
);
if (build.status !== 0) process.exit(build.status ?? 1);
// Card pages are folders; skip files copied in from public/og/.
const slugs = readdirSync(join(BUILD, 'og'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

// 2. Serve the build (stripping the base path).
const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
};
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.startsWith(BASE)) path = path.slice(BASE.length);
  let file = normalize(join(BUILD, path));
  if (!file.startsWith(BUILD)) return res.writeHead(403).end();
  if (existsSync(file) && !extname(file)) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(PORT);

// 3. Screenshot each card.
const browser = spawn(
  browserPath,
  [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'og-'))}`,
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

try {
  let tabs;
  for (let i = 0; i < 50 && !tabs; i++) {
    try {
      tabs = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
    } catch {
      await sleep(200);
    }
  }
  const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));

  let id = 0;
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const msgId = ++id;
      const onMessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', onMessage);
          resolve(msg.result ?? {});
        }
      };
      ws.addEventListener('message', onMessage);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1200,
    height: 630,
    deviceScaleFactor: 1,
    mobile: false,
  });
  mkdirSync(OUT, { recursive: true });

  for (const slug of slugs) {
    await send('Page.navigate', { url: `http://localhost:${PORT}${BASE}/og/${slug}/` });
    await sleep(600);
    await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
    await sleep(200);
    const { data } = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 },
    });
    writeFileSync(join(OUT, `${slug}.png`), Buffer.from(data, 'base64'));
    console.log(`  ✓ public/og/${slug}.png`);
  }
  ws.close();
} finally {
  browser.kill();
  server.close();
  rmSync(BUILD, { recursive: true, force: true });
}
