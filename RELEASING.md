# Releasing bails

A release has three parts:

- a Go tag (`vX.Y.Z`), which `go install …@vX.Y.Z`, `bails update cli` and
  generated projects' `go.mod` resolve;
- the `@bails/runtime` npm package of the same version, published to
  `https://npm.bgcl.dev/`, which generated projects' frontends install;
- optionally, a GitHub release, whose notes `bails releasenotes` shows.

Do them in the order below. A pushed Go tag cannot be taken back: once the Go
module proxy has fetched a version it is cached permanently, so publish and
check the npm package first, and fix mistakes in a new patch release rather
than by moving a tag.

## 1. Prepare

On `main`, with a clean working tree:

1. Set the version in both places (they must match):
   - `internal/version/version.txt`, e.g. `v0.2.0`
   - `"version"` in `internal/runtime/desktop/@bails/runtime/package.json`,
     e.g. `0.2.0`
2. Run the tests:

   ```bash
   CI=true go test ./...
   ```

3. Commit and push: `git commit -am "release: v0.2.0" && git push`

`bails update cli` only offers releases in the CLI's own major version line
(the major version in `version.txt`), so a `v1.0.0` tag is not offered to `v0`
users.

## 2. Publish the runtime package

From `internal/runtime/desktop/@bails/runtime`:

```bash
npm ci
npm run clean && npm run build:code
npm publish --ignore-scripts
rm -rf node_modules
```

Plain `npm publish` runs the package's full build first, which calls
`task generate:events` and needs the standalone `task` CLI. The steps above
skip it. That is safe as long as the generated event files are current: run
`bails task generate:events` in `internal/runtime` and confirm `git status` is
clean.

Publishing needs a login to the registry (stored in your user `~/.npmrc`):

```bash
npm login --registry=https://npm.bgcl.dev/ --scope=@bails
```

`publishConfig` in `package.json` already sends the package to that registry.
Check it arrived:

```bash
npm view @bails/runtime versions --registry=https://npm.bgcl.dev/
```

## 3. Tag

```bash
git tag -a v0.2.0 -m "bails v0.2.0"
git push origin v0.2.0
```

## 4. GitHub release (optional)

On GitHub: Releases → Draft a new release → choose the tag → write the notes →
Publish. `bails update cli` only needs the tag; `bails releasenotes` shows the
release body.

## 5. Check

Install the release the way a user would, then create and build a project:

```bash
cd /tmp
GOPROXY=direct go install github.com/blakeglucas/bails/cmd/bails@v0.2.0
bails version                      # v0.2.0
bails init -n hello -t vanilla && cd hello && bails build
```

`GOPROXY=direct` avoids waiting for the Go proxy to notice the new tag. This
replaces any `bails` you built from a checkout; run `go install ./cmd/bails`
in the repository afterwards to restore your development build.

A CLI built from a checkout (without `-trimpath`) reports `v0.0.0-dev` and
points new projects at that checkout with a `replace` directive, so use the
installed release for this check.

## Notes

- Syncing with Wails never conflicts with version bumps: the `upstream` branch
  always holds the same fixed values in `version.txt` and the runtime
  `package.json`.
- If a release is broken, publish a new patch release with the fix. Don't
  reuse or move a tag.
