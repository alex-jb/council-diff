# X thread (1/8)

I open-sourced council-diff — a 5-voice AI council for any decision.

Single-LLM verdicts hide their own uncertainty. Five specialists arguing expose it.

Live → vibexforge.com/council
Code → github.com/alex-jb/council-diff

🧵

---

# (2/8)

Paste a decision. Get 5 verdicts in parallel.

Each voice:
• score 0-100
• verdict (1-2 sentences)
• strongest signal supporting
• biggest risk / counter

Then consensus + agreement_score + recommendation (go/wait/kill/split).

---

# (3/8)

6 built-in domains, each with 5 specialist voices:

🚀 founder
🛠 engineer
📈 investor
🎯 career
📱 product
📊 quant

Plus `custom` for any roster you want.

---

# (4/8)

Example — "Should I raise $1M seed or stay bootstrapped?"

YC Partner: 80/100 — push raise
VC Skeptic: 50/100 — flag traction
Lawyer: 60/100 — watch SAFE terms
Indie CFO: 35/100 — bootstrap viable
Spouse: 40/100 — 60h/week is the signal

Agreement_score: 42% → SPLIT.

---

# (5/8)

The pattern came from 2 places:

1. Perplexity's Model Council UI — they let users see model outputs side-by-side
2. My Orallexa trading stack — 5-voice debate where Bull/Bear/Judge/Critic/Auditor must agree before a trade ships

Both validate the same insight: disagreement is signal.

---

# (6/8)

Roadmap:

✅ 6 domains shipped
✅ Custom voices
🟡 Brier audit at resolution — track which recommendations actually pan out
🟡 Public leaderboard
🟡 Python port + CLI

Brier audit is the moat. Anyone can build a council. Few will get scored honestly.

---

# (7/8)

Tech:
• TypeScript
• 1 Sonnet 4.6 call per deliberation, ~$0.03
• MIT license
• Bilingual README (EN + 中文)

`npm install council-diff` (publishing this week)

---

# (8/8)

What decision should I run through the council first?

Drop one below — I'll post the 5-voice verdict.

Repo: github.com/alex-jb/council-diff
Live: vibexforge.com/council
