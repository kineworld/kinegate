# Original work and reuse

Original for this build window: KineGate application, deterministic gates, canonical receipt/expiry/current-context verifier, fixture scenarios, benchmark, UI, custom Node request adapter, tests and recording automation.

Official Binance Web3 connector/source and documentation were consulted to establish authentication, endpoint parameters, RWA field semantics and RFQ/EVM distinctions. No upstream repository history was removed or represented as our own. Source commit and links are recorded in api-contracts.md. The adapter must not be represented as an official SDK.

Dependencies: TypeScript 5.9.3 (Apache-2.0), @types/node 24.10.1 and undici-types transitive typings (MIT). Versions locked in package-lock.json. Node.js runtime and its builtin modules are used. No third-party UI assets or copied competitor code. An unchanged official SDK response-type excerpt is preserved under evidence/devex/source-excerpts for a field observation, with its MIT LICENCE and source commit; no SDK runtime implementation is copied.

Browser QA/recording uses the locked Playwright 1.63.0 development dependency (Apache-2.0) as tooling, outside the static shipped code; FFmpeg is an installed tool, not redistributed. Preserve their licenses when redistributing tool binaries; none are included in this project.

Issuer/company names identify referenced assets and are not endorsements or partnerships. Synthetic fixture data is original test data and not historical market evidence.

The polished demo retains actual browser recording pixels. English narration uses Microsoft Edge AndrewNeural through unchanged edge-tts 7.2.8, with synthetic speech disclosed; no human voice is cloned. The ambient score is an original deterministic oscillator composition, with no sampled recording. Source and provenance are in demo/polished; subjective human listening has not been verified by the agent. FFmpeg exports the full video with the shared camera plan; HyperFrames 0.8.133 renders the separate short HTML sample. GSAP 3.14.2 is development tooling under its [standard license](https://gsap.com/standard-license/), not redistributed here. No paid generation service was used.

Six MIT-identified Diamond dispatcher source files are retained strictly as attributed research excerpts. Their original source URLs, metadata licensing and reproduction boundaries are in [the excerpt inventory](../evidence/devex/source-excerpts/README.md). They do not authenticate the swap facet. USDT contract source licensing was not established; its full source is excluded from the public project, with only sourced storage observations retained.
