# Original work and reuse

Original for this build window: KineGate application, deterministic gates, canonical receipt/expiry/current-context verifier, fixture scenarios, benchmark, UI, custom Node request adapter, tests and recording automation.

Official Binance Web3 connector/source and documentation were consulted to establish authentication, endpoint parameters, RWA field semantics and RFQ/EVM distinctions. No upstream repository history was removed or represented as our own. Source commit and links are recorded in api-contracts.md. The adapter must not be represented as an official SDK.

Dependencies: TypeScript 5.9.3 (Apache-2.0), @types/node 24.10.1 and undici-types transitive typings (MIT). Versions locked in package-lock.json. Node.js runtime and its builtin modules are used. No third-party UI assets or copied competitor code.

Browser QA/recording uses the environment's bundled Playwright (Apache-2.0) as tooling, outside shipped code; FFmpeg is an installed tool, not redistributed. Preserve their licenses when redistributing tool binaries; none are included in this project.

Issuer/company names identify referenced assets and are not endorsements or partnerships. Synthetic fixture data is original test data and not historical market evidence.
