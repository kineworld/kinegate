# Independent implementation review

Reviewer: a separate review agent in the current task. Review began 2026-10-05 11:31:05 UTC; verification snapshot 11:34:19 UTC. Scope: `src/engine.mjs`, `src/fixtures.mjs`, `server/binance.mjs`, `server/server.mjs`, their tests, current `src/app.mjs`/`index.html`, and product/security/claim documentation. This is a bounded code and behavior review, not a security certification or a human DevEx report. UI was still being developed during review.

Only this review file was written by the reviewer. Reproducible findings were sent to the root agent; implementation repairs were performed by the root agent and independently rechecked here.

## Findings and repair verification

| Priority/status | Finding | Reproduction and result | Required disposition |
| --- | --- | --- | --- |
| P2, FIXED_AND_RETESTED | Engine policy accepted malformed boolean/whitelist types | With an otherwise passing fixture: delete `policy.stopped`; or set `allowClosed = 'false'` while market is CLOSED with a fresh reference; or replace approved-assets array with its comma-joined string. Each originally returned READY_FOR_LOCAL_SIMULATION. After repair each returns BLOCKED. | Explicit boolean types and arrays now required; regressions added |
| P2, FIXED_AND_RETESTED | `parseUnits` accepted a JavaScript number whose precision was already lost | `parseUnits(9007199254740993, 0)` originally returned `9007199254740992`. After repair it throws, requiring a decimal string. | Keep string-only fixed-point input |
| P2, FIXED_AND_RETESTED | Default whitelist arrays were mutable despite top-level freeze | `Object.isFrozen(DEFAULT_POLICY.approvedAssets)` and `.approvedSpenders` were originally false. Scenario policies shallow-copy these defaults. After repair both arrays are frozen. | Retain nested freezing or independent immutable policy construction |
| Functional, FIXED_AND_RETESTED | Local homepage used nonexistent `public/index.html`, whereas UI/build use root `index.html` | Initial code could not serve the new homepage. Root repaired routing. Independent server now returns HTTP 200 and actual HTML at `/`. | Keep local and static-build entry paths consistent |
| P3, COPY_LIMITATION | Duplicate local simulation claim exceeds the persistence implemented | `src/app.mjs` stores receipt bindings in an in-memory Set; reload clears it. Current UI says duplicate receipts do not execute twice without a session qualifier. No assets are involved. | Say deduplication applies within this browser session; do not imply durable order idempotency |

The first run of existing engine/client tests passed 31/31 despite the malformed-policy and numeric-input gaps. After changes, `node --test tests/engine.test.mjs tests/binance.test.mjs` passed 34/34, including policy/numeric regression cases and client response/provenance coverage. Tests use fixtures; this does not establish authenticated external API success.

## Independently executed HTTP checks

Spawned temporary Node servers on loopback ports 4197 and 4198 with empty API key/secret and eligibility false, then terminated those child processes. No API credentials were read, no authenticated external call occurred, and no request evidence logs were created. Actual HTTP outcomes:

| Request | Result |
| --- | --- |
| `/` | 200, actual project HTML |
| `/src/engine.mjs` | 200, expected source module |
| `/src%2f..%2fdocs%2fmission.md` | 403 FILE_DENIED |
| `/src/%2e%2e%5cdocs%5cmission.md` | 403 FILE_DENIED |
| `/evidence/local-api/test.json` | 403 FILE_DENIED |
| `/%2eenv` | 404 NOT_FOUND |
| `/C:%5cWindows%5cwin.ini` | 404 NOT_FOUND |
| `/api/status` | 200, false credential/eligibility/signing/spending flags |
| `/api/discovery` | 503 CREDENTIALS_MISSING |
| `/api/status` with foreign Origin | 403 ORIGIN_DENIED |
| `/api/status` with cross-site Fetch Metadata | 403 ORIGIN_DENIED |
| `/api/status` with foreign Host, sent using `node:http` | 403 HOST_DENIED |
| `/api/status` with localhost/127.0.0.1 Host | 200 |

Note: the initial Node `fetch` Host-override attempt did not establish the transmitted Host. It was replaced by `node:http` with explicit Host, which verified the real denial. Encoded traversal denial was checked against the running server, not only against an imitation of the path function.

Static routing uses lexical resolved-path containment and blocks dot segments and the private local-api directory. It does not resolve symlink/junction targets before read. No symlink escape was demonstrated or created in this task. If local deployment later includes links under served directories, add realpath containment or prohibit them; do not treat this review as proving all filesystem configurations safe. Public static build excludes server credentials and the local API server. Loopback exposure controls are not a substitute for an authenticated service if deployed remotely.

## Authenticity, execution and race boundaries

- **Fixed point:** Inputs, outputs, min-received, balances, allowance, conversion ratios, and fee/gas caps use bigint/string amounts. The engine validates canonical unsigned integers and bounded precision. Display formatting truncates intentionally; it must not become an executable input without exact reparsing. The fixture input currency is USD-equivalent with 18 decimals; no real input-token schema is claimed. Future real normalization must include input token identity/decimals/currency and verified fee valuation.
- **Fail closed:** Missing amount/timestamp/reference/simulation, mismatched identity, unknown market/provenance, stale/future quote evidence, insufficient funding, denied eligibility and stop policy prevent readiness. Policy schema holes found above were repaired. Engine outcomes always retain `canSign:false` and `canBroadcast:false`.
- **Policy whitelist:** Chain/issuer/address and vendor/spender are bound; mutually agreeing but unapproved identities are rejected in tests. Fixture addresses are synthetic and block 0 denotes no chain observation. DEFAULT_POLICY is not a list of real approved execution contracts. The real API asset allowlist is a separate documented AAPLB address and is not promoted automatically into a passing fixture receipt.
- **Receipt authenticity:** A reviewer reproduced changing fixture provenance to LIVE, recomputing its result and SHA-256, and obtaining an internally valid receipt when verifying without trusted current context. This is expected for an unsigned hash and is disclosed in docs/UI: anyone can hash invented data. It proves no issuer signature, trusted oracle observation, personal eligibility or chain settlement. Current UI import passes its current FIXTURE context, so a relabeled LIVE payload does not match that context. Keep the warning and never present hash validity as LIVE proof.
- **TOCTOU:** Receipt verification recomputes original and current-time checks, compares current snapshot/intention/policy when supplied, and rejects equality at expiry. UI uses revision tokens around asynchronous hash/verification/import operations and invalidates on editable intention/policy changes. The public fixture clock is explicitly virtual; it advances/reset by controls and is not live wall-clock expiry. No real fresh RPC/quote/settlement validation occurs after receipt creation. Optional `current` in the standalone verifier must never be mistaken for an execution authorization.
- **RFQ versus EVM:** Client quote and EVM simulation are separate. No RFQ EIP-712 order is treated as executable EVM calldata. Current simulation gate binds an asserted quote ID and predicted output, not a real signed transaction, recipient, RFQ domain/order or settled balance delta. Docs state this limitation. No approval/order submission/broadcast route is implemented.
- **Deduplication:** The in-memory Set prevents repeated local simulation of the same receipt in one session. It is not durable nonce/order idempotency, crash recovery or prevention of duplicate real broadcasts.
- **Secrets/public surface:** Browser receives boolean configuration status and read-only responses, not key/secret/signature headers. Logs record endpoint names/status/timing/parameter names, omitting credential headers and parameter values. Public UI uses textContent/DOM construction rather than rendering imported strings as HTML and caps imported JSON at 1 MiB. This review did not inspect unrelated personal files or actual credentials.
- **API semantics:** API envelope business success is checked separately from HTTP status; bounded response size, request timeout, bounded GET retry, redirect denial, and no POST retry are covered by current client tests. Injected fetch is labeled FIXTURE. Endpoint-specific successful array/object shape is checked; raw field values still require independent normalization before any live decision.

## Rule and product claim assessment

The current fixture banner, synthetic address notice, zero-signing language, baseline limitations, raw integration-status distinction, and hash warning are consistent with the implementation. The fixture baseline is an authored, simplified price-only comparator over 16 constructed cases; it does not establish production error rates, avoided losses, profitability, user demand or winning probability.

The optional receipt/decision mechanism alone does not satisfy a completed competition submission. Outstanding gates remain:

1. A real person must establish competition/API/issuer/venue eligibility and provide actual registration/contact/account identity. An environment flag or fixture permission is a configuration/fixture state, not proof of personal facts.
2. Authenticated Binance Web3 calls and useful real API integration remain unverified. An unauthenticated failure and official schemas establish neither successful integration nor asset trading permission.
3. Official track calls for a small real BSC mainnet demo; current implementation has no signing/settlement adapter and no authorized spending. The public fixture workflow is correctly labeled but cannot replace mainnet execution evidence.
4. Actual project form requires an accessible video of at most four minutes, despite the homepage's optional-video wording. Final public repo, demo and runnable entry must be verified anonymously and remain available through judging.
5. Final DevEx report must be personally authored from actual experience. Objective evidence and this review do not replace it. Do not submit AI-generated report prose.
6. Preserve the final submitted commit and frozen artifacts by 2026-10-11 12:00 UTC. A review passed before later edits is not coverage of those edits.

## Snapshot and remaining test limits

Files were edited concurrently by the root during this review; this verification pertains to the following SHA-256 snapshot at 11:34:19 UTC:

```text
src/engine.mjs      d0ac68ce3fd413792e612b40afc50dba8a99acad6d89ad458e8742c8374ab3ea
src/fixtures.mjs    4b1bbbb90f3f7c904dcb8bcc4f793857de8bd07efc9185354f716a9d5a89dee5
server/binance.mjs  ddea0897bee1c40531301e37c867cc310dfe5be68c7263fe20dc38ac3eb6b9f3
server/server.mjs   c0dc373a6dc5b2a9b055456430e40ae1782a3c53583c2c8cddc9956eeba299af
src/app.mjs         b74b5c4d93de36fcc8d347335bc9be80a4c55b0d3e389bb8d4ec7048bebbb8407
index.html         188a07ed33ff09746e573f292a612861c54430d3680b2073610e6728cf8d0deb
```

NOT_RUN by this reviewer: actual browser end-to-end/UI layout, clean install/typecheck/production build, hosted anonymous access, valid-key authenticated API, real chain execution, RFQ settlement, issuer onboarding, form submission and human DevEx. Those require their own evidence. No demonstrated unresolved funds-loss or credential-disclosure bug was found within the reviewed no-signing local surface; the remaining session-dedup wording and stated limitations must remain visible.
