# Mainnet demonstration bounds and prerequisites

Qualification, wallet control and a narrow one-purchase budget were explicitly confirmed privately. Do not repeat that authorization request. Personal final wallet signing remains necessary. No actual token approval, signature, broadcast or purchase has occurred.

| Bound | Authorized limit / required check |
| --- | --- |
| Chain | BNB Smart Chain mainnet, chain ID 56 |
| Input | At most 6 Binance-Peg USDT; 0x55d398326f99059fF775485246999027B3197955, verified 18 decimals |
| Output | Current API-listed AAPLon/Ondo; 0x390a684ef9cade28a7ad0dfa61ab1eb3842618c4, verified 18 decimals |
| Purchase count | One purchase; do not auto-resubmit a pending or uncertain transaction |
| Total gas | At most 0.0001 BNB across approval, purchase and any required residual-allowance revoke; reserve revoke gas before approval |
| Allowance | At most 6 USDT, never unlimited; verify spender and inspect allowance after execution |
| Slippage | At most 0.5%, using exact integer cross multiplication; builder floor rounding does not waive the bound |
| Clock | Fresh receiver/amount-bound quote and payload, local maximum age 30 seconds; missing provider expiry remains unknown |
| Vendor / spender | Captured LiquidMesh wrapper 0xB44446b0c8E56988c34f7Ff73Ae904982b5FdDA5; provenance and present implementation require review before allowlisting |
| Effects | Exact fresh simulation, constrained input/output/allowance deltas, current wallet balance and remaining gas budget |
| Completion | Successful real receipt, actual token/native changes and fees; a hash or simulation is insufficient |

The public product has no wallet authority. Default authority for strangers remains zero. No additional paid service, funding transfer, gas-token purchase or later sale is authorized by these limits. Historical calldata must never be reused for signing.

## Actual evidence and remaining blockers

The official off-chain simulation returned FAILED for insufficient balance in the first capture and insufficient allowance in the later capture. These machine observations are preserved without asserting settlement.

At 2026-10-05T14:21Z, three native eth_simulateV1 counterfactuals used one fixed parent block and identical original calldata for the gas comparison. The 450000 builder estimate failed; a bounded 1183991 gas limit succeeded with exactly 6 USDT simulated input spent, 0.017788313322723381 AAPLon output and zero remaining allowance. A third test doubled a header word matching the builder minimum and reverted. The total maximum approval/swap/revoke gas cost was 99999979066890 wei, within the authorized 100000000000000 wei cap. All approvals and effects existed only inside simulation. See [the experiment](native-simulation.md) and [redacted evidence](../evidence/mainnet/native-simulation-comparison.json).

That saved minimum is 0.99 atomic unit below the exact 0.5% boundary after integer rounding; it must not pass the strict policy. A fresh builder must produce a compliant minimum, for example by requesting a tighter supported slippage setting and checking the actual returned integers. Do not patch historical calldata for a real transaction using an inferred ABI.

The dispatcher source was locally compiled: 127 execution bytes match BSC, but 53 CBOR metadata bytes differ. Selector storage points to candidate 0xa9fa1b56f4d7bd25375c2d40b4c8e36a9509e603. Its full swap source/ABI and complete current operator association remain unverified. A successful scoped minimum rejection is behavioral evidence, not a complete audit. Prior different-payload higher-gas tests also failed with adapter zero-output errors, so freshness and route validity still matter.

Native validation=false omits transaction validation and cannot establish signature/nonce/mempool acceptance. No signing adapter is present. Mainnet completion remains BLOCKED until a fresh exact policy/effects review and personal wallet signature are possible. The source, product, factual evidence and submission preparation continue independently.

## Tighter requested slippage follow-up

At 2026-10-05T14:38:50.4258670+00:00, a new official quote/build requested 0.49% slippage, automatic approval disabled, and used native simulation at pinned block 0x780dc4b. [Redacted follow-up](../evidence/mainnet/tight-slippage-native-comparison.json). The builder estimate of 450000 failed; an identical payload at a bounded 1336863 limit succeeded using 477319 swap gas, exactly 6 simulated USDT spent, 17933848689508824 atomic AAPLon received and zero residual virtual allowance. Doubling the matching minimum word again reverted. Maximum approval/swap/revoke gas cost 99999957738403 wei remained below 0.0001 BNB; quote age at batch start was 5.748 seconds.

The new minimum satisfies the unchanged authorized 0.5% cap by exact integer comparison (scaled margin 17934279890607950). It still rounds below the exact requested 0.49% boundary (scaled margin -4209); do not claim exact 0.49% enforcement. This tighter request resolves the numerical authorized-cap issue for this simulated payload, while the original historical 0.5% request remains blocked and preserved. All six controlled samples, including four failed swaps, are retained across the two records. Full facet source/ABI and fresh personal execution review remain incomplete; no actual approval, signature, broadcast or spend. All saved quotes are historical and cannot be signed.
