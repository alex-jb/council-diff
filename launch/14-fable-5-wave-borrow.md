# Fable 5 wave-borrow launch — council-diff v0.3.0

**Window:** 24h after Anthropic Fable 5 announcement (2026-06-10 morning ET).
**Strategy:** wave-borrow — every "what should I do with Fable 5?" search becomes a path to council-diff.
**Distribution:** X thread (primary), HN comment (Show HN already up — comment), Reddit r/ClaudeAI, LinkedIn.

---

## X thread (5 tweets, post within 12h of Fable 5 announcement)

**1/**
Anthropic shipped Claude Fable 5 today. 95% SWE-Bench, 1M context, Mythos-class.

So I shipped council-diff v0.3.0 with `oracle: "fable-5"` mode.

Council = 5 specialist voices debate your decision.
Oracle = Fable 5 reads all 5 verdicts and overrides if they're wrong.

Brier-audited at resolution.

🔗 github.com/alex-jb/council-diff

**2/**
Why two layers?

A single Fable 5 answer hides its own uncertainty. A 5-voice council exposes the disagreement, but mid-tier voices sometimes hit "split" on hard calls.

Run both. Council finds the fault lines. Oracle picks the side that holds up. You see when they agree (high confidence) vs split (think harder).

**3/**
```ts
import { CouncilDiff } from "council-diff";

const result = await council.deliberate({
  domain: "founder",
  decision: "Raise a seed or bootstrap?",
  context: "$5K MRR, 20% MoM, solo, 12mo runway",
  oracle: "fable-5",  // opt-in
});

result.recommendation         // council vote
result.oracle.recommendation  // Fable 5's vote
result.oracle.override_reason // only when they disagree
```

**4/**
Cost discipline:

- Council only: ~$0.03/call (Sonnet 4.6)
- Council + Fable 5 Oracle: ~$0.10/call

Skip Oracle for routine calls. Pay for it when the cost of being wrong is more than $0.10.

Every Oracle verdict is Brier-audited at resolution so we'll publish when Oracle beats vs underperforms the council.

**5/**
Built it in 90 min after Anthropic's announcement landed.

MIT, npm, no SaaS, no telemetry. Bring your own ANTHROPIC_API_KEY.

If you're already paying for Fable 5 — this is the cheapest way to use it on real decisions, not just code completions.

`npm install council-diff@0.3.0`

🔗 github.com/alex-jb/council-diff

---

## HN comment (under existing Show HN, or under any Fable 5 thread)

Shipped council-diff v0.3.0 with `oracle: "fable-5"` mode 90 min after Anthropic's announcement. The library runs a 5-voice specialist council (Sonnet 4.6) on any decision, and Fable 5 reads all 5 verdicts before issuing a single adjudication with override authority.

Council finds the disagreement. Oracle picks the side that holds up. Both get Brier-audited at resolution so we can see when Oracle beats vs underperforms the council over time.

Cost ~$0.10/call total. MIT. github.com/alex-jb/council-diff

---

## Reddit r/ClaudeAI

**Title:** Council-diff v0.3.0 adds Fable 5 Oracle mode — 5-voice debate + flagship adjudication

Anthropic shipped Fable 5 today. I added an `oracle: "fable-5"` opt-in to council-diff so you can run a 5-voice specialist council (Sonnet 4.6) on any decision, then have Fable 5 read all 5 verdicts and issue a single adjudication — with explicit authority to override the council.

The point isn't "Fable 5 is smarter than 5 Sonnets in parallel." It's that a single-LLM answer hides its own uncertainty, a council exposes the disagreement, and a flagship reasoner is the right tool to pick which side of the disagreement actually holds up.

Both layers get Brier-audited separately at resolution. So we'll see when Oracle wins vs underperforms the council, not just claim it.

MIT, npm, bring your own key. ~$0.10/Oracle call.

github.com/alex-jb/council-diff

---

## LinkedIn (EN)

Anthropic shipped Claude Fable 5 this morning. I shipped council-diff v0.3.0 with `oracle: "fable-5"` mode this afternoon.

What it does: run a 5-voice specialist council on a decision (founder/engineer/investor/career/product/quant — or fully custom voices), then have Fable 5 read all 5 verdicts and issue a single adjudication with override authority over the council.

Why both layers: a single-LLM answer hides its own uncertainty. A council exposes disagreement. A flagship reasoner picks which voice has the strongest grounding. Brier-audited at resolution so you see when Oracle beats vs underperforms the council, instead of taking either's word for it.

Open source (MIT), bring your own Anthropic API key.

🔗 github.com/alex-jb/council-diff

---

## Note on the wave

Fable 5 launch traffic peaks within ~36h. Posting within 12h of the announcement = catching the search wave where people are asking "what should I build with Fable 5 / how do I use Fable 5 / is Fable 5 worth $10/$50 per MTok?"

Council-diff Oracle mode = a concrete, runnable answer to those questions that doesn't require you to commit to a specific use-case. That's the wave-borrow.

Watch X reply notifications for 48h. If Anthropic's official account or Claude team members engage, the algo will amplify free.
