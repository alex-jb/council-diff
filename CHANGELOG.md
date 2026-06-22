# Changelog

All notable changes to council-diff. Versioning follows semver.

## [Unreleased]

### Added (issue #1 — llm_adapter abstraction)
- `src/llm-adapter.ts` introduces a thin `LlmAdapter` interface (`chat` / `supportedModels` / `retentionFor`) with three built-in implementations:
  - `AnthropicAdapter` — preserves the pre-#1 code path (no behavior change for existing users)
  - `OpenAIAdapter` — gpt-5 / gpt-5.1 / gpt-4.1 tier; openai SDK is an optional peer, lazy-imported only when the adapter actually runs
  - `MockAdapter` — deterministic canned responses for unit tests, no network
- `CouncilDiff` constructor accepts `{ adapter }` so callers can inject any `LlmAdapter` (custom GLM, local-model bridge, OpenAI-compatible endpoint, test mock).
- `buildAdapter()` factory reads `COUNCIL_DIFF_PROVIDER` (`anthropic` | `openai`) for env-var dispatch.
- README "Bring your own provider" section with code samples for the OpenAI swap + GLM-via-base-URL pattern + test mock.
- 23 new contract tests covering all three adapters + factory + CouncilDiff routing through MockAdapter end-to-end. Total: 55 tests, 0 LLM credit spend.

### Changed
- `MYTHOS_MODELS` set moved to `src/llm-adapter.ts` (single source of truth, re-exported from `src/index.ts` for back-compat).
- `OracleVerdict.data_retention` now sourced from `adapter.retentionFor(model)` instead of a hard-coded set lookup — keeps the field correct when running against non-Anthropic providers.
- Backwards-compatible: `new CouncilDiff({ apiKey: "..." })` continues to work and now wraps an `AnthropicAdapter` under the hood.

### Previously planned (still on roadmap)
- Streaming voice-by-voice output
- Python port parity tracking (see [council-diff-py](https://github.com/alex-jb/council-diff-py))

## [0.4.2] / 2026-06-16 / GitHub-install support + skills.sh 71 platforms

### Fixed
- `prepare: tsc` script added so `npm install github:alex-jb/council-diff#v0.4.2` auto-builds `dist/`. Without this, downstream TypeScript consumers (e.g. council-for-slack) failed to type-check against GitHub-tag installs.

### Distribution
- council-diff now installs across **71 AI agent platforms** via skills.sh `npx skills add alex-jb/council-diff`. Verified install on Amp, Antigravity, Antigravity CLI, Claude Code, Cline, Codex, Cursor, Deep Agents, Gemini CLI, GitHub Copilot, Kimi Code CLI, Open Code, Warp, Zed + 57 more.
- README + README.zh-CN updated with new install snippets.

## [0.4.1] / 2026-06-16 / Security patches — Anthropic SDK + esbuild

### Security
- Upgraded `@anthropic-ai/sdk` to ≥0.91.1 to clear [GHSA-p7fg-763f-g4gf](https://github.com/advisories/GHSA-p7fg-763f-g4gf) (CWE-732, insecure default file permissions in the local-filesystem memory tool).
- Patched transitive `esbuild` vulns: [GHSA-gv7w-rqvm-qjhr](https://github.com/advisories/GHSA-gv7w-rqvm-qjhr) (NPM_CONFIG_REGISTRY RCE) + [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) (arbitrary file read on Windows dev server).
- `npm audit` post-upgrade: **0 vulnerabilities**.
- skills.sh Snyk scan should drop council-diff from Med Risk → Safe on next index pass.

### Why
2026-06-16 Snyk Med Risk flag traced to `@anthropic-ai/sdk 0.79-0.91` range. No API surface change for consumers.

## [0.4.0] / 2026-06-14 / Karpathy Software 3.0 repositioning

### Changed
- **README hero rewritten** from "5-voice AI council OSS" to "Software 3.0 Reference Implementation: the OSS evaluation loop for multi-persona AI agents". Same library, sharper frame.
- Hero quote block now leads with Karpathy, Sequoia AI Ascent, 2026-04-20:
  - "Traditional software automates what you can specify. AI automates what you can verify."
  - "Agentic engineers design specs, supervise plans, inspect diffs, write tests, create evaluation loops, manage permissions, isolate worktrees, and preserve quality."
- New section "Why this is a Software 3.0 artifact" maps each council-diff primitive 1:1 to Karpathy's agentic engineering job description (specs / diffs / tests / **evaluation loops** / permissions / quality).
- Brier audit section renamed "Brier audit: the evaluation loop" and elevated above the differentiation paragraph. The audit is now positioned as the load-bearing piece, not a footnote.
- `package.json` description rewritten to lead with the Software 3.0 framing.
- New keywords: `agentic-engineering`, `software-3.0`, `evaluation-loop`, `evals`, `karpathy`, `calibration`.
- README.zh-CN mirrors all of the above in Chinese.

### Why now
Karpathy's Sequoia AI Ascent talk (2026-04-20) coined "Software 3.0 = prompting an LLM interpreter" and laid out the agentic engineering job description. council-diff's persona-vs-persona + Brier audit design IS literally a Karpathy evaluation loop. The library has not changed. The frame around it has. This release locks in the positioning before the Anthropic FDE / Sequoia press cycle that the framing will pull toward.

### Not changed
- No code changes. All tests still pass.
- Fable 5 Oracle, safeMode, data retention disclosure all unchanged.
- Install commands unchanged (`npm install council-diff`, `npx skills i alex-jb/council-diff`).

## [0.3.1] — 2026-06-11

### Added
- **Data retention disclosure** on every Oracle response. `OracleVerdict.data_retention` is `"30day-mythos"` for Mythos-class models (Fable 5, Opus 4.7-Mythos per [Anthropic policy](https://support.claude.com/en/articles/15425996-data-retention-practices-for-mythos-class-models)) or `"zero"` for Sonnet 4.6 / Haiku 4.5.
- **`safeMode: boolean` flag** on `CouncilOptions`. When `true`, any `oracle: "fable-5"` request silently downgrades to `claude-sonnet-4-6` to avoid the 30-day retention. Returned `OracleVerdict.downgraded: true` so the caller can tell what actually ran.
- README + zh-CN README data retention sections with the full disclosure model.

### Why now
Shipping Oracle (v0.3.0) on 2026-06-10 surfaced an industry-wide gap: many indie applications quietly route through Mythos-class models without disclosing the 30-day retention. For council-diff, whose positioning is calibration honesty + Brier audit, the gap is contradictory. v0.3.1 closes it before any further Oracle-mode marketing.

### Use cases that should set `safeMode: true`
- Mental-health / journaling apps with "on-device" or "零上传" claims
- Mainland China data-residency-sensitive products
- GDPR-sensitive PII processing
- Sealed M&A / legal deliberation
- Any product where 30-day server-side retention is a contractual problem

### Cost
- Council only: ~$0.03/call (Sonnet 4.6, zero retention)
- Council + Fable 5 Oracle: ~$0.10/call (30-day retention on the Oracle leg only)
- Council + Oracle + `safeMode`: ~$0.06/call (Sonnet 4.6 throughout, zero retention)

## [0.3.0] — 2026-06-10

### Added
- **Fable 5 Oracle mode** (`oracle: "fable-5"` on `DeliberateInput`). After the 5-voice council deliberates, [Claude Fable 5](https://www.anthropic.com/news/claude-fable-5) reads every verdict + the consensus and issues a single adjudication with override authority. Returned on `CouncilResult.oracle` with model, recommendation, score, verdict, and optional `override_reason` (set only when Oracle disagrees with the council).
- `OracleVerdict` interface exported from `src/index.ts`.
- `examples/oracle.ts` — runnable Fable 5 Oracle demo on a hosted-SaaS-vs-OSS decision. `npm run example:oracle`.
- `launch/14-fable-5-wave-borrow.md` — 24h wave-borrow launch kit (X thread, HN comment, Reddit r/ClaudeAI, LinkedIn).
- Keywords added to package.json: `claude-fable-5`, `fable-5`, `oracle`, `brier`.

### Why
Anthropic shipped Claude Fable 5 (Mythos-class flagship, 95% SWE-Bench, 1M context, $10/$50 per MTok) on 2026-06-10. A single-LLM answer hides its own uncertainty; a 5-voice council exposes the disagreement; a flagship adjudicator picks which side actually holds up. Council + Oracle runs both layers, Brier-audits both separately, and surfaces when Oracle wins vs underperforms the council — instead of taking either's word for it.

### Cost
- Council only: ~$0.03/call (Sonnet 4.6)
- Council + Fable 5 Oracle: ~$0.10/call total

## [0.2.0] — 2026-06-09

### Added
- **Brier audit module** (`src/brier.ts`): `addPrediction`, `resolvePrediction`, `predictedProbability`, `brierScore`, `meanBrier`, `brierByDomain`. Persistence-agnostic — bring your own JSONL / SQLite / Postgres.
- 2 worked examples: `examples/quant.ts` (AVGO buy decision with Druckenmiller 13F context) and `examples/career.ts` (job offer evaluation with realistic pipeline context).
- `docs/devto-article.md` — 48-hour OSS launch retrospective covering the shared Brier-audit pattern.
- `.github/workflows/release.yml` — auto npm publish + GitHub Release on `v*` tag (requires `NPM_TOKEN` secret).
- `launch/` folder with 13 platform launch drafts (HN Show / LinkedIn EN+中文 / X thread / 4 Reddit subs / dev.to / 小红书 / Bluesky / Threads + 3 awesome-list PRs).
- `CONTRIBUTING.md` + `SECURITY.md`.

### Changed
- Bilingual README updated with Brier audit usage example.

## [0.1.0] — 2026-06-08

### Added
- Initial release.
- `CouncilDiff` class with 6 built-in domains: `founder` / `engineer` / `investor` / `career` / `product` / `quant`.
- `custom` domain for fully user-defined voice rosters.
- Single Claude Sonnet 4.6 call produces 5 verdicts in 1 JSON response.
- `agreement_score` computed as `1 − normalized_stddev(voice_scores)`.
- Recommendation collapse: `go` / `wait` / `kill` / `split`.
- Bilingual README (EN + 中文).
- MIT license.

[Unreleased]: https://github.com/alex-jb/council-diff/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/alex-jb/council-diff/releases/tag/v0.2.0
[0.1.0]: https://github.com/alex-jb/council-diff/releases/tag/v0.1.0
