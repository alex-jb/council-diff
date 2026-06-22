/**
 * llm-adapter.ts — provider-agnostic chat surface for council-diff.
 *
 * Issue #1 (https://github.com/alex-jb/council-diff/issues/1) — decouple
 * the deliberate / adjudicate code paths from `@anthropic-ai/sdk` so that
 * the same council can run against OpenAI, GLM, or any other provider
 * without rewriting voice logic.
 *
 * Design tenets:
 *   1. Thin. One interface, three methods (chat / supportedModels /
 *      retentionFor). NOT a router, NOT a cost optimizer, NOT a
 *      streaming primitive. Add those in a separate file when needed.
 *   2. Strict-JSON expectation lives in the voice layer (src/index.ts),
 *      NOT here. Adapters return raw text; the voice layer parses.
 *   3. Retention semantics travel with the adapter, not the voice layer.
 *      Anthropic Mythos-class enforces 30-day server-side retention per
 *      support.claude.com/en/articles/15425996; every other model is
 *      "zero" by default. Voice layer queries `retentionFor(model)` to
 *      stamp `OracleVerdict.data_retention` without provider-specific
 *      branching.
 *
 * Adapters in this file:
 *   - MockAdapter: deterministic canned responses for unit tests; no
 *     network. Use this when writing voice-layer tests so they don't
 *     burn API credits.
 *   - AnthropicAdapter: wraps @anthropic-ai/sdk. Behavior identical to
 *     pre-#1 code path so v0.5.x users see no semantic change.
 *   - OpenAIAdapter: wraps the `openai` SDK. Lazy-imports so OpenAI is
 *     a soft dependency — installs only fire when adapter is actually
 *     used.
 *
 * GLM-5.2 adapter is a follow-up issue. It would subclass OpenAIAdapter
 * with a custom base_url + pricing — same pattern as the Orallexa
 * GlmProvider (commit a6750a9 on alex-jb/orallexa-ai-trading-agent).
 */

import Anthropic from "@anthropic-ai/sdk";

/** Mythos-class Anthropic models — 30-day server-side data retention. */
export const MYTHOS_MODELS = new Set<string>([
  "claude-fable-5",
  "claude-fable-5-2026-04-15",
  "claude-opus-4-7-mythos",
]);

export type DataRetention = "30day-mythos" | "zero";

export interface ChatArgs {
  /** System prompt. Adapters MUST plumb to the provider's system-role slot. */
  system: string;
  /** Chat-style message list. Roles "user" | "assistant" — system is separate. */
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  /** Provider-canonical model id. Adapter does NOT translate. */
  model: string;
  /** Hard cap on output tokens. */
  max_tokens: number;
}

export interface ChatResult {
  /** Concatenated text content of the assistant response. */
  text: string;
  /** Token usage if the provider reports it; zero-filled otherwise. */
  usage: { input_tokens: number; output_tokens: number };
  /** Raw provider response for debugging only. Do not depend on shape. */
  raw: unknown;
}

export interface LlmAdapter {
  /** Stable identifier used in logs + env-var dispatch. */
  readonly name: string;
  /** Issue one chat request. May throw on provider errors. */
  chat(args: ChatArgs): Promise<ChatResult>;
  /** Strict list of model ids this adapter accepts. Fail-fast validation
   *  before deliberate() spends real money on a typo. */
  supportedModels(): string[];
  /** Disclosure for the OracleVerdict.data_retention field. */
  retentionFor(model: string): DataRetention;
}

// ─────────────────────────────────────────────────────────────────────
// MockAdapter — for unit tests + offline development
// ─────────────────────────────────────────────────────────────────────

export interface MockAdapterConfig {
  /** Canned response text. Default echoes the user message + system to
   *  make assertions easy without prescribing a schema. */
  responseText?: string;
  /** Override usage; default 0/0. */
  usage?: { input_tokens: number; output_tokens: number };
  /** Throw on chat() — for error-path tests. */
  throwOn?: Error;
  /** Models claimed to be supported. Default ["mock-1"]. */
  models?: string[];
}

export class MockAdapter implements LlmAdapter {
  readonly name = "mock";
  private cfg: MockAdapterConfig;
  /** Recorded calls for test assertions. */
  public calls: ChatArgs[] = [];

  constructor(cfg: MockAdapterConfig = {}) {
    this.cfg = cfg;
  }

  async chat(args: ChatArgs): Promise<ChatResult> {
    this.calls.push(args);
    if (this.cfg.throwOn) throw this.cfg.throwOn;
    return {
      text: this.cfg.responseText ?? "",
      usage: this.cfg.usage ?? { input_tokens: 0, output_tokens: 0 },
      raw: { mock: true, args },
    };
  }

  supportedModels(): string[] {
    return this.cfg.models ?? ["mock-1"];
  }

  retentionFor(_model: string): DataRetention {
    return "zero";
  }
}

// ─────────────────────────────────────────────────────────────────────
// AnthropicAdapter — production primary, preserves pre-#1 behavior
// ─────────────────────────────────────────────────────────────────────

const ANTHROPIC_MODELS = [
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
  "claude-opus-4-7",
  "claude-fable-5",
];

export interface AnthropicAdapterOptions {
  apiKey?: string;
}

export class AnthropicAdapter implements LlmAdapter {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(opts: AnthropicAdapterOptions = {}) {
    const key = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not set");
    this.client = new Anthropic({ apiKey: key });
  }

  async chat(args: ChatArgs): Promise<ChatResult> {
    const msg = await this.client.messages.create({
      model: args.model,
      max_tokens: args.max_tokens,
      system: args.system,
      messages: args.messages,
    });
    const textBlock = msg.content.find((c) => c.type === "text");
    const text =
      textBlock && textBlock.type === "text" ? textBlock.text : "";
    return {
      text,
      usage: {
        input_tokens: msg.usage?.input_tokens ?? 0,
        output_tokens: msg.usage?.output_tokens ?? 0,
      },
      raw: msg,
    };
  }

  supportedModels(): string[] {
    return [...ANTHROPIC_MODELS];
  }

  retentionFor(model: string): DataRetention {
    return MYTHOS_MODELS.has(model) ? "30day-mythos" : "zero";
  }
}

// ─────────────────────────────────────────────────────────────────────
// OpenAIAdapter — added in #1, lazy-imports the openai SDK
// ─────────────────────────────────────────────────────────────────────

const OPENAI_MODELS = [
  "gpt-5",
  "gpt-5-mini",
  "gpt-5.1",
  "gpt-5.1-2025-11-13",
  "gpt-5.1-chat-latest",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4o",
  "o4-mini",
];

export interface OpenAIAdapterOptions {
  apiKey?: string;
  /** Override base URL — used by GLM-style OpenAI-compatible providers. */
  baseURL?: string;
}

export class OpenAIAdapter implements LlmAdapter {
  readonly name: string;
  private apiKey: string;
  private baseURL?: string;
  // Lazy: the SDK is only imported on first chat() call so users who
  // never set COUNCIL_DIFF_PROVIDER=openai don't pay the install cost.
  private clientPromise: Promise<unknown> | null = null;

  constructor(opts: OpenAIAdapterOptions = {}, nameOverride?: string) {
    const key = opts.apiKey ?? process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not set");
    this.apiKey = key;
    this.baseURL = opts.baseURL;
    this.name = nameOverride ?? "openai";
  }

  private async getClient(): Promise<{
    chat: { completions: { create: (req: unknown) => Promise<unknown> } };
  }> {
    if (this.clientPromise === null) {
      this.clientPromise = (async () => {
        let mod: { OpenAI: new (opts: unknown) => unknown };
        try {
          // `openai` is an optional peer — we don't pull it into
          // package.json `dependencies` because it's only used when
          // COUNCIL_DIFF_PROVIDER=openai (or callers construct an
          // OpenAIAdapter explicitly). The dynamic import is what
          // makes that optionality work at runtime.
          // @ts-ignore — optional peer, intentionally not type-resolved
          mod = (await import("openai")) as unknown as {
            OpenAI: new (opts: unknown) => unknown;
          };
        } catch {
          throw new Error(
            "openai SDK not installed. Run `npm install openai` to enable OpenAIAdapter.",
          );
        }
        const cfg: { apiKey: string; baseURL?: string } = {
          apiKey: this.apiKey,
        };
        if (this.baseURL) cfg.baseURL = this.baseURL;
        return new mod.OpenAI(cfg);
      })();
    }
    return this.clientPromise as Promise<{
      chat: { completions: { create: (req: unknown) => Promise<unknown> } };
    }>;
  }

  async chat(args: ChatArgs): Promise<ChatResult> {
    const client = await this.getClient();
    const resp = (await client.chat.completions.create({
      model: args.model,
      max_completion_tokens: args.max_tokens,
      messages: [
        { role: "system", content: args.system },
        ...args.messages,
      ],
    })) as {
      choices: Array<{ message: { content: string | null } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const text = resp.choices?.[0]?.message?.content ?? "";
    return {
      text,
      usage: {
        input_tokens: resp.usage?.prompt_tokens ?? 0,
        output_tokens: resp.usage?.completion_tokens ?? 0,
      },
      raw: resp,
    };
  }

  supportedModels(): string[] {
    return [...OPENAI_MODELS];
  }

  retentionFor(_model: string): DataRetention {
    // OpenAI enterprise terms = no server-side retention beyond the request.
    // GLM (when subclassed) returns the same value.
    return "zero";
  }
}

// ─────────────────────────────────────────────────────────────────────
// Factory — env-var dispatch
// ─────────────────────────────────────────────────────────────────────

/**
 * Build the default adapter from process env.
 *
 * Selection rules:
 *   - `COUNCIL_DIFF_PROVIDER=anthropic` (or unset) → AnthropicAdapter
 *   - `COUNCIL_DIFF_PROVIDER=openai`              → OpenAIAdapter
 *   - any other value                              → Error
 *
 * Tests should construct adapters directly (MockAdapter) and pass them
 * into `new CouncilDiff({ adapter })`. The factory is only for the
 * "no-explicit-adapter" production path.
 */
export function buildAdapter(): LlmAdapter {
  const provider = (process.env.COUNCIL_DIFF_PROVIDER ?? "anthropic")
    .toLowerCase()
    .trim();
  switch (provider) {
    case "anthropic":
      return new AnthropicAdapter();
    case "openai":
      return new OpenAIAdapter();
    default:
      throw new Error(
        `Unknown COUNCIL_DIFF_PROVIDER='${provider}'. Supported: anthropic, openai.`,
      );
  }
}
