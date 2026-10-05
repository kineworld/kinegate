# Router provenance and simulation error: bounded independent source review

Reviewed on 2026-10-05, approximately 12:52–13:04 UTC, with a later local clarification based on the saved Sourcify v2 compilation evidence. This review used public documentation, public source repositories and the existing read-only chain capture. It did not sign, submit, approve, spend funds, inspect credentials or contact external parties. No complete deployment metadata match or verified swap-facet ABI/source was completed. The later dispatcher execution-code match is described below.

## Result

The address mismatch alone does **not** demonstrate a Binance API fault. There is credible evidence that `0xB44446b0c8E56988c34f7Ff73Ae904982b5FdDA5` is a separate wrapper/router, and captured implementation bytecode explicitly contains the documented LiquidMesh router and approval address. However, a Binance first-party address allowlist, matching implementation source, complete ABI, and verified calldata interpretation are still missing. The evidence does not justify changing an execution allowlist automatically.

The simulated revert selector `0x1425ea42` matches `FailedInnerCall()` in Sourcify's signature database. OpenZeppelin v5.0.2 defines that error for a failed low-level call. This supplies a recognizable error candidate, **not** the deployed contract's ABI or the underlying cause. A revert trace or matched deployment source is needed to identify the failing call.

## Public primary and audit sources

| Source | What was directly verified | What it does not establish |
| --- | --- | --- |
| [LiquidMesh smart contracts](https://docs.liquidmesh.io/docs/smart-contracts) | EVM direct router `0x3d90f66B534Dd8482b181e24655A9e8265316BE9`; approval contract `0x8157a9d65807521FBB8db8f37EEEcEfDD247E9B1`. | No B444 wrapper declaration or complete wrapper ABI was found on this page. |
| [Binance Trading API](https://web3.binance.com/en/dev-docs/catalog/web3-wallet/api/rest-api/trading-api) | Approval transaction spender configuration is chain/vendor dependent. RWA routes can require the selected vendor's spender. | No literal B444 contract address or fixed public allowlist was found on the inspected page. |
| [Binance SDK trading API module, fixed commit a234eced](https://raw.githubusercontent.com/binance/binance-web3-connector-js/a234ecedffcdded0e73c781344ea11bd6cf9c6ce/clients/web3-wallet/src/rest-api/modules/trading-api.ts) | Quote expiry guidance, vendor selection and approval-generation API behavior. The inspected module contains none of B444, 3d90, the dispatcher constant or ad43f73d. | This is a single module inspection, not proof that the entire SDK lacks a list. API descriptions do not authenticate on-chain calldata. |
| [deBridge official governance record 072.md, fixed commit fd518ce3](https://github.com/debridge-finance/multisig-evm-transactions/blob/fd518ce31806d7f4f72647a287fb8035bf1e6daa/072.md) | Dated 2026-07-10. Identifies B444 as a BNB router and records a router whitelist proposal across several supported chains. | This is first-party evidence from an integrating protocol. It is not Binance source publication, bytecode verification, an audit of the current implementation or authorization for this application. |
| [Sherlock DeBank audit source, fixed commit ebc4e89a](https://github.com/sherlock-audit/2025-07-debank/blob/ebc4e89a0641bd7a8e2b6ea531b6d03731efe0e1/swap-router-v1/src/aggregatorRouter/DexSwap.sol) | Public audited DexSwap source uses Solidity `^0.8.25`, a structured `swap(SwapParams)` entry point, adapter registration and an immutable spender. | It contains no matching dispatcher constant or LiquidMesh addresses. It cannot be treated as B444 implementation source. |
| [DeBank deployment README in the same fixed audit repository](https://github.com/sherlock-audit/2025-07-debank/blob/ebc4e89a0641bd7a8e2b6ea531b6d03731efe0e1/swap-router-v1/DEXSWAPREADME.md) | DexSwap `0x5e99240175e6336795bffa62b14fa32922263cdd`, Spender `0xf8a2395604296cc320069fdd81414648e17df503`, six listed aggregator integrations. | These documented deployments and integrations are different from the captured B444/LiquidMesh path. |
| [Sherlock audit project](https://github.com/sherlock-audit/2025-07-debank) | Audit identifies original source commit `5b133bfb0a774baf715559d423e6ae20554e2408`; BSC is among the described chains. | An audit of that revision is not an audit of the current wrapper deployment. |
| [LiquidMesh error codes](https://docs.liquidmesh.io/docs/error-codes) | Numeric API/business error codes describe distinct causes, including expiry, allowance, transfer failure and generic simulation failure. | Those numeric codes do not map `0x1425ea42` to one of those causes. |
| [LiquidMesh security update](https://docs.liquidmesh.io/changelog/liquidmesh-security-update.md) | User address risk screening exists; actual user addresses are required for Order/Swap API requests. | This does not show that screening caused this revert. No matching deployment ABI is provided there. |

## Captured implementation bytecode: limited wrapper evidence

Input file: `evidence/mainnet/router-funded-refresh.json`, inspected locally without reading wallet or credential material. File SHA-256 at inspection: `D654B6A055264CD943BC08181CB573610249A77263A99DA6975AFF4483020101`.

Captured block: `0x7809e1d`. Selector-dispatch storage slot: `0x7ddc1c45a5ae31800e181de98e8cb97525e9b89f99e5829d49f25a8ca4bac1d7`. The recorded storage word contains implementation candidate `0xa9fa1b56f4d7bd25375c2d40b4c8e36a9509e603`. The inspected runtime is 8,622 bytes.

Local disassembly found the LiquidMesh router literal at byte offsets 6,934 and 7,236; its approval-address literal at byte offset 7,176. One branch compares an input address with the official router and returns the official approval address:

```text
1b15 PUSH20 0x3d90f66b534dd8482b181e24655a9e8265316be9
1b2a DUP2
1b2b EQ
1b2c PUSH2 0x1c04
1b2f JUMPI
...
1c04 JUMPDEST
1c05 POP
1c06 POP
1c07 PUSH20 0x8157a9d65807521fbb8db8f37eeecefdd247e9b1
1c1c SWAP1
1c1d JUMP
```

This supports an internal router-to-spender mapping and a wrapper interpretation. It does not prove a complete call graph, reachable path for the latest request, correct token/amount/recipient/minimum output, implementation ownership, or safety. Literal-address presence is not source verification.

The capture's compiler metadata indicates Solidity 0.8.23. The public DeBank audit source uses `^0.8.25`; together with its different deployment addresses and absent matching constants, that audit is insufficient to identify the captured implementation.

The implementation metadata CID is `QmeK3cdNWJmxN9hBS5tW8FpWkwQQiG8WpjEBaZYqemtExE`. Metadata retrieval was unsuccessful in this bounded review; no metadata source path or ABI was authenticated.

## Simulation revert selector

The parent reported a fresh quote followed by transaction construction within 11 seconds and a read-only official BSC RPC `eth_simulateV1` bundle. The simulated token approval succeeded, while swap failed with `0x1425ea42`, using `0x6a2b3` gas against a 450,000 gas limit. These are parent-reported observations, not an independently repeated simulation here. Simulated approval is not an actual token allowance transaction.

Public [Sourcify signature API](https://api.4byte.sourcify.dev/signature-database/v1/lookup?function=0x1425ea42), independently fetched with HTTP 200, returned:

```json
{"ok":true,"result":{"function":{"0x1425ea42":[{"name":"FailedInnerCall()","filtered":false,"hasVerifiedContract":true}]},"event":{}}}
```

The [OpenZeppelin official v5.0.2 Address.sol](https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.2/contracts/utils/Address.sol) defines `FailedInnerCall()`. Its low-level-call verification bubbles nonempty revert data; when an unsuccessful call returns no data, `_revert` emits this error. `sendValue` also emits it when a value transfer call fails. The selector candidate is therefore consistent with a generic inner-call failure, but cannot identify which contract emitted it or distinguish allowance, balance, route expiry, risk screening, minimum output, token behavior or inner-call gas exhaustion. Different signatures can share a selector.

The inspected candidate implementation runtime did not contain the literal bytes `1425ea42`. Later local analysis found the optimized `PUSH4 0x0a12f521` with a 225-bit left shift, which derives selector `0x1425ea42`. Absence of the literal therefore does not establish bubbling from another contract. A verified ABI or a structured call trace is still needed to identify the failing inner call and cause.

## Later Sourcify v2 compilation result

The latest source conclusion is recorded in `evidence/devex/router-source-verification.json`. Sourcify's documented v2 API returned sources for the Ethereum same-address `Diamond` deployment. Local compilation with the official SHA-256-checked Solidity 0.8.23 compiler produced a 180-byte runtime whose **127 execution-code bytes exactly match** the captured BSC dispatcher, while **53 CBOR metadata bytes differ**. The complete runtime does not match; this is not a complete metadata/deployment source verification. The dispatcher's source and storage namespace explain selector dispatch, but the selected `a9fa` swap facet still has no verified source or ABI. Its calldata words and the error candidate do not prove receiver behavior, minimum-output enforcement, or a specific simulation failure cause. These later bounded results supersede the earlier statement that no source verification had been completed.

## Remaining blockers and useful next evidence

1. A Binance-controlled address publication, or signed/verified official deployment source, explicitly identifying the B444 wrapper and its version on BSC was not found.
2. No matching verified source/ABI was retrieved for implementation candidate a9fa. Direct DeBank repository paths returned 404; the public audit is a different version. Exact constant/selector searches did not establish authorship.
3. Public metadata gateways did not yield the CID: Pinata returned 429, Cloudflare gateway failed TLS, and w3s returned 403. No TLS validation was bypassed. Sourcify Polygon full/partial lookups returned 404. Parent's earlier BSC explorer/source 403 was not retried.
4. Indexed historical transfer or internal-call results may suggest B444 → LiquidMesh, but they were not promoted to ABI proof. A successful historical trade does not prove the latest unsigned request is safe or executable.
5. The most valuable read-only follow-up is an available structured trace of the exact fresh simulation, showing the failing internal target, input, returndata and state context. Source-level decoding remains contingent on a matching ABI.

Execution remains blocked on authenticated destination/calldata semantics and a successful current simulation. No claim of an audited or production-safe wrapper is supported by this review.
