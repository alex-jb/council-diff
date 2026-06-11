# Changelog

All notable changes to council-diff. Versioning follows semver.

## [Unreleased]

### Added
- Streaming voice-by-voice output (planned)
- Python port parity tracking (see [council-diff-py](https://github.com/alex-jb/council-diff-py))

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
