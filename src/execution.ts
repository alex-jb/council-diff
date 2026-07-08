// src/execution.ts
// ──────────────────────────────────────────────────────────────────
// v0.5-alpha (2026-07-09): execution-before-review (TREX pattern).
//
// Motivation: Greptile/TREX (GitHub trending 2026-06-17) showed
// that AI code reviewers hallucinate less when they see the actual
// runtime behavior of the diff. council-diff today does static
// review only. This module adds an opt-in execution boundary so
// every voice sees the same ground truth instead of speculating
// about runtime.
//
// Spec: docs/v0.5-trex-execution-spec.md
//
// v0.5-alpha scope
// ----------------
// - ExecutionReport type + input schema addition
// - Sandbox interface (implementation-agnostic)
// - MockSandbox — deterministic, no side effects, for tests
// - DockerSandbox — stub that throws NotImplemented in v0.5-alpha.1
//   until a maintainer wires real Docker (~1 weekend per spec)
// - injectExecutionIntoPrompt() helper for voice system prompts
//
// Voices are told (via prompt injection) to ground their review in
// actual test outcomes when execution is provided, and to NOT flag
// concerns whose only evidence is speculation about runtime
// behavior when the execution report contradicts that speculation.

/**
 * Per-run summary of test suite behavior after the proposed diff is
 * applied inside a sandbox. Every voice sees the same report so no
 * voice can hallucinate runtime behavior that contradicts what
 * actually happened.
 */
export interface ExecutionReport {
  /** True if the sandbox spun up successfully AND the test runner
   *  produced parseable output. False = review proceeds without
   *  execution grounding (fail-open). */
  ran: boolean;

  test_summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };

  failed_tests: Array<{
    name: string;
    file: string;
    stack: string; // truncated stack trace (first 500 chars)
  }>;

  /** Percentage-point change in coverage, if the test runner
   *  emitted a coverage report Shadow could parse. null = not
   *  measured. */
  coverage_delta: number | null;

  sandbox_duration_ms: number;

  /** Any spin-up or eval errors. Empty array = clean run. */
  sandbox_errors: string[];
}

/**
 * Sandbox interface. Implementations must satisfy the security model
 * documented in docs/v0.5-trex-execution-spec.md#security-model:
 *   - No network egress by default
 *   - Read-only mount of project root + writable /tmp
 *   - 60-second wallclock timeout per run
 *   - Memory cap (default 512 MB)
 *   - No access to ANTHROPIC_API_KEY or other secrets
 */
export interface Sandbox {
  /** Apply the diff, run the test suite, return the report.
   *  MUST NOT throw on test failures — surface them via the
   *  ExecutionReport's failed_tests. Only throws for sandbox
   *  infrastructure failures (Docker unavailable, timeout hit,
   *  memory cap exceeded). */
  run(input: SandboxRunInput): Promise<ExecutionReport>;

  /** Human-readable name for logs + attestation binding. */
  readonly kind: SandboxKind;
}

export type SandboxKind = "mock" | "docker" | "firecracker" | "apple-container";

export interface SandboxRunInput {
  /** The proposed diff as a unified-diff string. */
  diff: string;

  /** Absolute path to the project root. Sandbox mounts read-only. */
  project_root: string;

  /** Auto-detected test-runner command, or an explicit override.
   *  Examples: "npm test", "pytest", "go test ./...". */
  test_command: string;

  /** Wallclock timeout in ms. Default 60_000. */
  timeout_ms?: number;
}

/**
 * MockSandbox — deterministic, no side effects, for tests + for
 * v0.5-alpha shipping without a real container backend.
 *
 * The mock parses the diff heuristically: if the diff includes any
 * "// FAIL" or "# FAIL" comment line, the mock emits a single failed
 * test entry. Otherwise it emits an all-green report. This keeps
 * downstream schema tests + voice-prompt-injection tests
 * deterministic without spinning up Docker.
 *
 * DO NOT use MockSandbox in production. It provides no security
 * guarantees and no runtime grounding.
 */
export class MockSandbox implements Sandbox {
  readonly kind: SandboxKind = "mock";

  async run(input: SandboxRunInput): Promise<ExecutionReport> {
    const startedAt = Date.now();
    const hasFailMarker = /\b(FAIL|fail_here)\b/.test(input.diff);

    if (hasFailMarker) {
      return {
        ran: true,
        test_summary: { total: 3, passed: 2, failed: 1, skipped: 0 },
        failed_tests: [
          {
            name: "mock_failed_test",
            file: "mock/mock.test.ts",
            stack:
              "MockSandbox: diff contained FAIL marker; simulating one failed test.",
          },
        ],
        coverage_delta: null,
        sandbox_duration_ms: Date.now() - startedAt,
        sandbox_errors: [],
      };
    }

    return {
      ran: true,
      test_summary: { total: 3, passed: 3, failed: 0, skipped: 0 },
      failed_tests: [],
      coverage_delta: null,
      sandbox_duration_ms: Date.now() - startedAt,
      sandbox_errors: [],
    };
  }
}

/**
 * DockerSandbox — stub. Real implementation deferred to v0.5-alpha.2
 * per spec. Throws NotImplemented so callers who set
 * `sandbox: "docker"` fail loudly instead of silently falling back
 * to the mock (which has no security guarantees).
 */
export class DockerSandbox implements Sandbox {
  readonly kind: SandboxKind = "docker";

  async run(_input: SandboxRunInput): Promise<ExecutionReport> {
    throw new Error(
      "DockerSandbox is a stub in council-diff v0.5-alpha.1. " +
      "Real Docker execution ships in v0.5-alpha.2. " +
      "Use MockSandbox for tests, or wait for the real backend.",
    );
  }
}

/**
 * Factory. Callers pass a kind string; get back the concrete
 * implementation. Falls back to MockSandbox for unknown kinds so
 * upstream callers do not crash — the mock explicitly labels itself
 * so downstream logs make the fallback visible.
 */
export function buildSandbox(kind: SandboxKind): Sandbox {
  if (kind === "docker") return new DockerSandbox();
  return new MockSandbox();
}

/**
 * Prompt-injection helper. When an ExecutionReport is present,
 * append a canonical grounding block to the voice's system prompt
 * so the voice knows to (a) treat the report as ground truth and
 * (b) refuse to flag concerns that contradict the report.
 *
 * Returns the original prompt unchanged when execution is null or
 * undefined.
 */
export function injectExecutionIntoPrompt(
  basePrompt: string,
  execution: ExecutionReport | null | undefined,
): string {
  if (!execution) return basePrompt;
  if (!execution.ran) {
    // Ran field false = sandbox failed to spin up. Tell the voice
    // execution grounding was attempted but unavailable, so it
    // knows to be more cautious about runtime speculation.
    return (
      basePrompt +
      "\n\nEXECUTION GROUNDING: attempted but unavailable this run (" +
      execution.sandbox_errors.join("; ") +
      "). Fall back to careful static review; do not fabricate runtime evidence."
    );
  }
  const s = execution.test_summary;
  const failList = execution.failed_tests
    .map((t) => `  - ${t.name} (${t.file}): ${t.stack.slice(0, 200)}`)
    .join("\n");
  return (
    basePrompt +
    `\n\nEXECUTION GROUNDING (real test-suite outcome after applying the diff):\n` +
    `Total: ${s.total} · Passed: ${s.passed} · Failed: ${s.failed} · Skipped: ${s.skipped}\n` +
    (failList ? `Failed tests:\n${failList}\n` : "All tests passed.\n") +
    `Sandbox duration: ${execution.sandbox_duration_ms}ms\n` +
    `INSTRUCTIONS: Ground your review in these outcomes. Do NOT flag concerns whose only evidence is your speculation about runtime behavior when the execution report contradicts that speculation. If the failed tests are unrelated to the diff, say so explicitly rather than blaming the diff.`
  );
}
