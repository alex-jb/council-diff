#!/usr/bin/env tsx
/**
 * Example: founder council deliberating on whether to add annual billing.
 * Designed as a GO-verdict counterpoint to the GOOGL Q3 2026 WAIT case study.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=$(cat ~/.config/anthropic_key) tsx examples/founder-annual-billing.ts
 */
import { CouncilDiff } from "../src/index.js";

const council = new CouncilDiff();

const result = await council.deliberate({
  domain: "founder",
  decision: "Should we add an annual billing option at '2 months free' (paying $290/yr for our $29/mo SaaS) given 40% of churn comes from credit card declines on month-over-month renewal?",
  context: `B2B developer tool, $14K MRR, 480 paying users.
Net churn: 8% monthly. Of churned users, 40% are involuntary (failed card auth on renewal).
Stripe data: 18% of users opt in to annual when offered on competitor tools (Linear, Notion).
Cost to ship: 2 days engineering (Stripe billing portal already wired).
Risk: cash from new annual revenue is non-recurring for 12 months — a 5x bump in March one-time then nothing.
Customer support reports 6 inbound asks for annual billing in the last 30 days.
Runway today: 11 months at current burn.`,
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
