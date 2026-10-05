# KineGate — an evidence gate for a stock-token trade

Core user: a spot user deciding whether an issuer-specific tokenized equity purchase is actually ready to proceed. Problem: a ticker and an attractive displayed price hide issuer identity, conversion ratios, market state, stale quotes and unverified transaction effects.

Value: turn one trade intention into a reproducible, expiring preflight receipt that states which evidence is missing and why a trade must wait. Distinction: issuer-bound, clock-bound, amount-bound checks that must all agree; editing an input invalidates the receipt. A reference price alone never authorizes execution.

Workflow: choose a scenario/issuer → inspect a requested spend → run preflight → inspect blockers and a local simulation → export the bound receipt → verify it or invalidate it by changing the intention. Public experience has no signing or broadcast capability.

Must complete: deterministic integer arithmetic, issuer/chain checks, evidence freshness, slippage/cost/balance/permission gates, local fixture simulation with distinct labels, receipt integrity and expiry, scenario comparison, documented Binance client, honest API failure, keyboard/mobile UI, tests and source provenance.

Optional: authenticated read-only snapshots and unsigned Transaction API simulation after valid credentials and qualification. Live purchase requires separate bounded human signing authorization and runtime verification. No claim of completion without actual API/mainnet evidence.

Not doing: predictions, profitable arbitrage claims, automated custody, real-wallet operations in a public demo, issuer equivalence, LLM permission overrides, pay-per-call, unnecessary agent integrations.

Scoring evidence: technical—client signing tests, timeout/retry/error paths, deterministic gates and receipt verification; originality—same-input comparison to a documented simplified price-only baseline, fixture limitations disclosed; UX—no-wallet complete workflow, reasons and next actions, actual browser checks; DevEx—timestamped objective probes and human reproduction guide, never an AI-written final report.

Dependencies: official authenticated API and issuer information. Missing key/eligibility blocks LIVE; fixture remains accessible. Unknown schemas remain raw and untrusted rather than guessed. Missing/ambiguous data fails closed. Mainnet spending budget remains 0.

Strongest objection: a preflight checklist is easy to copy and not enough alone to win. The differentiated contribution must be the tested evidence-bound receipt and invalidation semantics, and actual API depth remains the largest gap until credentials are provided.
