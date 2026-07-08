/**
 * director.ts — explicit decision layer for council-diff.
 *
 * Surfaced by the 2026-06-22 Jason Marsh call. Flow's "Magic Help"
 * is the named layer that decides which assets to compare against,
 * which narrative arc to render, which sources to pull. Jason
 * demoed it deciding to compare crude oil prices to QQQ "better
 * than even I do" — but the system didn't surface WHY it picked
 * QQQ specifically over S&P 500 or sector peers.
 *
 * That's the procurement gap for regulated banking: "the LLM
 * decided" is not an acceptable audit answer. Examiners need the
 * comparison-selection rationale traceable to source.
 *
 * The Director class is council-diff's named version of that
 * decision layer — but with reasoning trace surfaced by default.
 *
 * What it does:
 *   - Given a high-level intent ("decide whether to launch X"),
 *     the Director picks which domain (founder / engineer /
 *     investor / etc.), which custom voices if any, whether to
 *     run Oracle adjudication, and what level of clarification
 *     to ask the caller for first.
 *   - Returns a DirectorDecision that names every choice + the
 *     reasoning behind it — so auditors / compliance / users
 *     can verify the LLM's selection was warranted.
 *
 * Pattern source: Flow's Magic Help (named layer, opaque trace) +
 * council-diff's clarify() (already builds the "ask before answer"
 * pattern from Cyrus 说 AI tier-2). Director joins these: it
 * decides WHAT council to convene, while clarify() handles WHAT
 * context to gather before convening.
 *
 * Out of scope (deliberate):
 *   - Auto-execution. Director RECOMMENDS; CouncilDiff.deliberate()
 *     still requires the caller to act on the recommendation.
 *   - Cost optimization (pick cheaper model for trivial decisions).
 *     Add in a follow-up if needed.
 *   - Multi-step planning. Director makes ONE decision per call.
 */

import type { LlmAdapter } from "./llm-adapter.js";
import { buildAdapter } from "./llm-adapter.js";
import { type CouncilDomain } from "./index.js";

/** What the Director decided about how to run the council. */
export interface DirectorDecision {
  /** Which domain roster to use. "custom" requires `custom_voices`. */
  domain: CouncilDomain;
  /**
   * Optional custom-voice spec. Only meaningful when domain="custom".
   * Director may propose 5 ad-hoc voices when none of the prebuilt
   * domains fit (e.g. a hyper-specific medical-device launch).
   */
  custom_voices?: Array<{ slug: string; display: string; role_brief: string }>;
  /** Whether to run Oracle (Mythos-class adjudication) after the 5 voices. */
  run_oracle: boolean;
  /** Model the Oracle should use, if `run_oracle === true`. */
  oracle_model?: string;
  /** Whether to ask the caller for clarification BEFORE deliberating. */
  needs_clarification: boolean;
  /**
   * 1-3 specific reasons the Director made these choices. **This is
   * the procurement-defensibility field.** Auditors / compliance
   * teams reading a council output can verify the Director's
   * selection was warranted by the input.
   */
  reasoning: string[];
  /** ISO timestamp. */
  computed_at: string;
}

export interface DirectorInput {
  /** The high-level decision the caller wants made. */
  decision: string;
  /** Optional context that helps the Director pick the right domain. */
  context?: string;
  /**
   * Optional caller-supplied stakes signal: high stakes default to
   * Oracle = true. Low stakes default to Oracle = false (cost-aware).
   */
  stakes?: "low" | "medium" | "high";
}

const DEFAULT_MODEL_FOR_DIRECTOR = "claude-sonnet-4-6";

const DIRECTOR_SYSTEM_PROMPT = `You are the Director of an AI council. The user has a decision to make. Your job is NOT to make the decision — your job is to decide HOW the council should be convened to make it well.

You output STRICT JSON with these fields:

  domain — one of "founder" | "engineer" | "investor" | "career" | "product" | "quant" | "custom"
  custom_voices — array of 5 voices ONLY if domain="custom" (slug, display, role_brief each).
                  If domain is anything else, OMIT this field.
  run_oracle — boolean. true if a flagship-tier adjudication after the 5 voices is warranted.
              Defaults: high stakes → true; medium/low stakes → false unless voices likely split.
  oracle_model — string. Only when run_oracle=true. Default "fable-5" for Mythos-class.
  needs_clarification — boolean. true if the decision text or context is too thin for the council
                       to produce meaningful verdicts.
  reasoning — array of 1-3 short strings. Each one explains a specific choice you made above.
              Examples: "domain=quant chosen because the decision is about trade entry; founder
              voices have no edge here." "run_oracle=true because stakes=high and 'should we
              acquire X' is a near-irreversible call."

Rules:
- Pretend you are a senior consultant deciding which team to convene for a client meeting.
- Be deliberate about cost: do not run Oracle for cheap decisions just because.
- Be deliberate about clarification: if the input is concrete (specific numbers, named counterparties,
  clear deadline), needs_clarification=false.
- Be honest about uncertainty: if the input is too vague to know what domain fits, set
  needs_clarification=true rather than guessing.
- reasoning entries must be specific to THIS input, not generic.

Output STRICT JSON only. No markdown. No commentary.`;

function _stripCodeFence(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
  }
  return t.trim();
}

export class Director {
  private adapter: LlmAdapter;
  private model: string;

  constructor(opts: { adapter?: LlmAdapter; model?: string } = {}) {
    this.adapter = opts.adapter ?? buildAdapter();
    this.model = opts.model ?? DEFAULT_MODEL_FOR_DIRECTOR;
  }

  async decide(input: DirectorInput): Promise<DirectorDecision> {
    const userMsg =
      `DECISION TO BE MADE BY THE COUNCIL:\n${input.decision}\n\n` +
      `CONTEXT:\n${input.context ?? "(none provided)"}\n\n` +
      `STAKES:\n${input.stakes ?? "(unspecified)"}`;

    const { text } = await this.adapter.chat({
      model: this.model,
      max_tokens: 800,
      system: DIRECTOR_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    if (!text) {
      throw new Error(`Director: empty response from ${this.adapter.name}`);
    }
    const cleaned = _stripCodeFence(text);
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonStr = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
    const parsed = JSON.parse(jsonStr) as Partial<DirectorDecision>;

    // Defensive normalization — the procurement contract is that we
    // always emit a complete DirectorDecision, even if the model
    // skipped a field.
    return {
      domain: (parsed.domain as CouncilDomain) ?? "founder",
      custom_voices: parsed.custom_voices,
      run_oracle: Boolean(parsed.run_oracle ?? false),
      oracle_model:
        parsed.run_oracle && !parsed.oracle_model ? "fable-5" : parsed.oracle_model,
      needs_clarification: Boolean(parsed.needs_clarification ?? false),
      reasoning: Array.isArray(parsed.reasoning)
        ? parsed.reasoning.slice(0, 3).map(String)
        : [],
      computed_at: new Date().toISOString(),
    };
  }
}
