# council-diff

> [English](README.md) · [中文](README.zh-CN.md)

**5-voice AI council for any decision.** Paste a question, get 5 specialist perspectives in parallel, see where they agree and disagree. Brier-audited at resolution.

> **v0.3.1 (2026-06-11) — Privacy disclosure** Oracle responses now include `data_retention: "30day-mythos" | "zero"`. Pass `safeMode: true` to silently downgrade any Mythos-class request to Sonnet 4.6 (zero retention). Apps with privacy claims (mental-health, on-device-only marketing, GDPR-sensitive PII) **should** opt in.
>
> **v0.3.0 (2026-06-10): Fable 5 Oracle mode** — pass `oracle: "fable-5"` and after the 5 voices deliberate, [Claude Fable 5](https://www.anthropic.com/news/claude-fable-5) (Mythos-class flagship, 95% SWE-Bench, 1M context) reads every verdict and issues a single adjudication, with authority to override the council. Council finds the disagreement. Oracle picks the side that holds up. Brier-audited separately at resolution so we can see when Oracle beats vs underperforms the council.

Built on the pattern from Perplexity's Model Council UI + the multi-agent debate stack used in [Orallexa](https://github.com/alex-jb/orallexa-ai-trading-agent) for trading research.

## Why

Single-LLM verdicts hide their own uncertainty. A 90% confident answer from one model and disagreement among five specialists carry very different signals. Council-diff exposes the disagreement.

For 5 built-in domains:

- **founder** — YC Partner / VC Skeptic / Lawyer / Indie CFO / Pragmatic Spouse
- **engineer** — Rust Maintainer / SRE Oncall / Recruiter / Junior Dev / CTO 5y Later
- **investor** — Macro / Sector / PM / Growth VC / Activist Short
- **career** — Mentor 20y / Recruiter / Peer Doing Well / CSO / Future You 5y
- **product** — Real User / Competitor / Internal Dev / Garry-style / Naval-style
- **quant** — Jane Street MD / Citadel / Two Sigma ML / Anthropic / HFT Engineer

Plus `custom` for fully user-defined voice rosters.

## Install

```bash
npm install council-diff
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
console.log(result.agreement_score); // 0-1 — how much voices agree
console.log(result.consensus);       // 1-paragraph synthesis

for (const v of result.voices) {
  console.log(`${v.voice_display} (${v.score}/100): ${v.verdict}`);
  console.log(`  + ${v.strength}`);
  console.log(`  - ${v.gap}`);
}
```

## Oracle mode (Fable 5)

For hard calls — split councils, high-cost decisions, or anywhere you want a flagship-tier second opinion — opt into Oracle:

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

Anthropic enforces a **30-day server-side data retention policy on Mythos-class models** (Claude Fable 5, Opus 4.7-Mythos) per [their support article](https://support.claude.com/en/articles/15425996-data-retention-practices-for-mythos-class-models). The 5-voice base council uses Sonnet 4.6 which is **zero-retention** under standard enterprise terms.

Every Oracle response in v0.3.1+ includes the actual posture:

```ts
result.oracle?.data_retention  // "30day-mythos" or "zero"
result.oracle?.downgraded      // true if safeMode forced the downgrade
```

If your application has any privacy claim that conflicts with 30-day retention — mental-health journaling, "on-device 零上传" marketing copy, GDPR-sensitive PII, sealed business decisions — pass `safeMode: true` and Oracle silently downgrades to Sonnet 4.6:

```ts
const council = new CouncilDiff({ safeMode: true });

const result = await council.deliberate({
  domain: "founder",
  decision: "...",
  oracle: "fable-5",  // requested
});

result.oracle?.model         // "claude-sonnet-4-6" — actually ran
result.oracle?.downgraded    // true
result.oracle?.data_retention // "zero"
```

**This disclosure is not optional.** Council-diff's positioning is calibration honesty — shipping a Mythos route without surfacing the retention boundary undermines that.

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
    { slug: "cost_eng", display: "Cost Engineer", role_brief: "Watches the bill. Bias: serverless costs 5× at scale." },
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
  agreement_score: number;      // 0-1 — 1 = unanimous, 0 = split
  recommendation: "go" | "wait" | "kill" | "split";
  computed_at: string;          // ISO timestamp
  oracle?: {                    // present only when oracle: "fable-5" was passed
    model: string;              // e.g. "claude-fable-5"
    recommendation: "go" | "wait" | "kill" | "split";
    score: number;              // 0-100
    verdict: string;            // 2-3 sentences
    override_reason?: string;   // set when Oracle disagrees with council consensus
  };
}
```

## Cost

- **Council only:** one Claude Sonnet 4.6 call per deliberation. ~$0.02-0.04 per call depending on context length.
- **Council + Oracle (`oracle: "fable-5"`):** add one Claude Fable 5 call. ~$0.05-0.08 extra. Total ~$0.07-0.12 per Oracle deliberation.

## Pattern source

- [Perplexity Model Council UI](https://www.perplexity.ai/hub/blog/perplexity-model-council)
- [Orallexa multi-agent debate](https://github.com/alex-jb/orallexa-ai-trading-agent)
- Cohere Command A+ grounding citation pattern (sources cited inline as `[src:...]`)

## Brier audit (new in v0.2)

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

See `src/brier.ts` for `predictedProbability` math + persistence-agnostic interface.

## Roadmap

- [x] Brier audit math (v0.2)
- [ ] Public Brier leaderboard at council.alex-jb.com
- [ ] Streaming voice-by-voice output for UI
- [ ] Python port (`pip install council-diff`)
- [ ] CLI: `council "should I quit my job" --domain career`

## License

MIT
