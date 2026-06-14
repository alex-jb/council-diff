# council-diff v0.4.0 / Launch checklist

Shipped 2026-06-14. Repositioned from "5-voice AI council OSS" to "Software 3.0 Reference Implementation: the OSS evaluation loop for multi-persona AI agents" per Andrej Karpathy's Sequoia AI Ascent framing (2026-04-20).

This is a positioning release. Zero code changed. The launch goal is press / inbound from the Karpathy + Anthropic FDE + Sequoia ecosystem, not net new users on day one.

## Pre-launch gate (Alex must run before promoting)

- [ ] `cd ~/Desktop/council-diff && npm run build`. Confirm clean.
- [ ] `cd ~/Desktop/council-diff && npm test`. Confirm 33 smoke tests pass.
- [ ] Verify v0.4.0 README renders correctly on github.com (push already landed).
- [ ] Decide: tag + publish v0.4.0 to npm, or hold for a coordinated moment.
  - To publish: `git tag v0.4.0 && git push origin v0.4.0` (release.yml workflow auto-publishes if `NPM_TOKEN` is set).
  - Holding the tag is fine. The README repositioning works without the npm bump.

## Track 1: X / Twitter (tag Karpathy)

Single tweet, no thread. Karpathy famously responds to direct repo mentions when the framing matches his own. Keep it factual, not promotional.

```
Karpathy at Sequoia, April 2026:

"Agentic engineers design specs, supervise plans, inspect diffs, write tests, create evaluation loops, manage permissions, isolate worktrees, and preserve quality."

Shipped the evaluation loop in OSS 6 months early.

5 personas. Brier-audited. MIT.

https://github.com/alex-jb/council-diff

cc @karpathy
```

Backup variant if first dies:

```
"AI automates what you can verify."
@karpathy, Sequoia AI Ascent

council-diff is the smallest OSS implementation of his evaluation-loop bullet. 5 personas deliberate, Fable 5 Oracle adjudicates, Brier audit closes the loop at resolution.

v0.4.0 ships the Software 3.0 framing.

https://github.com/alex-jb/council-diff
```

Post timing: weekday 9 to 11am PT, when Karpathy is most active on X.

## Track 2: Hacker News Show HN

Title (one shot, HN punishes edits):

```
Show HN: council-diff v0.4. Karpathy's "evaluation loop" as an OSS library
```

Body:

```
council-diff is a 5-voice AI council (founder / engineer / investor / career / product / quant) that deliberates against the same model, with optional Fable 5 Oracle adjudication and a Brier audit module that scores every voice over 30 / 90 days.

v0.4.0 (today) is a positioning release. The library has not changed. The framing has.

Karpathy at Sequoia (April 2026) split software into three eras:
- Software 1.0: explicit code
- Software 2.0: trained networks
- Software 3.0: prompting an LLM interpreter

His agentic engineering job description: "design specs, supervise plans, inspect diffs, write tests, create evaluation loops, manage permissions, isolate worktrees, preserve quality."

council-diff maps onto that bullet directly. The persona briefs are the spec. The verdicts side by side are the diff. The agreement score is the test. The Brier audit is the evaluation loop. The Oracle is the supervisor.

What it does NOT do: it does not run agents, it does not wrap tools, it does not orchestrate workflows. It is one library, one call, 5 verdicts, optionally one adjudicator, ~$0.03 to $0.10.

What is different from Perplexity Model Council: persona-vs-persona on the same model, not provider-vs-provider on the same question. And OSS, with the Brier audit layer underneath.

What is different from Anthropic's "advisor strategy" (beta, 2026-06-09): same pattern, shipped 6 months earlier, and still the only OSS implementation that includes the calibration layer.

Install: npm install council-diff, or npx skills i alex-jb/council-diff for skills.sh.

MIT. Honest critique welcome on the persona briefs and the Brier math.

https://github.com/alex-jb/council-diff
```

Post timing: Tuesday or Wednesday 9 to 10am ET.

## Track 3: dev.to article skeleton

File: `~/Desktop/council-diff/docs/devto-article-v0.4.md` (to be drafted).

Title:

```
Karpathy's "evaluation loop" already exists. I open-sourced it in March.
```

Section outline (~1200 words):

1. **The Sequoia talk in one paragraph**. Karpathy's three software eras, agentic engineering job description, the exact "create evaluation loops" bullet.
2. **What I shipped 6 months early**. council-diff timeline: v0.1 (2026-06-08, persona briefs as spec), v0.2 (2026-06-09, Brier audit as evaluation loop), v0.3 (2026-06-10, Fable 5 Oracle as supervisor), v0.3.1 (2026-06-11, retention disclosure as permissions surface).
3. **Mapping table**. Same 6-row table from the README, with one paragraph of commentary per row explaining the design choice.
4. **What council-diff is NOT**. Not an agent framework, not a tool wrapper, not an orchestrator. One library, one call, one evaluation loop.
5. **How to run the audit**. 20-line code sample: deliberate, persist, resolve, brierScore, meanBrier. Show actual numbers from `examples/quant.ts` (AVGO buy decision).
6. **What 6 months of Brier data looks like**. TODO: include real audit JSON if Alex has any resolved predictions by launch day. If not, show the synthetic example from `examples/test.ts`.
7. **Why I rewrote the README, not the code**. Positioning lesson. The library was complete. The frame was wrong. Karpathy's talk gave me the frame.
8. **What is next**. Python port, public Brier leaderboard, CLI.

Tags: `#ai`, `#opensource`, `#claude`, `#agents`, `#typescript`, `#karpathy`.

## Track 4: LinkedIn (EN + 中文)

Two posts, 24 hours apart. EN goes first (Karpathy's audience). 中文 next day (Alex's network).

EN draft:

```
Karpathy gave the job description at Sequoia in April. I shipped the library in March.

"Agentic engineers design specs, supervise plans, inspect diffs, write tests, create evaluation loops, manage permissions, isolate worktrees, preserve quality."

council-diff v0.4.0 (today) rewrites the README to make the mapping explicit: persona briefs are the spec, side-by-side verdicts are the diff, agreement score is the test, Brier audit is the evaluation loop, Fable 5 Oracle is the supervisor.

Zero code changed. The frame around the library is now correct.

MIT. https://github.com/alex-jb/council-diff
```

中文 draft (Alex's voice, terse, no AI vocab):

```
Karpathy 4 月在 Sequoia 给了 agentic engineering 的工作描述:写规格、看 diff、写测试、搭评估闭环、管权限、守质量。

council-diff 早 6 个月就 ship 了。今天 v0.4.0 把 README 改写,把映射写明白:persona brief 是规格,verdict 并排是 diff,agreement score 是测试,Brier 审核是评估闭环,Fable 5 Oracle 是 supervisor。

代码没改一行。定位改对了。

MIT。https://github.com/alex-jb/council-diff
```

## Track 5: skills.sh repush

The `metadata.version` in SKILL.md is now `0.4.0`. If Alex already published to skills.sh under `alex-jb/council-diff`, re-run:

```bash
cd ~/Desktop/council-diff
npx skills publish
```

(Confirm exact command from the skills.sh docs. This is a placeholder.)

## Track 6: awesome-list refresh

Three awesome-list PRs already exist from v0.2 launch. Add v0.4.0 framing in the PR descriptions if they are still open. Targets:

- `awesome-claude-code`: emphasize Software 3.0 + evaluation loop wording.
- `awesome-llm-apps`: emphasize Brier audit + persona spec.
- `awesome-mcp-servers`: secondary, the MCP angle is weaker.

## Risk notes

- **Karpathy tag risk**. If Karpathy retweets, traffic spike. Repo is fine (no DB, static GitHub Pages-equivalent). npm has rate limits but a 100x burst is well within tolerance.
- **HN risk**. Show HN audience may pattern-match to "wrapper" and downvote. Mitigation: lead with the Brier audit + 6 months early timing, not the persona list.
- **Positioning risk**. If the Karpathy framing reads as opportunistic, it backfires. Mitigation: the library actually shipped on the dates claimed. CHANGELOG dates are git-verifiable.

## Do NOT do

- Do NOT publish v0.4.0 to npm before Alex says go. README + GitHub push is enough for the positioning shift. The npm bump is reserved for the launch moment.
- Do NOT cross-post to all 6 channels in the same 4-hour window. Stagger by 24 to 48h to avoid Anthropic / Karpathy followers seeing it as spam.
- Do NOT add new keywords to the README beyond what is in v0.4.0. The frame is locked.
