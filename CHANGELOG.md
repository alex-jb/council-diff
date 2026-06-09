# Changelog

All notable changes to council-diff. Versioning follows semver.

## [Unreleased]

### Added
- Streaming voice-by-voice output (planned)
- Python port parity tracking (see [council-diff-py](https://github.com/alex-jb/council-diff-py))

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
