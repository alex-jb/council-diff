# dev.to article

**Title**:
Why I built a 5-voice AI council instead of asking Claude one question

**Cover image**: scribble of 5 stick figures arguing over a paper

**Tags**: ai, claude, typescript, opensource, agents

---

## The problem with single-LLM verdicts

You ask Claude "should I raise a seed round?" and get a confident, well-structured 200-word answer. The answer feels right. You ship the decision.

The problem: you have no way to tell if the model was actually confident or just confidently-wrong.

Anthropic's own research on calibration says confidence scores out of single LLMs are not well-calibrated against ground truth. The 90% answer and the 60% answer often have the same actual hit rate.

So I built [council-diff](https://github.com/alex-jb/council-diff): a TypeScript library that gets 5 specialist verdicts on any decision in a single LLM call, then computes how much they agree.

## The pattern

For founder domain:

- **YC Partner** — pattern matches 4000+ portcos
- **VC Skeptic** — looks for moat + capital efficiency
- **Startup Lawyer** — equity / IP / liability lens
- **Indie CFO** — burn rate + runway
- **Pragmatic Spouse** — lifestyle + family + mental health

Same input goes to all 5. Each returns:

```ts
interface CouncilVoice {
  voice: string;          // "yc_partner"
  voice_display: string;  // "YC Partner"
  score: number;          // 0-100 — how strongly they support
  verdict: string;        // 1-2 sentences
  strength: string;       // single strongest signal supporting
  gap: string;            // biggest risk / counter from their lens
}
```

Then the library computes:

```ts
agreement_score = 1 - (stddev_of_scores / 50)  // normalized to [0, 1]
```

Plus a recommendation:
- avg ≥ 65 → `go`
- avg 40-64 → `wait`
- avg ≤ 39 → `kill`
- voices differ by > 40 points → `split`

## Why one call instead of five

Counter-intuitive: asking for 5 voices in 1 prompt produces better disagreement than 5 parallel prompts.

When you do 5 parallel calls each persona is alone in its context window. They tend to converge to the median answer because none of them has anything to react against.

When you do 1 call with 5 voices, the voices "see" each other inside the model's context and push back. The lawyer cites a tax issue, the CFO responds. The result: real disagreement instead of polite agreement.

Bonus: 1 call instead of 5 = 1/5th the cost.

## The agreement_score is the actual product

The 5 verdicts are not the value. The value is knowing whether they agree.

Example — "Should I quit my job and go full-time on this side project?":

```
YC Partner:    75/100 — "do it, momentum decays"
Recruiter:     30/100 — "salary now > optionality later"
Mentor 20y:    50/100 — "fine, but document the runway"
CSO (your own):40/100 — "Q3 hiring is bad, wait 60 days"
Future You 5y: 65/100 — "regret minimization says do it"

agreement_score: 38%
recommendation: split
```

That `38%` is the entire signal. Single-LLM confidence would have been 60-70% on either side. The split tells you not to act on any single confident answer.

## What's next

The Brier audit at resolution is the real moat. Anyone can build a council. Few will get scored honestly.

The plan: log every recommendation, track ground truth where possible (sports / public-prediction / "did the founder raise within 12 months / did the engineer regret the stack pick in 18 months"), publish a public leaderboard.

That's the differentiation: not "AI council that gives advice" but "AI council that gets graded on whether it was right."

## Code

- GitHub: [github.com/alex-jb/council-diff](https://github.com/alex-jb/council-diff)
- Live (no signup): [vibexforge.com/council](https://www.vibexforge.com/council)
- MIT, TypeScript, bilingual README (EN + 中文)
- 1 Claude Sonnet 4.6 call per deliberation, ~$0.03

If you build with it, drop me a link — would love to see what custom voice rosters people invent.

## Credits

Pattern source: Perplexity's [Model Council UI](https://www.perplexity.ai/hub/blog/perplexity-model-council) + the 5-voice debate I use in [Orallexa](https://github.com/alex-jb/orallexa-ai-trading-agent) for trading research. Cohere Command A+ for the `[src:...]` grounding citation pattern.
