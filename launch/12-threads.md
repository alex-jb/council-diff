# Threads (Meta)

**Post 1**:

Open-sourced something I built for my own decisions: council-diff.

5-voice AI council. Single LLM verdicts hide their own uncertainty — 5 specialists arguing expose it.

Live: vibexforge.com/council
Code: github.com/alex-jb/council-diff

---

**Post 2**:

Paste any decision, get 5 specialist verdicts in parallel:

6 domains — founder / engineer / investor / career / product / quant

Each voice scores 0-100, writes verdict, names strongest signal + biggest gap.

Then consensus + agreement_score + go/wait/kill/split recommendation.

---

**Post 3**:

Example — "Should I raise $1M seed?"

YC Partner: 80, push the raise
VC Skeptic: 50, traction is borderline
Lawyer: 60, SAFE terms matter
Indie CFO: 35, bootstrap is viable
Spouse: 40, the 60h/week is the signal

Agreement: 42% → SPLIT.

That number is the entire product.

---

**Post 4**:

Built with 1 Claude Sonnet 4.6 call per deliberation (~$0.03).

MIT license. TypeScript. Bilingual README (EN + 中文).

Brier audit at resolution is on the roadmap — track which recommendations actually pan out, publish leaderboard.

That's the moat: not council that advises, council that gets graded.
