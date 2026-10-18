import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { renderHeart } from '../src/heart-svg.js';
import { validateMotion } from '../src/motion.js';
const settingsUrl = new URL('../assets/motion.json', import.meta.url);
let settings = validateMotion(JSON.parse(await readFile(settingsUrl, 'utf8')));

const files = new Map([
  ['/', ['./preview.html', 'text/html']],
]);
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  if (pathname === '/motion' || pathname === '/heart.svg') {
    try {
      if (pathname === '/motion' && req.method === 'POST') {
        if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) throw new Error('同じ画面から保存してください');
        if (!req.headers['content-type']?.startsWith('application/json')) throw new Error('JSON が必要です');
        let body = '';
        for await (const chunk of req) { body += chunk; if (body.length > 2048) throw new Error('入力が長すぎます'); }
        const next = validateMotion(JSON.parse(body));
        const svg = renderHeart(next);
        await writeFile(new URL('../assets/heart.svg', import.meta.url), svg);
        await writeFile(settingsUrl, JSON.stringify(next, null, 2) + '\n');
        settings = next;
      } else if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405); res.end(); return;
      }
      const current = url.searchParams.has('settings') ? validateMotion(JSON.parse(url.searchParams.get('settings'))) : settings;
      res.writeHead(200, { 'Content-Type': pathname === '/motion' ? 'application/json' : 'image/svg+xml; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : pathname === '/motion' ? JSON.stringify(settings) : renderHeart(current));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  const file = files.get(pathname);
  if (!file || !['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    console.error(error.message);
    res.writeHead(500); res.end('Unable to load preview');
  }
});
server.listen(Number(process.env.PORT ?? 8787), '127.0.0.1', () => {
  console.log(`Profile preview: http://127.0.0.1:${server.address().port}/`);
});
