#!/usr/bin/env tsx
/**
 * Example: founder council deliberating on a fundraising decision.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... tsx examples/founder.ts
 */
import { CouncilDiff } from "../src/index.js";

const council = new CouncilDiff();

const result = await council.deliberate({
  domain: "founder",
  decision: "Should I raise a $1M seed round or stay bootstrapped?",
  context: `B2B SaaS for indie developers. $5K MRR, growing 20% MoM for 4 months.
Solo founder, currently coding 60h/week. 12 months personal runway.
Two YC partners have soft-circled $250K each.
Competitor just raised $8M Series A two weeks ago.`,
});

console.log(`\n📊 RECOMMENDATION: ${result.recommendation.toUpperCase()}`);
console.log(`Agreement: ${(result.agreement_score * 100).toFixed(0)}%\n`);
console.log(`Consensus:\n${result.consensus}\n`);
console.log("━".repeat(60));
for (const v of result.voices) {
  console.log(`\n${v.voice_display} — ${v.score}/100`);
  console.log(`  ${v.verdict}`);
  console.log(`  + ${v.strength}`);
  console.log(`  - ${v.gap}`);
}
