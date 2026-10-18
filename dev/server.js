import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['./preview.html', 'text/html']],
  ['/heart.svg', ['../assets/heart.svg', 'image/svg+xml']],
]);
const server = createServer(async (req, res) => {
  const file = files.get(new URL(req.url, 'http://localhost').pathname);
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
