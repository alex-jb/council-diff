#!/usr/bin/env tsx
/**
 * Example: Oracle mode — 5 voices + Fable 5 adjudication.
 *
 * The council deliberates first (Sonnet 4.6, 5 specialist voices).
 * Then Fable 5 reads all 5 verdicts and issues a single override-capable ruling.
 *
 * Use when the call is hard, the council looks split, or the cost of being
 * wrong is high enough to justify ~$0.08 per Mythos-class adjudication.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... tsx examples/oracle.ts
 */
import { CouncilDiff } from "../src/index.js";

const council = new CouncilDiff();

const result = await council.deliberate({
  domain: "founder",
  decision: "Ship Solo Founder OS hosted SaaS at $29/mo or stay OSS-only.",
  context: `Current state: 11-agent open-source stack, ~50 GitHub stars,
0 hosted-SaaS infra. Indie devs are the ICP. Hosted version would need
auth + billing + per-tenant agent isolation. Estimated 4 weeks engineering.
Alex is solo, has 3 paying customers begging for managed version,
but his thesis is "OSS distribution, no SaaS lock-in".`,
  oracle: "fable-5",
});

console.log(`\n📊 COUNCIL RECOMMENDATION: ${result.recommendation.toUpperCase()}`);
console.log(`Agreement: ${(result.agreement_score * 100).toFixed(0)}%\n`);
console.log(`Consensus:\n${result.consensus}\n`);
console.log("━".repeat(60));
for (const v of result.voices) {
  console.log(`\n${v.voice_display} — ${v.score}/100`);
  console.log(`  ${v.verdict}`);
}

if (result.oracle) {
  console.log("\n" + "═".repeat(60));
  console.log(`🔮 ORACLE (${result.oracle.model})`);
  console.log("═".repeat(60));
  console.log(`\nRecommendation: ${result.oracle.recommendation.toUpperCase()} (${result.oracle.score}/100)`);
  console.log(`\n${result.oracle.verdict}`);
  if (result.oracle.override_reason) {
    console.log(`\n⚠️  OVERRIDE: ${result.oracle.override_reason}`);
  }
}
