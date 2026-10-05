# Mainnet demonstration bounds and prerequisites

Current state: an actual fresh quote and unsigned SWAP build succeeded, and the off-chain simulation predicted FAILED because the receiver lacked the input token balance. No approval, wallet signature, transaction broadcast or spending occurred. See `evidence/devex/unsigned-swap-validation.json`. The private receiver and wallet observations are withheld from public source.

These are reviewable execution bounds. Historical transactions are never ready to sign. Explicit approval is recorded privately; the public product has no wallet authority. Any future execution requires the person to confirm control of the intended wallet and applicable Ondo/venue trading qualification, explicitly authorize the budget, refresh the whole quote/build/effects chain, and personally inspect the wallet request. Do not fund a synthetic fixture address or reuse saved calldata.

| Constraint | Proposed bound / prerequisite |
| --- | --- |
| Chain | BNB Smart Chain mainnet, chain ID 56 |
| Input | At most 6 Binance-Peg USDT; `0x55d398326f99059fF775485246999027B3197955`, 18 decimals verified at a pinned block |
| Output | Current API-listed AAPLon/Ondo; `0x390a684ef9cade28a7ad0dfa61ab1eb3842618c4`, 18 decimals verified |
| Asset budget / maximum asset loss | At most 6 USDT for one demonstration; default authorization is 0; explicit approval is recorded in the private ledger |
| Native gas budget / maximum native loss | Proposed total ceiling 0.0001 BNB across bounded approval and swap; default authorization is 0; explicit approval is recorded in the private ledger. Abort if fresh gas estimates exceed the remaining cap |
| Quote clocks | Reacquire for the exact 6-token intention and receiver; enforce a local 30s maximum age, never invent a provider expiry guarantee |
| Execution mode | Inspect actual builder response. Captured result was SWAP; RFQ/unknown requires separate handling and cannot be submitted to EVM simulation |
| Slippage | At most 0.5%; preserve the fresh builder's explicit `minReceiveAmount`. Historical minimum was 0.017919528896587165 AAPLon and is not a current promise |
| Vendor / spender | Captured LiquidMesh destination/approveTarget `0xB44446b0c8E56988c34f7Ff73Ae904982b5FdDA5` is informational. Independently verify its provenance/code and the fresh route before explicit allowlisting; do not trust it solely because an API returned it |
| Allowance | Inspect current allowance. If needed, one exact bounded approval of 6 USDT; no unlimited approval. Revoke residual allowance within the same approved gas cap if required |
| Effects | Successful simulation of the exact fresh EVM call, constrained balance/allowance deltas and confirmed wallet balance are prerequisites. Current prediction is FAILED |
| Transaction count / retries | At most one approval if necessary and one purchase; never auto-resubmit an unknown pending transaction. Stop switch stays available |
| Completion proof | Successful receipt, actual USDT/AAPLon/native balance changes and fees. A transaction hash or predicted success alone is insufficient |

The captured swap estimate was 450000 gas × 66475545 wei/gas, approximately 0.00002991399525 BNB for that unsigned call. It excludes any necessary approval and is historical, not a fee quote for future signing. Funding transfers, purchases of gas tokens, additional services or selling the acquired asset are not covered by this proposal.

Minimal human actions after explicit approval is recorded: confirm wallet control and issuer/venue qualification; place the permitted input balance in the intended wallet through the person's own authorized workflow; request a fresh preflight; inspect and sign only the explicitly reviewed bounded transactions. The public demo never connects to or controls this wallet. The application currently has no signing/broadcast adapter; approval of this proposal does not imply that such an adapter exists.

Actual additional blocker: the returned router/spender has code but its relationship to the independently documented LiquidMesh contracts and calldata ABI semantics remain unverified. Byte matches alone cannot establish the receiver, input amount or enforced minimum output. See `evidence/devex/router-provenance-and-calldata.json`. Do not substitute the direct LiquidMesh addresses into the Binance-built payload, or allowlist the returned address merely because it was returned.

Until these prerequisites are met, mainnet execution remains BLOCKED even if input funds are available. Product refinement, deployment, factual evidence and the human reproduction guide can continue independently.
