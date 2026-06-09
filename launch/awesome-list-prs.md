# Awesome-list submission PRs

Three repos to PR. Use these exact lines + PR descriptions.

---

## 1. awesome-claude-prompts (or awesome-claude)

**Target repo**: `langgptai/awesome-claude-prompts` (or similar curated Claude list)

**File**: typically `README.md` under `### Tools` or `### Libraries` section

**Line to add**:
```markdown
- [council-diff](https://github.com/alex-jb/council-diff) - 5-voice AI council for any decision (founder / engineer / investor / career / product / quant). Single Claude Sonnet 4.6 call, agreement_score + go/wait/kill/split recommendation. MIT, bilingual README (EN + 中文).
```

**PR title**:
Add council-diff — 5-voice AI council pattern for Claude

**PR body**:
Adds council-diff, a TypeScript library that uses a single Claude Sonnet 4.6 call to produce 5 specialist verdicts on any decision in one structured JSON response.

The interesting bit for the awesome-claude audience is the single-call-multi-persona pattern — asking for 5 voices in one prompt produces better disagreement than 5 parallel calls because voices see each other in the context. 1/5th the cost too.

6 built-in domains + custom voice rosters. ~$0.03 per deliberation.

MIT, bilingual README. Live demo at vibexforge.com/council.

---

## 2. awesome-ai-agents

**Target repo**: `e2b-dev/awesome-ai-agents` (curated agent list)

**File**: `README.md` under `### Open Source` section (multi-agent subsection)

**Line to add**:
```markdown
- [council-diff](https://github.com/alex-jb/council-diff) - 5-voice deliberation pattern. Specialist voices (e.g. YC Partner / VC / Lawyer / CFO / Spouse for founder decisions) argue in parallel via single LLM call. Outputs agreement_score and go/wait/kill/split recommendation. TypeScript, MIT.
```

**PR title**:
Add council-diff — single-call multi-voice deliberation pattern

**PR body**:
Adds council-diff, a small library that demonstrates a single-LLM-call multi-voice deliberation pattern. 5 specialist personas evaluate a decision in parallel inside one structured JSON response, then the library computes agreement_score and a recommendation.

Differs from typical multi-agent setups because it doesn't use a graph orchestrator — the multi-voice debate happens inside the model's context in a single call. This produces better disagreement than 5 parallel calls (voices push back on each other) and costs 1/5th as much.

6 built-in domains (founder/engineer/investor/career/product/quant) + custom voice rosters. Currently Claude Sonnet 4.6, ~$0.03 per deliberation.

MIT, TypeScript, bilingual README (EN + 中文).

---

## 3. awesome-llm-apps (or awesome-llm-agents)

**Target repo**: `Shubhamsaboo/awesome-llm-apps` or `e2b-dev/awesome-ai-agents`

**Line to add** (under "Agent Applications" or "Multi-Agent"):
```markdown
- [council-diff](https://github.com/alex-jb/council-diff) - Paste any decision, get 5 specialist verdicts in parallel + agreement_score + recommendation (go/wait/kill/split). Brier-audited at resolution on the roadmap. TypeScript, MIT, bilingual.
```

**PR title**:
Add council-diff to multi-agent section

**PR body**:
council-diff is a small TypeScript library for 5-voice LLM deliberation. The agreement_score (1 - normalized stddev of voice scores) collapses the 5 opinions into a single confidence-of-consensus signal, which is more useful than 5 separate verdicts.

6 domains shipped (founder/engineer/investor/career/product/quant) + custom voice rosters. ~$0.03 per deliberation via single Claude Sonnet 4.6 call. MIT.

Roadmap includes Brier audit at resolution — track which recommendations pan out over time, publish public leaderboard.

Live demo: https://www.vibexforge.com/council
