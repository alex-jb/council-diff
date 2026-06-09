# r/ClaudeAI

**Title**:
Open-sourced a 5-voice Claude council pattern — TypeScript, MIT

**Body**:

For anyone exploring multi-agent patterns with Claude — I just OSS'd council-diff, a library I built for my own decision making.

The idea: a single Claude call can give you a confident-sounding answer, but you can't tell if the model is actually confident or just confidently-wrong. So instead of one call, you do one call structured as 5 specialist voices that must each give a verdict, then you compute their agreement_score.

For "Should I raise a seed?":
- YC Partner: 80/100
- VC Skeptic: 50/100  
- Lawyer: 60/100
- Indie CFO: 35/100
- Pragmatic Spouse: 40/100

Agreement_score collapses to 42% → recommendation = SPLIT.

Implementation: 1 Sonnet 4.6 call with a structured prompt that asks for all 5 voices' JSON output in one go. ~$0.03 per deliberation.

Code: github.com/alex-jb/council-diff (TypeScript, MIT, bilingual README EN + 中文)
Live: vibexforge.com/council

The Sonnet prompt structure is in src/index.ts if you want to lift the pattern. Three things I learned wiring it:

1. Asking for 5 voices in one call is way cheaper than 5 parallel calls, AND the voices argue with each other inside the model's context (better disagreement).

2. Forcing each voice to name a `strength` and a `gap` separately stops the "all 5 say the same thing" failure mode.

3. The `agreement_score` (1 - normalized stddev of scores) is the actual product. Without it the verdicts are just 5 opinions; with it you have a meta-signal.

Built on top of pattern from Perplexity Model Council UI + my Orallexa trading research stack (5-voice debate for trade decisions).

Roadmap: Brier audit at resolution — track which recommendations pan out, publish leaderboard. That's the real moat: anyone can build a council, few will get scored honestly.

Curious how others are doing multi-voice patterns with Claude. Are you doing N parallel calls or single structured prompt?
