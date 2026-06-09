# r/LocalLLaMA

**Title**:
Multi-voice council pattern — could swap Claude for any model that does structured JSON

**Body**:

OSS'd a TypeScript library called council-diff that gets 5 specialist verdicts on any decision from a single LLM call. Currently wired to Claude Sonnet 4.6 but the pattern would port to Qwen3 / Llama 3.3 / Mistral / any model that does structured JSON output.

The structure:
- 1 system prompt defines 5 specialist voices (e.g. for "founder" domain: YC Partner / VC / Lawyer / CFO / Spouse)
- 1 user message has the decision + context
- Model returns 5 verdicts in 1 JSON response — each with score 0-100, verdict, strength, gap
- Library computes agreement_score (1 - normalized stddev) and recommendation

Cost: 1 call instead of 5. Sonnet 4.6 is ~$0.03 per deliberation. With Qwen3-4B local you could get this to $0.

The interesting bit isn't the council itself — it's that asking for 5 voices in one call gets the voices to argue with each other inside the model's context window, which produces better disagreement than 5 parallel calls.

6 built-in domains: founder / engineer / investor / career / product / quant. Plus `custom` for your own voice rosters.

Code: github.com/alex-jb/council-diff (MIT, TypeScript, bilingual README EN + 中文)

Would love to hear if anyone wants to ship the same pattern locally — happy to chat about the prompt structure. The src/index.ts has the full Sonnet prompt; swap to OpenAI-compatible client and point at local llama.cpp / ollama / lm-studio and it should work as long as the model can hold the JSON schema.

Roadmap includes Python port + CLI.

What 4-7B model would you trust to hold 5 distinct personas in a single response?
