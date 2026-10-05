import { createBinanceClient, ApiError, VERIFIED_ASSETS } from '../server/binance.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const evidence = [];
const client = createBinanceClient({ onEvidence: e => { evidence.push(e); } });
const command = process.argv[2] ?? 'status';
const startedAt = new Date().toISOString();
let result;
try {
  if (command === 'status') result = client.status();
  else if (command === 'discovery') result = await client.discovery();
  else if (command === 'asset') result = await client.asset(process.argv[3] ?? VERIFIED_ASSETS.AAPLB);
  else if (command === 'quote') {
    const [amount, fromTokenAddress, toTokenAddress, userWalletAddress] = process.argv.slice(3);
    if (![amount, fromTokenAddress, toTokenAddress, userWalletAddress].every(Boolean)) throw new ApiError('USAGE', 'quote <amount in base units> <from address> <to address> <user wallet address>', 400);
    result = await client.quote({ amount, fromTokenAddress, toTokenAddress, userWalletAddress });
  } else throw new ApiError('USAGE', 'Commands: status, discovery, asset [allowlisted address], quote <amount> <from> <to> <receiver>', 400);
} catch (error) {
  result = { mode: 'UNAVAILABLE', error: error instanceof ApiError ? error.code : 'LOCAL_ERROR', message: error.message };
  process.exitCode = 1;
}
await mkdir(resolve(root, 'evidence/local-api'), { recursive: true });
await writeFile(resolve(root, 'evidence/local-api', `probe-${Date.now()}.json`), JSON.stringify({ startedAt, command, evidence, result }, null, 2));
console.log(JSON.stringify(result, null, 2));
