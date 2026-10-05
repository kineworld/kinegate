# Safety and execution boundary

Public KineGate is a read-only fixture evaluator. It cannot request wallet signatures, spend assets, grant allowances or broadcast. In the fixture, all contract/spender addresses are synthetic and block number 0 denotes no chain observation. Never use these addresses for a transaction.

Local live API reads require credentials plus a human-confirmed eligibility flag. The server binds loopback by default. Do not host it publicly with keys without implementing a separate authenticated, rate-limited service and reviewing permitted regions. No key or request signature is returned to the browser or evidence files.

Deterministic checks bind chain 56, issuer and asset whitelist, vendor/spender whitelist, positive exact amount, balance/cap, timestamps, stop switch, permission, quote limits, minimum received, allowance and cost cap. Rights acknowledgement is necessary but not legal eligibility proof. A closed underlying market is a conservative configurable policy hold; it does not establish that secondary token markets are closed.

Receipts are not signed attestations. A passing FIXTURE receipt certifies only consistency under a documented local policy. It is not financial advice, a live transaction authorization, a proof of reserves or guaranteed execution.

Before a future live order: verify official current asset/spender identity, fee currency, RFQ executionMode and EIP-712 signer/domain/chain/amount/receiver/order expiry; use bounded allowance; requote if anything changes; exact requestId deduplication; never automatically resubmit a timed-out signed order; poll actual terminal status, receipt and asset/gas deltas. These settlement capabilities are not implemented or advertised here.

Data handling: .env ignored; no mnemonic/private key inputs exist; no telemetry; no competitor/private company data in public code. Objective API logs omit credentials. Imports must pass schema, integrity, current-context and expiry checks. Hashes are not authenticity claims.
