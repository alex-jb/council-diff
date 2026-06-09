#!/usr/bin/env tsx
/**
 * Example: quant council deliberating on a real trading decision.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... tsx examples/quant.ts
 */
import { CouncilDiff } from "../src/index.js";
import { addPrediction } from "../src/brier.js";

const council = new CouncilDiff();

const result = await council.deliberate({
  domain: "quant",
  decision: "Buy AVGO at $386 based on Druckenmiller Q1 2026 13F overweight position",
  context: `Druckenmiller Q1 2026 13F shows AVGO at ~6.5% of portfolio (new position).
Current price $386. 52-week range $122-$430. Forward P/E 28×.
Thesis: AI inference bottleneck shifts from GPU compute to memory/IO/networking.
AVGO captures both: custom AI ASICs (TPU successor, Meta MTIA) + 1.6T Tomahawk switches.
Risk: hyperscaler capex cycle peaked Q4 2025. Q2 earnings early July.
My own paper portfolio system signaled WAIT on AVGO (RSI 68 + BB% 0.84 = extension).
13F + technical disagree.`,
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

// Log for Brier audit at 30d (Q2 earnings landing)
const pred = addPrediction({
  decision: result.decision,
  domain: result.domain,
  recommendation: result.recommendation,
  agreement_score: result.agreement_score,
  voice_scores: result.voices.map((v) => v.score),
  resolve_by: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  notes: "Resolves on AVGO close vs $386 + Q2 earnings reaction",
});

console.log(`\n💾 Prediction logged for Brier audit:`);
console.log(`   id: ${pred.id}`);
console.log(`   resolve_by: ${pred.resolve_by}`);
console.log(`\nPersist this to your JSONL / SQLite / Postgres of choice.`);
