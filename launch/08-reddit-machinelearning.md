# r/MachineLearning

**Title**:
[P] council-diff — single-call multi-voice deliberation with Brier audit roadmap

**Body**:

OSS'd a small TypeScript library: github.com/alex-jb/council-diff

What it does: takes a decision (text), returns 5 specialist verdicts in parallel via a single LLM call structured to produce 5 personas inside one JSON response. Computes `agreement_score = 1 - normalized_stddev(scores)` as a meta-signal of how united the voices are.

Why I think it's interesting (besides being practical for solo founders):

1. **Single call vs parallel calls**: counter-intuitive finding from building this — asking for 5 voices in 1 prompt produces better disagreement than 5 parallel prompts. The voices "see" each other inside the model's context and push back. With 5 parallel calls each persona gets generic, and they tend to converge to the same advice.

2. **Forcing structure prevents persona collapse**: requiring each voice to output (score, verdict, strength, gap) separately stops the common "all 5 voices repeat the median answer" failure mode. The `strength` and `gap` fields force differentiation.

3. **Agreement_score as the actual product**: 5 opinions are not the value. The value is knowing whether they agree. A 90% confident single LLM answer and 5 specialists who disagree 60% give very different signals.

Roadmap that I think is the more interesting research angle:

- **Brier audit at resolution**: track which recommendations actually pan out over time. Public leaderboard. Same pattern I use in [Orallexa](https://github.com/alex-jb/orallexa-ai-trading-agent) for forecast calibration.
- **Comparing agreement_score vs single-call confidence**: hypothesis is that agreement_score has lower calibration error than single-LLM verbalized confidence. Want to set up the eval.

Currently Sonnet 4.6, ~$0.03/deliberation. MIT, bilingual README (EN + 中文).

Would love feedback on:
- Has anyone seen literature on single-call multi-persona vs parallel-call setups for calibration?
- For the Brier audit eval, what's your ICPL for "decisions" that I can resolve at known timestamps? Public predictions are easy (sports / Polymarket), career/founder decisions are private and slow.

Live demo (no signup): https://www.vibexforge.com/council
