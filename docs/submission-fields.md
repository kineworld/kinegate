# Actual official form inventory

Current checkpoint 2026-10-05T16:25:26.077Z: registration, DevEx and project forms each have an observed response-recorded confirmation. Redacted receipts: evidence/submission/registration-receipt.json, devex-receipt.json and project-receipt.json. Ordinary field inventory below includes historical preparation checkpoints. No organizer acceptance/scoring or real trade is inferred. Mainnet execution remains incomplete; the submitted description explicitly discloses that limit.


Read-only verification: 2026-10-05 UTC. Links were obtained from the [official hackathon page](https://www.bnbchain.org/en/hackathons/tokenized-stocks), then their actual Google Forms redirect targets were inspected using unauthenticated public HTTP GET, all returning HTTP 200. No fields were filled, no account was logged in, and no response was sent.

Google Forms published HTML and public field definitions were inspected; this is not a successful interactive form run. Web extraction refused Google Forms; in-app browser binding timed out. Required flags below came from published field definitions and were cross-checked against available visible HTML. Field meanings are paraphrased; the live form remains authoritative.

Rechecked 2026-10-05 14:01 UTC via the same official links and fresh public GET. The prior field inventory still matches: registration 7 answer fields (5 required), project 10 (9 required), DevEx 46 (31 required) plus 7 section breaks. Separate Google Forms email collection is excluded from these counts. This is a semantic comparison; no old canonical schema hash was archived. See submission-recheck.md.

## Official destinations and dependency order

| Purpose | Official link | Actual destination |
| --- | --- | --- |
| Register for API-limit uplift | [Apply as Hacker](https://forms.gle/NEmy3FxYc4f5Dua47) | [Registration form](https://docs.google.com/forms/d/e/1FAIpQLScV9gD2wo4LBOI5IXqAX6P-Q3UeSwlChvAM3rHAAPtu6vISOA/viewform) |
| Human DevEx report | [Report template](https://forms.gle/EUQ39xf54GHjC2ys5) | [DevEx form](https://docs.google.com/forms/d/e/1FAIpQLSfBkyWAYZ5JjzzUXRHlRgi7TjAIPUCkxPtV81eJgyBmGfrJiQ/viewform) |
| Submit final project | [Submit Project](https://forms.gle/yToDUzaDMwWnq6R6A) | [Project form](https://docs.google.com/forms/d/e/1FAIpQLSdMtogkNnWzkI6xUifE78Ks4TohOM1YuWMuNgV-UPLVnpHD4Q/viewform) |

Registration requests creation of the API account/key first at the [developer portal](https://web3.binance.com/en/dev-portal). Contact email must match across all three forms. The human-written DevEx report must be submitted before the project form confirms report completion. Deadline: 2026-10-11 12:00 UTC, or 20:00 Asia/Shanghai.

## Registration

Current preparation: human identity, API account identifier and team choice were supplied privately. Personal competition/API qualification and the bounded budget were already confirmed. The ignored local field pack maps the supplied values to actual entry IDs without opening a prefill URL or sending a response. The reviewed eligibility declaration was checked and registration submitted after human authorization. The official confirmation displayed response recorded; redacted evidence is in evidence/submission/registration-receipt.json.

| Field meaning | Input | Required | Preparation/owner |
| --- | --- | --- | --- |
| Team/project name | Short text | Yes | Working Kine name may change later |
| Matching contact email | Short text | Yes | Supplied privately; mapped consistently, value withheld publicly |
| Main contact Telegram | Short text | No | Not supplied; optional field omitted |
| Binance UID or email for API-key Binance account | Short text | Yes | Actual identifier supplied privately and mapped; never expose credentials |
| Team headcount | Single choice | Yes | Supplied privately and matched to the actual choice |
| Initial build concept | Short text | No | One-line current product concept |
| All-member eligibility declaration | Checkbox | Yes | Human confirms citizenship, residence and location for every member; plus applicable-law responsibility |

Do not check the legal/eligibility declaration based on assumptions. The actual API account identifier was supplied privately; no organizer contact is needed merely to prepare that field.

## Project submission

| Field meaning | Input | Required | Preparation/owner |
| --- | --- | --- | --- |
| Google Forms email collection | Email collection | Yes in HTML | Confirm email behavior in live form; no login attempted |
| Team/project name | Short text | Yes | Final Kine name |
| Matching contact email | Short text | Yes | Same registered/report contact |
| Prize-receiving BSC address or Binance UID | Paragraph | Yes | Authorized destination supplied privately and mapped; no private key |
| Telegram | Short text | No | Optional human @handle |
| Product, audience, used APIs and stock assets | Paragraph | Yes | Evidence-backed product summary |
| Applicable track(s) | Checkboxes | Yes | Main tokenized-stock track; Wallet/Skills special; Agent Studio special; select supported claims only |
| Public code repository | Paragraph | Yes | Personal public repository verified anonymously; keep public through judging |
| Demo video URL | Short text | Yes | 133.816667-second polished video is publicly downloadable; release digest matches the local artifact |
| Deployment URL or runnable judge instructions | Paragraph | Yes | Personal Pages HTTP200 and actual anonymous browser smoke passed; standalone local package also available |
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

Product summary, repository/video references and local run instructions are prepared. Contact identity, account/UID, team choice and prize destination were supplied privately; public null values deliberately withhold them. Personal qualification and bounded budget were already confirmed, so do not repeat those requests. Registration has been submitted and the actual confirmation recorded. The project field pack still omits the DevEx completion checkbox. Human experience answers, the personally authored final DevEx and actual form receipts remain required. The earlier visibility blocker is resolved by transfer to the personal public account; no other company repository was changed.

Historical checkpoint before the later confirmed submissions: registration was recorded while report/project receipts were then absent. The actual registration page was observed in the signed-in browser. The matching account and seven fields were visible. The initial fill timed out. Recovery through the official prefill link and draft-choice dialog completed all five prepared fields; the actual DOM and full-page private screenshot verified them. After approval of the concrete review, the eligibility declaration was checked and Submit performed. The official confirmation displayed response recorded; no new response was submitted during receipt verification. At that earlier checkpoint, DevEx traversal and final report/project validation were unverified. Later confirmed submissions are recorded above. Do not use this inventory to bypass login or legal confirmations.

Current publication links after the owner-requested transfer: https://github.com/zoahdev/kinegate ; https://zoahdev.github.io/kinegate/ ; https://github.com/zoahdev/kinegate/releases/tag/demo-polished-v1 . Anonymous page and video download metadata verified. Identity/prefill data stays in the private local pack. A registration response was submitted and confirmed. No DevEx or project response was sent.

Interactive checkpoint 2026-10-05T15:53:20.496Z: the signed-in official project page was opened and eight ordinary fields verified, including the main track, public repo, video and deployment. The concise product description was updated and Google displayed draft saved. Optional Telegram, email collection checkbox and DevEx completion checkbox remain blank; Submit was not clicked. A screenshot with private fields is retained only locally. This later checkpoint supersedes the initial no-interaction inventory above. DevEx is a partial human draft on page3/8, not submitted.
