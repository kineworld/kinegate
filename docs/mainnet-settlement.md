# Owner-completed BSC settlement

Observed 2026-10-05T17:52:33.3706234+00:00. The owner used the official PancakeSwap interface with Binance Wallet and completed a real 6-USDT buy of Ondo AAPLon on BSC. [Successful transaction](https://bscscan.com/tx/0x16682557ce0e9cb0bb266b0795fe94f88cfacd8bb552630f8b3f23d2559854d4). Exact owner-address-filtered ERC-20 logs show a debit of 6 USDT and net credit of 0.017913646647290058 AAPLon. 996 confirmations were observed. [Machine-readable evidence](../evidence/mainnet/owner-settlement.json).

The approval transaction and relayed fill together used 0.000042199401617142 BNB in on-chain fees; the fill sender is a relayer, not the owner. The owner's directly paid approval fee was 0.000003343716617142 BNB. These values do not imply that the relayed service charged nothing or that cleanup gas has been paid.

**Policy exception:** the owner confirmed uint256-max USDT approval to PancakeSwap Permit2 (0x31c2F6fcFf4F8759b3Bd5Bf0e1084A055615c768), exceeding the separately authorized 6-USDT allowance cap. The later revocation is confirmed: current allowance is zero, and token balances are unchanged. A later revocation does not repair historical cap compliance. The exact signed slippage/expiry details were not captured before the owner confirmed, so they remain unverified.

This supplements the authenticated Binance API acquisition and counterfactual simulations. It is **not** a successful Binance Trading API transaction, **not** execution by KineGate, and does **not** clear the application's thirteen evidence gates. Frozen source archives and the 134-second polished video predate this trade. All three official form receipts predate it; organizer acceptance remains unknown.

## Confirmed approval cleanup

[Owner revocation transaction](https://bscscan.com/tx/0xa5561739a7750a1a22deb209828d99bcc7353c90fac03299cd9b84dc588183c1) succeeded, with 161 confirmations observed at 2026-10-05T17:56:45.9268370+00:00. Calldata matches USDT approve(PCS Permit2, 0), native value is zero, and pinned-block allowance is zero. USDT and AAPLon balances are unchanged. [Cleanup evidence](../evidence/mainnet/owner-approval-cleanup.json).

Revocation cost 0.000001455652215270 BNB. Approval, relayed fill and revocation together cost **0.000043655053832412 BNB**, below the original 0.0001-BNB aggregate cap. The original unlimited-approval exception and missing signing-time order review remain historical facts. No second purchase was made.

## Organizer amendment request

With the owner's explicit authorization, the official project-form contact dialog was used once to submit a request to associate this supplement with the original entry and confirm whether the external-venue trade qualifies. The dialog closed; no additional sent/delivery confirmation or response was observed. [Contact submission observation](../evidence/submission/organizer-contact.json). The original project form response was not changed or duplicated.
