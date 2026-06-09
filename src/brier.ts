/**
 * brier.ts — Brier audit for council-diff verdicts.
 *
 * Persistence-agnostic. Functions take prediction records as input.
 * Bring your own storage (JSONL file, SQLite, Postgres) — the audit
 * math + resolution logic live here.
 *
 * Usage:
 *   import { brierScore, classifyOutcome, addPrediction, resolvePrediction } from "council-diff/brier";
 *
 *   const pred = addPrediction({
 *     decision: "Should I raise $1M seed?",
 *     recommendation: "go",
 *     agreement_score: 0.62,
 *     voice_scores: [80, 50, 60, 35, 40],
 *     resolve_by: "2027-06-09",
 *   });
 *
 *   // 12mo later when outcome is known:
 *   const resolved = resolvePrediction(pred.id, {
 *     outcome: "go-was-right",   // user raised + closed within 6mo
 *     resolved_at: "2027-03-15",
 *   });
 *
 *   const score = brierScore(resolved);
 *   // 0 = perfect, 1 = max wrong. council-diff's edge over random is 1 - score.
 */

export type Recommendation = "go" | "wait" | "kill" | "split";
export type Outcome =
  | "go-was-right"   // recommendation was go, decision panned out
  | "go-was-wrong"   // recommendation was go, decision failed
  | "wait-was-right" // recommendation was wait, waiting was correct
  | "wait-was-wrong" // recommendation was wait, should have moved
  | "kill-was-right" // recommendation was kill, decision would have failed
  | "kill-was-wrong" // recommendation was kill, decision would have worked
  | "split-was-right"// recommendation was split, mixed outcome confirmed
  | "split-was-wrong"// recommendation was split, was actually clear-cut
  | "unresolvable";  // ambiguous, exclude from Brier

export interface Prediction {
  id: string;
  decision: string;
  domain: string;
  recommendation: Recommendation;
  agreement_score: number;     // 0-1 — from CouncilResult
  voice_scores: number[];      // raw 0-100 scores from the 5 voices
  created_at: string;          // ISO timestamp
  resolve_by?: string;         // ISO date — when audit should fire
  outcome?: Outcome;           // filled at resolution time
  resolved_at?: string;        // ISO timestamp of resolution
  notes?: string;
}

export interface PredictionInput {
  decision: string;
  domain: string;
  recommendation: Recommendation;
  agreement_score: number;
  voice_scores: number[];
  resolve_by?: string;
  notes?: string;
}

export function addPrediction(input: PredictionInput): Prediction {
  return {
    id: cryptoId(),
    ...input,
    created_at: new Date().toISOString(),
  };
}

export function resolvePrediction(
  pred: Prediction,
  resolution: { outcome: Outcome; resolved_at?: string; notes?: string }
): Prediction {
  return {
    ...pred,
    outcome: resolution.outcome,
    resolved_at: resolution.resolved_at ?? new Date().toISOString(),
    notes: resolution.notes ?? pred.notes,
  };
}

/**
 * Convert a resolved prediction into the (predicted_p, actual_outcome) pair
 * used for Brier scoring.
 *
 * We map the recommendation to an implied probability:
 *   go     → 0.80 (council confidently says go)
 *   wait   → 0.50 (council deferred — close to coin-flip)
 *   kill   → 0.20 (council confidently says kill)
 *   split  → 0.50 (voices disagreed — also close to coin-flip)
 *
 * The agreement_score then nudges the probability toward the recommendation
 * for unanimous councils and away from it for split councils:
 *   p_final = 0.5 + (p_recommendation - 0.5) * agreement_score
 *
 * actual = 1 if "*-was-right", 0 if "*-was-wrong".
 */
export function predictedProbability(pred: Prediction): number {
  const base = {
    go: 0.8,
    wait: 0.5,
    kill: 0.2,
    split: 0.5,
  }[pred.recommendation];
  // nudge toward base for unanimous, toward 0.5 for split
  const p = 0.5 + (base - 0.5) * Math.max(0, Math.min(1, pred.agreement_score));
  return Math.max(0.01, Math.min(0.99, p));
}

export function actualOutcome(pred: Prediction): 0 | 1 | null {
  if (!pred.outcome) return null;
  if (pred.outcome === "unresolvable") return null;
  return pred.outcome.endsWith("-was-right") ? 1 : 0;
}

/**
 * Brier score for a single resolved prediction.
 * BS = (predicted_p - actual)^2
 * Range: 0 (perfect) to 1 (worst). 0.25 = random.
 */
export function brierScore(pred: Prediction): number | null {
  const actual = actualOutcome(pred);
  if (actual === null) return null;
  const p = predictedProbability(pred);
  return (p - actual) ** 2;
}

/**
 * Mean Brier score over a set of resolved predictions.
 * Edge over random = 0.25 - mean. Positive = council adds calibration value.
 */
export function meanBrier(preds: Prediction[]): { mean: number; n: number; edge_vs_random: number } | null {
  const scores = preds.map(brierScore).filter((s): s is number => s !== null);
  if (scores.length === 0) return null;
  const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
  return { mean, n: scores.length, edge_vs_random: 0.25 - mean };
}

/**
 * Per-domain Brier breakdown — surfaces where the council adds most value.
 */
export function brierByDomain(preds: Prediction[]): Record<string, ReturnType<typeof meanBrier>> {
  const out: Record<string, ReturnType<typeof meanBrier>> = {};
  const byDomain = preds.reduce(
    (acc, p) => {
      (acc[p.domain] ??= []).push(p);
      return acc;
    },
    {} as Record<string, Prediction[]>
  );
  for (const [domain, ps] of Object.entries(byDomain)) {
    out[domain] = meanBrier(ps);
  }
  return out;
}

/**
 * Predictions awaiting resolution. Filter by date if you only want
 * "should have been resolved by now" entries.
 */
export function pendingResolutions(preds: Prediction[], since?: string): Prediction[] {
  return preds.filter((p) => {
    if (p.outcome) return false;
    if (!p.resolve_by) return false;
    if (since && p.resolve_by > since) return false;
    return true;
  });
}

function cryptoId(): string {
  // Minimal id generation — 12-char alphanumeric. Not cryptographically secure
  // for high-volume systems but fine for indie use.
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) id += c[Math.floor(Math.random() * c.length)];
  return id;
}
