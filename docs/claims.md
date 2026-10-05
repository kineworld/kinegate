# Claim register

- Product implements a deterministic, evidence-bound local preflight: src/engine.mjs; tests/engine.test.mjs.
- Editing intention/policy/evidence or exceeding expiry invalidates a receipt: createReceipt/verifyReceipt; tamper, current-context and clock tests; browser evidence pending.
- Exact fixed-point input and constraints: parseUnits/uint, boundary unit tests. No floating-point token amounts.
- Sixteen fixture scenarios compare to a deliberately simplified price-only baseline: evidence/fixture-benchmark.json. This is a constructed policy test, not a real error-rate study or profitable strategy.
- Official APIs exist and schemas were inspected: docs/api-contracts.md and official SDK source commit recorded there. This does not mean our authenticated integration has succeeded.
- One real unauthenticated call returned 40101: evidence/devex/api-probes.json. Not a successful data call and not eligibility evidence.
- No mainnet execution, transaction hash, volume, user adoption, savings or return is claimed.
- Public static app has no signing/broadcast surface: code and execution-surface lint. No blanket security certification claimed.
- Receipt SHA-256 is tamper evidence for the serialized payload, not an issuer signature or trusted oracle proof.
- Final DevEx is not generated. Human report remains BLOCKED_BY_DEVEX_RULE until a human authors and submits their own experience.
