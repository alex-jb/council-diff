---
name: council-diff
description: Run a 5-voice AI council on any decision (founder, engineer, investor, career, product, quant, or custom roster). Voices deliberate in parallel against the same model, an optional Fable 5 Oracle adjudicates, and a Brier audit module scores every voice over 30/90 days. Use when the user wants multiple expert perspectives on a hard call, when single-LLM verdicts feel overconfident, when they ask for "second opinions" or "have a council look at this," or when they want their advice tracked for calibration. Requires ANTHROPIC_API_KEY.
license: MIT
metadata:
  version: "0.4.0"
  homepage: "https://github.com/alex-jb/council-diff"
  author: "alex-jb"
  runtime: "node>=18"
  install: "npm install council-diff"
  tags: "council, multi-agent, brier, calibration, decision-making, anthropic"
---

# council-diff

5-voice AI council for any decision. Paste a question, get 5 specialist perspectives in parallel, see where they agree and disagree. Brier-audited at resolution. Optional Fable 5 Oracle adjudication for split councils.

## When to use this skill

Invoke this skill whenever the user:

- Asks for multiple expert perspectives on a hard call ("what would a VC / lawyer / engineer / spouse think")
- Says the single-model answer feels overconfident or one-sided
- Asks for a "second opinion" or "have a council look at this" or "model council"
- Wants their advice tracked for calibration over time (Brier audit)
- Has a high-stakes founder / engineering / investing / career / product / quant decision

Do NOT invoke for trivial factual questions, single-domain code review (use a code review skill instead), or anything where a single LLM verdict is obviously sufficient.

## Setup

```bash
npm install council-diff
export ANTHROPIC_API_KEY=sk-ant-...
```

## Usage

```ts
import { CouncilDiff } from "council-diff";

const council = new CouncilDiff({ apiKey: process.env.ANTHROPIC_API_KEY });

const result = await council.deliberate({
  domain: "founder",          // founder | engineer | investor | career | product | quant | custom
  decision: "Should I raise a $1M seed or bootstrap?",
  context: "B2B SaaS, $5K MRR, 20% MoM, solo, 12mo runway",
  oracle: "fable-5",          // optional — Mythos-class adjudicator on split councils
  safeMode: false,            // true forces Sonnet 4.6 fallback (zero data retention)
});

console.log(result.recommendation);   // "go" | "wait" | "kill" | "split"
console.log(result.agreement_score);  // 0-1
console.log(result.consensus);        // 1-paragraph synthesis
for (const v of result.voices) {
  console.log(`${v.voice_display} (${v.score}/100): ${v.verdict}`);
}
```

## Built-in domains

- **founder** — YC Partner / VC Skeptic / Lawyer / Indie CFO / Pragmatic Spouse
- **engineer** — Rust Maintainer / SRE Oncall / Recruiter / Junior Dev / CTO 5y Later
- **investor** — Macro / Sector / PM / Growth VC / Activist Short
- **career** — Mentor 20y / Recruiter / Peer Doing Well / CSO / Future You 5y
- **product** — Real User / Competitor / Internal Dev / Garry-style / Naval-style
- **quant** — Jane Street MD / Citadel / Two Sigma ML / Anthropic / HFT Engineer
- **custom** — fully user-defined voice rosters

## Brier audit

`council.audit()` reads `~/.council-diff/forecasts.jsonl` and scores each voice + Oracle against ground truth at resolution. Tracks per-voice calibration over 30 / 90 days so you learn which voice tends to be right in which domain.

## Privacy

Pass `safeMode: true` to force every Mythos-class request down to Sonnet 4.6 (zero data retention). The Oracle response includes `data_retention: "30day-mythos" | "zero"` so apps with privacy claims (mental-health, GDPR-sensitive PII, on-device-only) can branch on it.

## License

MIT. Source: https://github.com/alex-jb/council-diff
