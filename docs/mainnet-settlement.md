# Owner-completed BSC settlement

Observed 2026-10-05T17:52:33.3706234+00:00. The owner used the official PancakeSwap interface with Binance Wallet and completed a real 6-USDT buy of Ondo AAPLon on BSC. [Successful transaction](https://bscscan.com/tx/0x16682557ce0e9cb0bb266b0795fe94f88cfacd8bb552630f8b3f23d2559854d4). Exact owner-address-filtered ERC-20 logs show a debit of 6 USDT and net credit of 0.017913646647290058 AAPLon. 996 confirmations were observed. [Machine-readable evidence](../evidence/mainnet/owner-settlement.json).

The approval transaction and relayed fill together used 0.000042199401617142 BNB in on-chain fees; the fill sender is a relayer, not the owner. The owner's directly paid approval fee was 0.000003343716617142 BNB. These values do not imply that the relayed service charged nothing or that cleanup gas has been paid.

**Policy exception:** the owner confirmed uint256-max USDT approval to PancakeSwap Permit2 (0x31c2F6fcFf4F8759b3Bd5Bf0e1084A055615c768), exceeding the separately authorized 6-USDT allowance cap. Current remaining allowance is still excessive. Revocation is prepared, not completed. A later revocation does not repair historical cap compliance. The exact signed slippage/expiry details were not captured before the owner confirmed, so they remain unverified.

This supplements the authenticated Binance API acquisition and counterfactual simulations. It is **not** a successful Binance Trading API transaction, **not** execution by KineGate, and does **not** clear the application's thirteen evidence gates. Frozen source archives and the 134-second polished video predate this trade. All three official form receipts predate it; organizer acceptance remains unknown.
