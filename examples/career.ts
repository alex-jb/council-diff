#!/usr/bin/env tsx
/**
 * Example: career council deliberating on accepting a job offer.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... tsx examples/career.ts
 */
import { CouncilDiff } from "../src/index.js";
import { addPrediction } from "../src/brier.js";

const council = new CouncilDiff();

const result = await council.deliberate({
  domain: "career",
  decision: "Accept the OneTouch Direct PM Intern offer ($22/hr, 12wk, in-person Tampa)",
  context: `Solo M.S. CS candidate at Yeshiva University (4.0 GPA, AI specialization),
graduating June 2026. Current pipeline:
- Jane Street ML Researcher: applied, no response yet
- 8 NYC quant + AI startup apps about to submit (Two Sigma, DRW, HRT, Jump, Citadel Securities, Anthropic, Perplexity, HF NYC)
- Rulebase reach-out warm, hasn't replied to follow-up
- CECP closed, 10a Labs rejected
- Skills Marketplace PR #1275 with Anthropic in review

OneTouch Direct is a BPO call center, role is admin/PM not technical.
Tampa not NYC. Hourly + temp + non-AI.

OpenAI Skills PR could land mid-summer. Jane Street + tier-1 quants take 4-8 weeks
to respond. Personal runway: 12 months. Living in NYC, lease through August.`,
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

const pred = addPrediction({
  decision: result.decision,
  domain: result.domain,
  recommendation: result.recommendation,
  agreement_score: result.agreement_score,
  voice_scores: result.voices.map((v) => v.score),
  resolve_by: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  notes: "Resolves at 90d: did the higher-leverage pipeline land OR did declining OTD waste runway?",
});

console.log(`\n💾 Brier-audit prediction logged: ${pred.id}`);
console.log(`   resolve_by: ${pred.resolve_by}\n`);
