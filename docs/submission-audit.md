# Submission audit

Updated 2026-10-05. States are separate, and passing fixtures do not count as mainnet trades.

| Requirement | State | Evidence | Remaining risk |
| --- | --- | --- | --- |
| Kine name, runnable product | PASS local fixture milestone | README, source, browser-qa.json | Mainnet execution workflow still incomplete |
| Official rules and real fields | PASS read-only verification | rules.md, submission-fields.md | Final form declarations and receipts absent |
| Tokenized-stock core | PASS fixture and authenticated data milestone | Ondo fixture; exact current AAPLon API identity and pinned-block chain read | Personal issuer access/liquidity/settlement unverified |
| Binance Web3 integration | PASS authenticated acquisition and bounded simulation evidence | Four signed RWA HTTP200/code0 responses; actual LIVE UI refresh; 6-USDT quote/build; evidence/mainnet/native-simulation-comparison.json | Quote/builder mode SWAP. Identical-payload native simulation failed at 450,000 swap gas and succeeded at 1,183,991 using 935,818 gas; doubled-minimum control failed. This does not establish actual execution or full ABI semantics |
| Thirteen-gate observed audit | PASS partial REPLAY audit | src/observed-swap.mjs; src/app.mjs | Recorded evidence is bound to intention/policy/source; unknown current gates remain WAIT/BLOCK. Hashes establish internal integrity, not external authenticity; cannot sign or broadcast |
| BSC mainnet small live demo | BLOCKED | Controlled native comparison at 2026-10-05 14:21 UTC | No actual approval, signature, broadcast, funds spent or settled trade. Original historical minimum fails exact 0.5% policy. Fresh 0.49% request meets authorized exact 0.5% cap in native simulation; router/facet source and full ABI remain incomplete. Qualification/bounded budget already confirmed privately |
| Public source / deployed experience | BLOCKED_BY_VISIBILITY_CHANGE | Parent verified current repository PRIVATE, has_pages=false, Pages API404 | Historical evidence/deployment.json and anonymous browser QA passed then; they are stale for current access. Contest public-access exception awaits human resolution |
| Tests and comparison | PASS bounded scope | tests-run.txt, fixture-benchmark.json, browser-qa.json | Not real-world accuracy or profitability evidence |
| Independent review | PASS bounded review | review-independent.md | No security certification; provenance hashes cannot authenticate sources |
| Clean install/build/start | PASS clean checkout, bounded scope | evidence/cleanroom.json, Linux CI | Fresh Windows checkout, not new OS; remote Git clone reset |
| Secrets/licenses/links | PASS bounded scan/licenses; partial links | publication-audit.json, attribution.md, link-check.json | Native HTTP follow-up reached five of six links (three docs returned202, content not verified); Ondo docs NETWORK_UNVERIFIED; official sources separately researched |
| Actual demo ≤4 min | PASS local artifact; public access blocked | Historical [polished release](https://github.com/kineworld/kinegate/releases/tag/demo-polished-v1), demo/polished/qa/final-qa.json; 133.816667 s | Actual product recording with disclosed synthetic narration and original score; no funded trade. Private repository currently prevents anonymous release access |
| Human DevEx | BLOCKED_BY_DEVEX_RULE | Objective evidence + reproduction guide | Human personally writes final report |
| Identity/eligibility/prize fields | PROVIDED PRIVATELY; final declarations pending | Actual form schema and ignored local field pack; personal qualification/bounded budget already confirmed | Identity values are deliberately withheld from public documents. Final legal declarations and current issuer/venue trading checks remain separate |
| Actual registration/submission | NOT_SUBMITTED | No receipt | Never check DevEx complete without true receipt |
| Freeze and judged accessibility | PLANNED | Official deadline 2026-10-11 12:00 UTC | Freeze submitted commit; keep accessible through Oct 23 |

Final readiness must report product, mainnet verification, deployment/publication, report compliance and actual submission separately.

Private registration/project field packs were prepared locally with the published entry IDs and supplied identity. They omit eligibility/legal declarations, DevEx completion and separate Google email collection. No prefill URL was opened or sent, and no POST occurred. Public draft null identity fields mean withheld, not missing; no repeated identity, qualification or budget request is needed.

Official forms/rules rechecked 2026-10-05 14:01 UTC: deadline and freeze unchanged; public GET schemas match the prior semantic inventory. See evidence/submission-recheck-2026-10-05.json and docs/submission-recheck.md. Registration, final human DevEx and project submission receipts remain absent; no completion checkbox or personal/legal declaration was entered.

Native follow-up: evidence/mainnet/tight-slippage-native-comparison.json preserves a new 0.49% request and three controlled native results. Exact authorized 0.5% cap passes; this does not clear ABI/source, fresh execution or personal signature gates. All actual asset actions remain zero. Local verification is 57 tests / 33 browser checks.
