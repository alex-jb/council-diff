# r/SideProject

**Title**:
I built a 5-voice AI council that disagrees with itself before you ship

**Body**:

A thing I kept hitting: I'd ask Claude "should I raise or bootstrap?" and get a confident 200-word answer. But I had no way to tell if the model was actually confident or just confidently-wrong.

So I built council-diff. You paste a decision and 5 specialist voices deliberate in parallel.

For a fundraising question:
- YC Partner: 80/100, push for the raise
- VC Skeptic: 50/100, flag the traction
- Lawyer: 60/100, watch the SAFE terms
- Indie CFO: 35/100, bootstrap is viable here
- Pragmatic Spouse: 40/100, the 60h/week is the real signal

Agreement_score (across the 5): 42% → recommendation = SPLIT.

That number alone is the value. "Split" means I shouldn't trust a single confident answer.

6 built-in domains:
- founder / engineer / investor / career / product / quant

Plus `custom` for your own voice rosters.

One Claude Sonnet 4.6 call per deliberation, ~$0.03.

Live: vibexforge.com/council (free, no signup)
Code: github.com/alex-jb/council-diff (MIT, TypeScript, bilingual README EN + 中文)

What I'd love feedback on:
1. Voice roster design — are the 5 voices per domain actually well-differentiated, or do they collapse to the same advice?
2. Should I add a "kill / wait / go / split" badge as a sticky to your repo (like coverage shields)?
3. Brier audit at resolution is on the roadmap — track which recommendations actually pan out. Public leaderboard. Worth the engineering?

Drop a decision in the comments, I'll run the council on it.
