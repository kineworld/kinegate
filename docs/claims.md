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
- Public source, static deployment and actual 133.816667-second polished video exist: evidence/deployment.json. Anonymous browser reached HTTP200 and ran fixture preflight. This does not satisfy live trade requirements.
- Person confirmed API/competition qualification; four signed RWA endpoints returned HTTP200/code0: authenticated-rwa.json. Earlier 40101 came from our key/secret role inversion, corrected locally. Windows JSON timestamp conversion was separately fixed and regression tested. No secret values exported.
- Exact current AAPLon identity agrees across four endpoints and pinned-block BSC reads: current-api-asset-readonly.json. The old campaign AAPLB address was absent from the current catalog.
- Actual LIVE read-only UI inspection passed, and stored evidence remains REPLAY: browser-live-readonly.json. Metadata alone never establishes a passing trading receipt.

- One real receiver-bound6USDT quote returned code0, LiquidMesh and actual SWAP mode: authenticated-quote-6usdt.json. Earlier1/5 inputs failed40375. Fee strings are not reinterpreted without unit evidence; no expiry/minimum output was declared. A quote is not a transaction.

- Real quote→unsigned SWAP builder→off-chain simulation completed; service code0, predicted status FAILED from insufficient balance in the first capture: unsigned-swap-validation.json. A later fresh capture predicted FAILED from insufficient allowance: unsigned-swap-allowance-validation.json. API success is not predicted execution success. No signatures/approvals/broadcasts. Latest dispatcher storage and implementation-candidate code were acquired, but source/ABI/vendor association remain unverified: mainnet/router-funded-refresh.json.

- Returned router/spender provenance and calldata semantics remain UNVERIFIED: router-provenance-and-calldata.json and pinned-block router-readonly.json. Code presence and raw word matches cannot prove recipient/input/minimum-output enforcement. No source/ABI-based execution authorization is claimed.

- Recorded SWAP observations now use the shared thirteen gate definitions with a partial evidence adapter: src/observed-swap.mjs, tests/observed-swap.test.mjs, evidence/observed-audit.json. Unknown facts remain WAIT; known failures BLOCK. This separate audit cannot become an executable receipt, and editing source/intention/stop state invalidates its current binding.
- Strict minimum-output arithmetic rejects the saved floor-rounded value; a one-atomic boundary test proves that the exact cross-product condition is enforced. Builder declarations alone do not prove contract enforcement.
- Three native counterfactual simulations use the same block and original unsigned payload: evidence/mainnet/native-simulation-comparison.json. Low-gas FAILED, bounded higher-gas SUCCESS with 6 USDT simulated input delta and 0.017788313322723381 AAPLon simulated output delta, raised-minimum FAILED. No key, approval, signature, broadcast or actual spend. Saved minimum still fails exact 0.5% policy; executionReady=false.
- The Diamond compilation matches 127 execution bytes but not 53 CBOR metadata bytes: evidence/devex/router-source-verification.json. This is not full runtime identity, a swap facet audit or proof of current operator ownership.

- A fresh request at 0.49% produced a minimum meeting the authorized exact 0.5% cap, with three controlled native results preserved in mainnet/tight-slippage-native-comparison.json. It does not meet an exact 0.49% ceiling after rounding, does not alter the blocked historical audit, and does not prove real settlement. The client validates slippage as exact integer bps in 1–50 and signs the exact supplied query string; 58 tests pass.
