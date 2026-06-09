# LinkedIn — English

I open-sourced something I built for myself: **council-diff** — a 5-voice AI council for any decision.

Single-LLM verdicts hide their own uncertainty. A "90% confident yes" from one model and disagreement among five specialists carry very different signals. Council-diff exposes the disagreement.

You paste a decision, get 5 specialist verdicts in parallel:

🚀 Founder council: YC Partner / VC Skeptic / Lawyer / Indie CFO / Pragmatic Spouse
🛠 Engineer council: Rust core / SRE oncall / Recruiter / Junior dev / CTO 5y later
📈 Investor council: Macro / Sector / PM / Growth VC / Activist short
🎯 Career council: 20y Mentor / Recruiter / Peer / CSO / Future you
📱 Product council: Real user / Competitor / Internal dev / Garry-style / Naval-style
📊 Quant council: Jane Street / Citadel / Two Sigma / Anthropic / HFT

Plus `custom` for fully user-defined voice rosters.

Each voice scores 0-100, writes a verdict, names the strongest signal + biggest gap. Then a consensus paragraph + `agreement_score` (how much they agree) + recommendation (go / wait / kill / split).

One Claude Sonnet 4.6 call per deliberation, ~$0.03.

Pattern source: Perplexity's Model Council UI + the multi-agent debate I already use in my Orallexa trading research stack. The Brier audit at resolution is on the roadmap — track which recommendations pan out, publish the leaderboard.

Live at vibexforge.com/council
Code at github.com/alex-jb/council-diff
MIT, bilingual README (EN + 中文)

What decision should I run through the council first? (Drop one in the comments — I'll post the verdict.)
