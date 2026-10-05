# Controlled native simulation: factual experiment

Acquired 2026-10-05T14:21:09Z. [Public machine evidence](../evidence/mainnet/native-simulation-comparison.json). Mode SIMULATION; actual approvals, wallet signatures, broadcasts and spending all zero.

Three independent eth_simulateV1 calls were submitted in one RPC batch to the documented BSC endpoint. All used parent block 0x780d30e / hash 0x45bb63bc16936a6561948cc74ef519d799f412978555377cf56388ccf75e0d44. Each sequence read token balances/allowance, counterfactually approved exactly 6 USDT, simulated the unsigned swap, then read effects. No state overrides or wallet key were used. validation=false; this does not validate a signed transaction.

| Variant | Swap gas limit | Result | Gas used | Simulated input / output |
| --- | ---: | --- | ---: | --- |
| Builder estimate | 450000 | FAILED, 0x1425ea42 | 435331 | 0 / 0 |
| Identical calldata, bounded higher gas | 1183991 | SUCCESS | 935818 | 6 USDT / 0.017788313322723381 AAPLon |
| Same higher gas, matched minimum word doubled | 1183991 | FAILED, 0x6d9e7a9e plus two uint words | 1126928 | 0 / 0 |

The first two variants differ only in gas limit. The third changes zero-indexed top-level word 6, after verifying its original value equals the builder minimum. This is a labeled guard test, not an organic API failure. The successful sequence consumed the exact virtual approval and met the original declared minimum. Failed swaps rolled back token deltas but left the virtual preceding approval; actual allowance was unchanged by every experiment.

Gas price 72254790 wei; approval ceiling 100000 gas; revoke reserve 100000 gas. Maximum combined cost 99999979066890 wei is within 0.0001 BNB. Successful simulated approval-plus-swap gas cost was 70955070837480 wei, excluding read-only measurement calls and unused revoke reserve. Quote acquisition age at batch start was 15.966 seconds.

The [official Trading API](https://web3.binance.com/en/dev-docs/catalog/web3-wallet/api/rest-api/trading-api) describes tx.gas as an estimate and supports gasLimit override. This experiment demonstrates a scoped insufficient estimate; it does not establish the backend algorithm, a documented fixed fallback, a universal gas minimum or guaranteed future execution. Earlier different-payload tests included successful and failed higher-gas runs; one surfaced an adapter zero-output error.

The saved minimum also fails our exact slippage policy: minimum × 10000 − quoted output × 9950 = −9900, equivalent to 0.99 atomic unit below the required ceiling-rounded minimum. A successful simulation therefore remains executionReady=false. Full swap facet source/ABI, current operator provenance and a fresh compliant payload remain incomplete.

## Reproduction boundary

The exact receiver-bound payload and absolute balances remain private. Public evidence is a redacted factual record, not an independently rerunnable original transaction. Reproduction requires one's own eligible receiver, authorized read-only API configuration, fresh quote/build and safe native simulation setup. Keep keys local, disable automatic approval, check actual SWAP mode and fields, pin one block, enforce age and total gas limits, then compare counterfactual results. Do not broadcast, use generated hashes as proof of settlement, or submit subjective DevEx answers from this document. A human must personally reproduce and author that report.

## Tighter requested slippage follow-up

At 2026-10-05T14:38:50.4258670+00:00, a new official quote/build requested 0.49% slippage, automatic approval disabled, and used native simulation at pinned block 0x780dc4b. [Redacted follow-up](../evidence/mainnet/tight-slippage-native-comparison.json). The builder estimate of 450000 failed; an identical payload at a bounded 1336863 limit succeeded using 477319 swap gas, exactly 6 simulated USDT spent, 17933848689508824 atomic AAPLon received and zero residual virtual allowance. Doubling the matching minimum word again reverted. Maximum approval/swap/revoke gas cost 99999957738403 wei remained below 0.0001 BNB; quote age at batch start was 5.748 seconds.

The new minimum satisfies the unchanged authorized 0.5% cap by exact integer comparison (scaled margin 17934279890607950). It still rounds below the exact requested 0.49% boundary (scaled margin -4209); do not claim exact 0.49% enforcement. This tighter request resolves the numerical authorized-cap issue for this simulated payload, while the original historical 0.5% request remains blocked and preserved. All six controlled samples, including four failed swaps, are retained across the two records. Full facet source/ABI and fresh personal execution review remain incomplete; no actual approval, signature, broadcast or spend. All saved quotes are historical and cannot be signed.
