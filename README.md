# KineGate

**A ticker is only the beginning.** KineGate turns one tokenized-equity trade intention into an expiring preflight receipt bound to the issuer, exact amount, quote clocks, permissions and execution evidence. Edit a reviewed field and the old receipt becomes invalid.

The no-wallet workspace is a complete **FIXTURE / local SIMULATION** experience: sixteen scenarios, thirteen deterministic checks, receipt export/import, clock expiry and a same-input comparison. It never signs or broadcasts. Actual Binance authenticated data and small funded mainnet settlement are still blocked pending authorized eligible credentials and human signing; the recorded BSC contract read is distinct from a trade.

Public repository and deployed demo links will be recorded here after verified publication. All submission gates are tracked in [the audit](docs/submission-audit.md).

![Yellow/black workspace](evidence/desktop-yellow.png)

## Try in a minute

Requires Node.js 24+. No credentials or wallet needed.

```sh
npm ci
npm start
```

Open http://127.0.0.1:4173 . Run preflight on the $50 fixture, export its receipt, run local simulation, then edit the amount to $51. Choose the weekend, different-issuer or expired-quote cases to inspect exact blocking reasons. Advance the virtual clock to expire a valid receipt. The $25 scenario provides a correctly matching smaller fixture quote.

## Evidence before action

- [Test run](evidence/tests-run.txt): 38 unit/integration checks, including exact arithmetic, malformed policy, whitelist, tampering, clock expiry, signed-request bytes, bounded retry and local server protection.
- [Browser evidence](evidence/browser-qa.json): 27 actual browser checks, all sixteen scenarios, recovery/import rejection, 360px layout and keyboard smoke. [Mobile screenshot](evidence/mobile-yellow.png).
- [Comparison](evidence/fixture-benchmark.json): 16 authored fixtures; simplified display-price comparator accepts 13 of 14 policy-unsafe cases, gate accepts 0. Constructed fault cases are not a real-world safety or profitability estimate.
- [Independent review](evidence/review-independent.md): reproduced bugs and fixes, HTTP isolation checks, explicit limitations.
- [Real read-only BSC acquisition](evidence/mainnet/bsc-readonly-probe.json): official-listed AAPLB contract code and decimals, no liquidity, eligibility or transaction claim.
- [Real no-key API response](evidence/devex/unauthenticated-probe.json): HTTP401/code40101, **not** successful data integration.
- [Claims and their limits](docs/claims.md), [judging map](docs/judging.md), [rules](docs/rules.md).

The referencePrice field in RWA data is derived per-share token value; it must not be marketed as an independent executable stock quote. RFQ typed data and EVM simulation require separate execution-mode handling. A receipt hash checks internal consistency, not source authenticity or chain settlement.

## Architecture and local API

Pure bigint checks in `src/engine.mjs`; original fixture dataset in `src/fixtures.mjs`; vanilla module UI; loopback Node server and minimal documented HMAC adapter. Public production build is static and excludes all credentials and the API server. Static hosting shows API unavailability explicitly.

For authorized API reads, copy `.env.example` to ignored `.env`, configure `OC_API_KEY` and `OC_SECRET_KEY` locally, and personally confirm API/asset qualification before enabling its flag. Restart the server; `npm run probe -- status`, `npm run probe -- discovery`, `npm run probe -- asset`. Local endpoints: `/api/status`, `/api/discovery`, `/api/asset?address=<allowlisted-contract>`. RWA responses are raw inspection evidence and never silently authorize a receipt. No broadcast/signing route exists.

[API contract sources](docs/api-contracts.md) · [Architecture](docs/architecture.md) · [Safety](docs/security.md) · [Recovery and human reproduction](docs/devex-reproduction-guide.md) · [Open-source attribution](docs/attribution.md).

## Verify and record

```sh
npm test
npm run lint
npm run typecheck
npm run benchmark
npm run build
node scripts/browser-qa.mjs
node scripts/record-demo.mjs
```

Type checking covers the engine, fixtures and request adapter; UI and server syntax are checked by the bounded custom lint. Browser tooling uses installed Edge on Windows, Chromium on other platforms (`npx playwright install chromium` if needed). Start the server first. Recorded video uses actual application interactions; captions and recording steps live in `demo/`. No final human DevEx report is generated.

## Competition readiness

Not fully eligible for final submission yet: authenticated integration and funded mainnet demonstration are unverified, identity/qualification fields are human owned, and the official DevEx rule requires a personally authored report. [Actual form fields](docs/submission-fields.md), [human gates](docs/human-actions.md), [submission audit](docs/submission-audit.md). No registration or submission receipt exists. MIT-licensed original project; no issuer or Binance endorsement claimed.
