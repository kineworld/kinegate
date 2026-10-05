import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const TRANSPORT_MAX_BYTES = 1024 * 1024;
const scriptPath = fileURLToPath(new URL('./windows-transport.ps1', import.meta.url));
const allowedPath = /^\/build\/api\/v1\/dex\/(market\/rwa\/(tokens|price|underlying-profile|underlying-market)|aggregator\/(quote|swap)|pre-transaction\/simulate)$/;
const allowedHeaders = new Set(['x-oc-apikey', 'x-oc-timestamp', 'x-oc-sign', 'x-oc-nonce', 'content-type']);
/** @typedef {{spawnFn?:typeof spawn}} TransportOptions */
/** Original stdin-only PowerShell bridge. Custom process injection is for FIXTURE tests. @param {TransportOptions} [options] @returns {typeof fetch} */
export function createWindowsTransport(options = {}) {
  const spawnFn = options.spawnFn ?? spawn;
  return async (input, init = {}) => {
    if (typeof input !== 'string' && !(input instanceof URL)) throw new Error('WINDOWS_TRANSPORT_INPUT_DENIED');
    const rawUrl = String(input);
    const url = new URL(rawUrl);
    const method = init.method ?? 'GET';
    if (url.origin !== 'https://web3.binance.com' || url.username || url.password || url.hash || !allowedPath.test(url.pathname) || !['GET', 'POST'].includes(method)) throw new Error('WINDOWS_TRANSPORT_ENDPOINT_DENIED');
    if (rawUrl !== 'https://web3.binance.com' + url.pathname + url.search) throw new Error('WINDOWS_TRANSPORT_NONCANONICAL_URL');
    const headers = new Headers(init.headers);
    /** @type {Record<string,string>} */ const headerRecord = {};
    headers.forEach((value, key) => {
      if (!allowedHeaders.has(key)) throw new Error('WINDOWS_TRANSPORT_HEADER_DENIED');
      headerRecord[key] = value;
    });
    if (init.body !== undefined && typeof init.body !== 'string') throw new Error('WINDOWS_TRANSPORT_BODY_DENIED');
    const body = typeof init.body === 'string' ? init.body : '';
    if (method === 'GET' && body) throw new Error('WINDOWS_TRANSPORT_BODY_DENIED');
    const payload = JSON.stringify({ url: rawUrl, method, headers: headerRecord, body });
    if (Buffer.byteLength(payload) > 65536) throw new Error('WINDOWS_TRANSPORT_INPUT_TOO_LARGE');
    if (init.signal?.aborted) throw new Error('WINDOWS_TRANSPORT_ABORTED');
    return new Promise((resolve, reject) => {
      // No credentials, signature or body in process arguments, environment, files or stderr.
      const child = spawnFn('pwsh.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', scriptPath], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR, PATH: process.env.PATH, TEMP: process.env.TEMP, TMP: process.env.TMP } });
      /** @type {Buffer[]} */ const chunks = [];
      let length = 0;
      let stageCode = '';
      let settled = false;
      /** @param {string} code */
      function fail(code) {
        if (settled) return;
        settled = true; clearTimeout(timer); init.signal?.removeEventListener('abort', onAbort); child.kill(); reject(new Error(code));
      }
      function onAbort() { fail('WINDOWS_TRANSPORT_ABORTED'); }
      const timer = setTimeout(() => fail('WINDOWS_TRANSPORT_TIMEOUT'), 10000);
      init.signal?.addEventListener('abort', onAbort, { once: true });
      child.on('error', () => fail('WINDOWS_TRANSPORT_UNAVAILABLE'));
      // Discard child errors: they may include a URI or request detail in an upstream stack trace.
      child.stderr?.on('data', chunk => {
        const code = String(chunk);
        if (/^WINDOWS_NATIVE_TRANSPORT_FAILED_(STDIN|INPUT_PARSE|INPUT_VALIDATE|REQUEST_HEADERS|HTTP_REQUEST|RESPONSE_BODY|RESPONSE_HEADERS|RESPONSE_SERIALIZE)$/.test(code)) stageCode = code;
      });
      child.stdout?.on('data', (chunk) => {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        length += bytes.length;
        if (length > TRANSPORT_MAX_BYTES) { fail('WINDOWS_TRANSPORT_RESPONSE_TOO_LARGE'); return; }
        chunks.push(bytes);
      });
      child.on('close', code => {
        if (settled) return;
        clearTimeout(timer); init.signal?.removeEventListener('abort', onAbort);
        if (code !== 0) { fail(stageCode || 'WINDOWS_TRANSPORT_FAILED'); return; }
        try {
          const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          if (!parsed || typeof parsed !== 'object' || !Number.isInteger(parsed.status) || parsed.status < 200 || parsed.status > 599 || (parsed.status >= 300 && parsed.status < 400) || typeof parsed.body !== 'string' || !parsed.headers || typeof parsed.headers !== 'object' || Array.isArray(parsed.headers)) throw new Error('invalid response shape');
          /** @type {Record<string,string>} */ const safeHeaders = {};
          for (const [key, value] of Object.entries(parsed.headers)) {
            if (!['content-type', 'retry-after', 'content-length'].includes(key.toLowerCase()) || typeof value !== 'string') throw new Error('invalid response header');
            safeHeaders[key] = value;
          }
          const response = new Response([204, 205, 304].includes(parsed.status) ? null : parsed.body, { status: parsed.status, headers: safeHeaders });
          settled = true; resolve(response);
        } catch { fail('WINDOWS_TRANSPORT_INVALID_RESPONSE'); }
      });
      if (!child.stdin || !child.stdout || !child.stderr) { fail('WINDOWS_TRANSPORT_UNAVAILABLE'); return; }
      child.stdin.on('error', () => fail('WINDOWS_TRANSPORT_INPUT_FAILED'));
      child.stdin.end(payload, 'utf8');
    });
  };
}

export const windowsTransport = createWindowsTransport();
