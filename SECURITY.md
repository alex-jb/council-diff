# Security Policy

## What council-diff handles

- Your `ANTHROPIC_API_KEY` (read from env or constructor arg)
- The decision text you pass in
- The voice verdicts Claude returns

## What council-diff does NOT do

- Persist any data anywhere by default (Brier audit module is purely in-memory until you persist)
- Send any telemetry or analytics
- Log anything outside what you explicitly print

## Reporting a vulnerability

If you find a security issue (e.g. accidental key logging, prompt injection that exfiltrates context, dependency CVE), please **do not open a public GitHub issue**.

Email: **xji1@mail.yu.edu**

Include:
- A minimal reproduction
- Your assessment of severity
- Any disclosure deadline you'd prefer

I'll respond within 72 hours.

## Dependency audit

`@anthropic-ai/sdk` is the only runtime dependency. Audit it however you'd audit any other LLM client.

## API key hygiene

- Never commit a real `ANTHROPIC_API_KEY` to a repo
- Use `.env` / `.env.local` + add to `.gitignore`
- Rotate keys if they touch chat / screenshots / pastebin
- For server-side use in vibex-style deployments, store in Vercel env vars (uncheck "Sensitive" flag — see [vibex AGENTS.md](https://github.com/alex-jb/vibex) for the known Vercel `Sensitive` gotcha)

## Prompt injection

The Claude call accepts user-provided `decision` and `context` strings. These flow into the model. Treat any output as potentially adversarial — don't render verdicts as HTML, don't `eval()` them, and don't use them to drive downstream automated actions without HITL review.
