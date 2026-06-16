#!/usr/bin/env tsx
/**
 * Example: investor council deliberating on a real Q1 2026 13F divergence.
 *
 * Druckenmiller exited GOOGL entirely. Berkshire opened a new ~$10B GOOGL
 * position. Two of the loudest smart-money signals went opposite directions
 * on the same name. A single-LLM verdict would pick one side; the investor
 * council exposes the disagreement directly.
 *
 * Live writeup (with per-voice breakdown):
 *   docs/case-studies/googl-q3-2026.md
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... tsx examples/investor.ts
 */
import { CouncilDiff } from "../src/index.js";

const council = new CouncilDiff();

const result = await council.deliberate({
  domain: "investor",
  decision: "Go long GOOGL into Q3 2026?",
  context: [
    "Druckenmiller Q1 2026 13F (filed May 15): sold ALL GOOGL position, exited the name entirely.",
    "Berkshire Hathaway Q1 2026 13F: took ~$10B GOOGL position (new buy). Ben Thompson framed this on Stratechery 2026-06-02 as 'The Google Capital Company' thesis — Berkshire is paying for the AI compute moat.",
    "Bull case: TPU vs Nvidia competition real, Gemini gaining enterprise share, Search ad revenue still growing 10%+ YoY, Waymo public ride volume up 4x YoY.",
    "Bear case: Perplexity + ChatGPT search erode Google Search query share at the margin; antitrust remedies still unresolved (Chrome divestiture risk); AI capex (~$75B 2026) burns FCF for 2-3 years before payoff.",
    "Current valuation: ~$190/share, 22x forward P/E, FCF yield ~3.5%. 5-year revenue CAGR 12%.",
    "Macro: 10y at 4.4%, Fed paused, NVDA already +60% YTD — rotation candidates getting bid.",
  ].join(" "),
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
