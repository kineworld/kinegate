# Official rules and unresolved eligibility

Verified on 2026-10-05, starting at 11:20:48 UTC (19:20:48 Asia/Shanghai). This is a sourced rule checklist, not an eligibility certification or the final DevEx report.

Rechecked 2026-10-05 14:01 UTC: deadline, repository freeze, scoring and AI/DevEx rules remain as summarized below. Actual public form schemas were re-read; see [recheck](submission-recheck.md) and evidence/submission-recheck-2026-10-05.json. Initial blocker observations below describe the original rules review; current project readiness is tracked in submission-audit.md. No final legal declaration or submission was made.

## Source register

| ID | Official source | Access and scope |
| --- | --- | --- |
| H | [Hackathon page](https://www.bnbchain.org/en/hackathons/tokenized-stocks) | Read 2026-10-05; current event requirements, awards and eligibility |
| B | [Announcement, dated 2026-09-16](https://www.bnbchain.org/en/blog/bnb-hack-tokenized-stocks-edition-with-binance-web3-wallet) | Read 2026-10-05; build window, freeze, reuse and tie-breaks |
| R | [API service restrictions](https://web3.binance.com/en/dev-docs/web3-api-prohibited-regions) | Read 2026-10-05; page last modified 2026-10-01 |
| F | [Actual project form](https://forms.gle/yToDUzaDMwWnq6R6A) | Followed official H link; public HTTP GET 200, 2026-10-05; see submission-fields.md |
| G | [Actual registration form](https://forms.gle/NEmy3FxYc4f5Dua47) | Followed official H link; public HTTP GET 200, 2026-10-05 |
| D | [Actual DevEx form](https://forms.gle/EUQ39xf54GHjC2ys5) | Followed official H link; public HTTP GET 200, 2026-10-05 |
| O | [Ondo eligibility](https://docs.ondo.finance/ondo-stocks/eligibility) | Read 2026-10-05; old global-markets URL redirects here |
| X | [xStocks partner restrictions](https://xstocks.com/partner) and [issuer legal documents](https://assets.backed.fi/legal-documentation) | Read 2026-10-05; separate asset restrictions |
| S | [BNB Chain bStocks issuer notice](https://www.bnbchain.org/en/blog/win-a-share-of-300k-with-bstocks-on-trust-wallet-pancakeswap-aster-lista-dao-venus-and-native) | Read 2026-10-05; dated 2026-06-22, not complete issuer terms |

## Event checklist

The following compact summary comes from [H](https://www.bnbchain.org/en/hackathons/tokenized-stocks).

| Requirement | Project acceptance evidence |
| --- | --- |
| Solo/team; one entry per team | Consistent registration and contact |
| bStocks, Ondo or xStocks central | Core workflow and asset provenance |
| Binance Web3 API integration | Actual calls and useful code path |
| BSC mainnet; spot; small live demo after simulation | Receipt, balance changes, guarded execution |
| Public repo; deployment or runnable judge instructions | Anonymous access and clean setup |
| Repo/demo/deployment accessible through judging | Availability checks through October 23 |
| Technical 30%; originality 25%; DevEx 25%; product/UX 20% | Running tests, baseline comparison, human feedback, browser validation |
| Main awards: $6,000/$4,000/$3,000/$2,000/$1,000 | Overall first is the objective, not a guarantee |
| Agentic Wallet/Wallet Skills and Agent Studio optional | Include only if core value improves |

[H eligibility](https://www.bnbchain.org/en/hackathons/tokenized-stocks) excludes US, Canada, Netherlands, Iran, Cuba, North Korea, Crimea, DPR, LPR, UK and Japan. Registration also attests citizenship and sanctions status. API availability does not certify competition eligibility.

## Calendar, reuse, freeze and tie-breaks

From [B](https://www.bnbchain.org/en/blog/bnb-hack-tokenized-stocks-edition-with-binance-web3-wallet):

| Event | UTC | Asia/Shanghai |
| --- | --- | --- |
| Build/registration begins | 2026-09-16 12:00 | 2026-09-16 20:00 |
| Submission locks; repositories freeze | 2026-10-11 12:00 | 2026-10-11 20:00 |
| Screening | October 12–14 | Dates stated in UTC |
| Judging | October 15–23 | Dates stated in UTC |
| Winners | Week of October 26 | Announcement week |

At the verification timestamp, remaining time was 6 days, 39 minutes, 12 seconds. Recompute when planning work.

Submission work must be built inside the window. Existing products may enter a new integration with before/after evidence. Do not represent old functionality as new. Record reused components, licenses, modifications and original contributions in attribution.md. Finalize the submitted commit, archive video and evidence, and freeze the submitted artifact at lock time. Post-lock repair exceptions are not specified; obtain written organizer clarification before changing the judged version.

Completeness and eligibility screening precede scoring. Tie-breaks prioritize Web3 API depth, then feedback quality; no live PnL score. Each special is $2,000; a main placement and a special can coexist. Whether one project may receive both specials is not explicit.

## AI and DevEx boundary

[D](https://forms.gle/EUQ39xf54GHjC2ys5) makes the report compulsory: without it the project is not scored. AI-generated or perfunctory reports are rejected. [B](https://www.bnbchain.org/en/blog/bnb-hack-tokenized-stocks-edition-with-binance-web3-wallet) permits AI-assisted code.

Project policy: the agent may gather objective timestamps, redacted request/response evidence, reproduction commands, documentation URLs and failures. A real team member must personally reproduce relevant flows and write their own experience, judgments and suggestions. Human approval of generated prose does not establish compliance. Do not produce a submit-ready DevEx narrative. If no human completes the report, final submission status is BLOCKED_BY_DEVEX_RULE. The genuine report must be submitted before checking the project form's report-completion box.

## Conflicts and project decisions

| Issue | Observed conflict | Current action |
| --- | --- | --- |
| Video | H says optional; B describes a video; F requires a video URL | Deliver an accessible video of at most four minutes; do not rely on optional wording |
| Japan | H excludes Japan; R offers conditional API access | Treat competition exclusion independently; do not claim API exemption permits entry |
| Duration prose | H says four-and-a-half weeks; B says three-and-a-half | Use exact dated build window |
| Registration account | B mentions external-wallet API signup; G requests Binance UID or API account email | Verify supported identifier with organizer if using only an external-wallet identity |
| Specials | Automatic consideration stated; F still requests track checkboxes | Truthfully select only substantiated integrations |
| Reuse/freeze | B allows new integration in old product, but window and frozen repo remain | Preserve before/after and submitted commit; no invented blanket reuse permission |

No organizer message has been sent. Clarification requires authorized communication and actual written response.

## Three independent eligibility gates

1. **Competition:** Every human member must confirm citizenship, residence, current physical location and sanctions status. Registration's checkbox covers all members. Personal facts are unverified. Do not infer them from language, nationality alone, host IP or timezone.
2. **API service:** [R](https://web3.binance.com/en/dev-docs/web3-api-prohibited-regions) checks portal/API IPs and includes US territories (Guam, Northern Mariana Islands, Puerto Rico, US Virgin Islands, American Samoa and US Minor Outlying Islands). Japan's exception requires Binance login, non-prohibited KYC country and Japan server IP simultaneously. Other prohibited regions have no exemption. Do not select hosting or use proxies to evade checks.
3. **Asset issuer and venue:** Hackathon permission and successful API access do not establish permission to acquire, trade, mint or redeem securities. Check chosen issuer, venue and applicable law before the live demo.

| Issuer | Verified boundary | What remains |
| --- | --- | --- |
| Ondo | [Eligibility](https://docs.ondo.finance/ondo-stocks/eligibility) prohibits acquisition/subscription/redemption for specified jurisdictions, including US persons or their benefit; covers controlled entities. Brazil, EEA, Hong Kong, Malaysia, Singapore, Switzerland and UK have separate investor-status restrictions. [Platform FAQ](https://ondo.finance/ondo-stocks) requires onboarding/KYC for direct mint/redemption; holding through secondary markets does not confer redemption eligibility. | Verify user/entity and chosen venue; no assertion of universal non-US eligibility |
| xStocks | [Partner page](https://xstocks.com/partner) restricts US persons/US, Canada, UK and Australia and requires geographic compliance. [Issuer documents](https://assets.backed.fi/legal-documentation) distinguish token transferability from offering restrictions, direct qualified-investor purchase, and product-specific terms. | Full jurisdiction and product/venue terms review before trading; no checkbox accepted on issuer site |
| bStocks | [Official BNB notice](https://www.bnbchain.org/en/blog/win-a-share-of-300k-with-bstocks-on-trust-wallet-pancakeswap-aster-lista-dao-venus-and-native) identifies BTECH Holdings Ltd (ADGM), excludes US persons/restricted jurisdictions, and says tokens do not directly confer underlying-stock ownership. | Complete issuer prospectus, restrictions and chosen venue terms not yet verified |

## Explicit blockers and limitations

| Status | Missing fact or action | Independent work allowed |
| --- | --- | --- |
| BLOCKED_ELIGIBILITY_ATTESTATION | No human confirmation for all team members or applicable-law assessment | Local research, implementation, read-only evidence |
| BLOCKED_API_ACCOUNT | Actual authorized API account/key and portal eligibility not verified by this rules review | Adapters, tests and clearly labeled fixtures |
| BLOCKED_LIVE_AUTHORIZATION | Real asset budget/signature permission remains zero until specifically authorized | Read-only data and unbroadcast simulations |
| BLOCKED_BY_DEVEX_RULE | Human report author, reproduction and final report still required | Evidence collection and reproduction guide |
| BLOCKED_SUBMISSION_IDENTITY | Contact email, team size and prize wallet/UID must come from the user | Field-aligned product materials |
| UNVERIFIED_ISSUER_TERMS | Selected asset and venue must pass their own restrictions | Asset research; no live trade |
| UNVERIFIED_FREEZE_EXCEPTION | Post-lock repair permission and dual-special compatibility not explicit | Plan strict freeze and one main entry |

All three official forms were read without filling, login, POST or submission. No registration or submission receipt exists. Browser integration timed out and web extraction could not read Google Forms; public HTTP GET successfully exposed the published field definitions. Live browser behavior, CAPTCHA and final submission flow remain NOT_RUN.
