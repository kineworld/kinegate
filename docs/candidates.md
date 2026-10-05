# Candidate comparison — 2026-10-05

## Method

Four criterion estimates use the [official event weights](https://www.bnbchain.org/en/hackathons/tokenized-stocks): technical implementation (T) 30%, originality (O) 25%, DevEx evidence opportunity (D) 25%, product/UX (U) 20%. Scores are internal prioritization judgments on a 0–100 scale, not observed judge scores or award probabilities. D means potential for a human teammate's specific report; no AI-generated final report is allowed. Without that human work, the estimate cannot be realized.

Weighted raw score = 0.30T + 0.25O + 0.25D + 0.20U. Subtract independent implementation (I), dependency (P), demo failure (F) and overtime/scope (S) costs, each in score points. All options share the hard blockers of API credentials, eligibility verification and separate live-asset authorization. Scores express the relative bounded delivery burden, not a claim those blockers are resolved. Source-backed alternatives and API caveats are in [market-research.md](market-research.md).

## Fourteen substantially different options

Each row describes one main product rather than cosmetic versions of the same idea.

| ID / candidate | Target user | Pain | Existing alternative | Key difference | Necessary integration | Demo highlight | Largest risk |
|---|---|---|---|---|---|---|---|
| A. KineGuard execution preflight | Person making a first meaningful BSC equity swap | Ticker/issuer/rights, venue clocks and RFQ permissions are easy to conflate | Issuer disclosures plus existing swap/wallet screens | Deterministic decision bound to a concrete order, with sources, unknown states and a recomputable receipt | RWA + Trading; Transaction for supported calldata; wallet/RPC for balance/allowance | Good intent passes; stale quote or changed spender is rejected with exact reason | A generic checklist is easy to copy; true differentiator needs invariants and baseline evidence |
| B. KinePassport asset identity and rights explorer | Investor comparing representations of one underlying | Same ticker hides different instruments, rights and redemption access | Ondo/xStocks legal/product pages inspected separately | Contract-to-issuer-to-underlying identity graph with claim-level sources and explicitly unknown fields | RWA discovery/profile + official per-asset terms | Compare one ticker's distinct issuers without calling them fungible | Public issuer data may be incomplete; legal interpretation must stay narrow |
| C. KineClock market-aware DCA | Small scheduled equity saver | Crypto schedule may fire into halts, stale data or unsuitable routes | Manual recurring reminders; event-suggested DCA agents | Persistent hold/resume policy over asset-specific clocks and fresh route conditions | RWA status + Trading + Wallet; authorized signing scheduler | Halt postpones one job; recovery executes once with same intent identity | Persistent wallet authority and recovery add risk; standard DCA is crowded |
| D. KineReceipt RFQ lifecycle debugger | Wallet/agent developer | RFQ quote, signature, approval and settlement failures are hard to reproduce | Binance REST docs; vendor SDKs/logging | Normalized mode-aware trace and deterministic replay with safe payload diffs | Trading RFQ + Transaction approval simulation + Wallet receipts | Wrong signer/vendor, expired order and retry trace explained in one timeline | Could look like a thin API wrapper; needs substantive invariant detection |
| E. KineBasket explainable thematic purchase | Non-crypto equity buyer | Buying a small transparent theme is many separate steps | One-tap thematic products; issuer asset lists | Cost-aware basket preview with issuer-consistent accounting and partial-fill recovery | RWA categories + Trading + Wallet | One leg expires; show exact remaining exposure and safe continuation | Non-atomic multiple legs and repeated approvals complicate demo |
| F. KineDividend corporate-action ledger | Self-custody equity holder | Balance changes can be mistaken for deposits/profit or double-adjusted | Issuer corporate-action docs, wallet transaction history | Issuer/chain-aware reconciliation of economic units and token units | Wallet/history + RWA ratio + issuer event data | Rebase reconciles without inventing a transfer | Reliable historical corporate actions may be unavailable |
| G. KineExposure equity/crypto risk map | Mixed equity/crypto holder | Portfolio shows token names, obscuring underlying/issuer concentration | Wallet portfolio view; spreadsheet | Normalize economic exposure and separate issuer concentration from underlying concentration | Wallet + RWA identity/ratios | Two Nvidia representations become one underlying exposure but two issuer risks | Quantitative correlation/risk claims need sufficient trustworthy history |
| H. KineExit redemption/secondary-exit navigator | Holder seeking to exit | A token balance does not establish issuer redemption eligibility | Issuer onboarding/status pages and manual venue quotes | Show separately authorized primary eligibility and executable secondary alternatives | RWA + Trading + issuer documented status | Ineligible primary holder sees unknown/blocked route and allowed secondary quote | Cannot self-certify legal eligibility or promise redemption; issuer API access |
| I. KineDepth liquidity-cliff planner | User placing a larger order | Headline price does not reveal size-dependent fill conditions | Swap amount previews and aggregator routes | Bound size/cost sweep with quote timestamps and no-fill regions | Trading repeated quotes + market data | Increasing size visibly crosses a supported price-impact/route policy | Elevated calls, volatile RFQ quotes and minimum sizes may frustrate comparison |
| J. KineWatch halt/corporate-action alert feed | Busy self-custody holder | Crypto venue stays open while issuer/underlying state changes | Issuer status pages; generic price alerts | Source-backed asset-state changes with actionable refresh/hold instruction | RWA status + legitimate polling/persistence | Halt/reopen transition yields one deduplicated notification | Alert-only product has limited implementation depth; notification authorization |
| K. KineRules natural-language strategy compiler | Power user without scripting skills | Strategy prose is ambiguous and hard to audit | Official suggested natural-language agents; scripts | Compile to fixed bounded policy and show counterexample before authorization | RWA + Trading + Wallet; optional LLM only for proposal | Ambiguous prompt cannot bypass hard rules | LLM integration adds cost and ambiguities; broad existing competition |
| L. KineEvent earnings-window planner | Equity event trader | Event window can restrict route availability or create stale assumptions | Earnings calendars and manual trades | Event-linked execution hold conditions, without return prediction | RWA reason/status + independent verified event source + Trading | Earnings restriction causes explainable hold rather than fabricated signal | External calendar/licensing; user value may reduce to a calendar |
| M. KineSentinel issuer/attestation incident circuit breaker | Small treasury holding tokenized equity | Changes in issuer evidence or route state lack operational response | Issuer attestation/status resources and manual pause | Policy pauses a planned order when cited evidence becomes stale/unavailable | RWA profile + issuer proof resources + Trading intent state | Missing evidence stops a pending action and preserves audit trail | Attestation absence does not prove backing failure; reliable feeds uncertain |
| N. KineSpread cross-issuer arbitrage executor | Sophisticated arbitrage trader | Apparent same-ticker spread may have no redeemable/correctly valued path | Official suggested market-hours/cross-protocol bots | Attempt only independently priced, permission-verified two-leg opportunity | Multiple issuers + Trading/Wallet + independent underlying feed | Show why apparent spread is rejected, then bounded executable route if available | Rights non-equivalence, feed availability, non-atomic legs, capital and liquidity |

## Risk-adjusted ranking

| Rank | ID | T | O | D | U | Weighted raw | I/P/F/S deductions | Adjusted |
|---:|---|---:|---:|---:|---:|---:|---|---:|
| 1 | A | 90 | 88 | 85 | 88 | 87.85 | 2 / 3 / 2 / 2 | **78.85** |
| 2 | B | 78 | 89 | 86 | 92 | 85.55 | 2 / 3 / 1 / 3 | **76.55** |
| 3 | D | 90 | 83 | 92 | 75 | 85.75 | 3 / 3 / 2 / 2 | **75.75** |
| 4 | C | 89 | 70 | 86 | 92 | 84.10 | 4 / 3 / 3 / 3 | 71.10 |
| 5 | F | 83 | 87 | 82 | 79 | 82.95 | 3 / 6 / 2 / 3 | 68.95 |
| 6 | H | 81 | 87 | 83 | 88 | 84.40 | 3 / 6 / 3 / 4 | 68.40 |
| 7 | G | 80 | 78 | 78 | 88 | 80.60 | 3 / 4 / 2 / 4 | 67.60 |
| 8 | M | 84 | 91 | 86 | 75 | 84.45 | 4 / 7 / 3 / 4 | 66.45 |
| 9 | I | 88 | 80 | 89 | 77 | 84.05 | 4 / 5 / 5 / 4 | 66.05 |
| 10 | J | 72 | 70 | 78 | 85 | 75.60 | 2 / 4 / 1 / 3 | 65.60 |
| 11 | E | 86 | 65 | 84 | 91 | 81.25 | 5 / 3 / 5 / 4 | 64.25 |
| 12 | L | 79 | 75 | 80 | 83 | 79.05 | 3 / 6 / 3 / 4 | 63.05 |
| 13 | K | 89 | 68 | 85 | 88 | 82.55 | 6 / 5 / 5 / 5 | 61.55 |
| 14 | N | 92 | 82 | 90 | 70 | 84.60 | 7 / 9 / 8 / 7 | 53.60 |

These estimates deliberately penalize capital, independent data, permission and multi-leg dependencies rather than reward a speculative profitability story. Originality scores are our judgment within inspected alternatives; they do not establish novelty across all projects.

## Top three: minimum technical validation and strongest objections

| Candidate | Read-only/document validation completed | Actual runtime / permission status | Strongest objection | Bounded next proof |
|---|---|---|---|---|
| A. Preflight | Official RWA identity/status/timestamps, RFQ execution mode and vendor approval rules, transaction simulation fields inspected | Authenticated API, actual liquidity and live signatures BLOCKED pending legitimate credentials/authorization; not proven by schema | Existing wallets already check slippage and approvals; a list of warnings is not a new system | Bind checks to exact chain/contract/amount/wallet/vendor/quote; mutate one parameter after preview and prove signing becomes invalid; compare to documented fixed baseline |
| B. Passport | Official Ondo/xStocks issuer structure, primary eligibility and corporate-action documentation inspected | Per-asset BSC contract list and bStocks terms NOT_VERIFIED; no authenticated discovery | Static cards and links may feel like content rather than a technically deep product | Live discovered contract linked to issuer source with precise supported/unknown claims; no automatic rights equivalence; include one actual source conflict |
| D. RFQ debugger | Official documented wallet binding, EIP-712 flow, vendor matching, retry idempotency and terminal states inspected | Payload shape, real errors, order status and settlement NOT_RUN/BLOCKED | A logging wrapper can be built quickly and may have narrow user appeal | Replay deterministic signature/quote/vendor invariants; separate order accepted from filled and chain receipt; compare troubleshooting steps on same failure |

Do not label these document checks as successful API calls, observed pools, permissions, or deployed accessibility. A top-three runtime spike should stop after a bounded credential attempt, then record BLOCKED and continue fixture/local validation. No fake key or unauthenticated endpoint bypass is an acceptable alternative.

## Autonomous recommendation and rejection test

Select **A: KineGuard execution preflight**. B's issuer passport and D's decision receipt are internal mechanisms of one workflow, not separate launches. A has a clear first-user task, a compact judge demo, a factual equity-specific problem and useful failure cases without predictive claims. Adopt another Kine-containing name if branding merits it.

The primary opposition is credible: this may still be perceived as a wallet safety feature. Stop broadening features; overcome that with exact-intent binding, mode-specific RFQ behavior, source provenance and baseline fault detection. If legitimate quotes cannot be obtained before the integration milestone, the local preflight is deliverable engineering but the contest-required live integration remains blocked. Passport is the narrower fallback, not a claim of contest completion.

Five selection answers:

1. Existing workflow: search an issuer page, manually identify the BSC contract, open a swap, inspect permissions and understand a vendor-specific signature; information is split. This is an inferred workflow to validate, not a measured user study.
2. Measurable improvement: predefined unsafe/unknown order attempts detected, false-block rate on valid attempts, reproducible decision agreement and task steps. Report sample size and FIXTURE/REPLAY/LIVE source; no financial-loss savings claims from fixtures.
3. Original mechanism: a deterministic evidence receipt binds a policy result to exact intent and data snapshots. Changing the quote, contract, wallet, spender, amount or evidence age invalidates it. LLM cannot override it.
4. Equity is central: issuer instruments and redemption rights, underlying versus venue clocks, share ratios/corporate actions and equity RFQ execution require checks a generic token swap does not capture.
5. Twenty-second explanation: “Before signing a stock token order, see what it is, whether this exact route is still valid, and the evidence for the decision.” A four-minute demo can include a legitimate quote, one expiry, one mutated permission, a mode-correct preview and a receipt; actual mainnet fill is shown only when separately authorized and verified.

Closed underlying market is contextual information, not proof a DEX trade is forbidden. Product policy may HOLD for a stated reason, but should distinguish this from a technical BLOCK and not manufacture universal restrictions. Missing evidence remains UNKNOWN. Quote age can enforce a conservative local refresh policy, but cannot be advertised as the vendor's true deadline unless parsed from a verified field or documented source.
