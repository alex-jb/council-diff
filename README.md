# council-diff

> [English](README.md) · [中文](README.zh-CN.md)

**5-voice AI council for any decision.** Paste a question, get 5 specialist perspectives in parallel, see where they agree and disagree. Brier-audited at resolution.

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
}
```

## Cost

One Claude Sonnet 4.6 call per deliberation. ~$0.02-0.04 per call depending on context length.

## Pattern source

- [Perplexity Model Council UI](https://www.perplexity.ai/hub/blog/perplexity-model-council)
- [Orallexa multi-agent debate](https://github.com/alex-jb/orallexa-ai-trading-agent)
- Cohere Command A+ grounding citation pattern (sources cited inline as `[src:...]`)

## Roadmap

- [ ] Brier audit at resolution — track recommendation accuracy over time, publish public leaderboard
- [ ] Streaming voice-by-voice output for UI
- [ ] Python port (`pip install council-diff`)
- [ ] CLI: `council "should I quit my job" --domain career`

## License

MIT
