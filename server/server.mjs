import http from 'node:http';
import { readFile, appendFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname, sep } from 'node:path';
import { createBinanceClient, ApiError } from './binance.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const logDirectory = resolve(root, 'evidence/local-api');
const client = createBinanceClient({ onEvidence: async e => { await mkdir(logDirectory, { recursive: true }); await appendFile(resolve(logDirectory, 'requests.ndjson'), JSON.stringify(e) + '\n'); } });
const mime = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };
const port = Number(process.env.PORT ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be an integer from 1024 to 65535');
const allowedOrigins = new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`]);
const pending = new Map();
const cache = new Map();
async function cached(key, loader) {
  const previous = cache.get(key);
  if (previous && Date.now()-previous.time < 15000) return previous.value;
  if (pending.has(key)) return pending.get(key);
  if (pending.size >= 4) throw new ApiError('LOCAL_RATE_LIMIT', 'Wait for the current read-only request to finish.', 429);
  const promise = loader().then(value => { cache.set(key, {time:Date.now(),value}); return value; }).finally(()=>pending.delete(key));
  pending.set(key,promise);
  return promise;
}
const server = http.createServer(async (req, res) => {
  const json = (status, value) => { res.writeHead(status, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
  try {
    if (req.method !== 'GET') return json(405, { error: 'METHOD_DENIED' });
    if (!allowedOrigins.has(`http://${req.headers.host}`)) return json(403, {error:'HOST_DENIED'});
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    if (url.pathname.startsWith('/api/') && ((req.headers.origin && !allowedOrigins.has(req.headers.origin)) || req.headers['sec-fetch-site']==='cross-site')) return json(403,{error:'ORIGIN_DENIED'});
    if (url.pathname === '/api/status') return json(200, client.status());
    if (url.pathname === '/api/discovery') {
      const result = await cached('discovery',()=>client.discovery());
      return json(200, { code:result.code, timestamp:result.timestamp, mode:'LIVE', observedAt: new Date().toISOString(), data: Array.isArray(result.data) ? result.data.slice(0, 100) : [] });
    }
    if (url.pathname === '/api/asset') { const address=url.searchParams.get('address') ?? ''; return json(200,await cached('asset:'+address.toLowerCase(),()=>client.asset(address))); }
    if (url.pathname.startsWith('/api/')) return json(404, { error: 'ROUTE_NOT_FOUND' });
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    let candidate;
    if (!relative || relative === 'index.html') candidate = resolve(root, 'index.html');
    else if (relative.startsWith('src/') || relative.startsWith('evidence/')) candidate = resolve(root, relative);
    else return json(404,{error:'NOT_FOUND'});
    const allowedRoots = [resolve(root, 'src'), resolve(root, 'evidence')];
    const insideAllowed = candidate === resolve(root,'index.html') || allowedRoots.some(base => candidate.startsWith(base + sep));
    if (!insideAllowed || candidate.startsWith(logDirectory + sep) || relative.split(/[\\/]/).some(part => part.startsWith('.')) || !mime[extname(candidate)]) return json(403, { error: 'FILE_DENIED' });
    const bytes = await readFile(candidate);
    res.writeHead(200, { 'Content-Type': mime[extname(candidate)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }); res.end(bytes);
  } catch (error) {
    if (error instanceof ApiError) return json(error.status, { error: error.code, message: error.message, mode: 'UNAVAILABLE' });
    json(404, { error: 'NOT_FOUND' });
  }
});
server.listen(port, '127.0.0.1', () => console.log(`KineGate: http://127.0.0.1:${port} (local only, read-only API)`));
