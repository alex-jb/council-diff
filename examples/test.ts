#!/usr/bin/env tsx
/**
 * test.ts — minimal smoke test of the Brier audit math.
 *
 * Runs without an Anthropic API key — uses synthetic Prediction records
 * to verify the math behaves as expected. For integration tests with
 * actual Claude calls, see examples/quant.ts and examples/career.ts.
 *
 * Usage:
 *   npx tsx examples/test.ts
 *
 * Exit code 0 on all-pass, 1 on any fail.
 */
import {
  addPrediction,
  brierByDomain,
  brierScore,
  meanBrier,
  predictedProbability,
  resolvePrediction,
  type Prediction,
} from "../src/brier.js";

let pass = 0;
let fail = 0;

function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    console.log(`  ✓ ${name}`);
    pass++;
  } else {
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
    fail++;
  }
}

function near(a: number, b: number, eps = 0.005): boolean {
  return Math.abs(a - b) < eps;
}

console.log("\nBrier audit math smoke tests");
console.log("============================");

// --- addPrediction
const p1 = addPrediction({
  decision: "test1",
  domain: "founder",
  recommendation: "go",
  agreement_score: 1.0,
  voice_scores: [80, 75, 70, 65, 60],
});
check("addPrediction returns id+created_at", !!p1.id && p1.id.length === 12 && p1.created_at.startsWith("20"));
check("addPrediction outcome is null", p1.outcome === undefined);

// --- predictedProbability go + high agreement
const pGo = addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 1.0, voice_scores: [] });
check("predictedProbability(go, agreement=1.0) ≈ 0.8", near(predictedProbability(pGo), 0.8));

const pSplit = addPrediction({ decision: "x", domain: "founder", recommendation: "split", agreement_score: 0.9, voice_scores: [] });
check("predictedProbability(split, agreement=0.9) ≈ 0.5", near(predictedProbability(pSplit), 0.5));

const pKill = addPrediction({ decision: "x", domain: "founder", recommendation: "kill", agreement_score: 1.0, voice_scores: [] });
check("predictedProbability(kill, agreement=1.0) ≈ 0.2", near(predictedProbability(pKill), 0.2));

const pGoLowAgreement = addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 0.0, voice_scores: [] });
check("predictedProbability(go, agreement=0) → 0.5 (coin flip)", near(predictedProbability(pGoLowAgreement), 0.5));

// --- brierScore perfect
const r1 = resolvePrediction(addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 1.0, voice_scores: [] }), { outcome: "go-was-right" });
check("brierScore(p=0.8, actual=1) ≈ 0.04", near(brierScore(r1) ?? -1, 0.04));

const r2 = resolvePrediction(addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 1.0, voice_scores: [] }), { outcome: "go-was-wrong" });
check("brierScore(p=0.8, actual=0) ≈ 0.64", near(brierScore(r2) ?? -1, 0.64));

// --- brierScore None
check("brierScore(unresolved) = null", brierScore(p1) === null);

const rU = resolvePrediction(addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 1.0, voice_scores: [] }), { outcome: "unresolvable" });
check("brierScore(unresolvable) = null", brierScore(rU) === null);

// --- meanBrier
const trio: Prediction[] = [
  resolvePrediction(addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 1.0, voice_scores: [] }), { outcome: "go-was-right" }),
  resolvePrediction(addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 1.0, voice_scores: [] }), { outcome: "go-was-right" }),
  resolvePrediction(addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 1.0, voice_scores: [] }), { outcome: "go-was-right" }),
];
const audit = meanBrier(trio);
check("meanBrier(3 correct go) mean ≈ 0.04", audit !== null && near(audit.mean, 0.04));
check("meanBrier edge_vs_random > 0.2", audit !== null && audit.edge_vs_random > 0.2);

// --- brierByDomain
const mixed = [
  resolvePrediction(addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 1.0, voice_scores: [] }), { outcome: "go-was-right" }),
  resolvePrediction(addPrediction({ decision: "x", domain: "founder", recommendation: "go", agreement_score: 1.0, voice_scores: [] }), { outcome: "go-was-wrong" }),
  resolvePrediction(addPrediction({ decision: "x", domain: "quant",   recommendation: "kill", agreement_score: 1.0, voice_scores: [] }), { outcome: "kill-was-right" }),
];
const byDomain = brierByDomain(mixed);
check("brierByDomain founder n=2", byDomain.founder !== null && byDomain.founder?.n === 2);
check("brierByDomain quant n=1",   byDomain.quant !== null && byDomain.quant?.n === 1);

console.log("\n============================");
console.log(`Result: ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
