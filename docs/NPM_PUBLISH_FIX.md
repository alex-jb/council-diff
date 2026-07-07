# npm publish failure — root cause + fix

**Status (2026-07-07):** 5 consecutive tag pushes (v0.3.0, v0.3.1, v0.4.0, v0.4.1, v0.4.2) all failed to publish to npm. npm registry version stuck at v0.2.x. Users doing `npm i council-diff` get stale code.

**Root cause:** The `NPM_TOKEN` GitHub Actions secret is empty (verified via the Actions run log — `NODE_AUTH_TOKEN:` blank).

## Fix (Alex-manual, ~3 minutes)

1. Log in to [npmjs.com](https://www.npmjs.com/) → click your avatar → **Access Tokens**
2. Click **Generate New Token → Granular Access Token**
3. Configure:
   - **Token name:** `council-diff-github-actions`
   - **Expiration:** 365 days (procurement-defensible without being annoying)
   - **Packages and scopes:** `council-diff` — read + write
   - **Organizations:** none
   - **IP allowlist:** empty (GitHub Actions IPs rotate)
4. Copy the generated token (starts with `npm_`)
5. On this repo:
   - Go to **Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   - **Name:** `NPM_TOKEN`
   - **Value:** the token from step 4
   - Click **Add secret**
6. Re-run the failed workflow:
   ```bash
   # From your terminal, in a fresh clone
   gh workflow run release.yml -f tag=v0.4.3
   # or push a fresh tag
   git tag v0.4.3
   git push origin v0.4.3
   ```
7. Verify:
   ```bash
   npm view council-diff version  # should show 0.4.3, not 0.2.x
   ```

## Why the workflow now fails-fast

The `Verify NPM_TOKEN secret is present` step runs before `npm publish`. If the token is missing or empty, it fails with a clear error message linking back to this file. Prevents 5-more-silent-failures.

## Alternate: OIDC-based publish (future upgrade)

npm added OIDC provenance publishing in 2024 that eliminates the need for a long-lived token. The workflow already sets `id-token: write` for provenance. Migrating to OIDC-only publish would remove the token entirely. Reference: [npm docs on trusted publishers](https://docs.npmjs.com/generating-provenance-statements). Not a July 2026 priority — the token path works fine.
