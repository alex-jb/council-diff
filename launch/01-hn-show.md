# HN Show: 5-voice AI council for any decision

**Title** (≤80 chars):
Show HN: Council Diff – 5-voice AI council that disagrees with itself

**URL**:
https://github.com/alex-jb/council-diff

**Body**:

I kept burning time on decisions where one LLM said "yes, 90% confident" and I had no way to tell if the model was actually confident or just confidently-wrong. So I built council-diff.

You paste a decision and 5 specialist voices deliberate in parallel. For a fundraising question:

- YC Partner: 80/100 — "Bootstrapped traction matches the YC Demo Day median; raise to compress the timeline"
- VC Skeptic: 50/100 — "$5K MRR is below most Tier-1 thresholds; bridge round risk if growth slows"
- Lawyer: 60/100 — "Standard SAFE post-money cap is fine here, watch participation rights"
- Indie CFO: 35/100 — "12mo runway + 20% MoM = bootstrap viable; raise dilutes optionality"
- Pragmatic Spouse: 40/100 — "60h/week is the actual signal; raising adds investor management on top"

You see where they agree (consensus) and where they split (agreement_score). The recommendation field collapses to `go / wait / kill / split`.

6 built-in domains: founder / engineer / investor / career / product / quant. Plus `custom` for fully user-defined voice rosters.

One Claude Sonnet 4.6 call per deliberation, ~$0.03. Bilingual README (EN + 中文).

The pattern came from two places: (1) Perplexity's Model Council UI feature, where they let users see multiple model outputs side-by-side, and (2) the 5-voice debate stack I already use in [Orallexa](https://github.com/alex-jb/orallexa-ai-trading-agent) for trading research. The insight: a single LLM verdict hides its own uncertainty, but five specialists arguing exposes it.

Live demo at https://www.vibexforge.com/council if you want to try without installing.

Brier audit at resolution is on the roadmap — track which recommendations actually pan out over 6mo, publish leaderboard. That's the real differentiation: not just councils, but councils that get scored honestly.

Feedback wanted on: voice roster design (are the 5 voices for each domain actually well-differentiated?), and whether custom_voices is flexible enough for non-decision domains.

MIT, TypeScript, npm package coming after a stability week.
