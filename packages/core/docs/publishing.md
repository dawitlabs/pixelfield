# Publishing

## Why there is no NPM_TOKEN

npm is retiring token-based publishing:

- **November 2025** — legacy/classic tokens removed. Granular tokens only.
- **August 2026** — tokens with Bypass 2FA can no longer perform account-identity actions.
- **January 2027** — granular tokens combining bypass-2FA with direct-publish are removed.

A `NPM_TOKEN` secret would therefore stop working within months. This repo publishes with
**trusted publishing** instead: GitHub Actions mints a short-lived OIDC token, npm verifies
it against the configured publisher, and no long-lived credential exists anywhere.

## One-time setup on npmjs.com

The package must exist on the registry before a trusted publisher can be attached, so the
first release is manual and every release after it is automated.

1. Create the `@dawitlabs` org (the scope does not exist yet).
2. Publish `0.1.0` once from a local machine with 2FA at the prompt:
   ```sh
   cd packages/core
   pnpm build && pnpm test
   npm publish --access public
   ```
3. On npmjs.com open the package → **Settings → Trusted Publisher → GitHub Actions** and enter:
   - Organization or user: `dawitlabs`
   - Repository: `pixelfield`
   - Workflow filename: `publish.yml`
   - Environment: leave blank
4. Still in Settings, set publishing access to **Require trusted publishing**. That turns off
   token publishing for the package entirely.

## Every release after that

Create a GitHub Release. `publish.yml` runs, builds, tests, and publishes over OIDC.
Provenance attestations are generated automatically — no `--provenance` flag needed.

## Requirements the workflow already meets

- `permissions: id-token: write`
- Node 22.14.0 or newer
- npm CLI 11.5.1 or newer (the workflow upgrades npm before publishing)
