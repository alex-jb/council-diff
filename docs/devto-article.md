# I open-sourced 2 Brier-audited tools in 48 hours. Here's the actual pattern

**Tags**: ai, claude, opensource, typescript

---

In the last 48 hours I shipped two open-source projects that share one architectural insight: **the only thing that makes AI predictions credible is being graded on whether they were right.** Not how confident the model sounded. Not how detailed the reasoning was. The Brier score, taken seriously.

Here's the pattern, the math, and what I learned.

## The two projects

### 1. [`council-diff`](https://github.com/alex-jb/council-diff)

A 5-voice AI council for any decision. You paste a question, and a single Claude Sonnet 4.6 call produces 5 specialist verdicts in parallel. For a fundraising question:

- YC Partner: 80/100 — "push the raise"
- VC Skeptic: 50/100 — "flag the traction"
- Lawyer: 60/100 — "watch SAFE terms"
- Indie CFO: 35/100 — "bootstrap is viable"
- Pragmatic Spouse: 40/100 — "60h/week is the signal"

Agreement_score: 42% → recommendation: `split`.

The agreement_score is the actual product. 5 opinions are noise. Knowing they disagree 60% is signal.

### 2. [`memory-wall-tracker`](https://github.com/alex-jb/memory-wall-tracker)

A daily Claude-managed research feed on Stan Druckenmiller's Q1 2026 13F AI inference memory basket — AVGO/INTC/ARM/MU/STX/WDC. The thesis: the AI bottleneck shifts from GPU compute to memory bandwidth, IO, and networking.

Daily brief at 14:00 ET. ~$0.03/day. Every prediction timestamped, Brier-scored at resolution.

## The shared insight: Brier audit is the moat

Anyone can build a council. Anyone can publish a stock research feed. The number that matters is the Brier score.

```
Brier = (predicted_probability - actual_outcome)²
```

Range: 0 (perfect) to 1 (worst). 0.25 = random guess. If your mean Brier across many resolved predictions is below 0.25, you have calibration edge. Above 0.25, you're worse than a coin flip.

Most LLM-powered "research" tools never publish this number. They cherry-pick winning predictions in marketing posts and quietly forget the losers. Brier audit makes the cherry-picking visible.

## How council-diff converts a verdict to a probability

The trick is mapping recommendations to implied probabilities, then nudging by agreement:

```typescript
const base = {
  go:    0.80,  // council confidently says go
  wait:  0.50,  // close to coin-flip
  kill:  0.20,  // council confidently says kill
  split: 0.50,  // voices disagreed — also coin-flip
}[recommendation];

// High agreement nudges toward base, low agreement pulls back to 0.5
const p_final = 0.5 + (base - 0.5) * agreement_score;
```

A unanimous "go" (agreement 0.95) → p = 0.785.
A split "go" (agreement 0.3) → p = 0.59.
Both produce the same recommendation. The agreement_score is what makes the calibration honest.

At resolution time:

```typescript
const brier = (p_final - actual) ** 2;
// edge_vs_random = 0.25 - mean(brier)
```

## Counter-intuitive thing I learned

Asking for 5 voices in 1 LLM call produces **better** disagreement than 5 parallel calls.

The voices "see" each other in the model's context window and push back. When the lawyer cites a tax issue, the CFO responds with a different lens. When you do 5 parallel calls, each persona is alone and tends to converge to the median answer.

Bonus: 1 call instead of 5 = 1/5 the cost.

## Memory wall tracker uses the same skeleton

```python
# scripts/daily_brief.py (simplified)
snapshots = [fetch_price_snapshot(t) for t in TICKERS]
prompt = build_brief_prompt(snapshots)  # 6 ticker context

msg = claude.messages.create(
    model="claude-sonnet-4-6",
    system="...write structured brief with predictions log...",
    user=json.dumps(snapshots),
)

# Auto-commit + push to GitHub
```

Brief structure forces predictions with timestamps and resolution dates. Tomorrow's brief carries over yesterday's open predictions. After 30/90/180 days, each prediction gets a Brier score.

## What I'm not yet doing (the honest part)

I haven't shipped the resolver yet. The Brier math is in `council-diff/src/brier.ts`. The data persistence is up to you (JSONL, SQLite, Postgres). The actual public leaderboard at council.alex-jb.com is roadmap.

This is the same honest-failure-mode I'm building toward in another project — [Orallexa](https://github.com/alex-jb/orallexa-ai-trading-agent), my 9-model trading research stack. I just caught my own +60.9% win-rate backtest as a **false positive** — in-sample evaluation with a hidden flag. Production paper P&L: -16% / 17.5% win rate. The willingness to publish negative results is the point.

## TL;DR

Build small. Publish predictions with timestamps. Resolve them. Compute the Brier score. Show it.

The differentiation isn't "AI tool that gives advice." It's "AI tool that gets graded on whether the advice was right."

---

## Links

- [council-diff](https://github.com/alex-jb/council-diff) — 5-voice council with Brier audit (TypeScript, MIT, bilingual README EN+中文)
- [memory-wall-tracker](https://github.com/alex-jb/memory-wall-tracker) — daily Brier-audited research feed
- Live council demo: [vibexforge.com/council](https://www.vibexforge.com/council)
- Memory Wall site: [vibexforge.com/memory-wall](https://www.vibexforge.com/memory-wall)

Decisions to drop in the comments: I'll run the council on whatever you send and report back when the Brier scores resolve.
