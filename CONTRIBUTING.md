# Contributing

Thanks for considering a contribution. `council-diff` is small on purpose — the whole engine is ~200 LOC in `src/index.ts` plus ~100 LOC of Brier math in `src/brier.ts`. Keep contributions focused.

## Quick start

```bash
git clone https://github.com/alex-jb/council-diff.git
cd council-diff
npm install
npm run build
```

To run an example:
```bash
ANTHROPIC_API_KEY=sk-ant-... npx tsx examples/founder.ts
```

## What we welcome

- **New domains** — add a 5-voice roster to `DOMAIN_VOICES` in `src/index.ts`. Each voice needs a `slug`, `display`, and a `role` brief (1 sentence describing their bias + push). Open a PR with the roster + 2-3 sample deliberations showing they argue well.
- **Brier audit extensions** — better outcome mapping, calibration tests, persistence adapters (SQLite / Postgres / JSONL helpers).
- **Streaming voice-by-voice output** — currently the 5 voices return in one JSON response. Streaming each as it lands without breaking the "they argue in shared context" insight is open research.
- **Python port parity** — see [council-diff-py](https://github.com/alex-jb/council-diff-py). PRs that keep the TypeScript and Python versions in sync are gold.

## What we'll reject

- Frameworks / orchestrators / graph DSLs. The whole point is single-call multi-persona — don't expand to multi-call.
- Streaming UI components. This is a library, not a UI kit. The UI lives in [vibex](https://github.com/alex-jb/vibex) `/council` route.
- Hardcoded model choices. Sonnet 4.6 is the default; the `model` constructor arg lets users override.

## Style

- TypeScript strict mode + ESM
- Prefer `interface` over `type` for object shapes
- No external deps beyond `@anthropic-ai/sdk`
- Tests welcome but not required (the public API is tiny; runtime behavior is dominated by Claude responses)

## Brier audit math

The interesting part. See `src/brier.ts`. Open an issue if you find a calibration assumption you disagree with — the math is opinionated by design but should be defensible.

## License

By contributing, you agree your contributions are licensed under MIT.
