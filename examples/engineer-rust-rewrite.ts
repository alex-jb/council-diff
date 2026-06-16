#!/usr/bin/env tsx
/**
 * Example: engineer council deliberating on a Rust rewrite of a hot-path service.
 * Designed as a SPLIT-verdict third case study completing the GO/WAIT/SPLIT
 * trifecta (paired with founder-annual-billing.ts GO + investor.ts WAIT).
 *
 * Usage:
 *   ANTHROPIC_API_KEY=$(cat ~/.config/anthropic_key) tsx examples/engineer-rust-rewrite.ts
 */
import { CouncilDiff } from "../src/index.js";

const council = new CouncilDiff();

const result = await council.deliberate({
  domain: "engineer",
  decision: "Should we rewrite our Python inference router from FastAPI to Rust (axum) given P99 latency is 380ms on hot paths and CPU cost is $9K/month?",
  context: `Mid-stage Series B AI infra startup, 18 eng team.
The inference router is the single hot path — handles ~12M req/day, ~140 req/sec peak.
Current Python FastAPI service: P99 380ms, P50 90ms, CPU-bound at peak (8 c5.4xlarge in prod, $9K/month).
2 eng on the team have shipped production Rust before. 16 have shipped production Python.
Estimated rewrite: 6-8 eng-weeks. No customer outage budget — must dual-run for 2 weeks at ~$2K extra cost.
Roadmap: 2 known feature blocks in next 2 quarters (batch inference + tenant isolation) that would need to ship into either stack.
Alternative: profile and optimize the Python path — likely 30-40% latency improvement, 1-2 eng-weeks.
Internal Slack thread on this has 47 messages, no convergence.`,
});

console.log(`\n📊 RECOMMENDATION: ${result.recommendation.toUpperCase()}`);
console.log(`Agreement: ${(result.agreement_score * 100).toFixed(0)}%\n`);
console.log(`Consensus:\n${result.consensus}\n`);
console.log("━".repeat(60));
for (const v of result.voices) {
  console.log(`\n${v.voice_display} — ${v.score}/100`);
  console.log(`  verdict: ${v.verdict}`);
  console.log(`  + ${v.strength}`);
  console.log(`  - ${v.gap}`);
}
console.log("\n" + "━".repeat(60));
console.log(JSON.stringify(result, null, 2));
