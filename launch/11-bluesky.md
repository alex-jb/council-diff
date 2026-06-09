# Bluesky

**Post 1**:

Open-sourced council-diff — a 5-voice AI council for any decision.

The pitch: single-LLM verdicts hide their own uncertainty. 5 specialists arguing expose it.

Live: vibexforge.com/council
Code: github.com/alex-jb/council-diff (MIT, TypeScript, bilingual)

🧵👇

---

**Post 2**:

6 domains × 5 voices:

🚀 founder
🛠 engineer
📈 investor
🎯 career
📱 product
📊 quant

Each voice scores 0-100, writes verdict + strength + gap. Then agreement_score collapses to recommendation: go / wait / kill / split.

---

**Post 3**:

Counter-intuitive: asking for 5 voices in 1 LLM call produces better disagreement than 5 parallel calls.

The voices see each other inside the model's context and push back. 5 parallel calls converge to median advice.

1 call also = 1/5th the cost. ~$0.03 per deliberation.

---

**Post 4**:

Brier audit at resolution is the moat. Anyone can build a council. Few will get scored honestly.

Plan: log every recommendation → ground truth where possible → public leaderboard.

That's the differentiation: not "AI council that advises" but "AI council that gets graded."
