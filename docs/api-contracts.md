# Binance Web3 integration contracts

Checked 2026-10-05. These are implementation facts and reproduction inputs, not a human DevEx report. Authenticated success is **NOT_VERIFIED** because no authorized credentials are configured.

Official references: [authentication](https://web3.binance.com/en/dev-docs/authentication), [RWA API](https://web3.binance.com/en/dev-docs/catalog/web3-wallet/api/rest-api/rwa-data), [Trading flow](https://web3.binance.com/en/dev-docs/products/trading-api/integration-flow), [Transaction API](https://web3.binance.com/en/dev-docs/catalog/web3-wallet/api/rest-api/transaction-api).

## Authentication

Host `https://web3.binance.com`; prefix `/build` in URL **and signature**. Headers: `X-OC-APIKEY`, `X-OC-TIMESTAMP` (UTC ISO milliseconds), `X-OC-SIGN`; optional `X-OC-NONCE`, `X-OC-RECV-WINDOW` (default 5000 ms, maximum 60000). UTF-8 HMAC-SHA256, Base64, over `timestamp + UPPERCASE_METHOD + exact_encoded_path_with_query + raw_body`. GET body is empty. Query bytes and order cannot change after signing. Keep credentials server-side.

Success requires both acceptable HTTP status and `code === 0`; HTTP 200 alone is insufficient. Envelope: `code:number`, `msg:string`, `data: endpoint-specific`, `timestamp: Unix-ms`, optional `success:boolean`. Handle incomplete optional response fields as missing evidence. No auth or eligibility means local failure before networking.

## RWA query schemas

All below are signed GET endpoints under `/build/api/v1/dex/market/rwa/`.

| Endpoint | Required query | Optional query | Data shape |
|---|---|---|---|
| `tokens` | none | `binanceChainId:string`, `platformId:ondo\|bstock`, `tabId:number` | token array |
| `price` | `binanceChainId:string`, `tokenContractAddresses:string` (comma-separated, at most 100) | none | price array |
| `search` | `keyword:string` | `platformId:ondo\|bstock` | groups of ticker/company/assets |
| `underlying-profile` | `binanceChainId:string`, `tokenContractAddress:string` | none | profile object |
| `underlying-market` | `binanceChainId:string`, `tokenContractAddress:string` | none | market object |

Price fields: `binanceChainId`, `tokenContractAddress`, `platformId`, `tokenPrice`, `referencePrice` (strings); `tokenPriceUpdatedAt` (Unix-ms). `referencePrice` is a per-share conversion of the on-chain token price, **not an independent traditional stock-market quote**. Use it only with its documented semantics, never as executable arbitrage evidence.

Token fields: chain/contract/platform, `assetType`, `tokenName`, `tokenSymbol`, `tokenLogoUrl`, `decimals` (string), `underlyingTicker`, `underlyingName`, `tokenToShareRatio`, `tags`, `statusInfo`, token/reference price, `volume24H`, `marketCap`, `peRatioTTM`.

Profile fields: chain/contract/platform, `underlyingTicker`, `underlyingFullName`, `assetType`, `tokenToShareRatio`, `protections` map, nullable `companyInfo` containing CEO, website, industry, concepts and description. A profile is not a substitute for issuer terms or personal eligibility.

Market fields: chain/contract/platform, `assetType`, `statusInfo`, `marketData`. `statusInfo`: `openState:boolean`, `marketStatus` (`premarket`, `regular`, `postmarket`, `overnight`, `closed`, `pause`), nullable `reasonCode`, `reasonMsg`, `nextOpenTime`, `nextCloseTime` (Unix-ms). Reasons include market closure/pause/maintenance, asset pause/restriction, `TRADING`, `UNSUPPORTED`. Do not infer current status from a local weekday calendar when API evidence is missing. No dedicated status update timestamp is declared; retain retrieval time and server envelope timestamp.

## Trading quote and RFQ constraints

`GET /build/api/v1/dex/aggregator/quote`: required `binanceChainId`, `amount` (positive base-unit integer string), `fromTokenAddress`, `toTokenAddress`. `userWalletAddress` is required for RWA/RFQ and identifies the receiver/signing wallet. Optional vendor selector: `LiquidMesh`, `Pancake`, `Jupiter`; fee fields are unnecessary for this read-only implementation. Token pair must differ.

Quote returns route array. Fields include `quoteId`, `vendorName`, chain, from/to base-unit amounts, optional fee/gas/price impact, router, from/to token metadata, route list, `executionMode`, `approveTarget`, `isBest`. Cache TTL is documented as approximately 30 seconds; this is not a guaranteed exact expiry timestamp.

For `executionMode=RFQ`, quote first; `/approve-transaction` uses **that quote's `vendorName`** if an ERC-20 approval is needed. `/swap` returns EIP-712 `rfq.typedDataToSign`; it is not an EVM transaction. `/order/submit` needs the actual user's signature and stable `requestId`. KineGate currently implements no approval, signature, submission or broadcast.

## Transaction simulation

`POST /build/api/v1/dex/pre-transaction/simulate`, JSON body:

```json
{"binanceChainId":"56","evmTx":{"from":"<address>","to":"<address>","value":"0","data":"0x<hex calldata>"}}
```

For BSC supply exactly one `evmTx`; do not send `solTx` or `tronTx`. Native value is a decimal integer wei string. Official rendering and generated SDK mark all three payloads required; the official field description says this is for rendering and actual input is exactly one matching the chain. The handwritten client follows the documented wire contract.

Result `data`: `status` (`SUCCESS` / `FAILED`), nullable `failReason`, `balanceChanges` (contract, token type, signed integer change, owner), `allowanceChanges` (token, owner, spender, pre/post amounts). It predicts off-chain execution and is never a transaction receipt. It cannot simulate an RFQ EIP-712 order as though it were EVM calldata.

## Three minimum feasibility probes

| Direction | Needed capabilities | Actual verification | Limitation |
|---|---|---|---|
| Evidence-bound preflight | Quote, issuer metadata, valid EVM simulation where applicable | Official contract schemas plus local FIXTURE client tests | Authenticated quote/simulation BLOCKED_CREDENTIALS; RFQ requires a separate policy path |
| Issuer passport | RWA tokens/profile, issuer terms, chain existence | One LIVE unauthenticated tokens request returned HTTP401/API40101; LIVE official BSC RPC confirmed AAPLB symbol/decimals/code | Profile data, reserves and user eligibility not verified |
| Market-aware execution | Underlying-market status/time/reasons, freshness | Exact official response schema checked | LIVE market status BLOCKED_CREDENTIALS; do not fabricate a current open/closed result |

## Official source reuse and contract evidence

Official [JavaScript SDK](https://github.com/binance/binance-web3-connector-js), package `@binance-web3/wallet`, inspected repository version `13.0.1`, commit `a234ecedffcdded0e73c781344ea11bd6cf9c6ce`; MIT, backend only, documented Node >=22.12. Source files inspected: `clients/web3-wallet/src/rest-api/modules/{rwadata-api,trading-api,transaction-api}.ts` and their generated response types. It includes runnable examples. This project implements an original minimal fetch adapter and copies no SDK implementation; it uses documented wire schemas. The SDK was not installed or executed. A Windows filename-length clone checkout failure was corrected with repository-local `core.longpaths=true`; it is an environment issue, not API failure.

[Official Binance bStock list](https://web3.binance.com/en/dev-docs/products/agentic-wallet/use-cases/campaigns/bstock-eligible-tokens) specifies AAPLB on BSC: `0x431a3bee82e2ca41e49895cbece5bb0f76a89b7a`. That campaign page's effective dates are August 11–September 1, 2026; it is an address provenance source, **not proof of October campaign eligibility**. Official [BSC RPC documentation](https://docs.bnbchain.org/bnb-smart-chain/developers/wallet-configuration/) supplies `https://bsc-dataseed.bnbchain.org`. LIVE read-only evidence is in `evidence/mainnet/bsc-readonly-probe.json` and its summary. No trade was made.

[Issuer announcement](https://www.binance.bh/en/support/announcement/detail/2c0c92ed15ac42d1b14bb1eac00d22bb) identifies BTech Holdings Limited. [Conversion terms](https://www.binance.com/en/about-legal/product-terms-minting-redemption) link the [official terms PDF](https://bin.bnbstatic.com/static/cms/cg08ou2ak0tn7mcplvfg/file/97e1b675b136f1c7459c01b3cd0a680518dbf11d38cc843a5fa44bfb6b535f73.pdf). Certificates represent beneficial interest and do not confer direct underlying share ownership; offers and secondary access have eligibility restrictions. This is source evidence only; no legal declaration has been accepted for the user.

## Implemented local surface

`server/server.mjs` binds `127.0.0.1:4173`. GET `/api/status` returns boolean credential/eligibility state; `/api/discovery` caps the displayed token array at 100; `/api/asset?address=...` allows only documented AAPLB and fetches price, profile and market. Missing credentials return HTTP503 with machine error `CREDENTIALS_MISSING`. CLI `node scripts/probe.mjs quote <amount> <from> <to> <receiver>` fetches a read-only quote. No generic API proxy is exposed. Local request logs are ignored under `evidence/local-api/` and exclude secrets/signatures and value-bearing parameters. GET has at most two attempts with capped delay; auth/permission errors and POST simulation never retry.
