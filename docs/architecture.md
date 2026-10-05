# Architecture

Browser UI → normalized immutable FIXTURE snapshot → pure preflight engine → bound local simulation receipt → current-state verifier.

Separately, a loopback Node server holds HMAC credentials and performs an allowlisted set of official read-only Binance calls. It exposes availability and sanitized discovery data. The public static build contains no credentials, no wallet bridge, no transaction signing and no broadcast endpoints. The API inspector does not silently promote raw data into a passing receipt.

The receipt binds exact asset identity, amounts in smallest units, quote/vendor/spender, clocks, policy, observed effects and outcome using canonical JSON and SHA-256. It expires at the shorter quote/policy clock. Verification recomputes the digest, the original gates and the current-time gates. A hash establishes internal consistency, not issuer authenticity or a blockchain settlement. Fabricated data can still be hashed: provenance is a separate obligation.

The UI serializes preflight requests and invalidates results on intention changes. State and local simulation deduplication are in memory within a browser session. JSON export and verified import provide an explicit recovery path after reload. Receipt imports are untrusted and bounded; they are rendered as text. There are no stored secrets.

Execution modes matter: equity RFQ EIP-712 data is an off-chain order intention. EVM Transaction API simulation requires actual EVM transaction fields and cannot prove RFQ final settlement. This MVP intentionally has no settlement adapter. Mainnet completion remains blocked pending credentials, eligible human access, explicit budget/signing authorization and receipt/balance verification.

Amounts: bigint arithmetic for inputs, outputs, minimum received, balance, allowance, share conversion, fee cap. UI decimal strings are parsed exactly; arbitrary scientific notation, negative amounts and excessive precision are rejected. Time uses explicit UTC milliseconds and expiry equality fails closed.
