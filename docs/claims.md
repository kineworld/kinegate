# Claim register

- Product implements a deterministic, evidence-bound local preflight: src/engine.mjs; tests/engine.test.mjs.
- Editing intention/policy/evidence or exceeding expiry invalidates a receipt: createReceipt/verifyReceipt; tamper, current-context and clock tests; actual browser evidence in browser-qa.json.
- Exact fixed-point input and constraints: parseUnits/uint, boundary unit tests. No floating-point token amounts.
- Sixteen fixture scenarios compare to a deliberately simplified price-only baseline: evidence/fixture-benchmark.json. This is a constructed policy test, not a real error-rate study or profitable strategy.
- Official APIs exist and schemas were inspected: docs/api-contracts.md and official SDK source commit recorded there. Authenticated RWA calls additionally succeeded in authenticated-rwa.json; SDK inspection itself does not prove runtime success.
- One real unauthenticated call returned 40101: evidence/devex/api-probes.json. Not a successful data call and not eligibility evidence.
- No mainnet execution, transaction hash, volume, user adoption, savings or return is claimed.
- Public static app has no signing/broadcast surface: code and execution-surface lint. No blanket security certification claimed.
- Receipt SHA-256 is tamper evidence for the serialized payload, not an issuer signature or trusted oracle proof.
- Final DevEx is not generated. Human report remains BLOCKED_BY_DEVEX_RULE until a human authors and submits their own experience.
- Public source, static deployment and actual 133.68-second video exist: evidence/deployment.json. Anonymous browser reached HTTP200 and ran fixture preflight. This does not satisfy live trade requirements.
- Person confirmed API/competition qualification; four signed RWA endpoints returned HTTP200/code0: authenticated-rwa.json. Earlier 40101 came from our key/secret role inversion, corrected locally. Windows JSON timestamp conversion was separately fixed and regression tested. No secret values exported.
- Exact current AAPLon identity agrees across four endpoints and pinned-block BSC reads: current-api-asset-readonly.json. The old campaign AAPLB address was absent from the current catalog.
- Actual LIVE read-only UI inspection passed, and stored evidence remains REPLAY: browser-live-readonly.json. Metadata alone never establishes a passing trading receipt.

- One real receiver-bound6USDT quote returned code0, LiquidMesh and actual SWAP mode: authenticated-quote-6usdt.json. Earlier1/5 inputs failed40375. Fee strings are not reinterpreted without unit evidence; no expiry/minimum output was declared. A quote is not a transaction.

- Real fresh quote→unsigned SWAP builder→off-chain simulation completed; service code0, predicted status FAILED from insufficient balance: unsigned-swap-validation.json. API success is not predicted execution success. No signatures/approvals/broadcasts.
