# Releasing

Releases are published to npm by `.github/workflows/release.yml` when a `v*` tag is pushed. The workflow typechecks, tests, builds, checks that `dist/` is committed and up to date, checks that the tag equals `v<package.json version>`, publishes with provenance, and creates a GitHub Release using the matching `CHANGELOG.md` section.

## Routine release

1. Update `CHANGELOG.md` with a `## <new version>` section (the release notes are taken from it).
2. Make sure `dist/` is rebuilt and committed (`npm run build`).
3. Bump, commit and tag: `npm version patch` (or `minor` / `major`). Edit the changelog before this so it is included, or amend afterwards.
4. Push: `git push --follow-tags`.

## One-time setup

The npm scope `@bartekrozycki/` requires that the npm account (or organization) is named `bartekrozycki`. If your npm username differs, rename the package in `package.json` to `@<your-npm-username>/copilot-paperclip-adapter` or to an unscoped name, and update the README install commands.

### First publish (local)

Trusted publishers can only be configured on a package that already exists on npm (npm docs, "Trusted publishing for npm packages"; the `npm trust` command also lists "the package must already exist" as a prerequisite). So the first publish is done locally:

```sh
npm login
npm publish --access public   # prepublishOnly runs typecheck, tests and build
```

(Local publishes cannot produce provenance; `publishConfig.provenance` only applies in supported CI. If npm refuses `provenance: true` locally, use `npm publish --access public --provenance=false`.)

Then push the tag so a GitHub Release exists: `git tag v0.1.0 && git push origin v0.1.0` would re-run the workflow and fail on "version already published", so for the first version create the release manually: `gh release create v0.1.0 --notes-file <(awk '/^## 0.1.0/{f=1;next} /^## /{f=0} f' CHANGELOG.md)`.

### Configure trusted publishing

On npmjs.com: package -> Settings -> Trusted publisher -> GitHub Actions:

- Organization or user: `bartekrozycki`
- Repository: `copilot-paperclip-adapter`
- Workflow filename: `release.yml`
- Environment: leave blank
- Allowed actions: permit `npm publish`

Requires npm CLI >= 11.5.1 and Node >= 22.14 (the workflow installs the latest npm). Equivalent CLI: `npm trust github @bartekrozycki/copilot-paperclip-adapter --file release.yml --repo bartekrozycki/copilot-paperclip-adapter --allow-publish`. Provenance is generated automatically for public repos published via OIDC.

Optionally then restrict the package to "Require two-factor authentication and disallow tokens" in package settings.

### Fallback: NPM_TOKEN

If OIDC is not set up, create a granular access token (read/write for this package, bypass 2FA) and store it:

```sh
gh secret set NPM_TOKEN --repo bartekrozycki/copilot-paperclip-adapter
```

When the secret is set the workflow uses it (`NODE_AUTH_TOKEN`) instead of OIDC. Delete it once trusted publishing works: `gh secret delete NPM_TOKEN`.
