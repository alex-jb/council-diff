# council-diff

[![npm version](https://img.shields.io/npm/v/council-diff.svg)](https://www.npmjs.com/package/council-diff)
[![npm downloads](https://img.shields.io/npm/dm/council-diff.svg)](https://www.npmjs.com/package/council-diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> [English](README.md) · [中文](README.zh-CN.md)

### Software 3.0 Reference Implementation · The OSS evaluation loop for multi-persona AI agents

> **"Traditional software automates what you can specify. AI automates what you can verify."**
> Andrej Karpathy, Sequoia AI Ascent, April 20, 2026

> **"Agentic engineers design specs, supervise plans, inspect diffs, write tests, create evaluation loops, manage permissions, isolate worktrees, and preserve quality."**
> Karpathy, same talk

council-diff is the smallest reproducible **evaluation loop** for multi-persona agents. Paste a decision, get 5 persona verdicts in parallel, watch them disagree, optionally let a Fable 5 Oracle adjudicate, then Brier-audit every voice when the outcome resolves. v0.3.0 shipped 6 months before Anthropic's "advisor strategy" beta. MIT licensed, on npm.

## Why this is a Software 3.0 artifact

Karpathy's framing splits software history into three eras:

- **Software 1.0**: explicit code you write
- **Software 2.0**: trained neural networks
- **Software 3.0**: prompting an LLM interpreter

Software 3.0 has no compiler error and no unit test that catches a hallucination. The job description shifts. The agentic engineer designs specs precise enough that ambiguity has nowhere to hide, then builds the **evaluation loop** that catches the model when it drifts.

council-diff maps onto that bullet directly:

| Karpathy's job description | council-diff primitive |
|---|---|
| Design specs so precise ambiguity has nowhere to hide | 5 persona briefs per domain, each with explicit bias declarations |
| Inspect diffs | `voice.verdict` + `voice.strength` + `voice.gap` per persona, side by side |
| Write tests | `agreement_score` is the test. 1.0 unanimous, 0.0 split |
| **Create evaluation loops** | **Brier audit module. Every voice scored at resolution, calibration tracked over 30 / 90 days** |
| Manage permissions | `safeMode: true` forces zero-retention Sonnet 4.6, surfaces `data_retention` per call |
| Preserve quality | Oracle layer. Fable 5 reads all 5 verdicts and adjudicates, Brier-audited separately |

The persona-vs-persona format is the spec. The agreement score is the test. The Brier audit is the evaluation loop. The Oracle is the supervisor. That is one OSS library, 5 verdicts per call, ~$0.03.

## What it does

Single-LLM verdicts hide their own uncertainty. A 90% confident answer from one model and 5 specialists who disagree carry very different signals. council-diff exposes the disagreement.

For 6 built-in domains:

- **founder**: YC Partner / VC Skeptic / Lawyer / Indie CFO / Pragmatic Spouse
- **engineer**: Rust Maintainer / SRE Oncall / Recruiter / Junior Dev / CTO 5y Later
- **investor**: Macro / Sector / PM / Growth VC / Activist Short
- **career**: Mentor 20y / Recruiter / Peer Doing Well / CSO / Future You 5y
- **product**: Real User / Competitor / Internal Dev / Garry-style / Naval-style
- **quant**: Jane Street MD / Citadel / Two Sigma ML / Anthropic / HFT Engineer

Plus `custom` for fully user-defined rosters.

## Live case studies — quartet covering the full GO → KILL spectrum

Four real `council.deliberate()` fires from 2026-06. Same engine. Four different verdict shapes. The shape of the question determined the shape of the verdict — and the agreement score is the calibration signal.

| Case | Domain | Verdict | Agreement | Voice spread | Example |
|---|---|---|---|---|---|
| [Crypto payments on B2B SaaS](https://github.com/alex-jb/council-for-slack-2026/blob/main/docs/case-studies/crypto-payments-2026-06.md) | founder | **KILL** | **0.94** | 4 → 12 (8 pt, tightest) | `examples/founder-crypto-payments.ts` |
| [Annual billing at 2 months free](https://github.com/alex-jb/council-for-slack-2026/blob/main/docs/case-studies/annual-billing-2026-06.md) | founder | GO | 0.89 | 72 → 88 (16 pt) | `examples/founder-annual-billing.ts` |
| [GOOGL Q3 2026 — Druckenmiller vs Berkshire](./docs/case-studies/googl-q3-2026.md) | investor | WAIT | 0.78 | 38 → 72 (34 pt) | `examples/investor.ts` |
| [Rust rewrite of Python inference router](https://github.com/alex-jb/council-for-slack-2026/blob/main/docs/case-studies/rust-rewrite-2026-06.md) | engineer | WAIT | 0.62 | 22 → 72 (50 pt, widest) | `examples/engineer-rust-rewrite.ts` |

Agreement range: **0.62 → 0.94**. Voice spread range: **8 → 50 points**. Verdicts span GO / WAIT / KILL.

Reproduce any of these locally:

```bash
ANTHROPIC_API_KEY=sk-... npx tsx examples/founder-crypto-payments.ts
```

Each fire ~$0.03, ~10s. **The verdicts were not chosen for variety** — the quartet was selected before firing for question shape diversity. The fact that the cleanest convergence (0.94 agreement, 8-pt spread) is on a KILL is itself the calibration claim: when every framing converges against, the council collapses tighter than for any single GO.

## Install

```bash
# npm (TypeScript / Node)
npm install council-diff

# skills.sh — agent-agnostic distribution, supports 71 AI agent platforms
# (Amp, Antigravity, Antigravity CLI, Claude Code, Cline, Codex, Cursor,
#  Deep Agents, Gemini CLI, GitHub Copilot, Kimi Code CLI, Open Code,
#  Warp, Zed, +57 more)
npx skills add alex-jb/council-diff
```

## Quickstart

```ts
import { CouncilDiff } from "council-diff";

const council = new CouncilDiff({ apiKey: process.env.ANTHROPIC_API_KEY });

const result = await council.deliberate({
  domain: "founder",
  decision: "Should I raise a $1M seed or bootstrap?",
  context: "B2B SaaS, $5K MRR, growing 20% MoM, solo founder, 12 months runway",
});

console.log(result.recommendation);  // "go" | "wait" | "kill" | "split"
console.log(result.agreement_score); // 0-1, how much voices agree
console.log(result.consensus);       // 1-paragraph synthesis

for (const v of result.voices) {
  console.log(`${v.voice_display} (${v.score}/100): ${v.verdict}`);
  console.log(`  + ${v.strength}`);
  console.log(`  - ${v.gap}`);
}
```

## Oracle mode (Fable 5)

For hard calls, split councils, or anywhere you want a flagship-tier second opinion, opt into Oracle:

```ts
const result = await council.deliberate({
  domain: "founder",
  decision: "Ship hosted SaaS at $29/mo or stay OSS-only?",
  context: "11-agent OSS stack, ~50 stars, 3 paying customers begging for managed",
  oracle: "fable-5",  // opt-in
});

console.log(result.recommendation);          // council vote
console.log(result.oracle?.recommendation);  // Fable 5's vote
console.log(result.oracle?.verdict);         // 2-3 sentences naming which voices it sided with
console.log(result.oracle?.override_reason); // only set if Oracle disagrees with the council
```

Council deliberates first (Sonnet 4.6, 5 voices, ~$0.03). Then Fable 5 reads all 5 verdicts and the consensus, weighs them with the full Mythos-class reasoning budget, and either ratifies the council or overrides with reason. Adds ~$0.05-0.08 per call.

Use it when the decision matters enough that paying for a second model with override authority is rational. Skip it for routine deliberations.

Try it: `ANTHROPIC_API_KEY=... npm run example:oracle`

### Data retention disclosure

Anthropic enforces a **30-day server-side data retention policy on Mythos-class models** (Claude Fable 5, Opus 4.7-Mythos) per [their support article](https://support.claude.com/en/articles/15425996-data-retention-practices-for-mythos-class-models). The 5-voice base council uses Sonnet 4.6, which is **zero-retention** under standard enterprise terms.

Every Oracle response in v0.3.1+ includes the actual posture:

```ts
result.oracle?.data_retention  // "30day-mythos" or "zero"
result.oracle?.downgraded      // true if safeMode forced the downgrade
```

If your application has any privacy claim that conflicts with 30-day retention (mental-health journaling, "on-device 零上传" marketing copy, GDPR-sensitive PII, sealed business decisions), pass `safeMode: true` and Oracle silently downgrades to Sonnet 4.6:

```ts
const council = new CouncilDiff({ safeMode: true });

const result = await council.deliberate({
  domain: "founder",
  decision: "...",
  oracle: "fable-5",  // requested
});

result.oracle?.model         // "claude-sonnet-4-6", actually ran
result.oracle?.downgraded    // true
result.oracle?.data_retention // "zero"
```

This disclosure is not optional. council-diff's positioning is calibration honesty. Shipping a Mythos route without surfacing the retention boundary undermines the whole point.

## Custom voices

```ts
const result = await council.deliberate({
  domain: "custom",
  decision: "Use Postgres or DynamoDB for this new service?",
  context: "10K writes/sec peak, eventual consistency OK, team knows SQL well",
  custom_voices: [
    { slug: "dba", display: "Postgres DBA", role_brief: "Decades of OLTP. Bias: PG fits 95% of workloads." },
    { slug: "aws_se", display: "AWS Solutions Engineer", role_brief: "DynamoDB enthusiast. Bias: serverless > self-managed." },
    { slug: "kafka_dev", display: "Kafka Streams Dev", role_brief: "Event-sourcing lens. Bias: write log + project to either." },
    { slug: "cost_eng", display: "Cost Engineer", role_brief: "Watches the bill. Bias: serverless costs 5x at scale." },
    { slug: "former_cto", display: "Former CTO with 3 migrations", role_brief: "Has done both migrations. Bias: stay where the team is fluent." },
  ],
});
```

## Output schema

```ts
interface CouncilResult {
  domain: CouncilDomain;
  decision: string;
  voices: {
    voice: string;          // slug
    voice_display: string;  // human-readable
    score: number;          // 0-100, how strongly they support
    verdict: string;        // 1-2 sentences
    strength: string;       // strongest supporting signal
    gap: string;            // biggest risk / counter
  }[];
  consensus: string;            // 1-paragraph synthesis (60-100 words)
  agreement_score: number;      // 0-1, 1 = unanimous, 0 = split
  recommendation: "go" | "wait" | "kill" | "split";
  computed_at: string;          // ISO timestamp
  oracle?: {                    // present only when oracle: "fable-5" was passed
    model: string;              // e.g. "claude-fable-5"
    recommendation: "go" | "wait" | "kill" | "split";
    score: number;              // 0-100
    verdict: string;            // 2-3 sentences
    override_reason?: string;   // set when Oracle disagrees with council consensus
    data_retention?: "30day-mythos" | "zero";
    downgraded?: boolean;       // true if safeMode forced Sonnet 4.6
  };
}
```

## Cost

- **Council only:** one Claude Sonnet 4.6 call per deliberation. ~$0.02-0.04 per call depending on context length.
- **Council + Oracle (`oracle: "fable-5"`):** add one Claude Fable 5 call. ~$0.05-0.08 extra. Total ~$0.07-0.12 per Oracle deliberation.

## Brier audit: the evaluation loop

This is the part that makes council-diff a Software 3.0 artifact rather than a chat prompt wrapper. Every deliberation can be logged at decision time and scored at resolution time. The Brier score (0 perfect, 1 maximally wrong, 0.25 random coin-flip) tells you whether the council is calibrated or just opinionated.

```ts
import { addPrediction, resolvePrediction, brierScore, meanBrier } from "council-diff/brier";

// At deliberation time:
const pred = addPrediction({
  decision: result.decision,
  domain: result.domain,
  recommendation: result.recommendation,
  agreement_score: result.agreement_score,
  voice_scores: result.voices.map((v) => v.score),
  resolve_by: "2027-06-09",  // 12mo from now
});
// Persist `pred` to your storage of choice (JSONL, SQLite, Postgres).

// At resolution time (when the outcome is known):
const resolved = resolvePrediction(pred, { outcome: "go-was-right" });
const score = brierScore(resolved);  // 0 = perfect, 1 = max wrong, 0.25 = random

// Aggregate over many resolutions:
const audit = meanBrier(allResolvedPreds);
console.log(audit.edge_vs_random);  // positive = council adds calibration value
```

See `src/brier.ts` for `predictedProbability` math + persistence-agnostic interface. Oracle calls are Brier-audited separately so you can see when the Oracle beats the council and when it underperforms.

## How this differs from existing tools

**Perplexity Model Council (Feb 2026)** is a closed UI feature that compares the *same question* across *different providers* (GPT-5.2 vs Claude 4.6 vs Gemini side-by-side). council-diff is an OSS library that compares *different personas* against *the same model*, with a Fable 5 Oracle adjudicating, and a Brier audit module that scores every voice over 30 / 90 days. Persona-of-the-judge instead of provider-of-the-judge. Closes the loop with reality.

**Anthropic shipped "advisor strategy" (beta) on 2026-06-09.** Same pattern, 6 months later. Anthropic's June 2026 Skills release added an "advisor strategy" mode where agents consult an advisor model before deciding. That is literally what council-diff has shipped since v0.3.0: the 5-voice council consults, the Fable 5 Oracle adjudicates, the Brier audit closes the loop. The pattern was 6 months early and is still the only OSS implementation that ships the calibration layer underneath. Pairs with the official Skills standard cleanly. Drop `council-diff` into any `.claude/skills/` directory and it auto-loads.

## Pattern source

- [Karpathy, Sequoia AI Ascent, April 20, 2026](https://www.youtube.com/results?search_query=karpathy+sequoia+ai+ascent+software+3.0). Software 3.0 framing + agentic engineering job description.
- [Perplexity Model Council UI](https://www.perplexity.ai/hub/blog/perplexity-model-council)
- [Orallexa multi-agent debate](https://github.com/alex-jb/orallexa-ai-trading-agent)
- Cohere Command A+ grounding citation pattern (sources cited inline as `[src:...]`)

## Roadmap

- [x] Brier audit math (v0.2)
- [x] Fable 5 Oracle adjudication (v0.3)
- [x] Data retention disclosure + safeMode (v0.3.1)
- [x] Karpathy Software 3.0 positioning (v0.4)
- [ ] Public Brier leaderboard at council.alex-jb.com
- [ ] Streaming voice-by-voice output for UI
- [ ] Python port (`pip install council-diff`)
- [ ] CLI: `council "should I quit my job" --domain career`

## License

MIT
