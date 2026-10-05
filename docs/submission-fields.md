# Actual official form inventory

Read-only verification: 2026-10-05 UTC. Links were obtained from the [official hackathon page](https://www.bnbchain.org/en/hackathons/tokenized-stocks), then their actual Google Forms redirect targets were inspected using unauthenticated public HTTP GET, all returning HTTP 200. No fields were filled, no account was logged in, and no response was sent.

Google Forms published HTML and public field definitions were inspected; this is not a successful interactive form run. Web extraction refused Google Forms; in-app browser binding timed out. Required flags below came from published field definitions and were cross-checked against available visible HTML. Field meanings are paraphrased; the live form remains authoritative.

## Official destinations and dependency order

| Purpose | Official link | Actual destination |
| --- | --- | --- |
| Register for API-limit uplift | [Apply as Hacker](https://forms.gle/NEmy3FxYc4f5Dua47) | [Registration form](https://docs.google.com/forms/d/e/1FAIpQLScV9gD2wo4LBOI5IXqAX6P-Q3UeSwlChvAM3rHAAPtu6vISOA/viewform) |
| Human DevEx report | [Report template](https://forms.gle/EUQ39xf54GHjC2ys5) | [DevEx form](https://docs.google.com/forms/d/e/1FAIpQLSfBkyWAYZ5JjzzUXRHlRgi7TjAIPUCkxPtV81eJgyBmGfrJiQ/viewform) |
| Submit final project | [Submit Project](https://forms.gle/yToDUzaDMwWnq6R6A) | [Project form](https://docs.google.com/forms/d/e/1FAIpQLSdMtogkNnWzkI6xUifE78Ks4TohOM1YuWMuNgV-UPLVnpHD4Q/viewform) |

Registration requests creation of the API account/key first at the [developer portal](https://web3.binance.com/en/dev-portal). Contact email must match across all three forms. The human-written DevEx report must be submitted before the project form confirms report completion. Deadline: 2026-10-11 12:00 UTC, or 20:00 Asia/Shanghai.

## Registration

| Field meaning | Input | Required | Preparation/owner |
| --- | --- | --- | --- |
| Team/project name | Short text | Yes | Working Kine name may change later |
| Matching contact email | Short text | Yes | Human supplies; reuse consistently |
| Main contact Telegram | Short text | No | Human supplies optional @handle |
| Binance UID or email for API-key Binance account | Short text | Yes | Human provides actual account identifier; never secret |
| Team headcount | Single choice | Yes | Solo, 2, 3, 4, or 5+; human confirms |
| Initial build concept | Short text | No | One-line current product concept |
| All-member eligibility declaration | Checkbox | Yes | Human confirms citizenship, residence and location for every member; plus applicable-law responsibility |

Do not check the legal/eligibility declaration based on assumptions. The account identifier requirement may need organizer clarification for a wallet-only developer account.

## Project submission

| Field meaning | Input | Required | Preparation/owner |
| --- | --- | --- | --- |
| Google Forms email collection | Email collection | Yes in HTML | Confirm email behavior in live form; no login attempted |
| Team/project name | Short text | Yes | Final Kine name |
| Matching contact email | Short text | Yes | Same registered/report contact |
| Prize-receiving BSC address or Binance UID | Paragraph | Yes | Human supplies authorized address/UID; no private key |
| Telegram | Short text | No | Optional human @handle |
| Product, audience, used APIs and stock assets | Paragraph | Yes | Evidence-backed product summary |
| Applicable track(s) | Checkboxes | Yes | Main tokenized-stock track; Wallet/Skills special; Agent Studio special; select supported claims only |
| Public code repository | Paragraph | Yes | Public at submission and through judging |
| Demo video URL | Short text | Yes | At most four minutes, anonymously accessible; actual form makes this required |
| Deployment URL or runnable judge instructions | Paragraph | Yes | Complete usable instructions; never credentials or wallet secrets |
| DevEx completion confirmation | Checkbox | Yes | Only after a real report receipt exists |

The form is one page. The required video field overrides the project's assumption that a video could be skipped; official homepage wording remains inconsistent. The prize identity field accepts a Binance UID as an alternative to the wallet address. A transaction hash is not requested as its own field; include verified evidence in the product/repo where appropriate.

## Human DevEx form

The form is eight pages including its opening page, with seven topic sections, 46 project/experience questions, and additional Google Forms email collection shown as required on the opening page. No final report answers are provided here. R = required, O = optional. Published options are summarized without selecting answers.

| Section | Field meaning | Input / requirement |
| --- | --- | --- |
| 1. Matching details | Project name | Short text, R |
| 1 | Contact email | Short text, R |
| 1 | Public repo | Short text, R |
| 1 | API/tools actually called | Checkboxes, R: RWA, Market, Trading, Transaction, Wallet, DeFi, b402, Wallet/Skills, Agent Studio |
| 1 | Team headcount | Single choice, R: solo, 2, 3, 4, 5+ |
| 1 | Longest Web3 experience among members | Single choice, R: <6 months, 6–12 months, 1–3 years, >3 years |
| 1 | Prior Binance Web3 API usage | Single choice, R: new, brief trial, production |
| 2. Onboarding | Documentation-to-first-call duration | Single choice, R: <15 min, 15–60 min, 1–3 h, 3–8 h, >1 day, never successful |
| 2 | Time to obtain working portal key | Single choice, R: <15 min, 15–60 min, hours, >1 day, help required |
| 2 | Onboarding rating | Scale 1–5, R |
| 2 | Exact onboarding blockage and attempts | Paragraph, R |
| 2 | Unexpectedly slow step and reason | Paragraph, R |
| 2 | Usefulness/awareness of llms documentation files | Single choice, R: useful, unreliable, would have used, unaware |
| 2 | AI coding errors from docs | Paragraph, O |
| 3. Documentation | Overall documentation rating | Scale 1–5, R |
| 3 | Specific documentation errors, including none if applicable | Paragraph, R; URL/section/problem/correction evidence |
| 3 | Missing or insufficiently documented topics | Paragraph, R |
| 3 | Examples runnable without change | Single choice, R: all, most, some, none, not tried |
| 3 | Failed examples and repairs | Paragraph, O |
| 3 | Most helpful page URL | Short text, O |
| 4. API pitfalls | Reliability rating | Scale 1–5, R |
| 4 | Unexpected behavior with request/endpoint/result | Paragraph, R |
| 4 | Ambiguous errors and actual cause | Paragraph, R |
| 4 | Slow endpoints and measured response times | Paragraph, O |
| 4 | Rate-limit incidence | Single choice, R: none, occasional, blocking, undocumented |
| 4 | Rate-limit workload and response | Paragraph, O |
| 4 | Authentication/signing problems | Paragraph, O |
| 4 | Unreconciled or untrusted returned data | Paragraph, O |
| 5. AI stack | Stack components used | Checkboxes, R: Agentic Wallet, Skills, Skills CLI, Agent Studio, none |
| 5 | Execution-layer rating | Single choice, R: 1–5 or unused/N/A |
| 5 | Successful stack behavior | Paragraph, O |
| 5 | Failed component/command and behavior | Paragraph, O |
| 5 | Missing primitives/tooling/guardrails | Paragraph, O |
| 5 | Agent Studio experience if used | Paragraph, O |
| 6. Stock assets | Platforms actually used | Checkboxes, R: bStocks, Ondo, xStock, or no trade execution |
| 6 | Observed depth by ticker/notional | Paragraph, R |
| 6 | Observed slippage by size/ticker | Paragraph, R |
| 6 | Behavior while underlying market closed | Paragraph, R |
| 6 | Onchain/reference-price gaps and actionability | Paragraph, O |
| 6 | Issuer differences for a shared ticker | Paragraph, O |
| 7. Improvements | Platform redesign for immediate first call | Paragraph, R |
| 7 | Requested endpoints/SDKs/features and intended use | Paragraph, R |
| 7 | Single greatest time-saving change | Paragraph, R |
| 7 | Intention to continue using the API | Single choice, R: definitely, probably, unsure, probably not, no |
| 7 | Reason for that intention | Paragraph, O |
| 7 | Additional feedback | Paragraph, O |

Required text does not authorize invented experience. Where no failure or trade occurred, the human must truthfully say what was and was not tested. Only mark modules actually called, and distinguish simulations from live execution. The form supplies N/A/unused options for the AI stack; this confirms optional stack integration while preserving feedback coverage.

## Handoff and blockers

Prepare product summary, repo link, deployment/run instructions and video URL automatically. Gather objective API evidence and reproduction steps automatically. Human-owned inputs remain contact identity, account/UID, team size/experience, eligibility, wallet receiving address and the final DevEx answers. Final forms must be reviewed against live fields before any authorized submission.

Status: NOT_REGISTERED, DEVEX_NOT_SUBMITTED, PROJECT_NOT_SUBMITTED. No receipt exists. Live Google Forms validation, sign-in requirements, CAPTCHA behavior, closed-form handling and subsequent pages were not interactively tested; published definitions are readable without authentication, but that does not prove unauthenticated submission is possible. Do not use this inventory to bypass login or legal confirmations.
