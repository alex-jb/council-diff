# AMD MI300X portability proof — 2h play

> **Goal**: prove council-diff runs unchanged against an AMD MI300X vLLM endpoint, not just Anthropic. Single-file swap in the provider abstraction. ~2 hours work when AMD credit lands.
>
> **Why bother**: council-diff is "provider-pluggable" in the README. Backing that claim with a 1-tweet hardware demo + 1 README paragraph is the cheapest portability proof available. Strengthens the Slack Agent Builder pitch ("provider-portable Anthropic-default deliberation engine") without splitting focus from the 7/13 submission.

## Prerequisites

- [ ] AMD Developer Hackathon Act II credit ($100) link in inbox
- [ ] vLLM endpoint provisioned on MI300X (lablab.ai docs link)
- [ ] OpenAI-compatible API base URL + key from vLLM
- [ ] Model name (e.g. `meta-llama/Llama-3.3-70B-Instruct`)

## The 1-file swap (when credit lands)

council-diff already has provider abstraction in `src/index.ts`. To run against MI300X:

1. **New branch**:
   ```bash
   git checkout -b feat/amd-backend
   ```

2. **Add OpenAI-compat client option** in `src/index.ts` (or wherever the provider is wired):
   ```ts
   // pseudo — adapt to actual provider abstraction shape
   const provider = process.env.COUNCIL_BACKEND === "amd-vllm"
     ? new OpenAICompatProvider({
         baseURL: process.env.AMD_VLLM_BASE_URL!, // e.g. https://mi300x.lablab.ai/v1
         apiKey: process.env.AMD_VLLM_API_KEY!,
         model: process.env.AMD_VLLM_MODEL ?? "meta-llama/Llama-3.3-70B-Instruct",
       })
     : new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY! });
   ```

3. **Run one deliberation** to verify:
   ```bash
   COUNCIL_BACKEND=amd-vllm \
   AMD_VLLM_BASE_URL=https://your-mi300x-endpoint.example.com/v1 \
   AMD_VLLM_API_KEY=sk-... \
   npx tsx examples/founder-annual-billing.ts
   ```

4. **Capture timing + output**:
   - Latency (target: <30s for 5 parallel calls)
   - Per-voice score quality (should be similar to Anthropic; Llama 3.3 70B is the closest open-weights model in capability)
   - Total cost ($0 — AMD credit covers it)

## Deliverable when done

### 1. council-diff README paragraph

Add to the "Why this thesis is not new" section or as a new "Provider portability" section:

```markdown
**Provider portability proof** — council-diff also runs against AMD MI300X via vLLM. One-file swap in the provider abstraction. Latency: [X]s end-to-end across 5 parallel calls. Per-voice score quality: comparable to Anthropic Sonnet 4.6 on the [annual-billing/GOOGL/Rust/crypto] case study. Cost: covered by AMD Developer Hackathon Act II credit. Branch: [`feat/amd-backend`](https://github.com/alex-jb/council-diff/tree/feat/amd-backend).
```

### 2. council-for-slack README paragraph

Update [`docs/3week-upgrade-roadmap.md`](../../council-for-slack-2026/docs/3week-upgrade-roadmap.md) checkbox and add to the council-for-slack-2026 README right after the "Stack" section:

```markdown
**Provider-portable**: council-diff also runs unchanged against AMD MI300X via vLLM. See [`council-diff AMD branch`](https://github.com/alex-jb/council-diff/tree/feat/amd-backend).
```

### 3. Twitter/X demo tweet

```
council-diff runs unchanged against AMD MI300X via vLLM.

Same 5-persona deliberation. Same agreement score math. Same Brier audit at resolution.

One-file swap in the provider abstraction. Llama 3.3 70B in [X]s.

OSS, MIT, on npm:
npm install council-diff
```

## What this DOES NOT do

- Submit to AMD Developer Hackathon Act II (DEFER verdict per [`~/alex-brain/research/2026-06-16-amd-hackathon-reeval.md`](.) — submission split focus 6h that goes better into Slack polish)
- Replace Anthropic as default. Sonnet 4.6 stays the default for council-diff and Council for Slack.
- Anything for the 7/13 Slack submission directly. This is leverage proof for the pitch, not a feature.

## Timing

- 6/16 NOW: scaffold doc + branch placeholder (this file ✓)
- ANY-DAY when credit lands: 2h work as described above
- 6/30 deadline: if not done by then, defer permanently. Slack 7/13 polish is more leveraged.

## Backup plan

If AMD credit never arrives, fall back to RunPod or fal.ai with an MI300X-equivalent open-weights model. Cost ~$5 for 1 deliberation. Same README paragraph — the claim is "provider-portable", not "AMD-specific".
