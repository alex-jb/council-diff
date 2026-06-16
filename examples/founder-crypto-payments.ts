#!/usr/bin/env tsx
/**
 * Example: founder council deliberating on adding crypto payments to a B2B SaaS.
 * Designed to complete the GO / WAIT / KILL verdict spectrum across the
 * council-diff example set (founder-annual-billing.ts = GO, investor.ts
 * + engineer-rust-rewrite.ts = WAIT × 2, this = KILL).
 *
 * Usage:
 *   ANTHROPIC_API_KEY=$(cat ~/.config/anthropic_key) tsx examples/founder-crypto-payments.ts
 */
import { CouncilDiff } from "../src/index.js";

const council = new CouncilDiff();

const result = await council.deliberate({
  domain: "founder",
  decision: "Should we add cryptocurrency payments (BTC + USDC) to our B2B SaaS given zero customer demand but a board member is pushing for it?",
  context: `Series A B2B developer-tools SaaS, $42K MRR, 1,200 paying customers.
98% of customers are US-based at small/mid companies; 0 inbound asks for crypto payment in last 18 months across support, sales, and dev community.
Board member who joined last quarter (formerly at a crypto exchange) is pushing this as "future-proofing" at every board meeting.
Cost: Stripe Crypto + Circle USDC integration ~$45K (eng time + audit + legal), 8-10 eng-weeks total.
Compliance burden: BSA/AML reporting, OFAC sanctions screening, state-by-state money transmitter analysis (FinCEN gray area for B2B SaaS).
Runway: 9 months at current burn. Hiring freeze in effect.
Last product survey: top 3 requests were API rate-limit increase, SOC 2 Type II, and a Postman collection. Crypto not mentioned.
The board member has a 4% equity stake.`,
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
