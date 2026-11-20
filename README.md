# bails

Build desktop and mobile applications using Go and web technologies.

bails is a fork of [Wails](https://wails.io), split into its own project. It
keeps Wails' architecture (Go backend, system WebView frontend, generated
bindings) and adds its own fixes on top.

## Layout

| Path | Contents |
| --- | --- |
| `cmd/bails` | The `bails` CLI |
| `pkg/` | Public Go packages (`pkg/application` is the app API) |
| `internal/` | CLI commands, templates, generators, platform code |
| `internal/runtime/desktop/@bails/runtime` | The JavaScript runtime (`@bails/runtime`) |
| `examples/` | Sample desktop and mobile apps |
| `scripts/upstream-sync` | Regenerates this tree from a Wails checkout |

## Install the CLI

```bash
go install -trimpath ./cmd/bails
bails version
```

## JavaScript runtime package

`@bails/runtime` is published to a private registry, `https://npm.bgcl.dev/`.
Generated projects and the examples ship a `frontend/.npmrc` that maps the
`@bails` scope to it; authenticate once before installing dependencies (bun,
pnpm and yarn read the same `.npmrc` and user credentials):

```bash
npm login --registry=https://npm.bgcl.dev/ --scope=@bails
```

The token lands in your user `~/.npmrc`; never commit it to a project. In CI,
write `//npm.bgcl.dev/:_authToken=${NPM_TOKEN}` to the user `.npmrc` from a
secret.

To publish it as part of a release, see [RELEASING.md](RELEASING.md).

## Frontend package manager

Builds detect the frontend's package manager instead of assuming npm, in this
order: a `PACKAGE_MANAGER` environment variable (Taskfile projects also accept
`bails build PACKAGE_MANAGER=pnpm`), the `packageManager` field in
`package.json`, a lockfile (`bun.lock`, `pnpm-lock.yaml`, `yarn.lock`,
`package-lock.json`), then bun if installed, then npm. If none is available, or
the detected manager is not installed, the build stops with an error.
`bails tool package-manager -v` prints the choice and the reason.

## Status

Android and iOS support is experimental.

## Syncing with Wails

The `upstream` branch holds renamed snapshots of Wails: what
`scripts/upstream-sync/split.py` produces from a Wails checkout by copying its
Go module, removing upstream-only material and renaming Wails to bails. It
contains no bails changes. Everything bails changes is an ordinary commit on
`main`, so edit any file freely.

To pull in newer Wails changes:

```bash
scripts/upstream-sync/sync.sh ~/Projects/wails   # commits a snapshot on upstream
git merge upstream
```

Git merges against the last synced snapshot, so only upstream's new changes
arrive, and they conflict only where bails changed the same lines. Generated
files (binding goldens, embedded runtime bundles, the setup wizard bundle)
often conflict; resolve those by regenerating rather than by hand:

```bash
python3 scripts/upstream-sync/split.py --regenerate .
```

Keep `split.py` purely mechanical. A bails decision added there would apply
to `upstream` and blur the line the merges rely on.

## License

MIT. bails is derived from Wails, copyright (c) 2018-present Lea Anthony; see
[LICENSE](LICENSE).
