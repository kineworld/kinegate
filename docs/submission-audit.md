# Submission audit

Updated 2026-10-05. States are separate, and passing fixtures do not count as mainnet trades.

| Requirement | State | Evidence | Remaining risk |
| --- | --- | --- | --- |
| Kine name, runnable product | PASS local fixture milestone | README, source, browser-qa.json | Mainnet execution workflow still incomplete |
| Official rules and real fields | PASS read-only verification | rules.md, submission-fields.md | Human declarations not supplied |
| Tokenized-stock core | PASS fixture and authenticated data milestone | Ondo fixture; exact current AAPLon API identity and pinned-block chain read | Personal issuer access/liquidity/settlement unverified |
| Binance Web3 integration | PASS authenticated RWA acquisition | Four signed RWA HTTP200/code0 responses; actual LIVE UI refresh; one successful6USDT quote | Quote/builder actual modeSWAP; predicted simulation FAILED for balance. Mainnet settlement and issuer qualification remain separate |
| BSC mainnet small live demo | BLOCKED | mainnet read-only evidence is insufficient | Bounded approval tracked privately; no asset signatures or settled trade. Prediction failed for balance; router provenance/ABI semantics also unverified |
| Public source / deployed experience | PASS | evidence/deployment.json, anonymous browser screenshot, public repository | Keep accessible through judging; public API deliberately disabled |
| Tests and comparison | PASS bounded scope | tests-run.txt, fixture-benchmark.json, browser-qa.json | Not real-world accuracy or profitability evidence |
| Independent review | PASS bounded review | review-independent.md | No security certification; provenance hashes cannot authenticate sources |
| Clean install/build/start | PASS clean checkout, bounded scope | evidence/cleanroom.json, Linux CI | Fresh Windows checkout, not new OS; remote Git clone reset |
| Secrets/licenses/links | PASS bounded scan/licenses; partial links | publication-audit.json, attribution.md, link-check.json | Native HTTP follow-up reached five of six links (three docs returned202, content not verified); Ondo docs NETWORK_UNVERIFIED; official sources separately researched |
| Actual demo ≤4 min | PASS 133.68 s | demo/recording.json, release video, ffprobe | Captioned fixture demonstration; no funded trade |
| Human DevEx | BLOCKED_BY_DEVEX_RULE | Objective evidence + reproduction guide | Human personally writes final report |
| Identity/eligibility/prize fields | PARTIAL human qualification confirmed | Actual form inventory and local authorization ledger | Final human declarations/team/contact/prize fields and issuer trading checks remain |
| Actual registration/submission | NOT_SUBMITTED | No receipt | Never check DevEx complete without true receipt |
| Freeze and judged accessibility | PLANNED | Official deadline 2026-10-11 12:00 UTC | Freeze submitted commit; keep accessible through Oct 23 |

Final readiness must report product, mainnet verification, deployment/publication, report compliance and actual submission separately.
