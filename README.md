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

Publish from `internal/runtime/desktop/@bails/runtime` with `npm publish`
(`publishConfig` already targets the registry).

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

`scripts/upstream-sync/split.py` generates this tree from a Wails checkout:
it copies the Wails Go module, removes upstream-only material and renames Wails to bails.
New files owned by bails, such as this README, live in
`scripts/upstream-sync/overlay/`. Changes to upstream files live in
`scripts/upstream-sync/patches/*.patch`: git diffs against the renamed tree,
applied in order. To change an upstream file, edit it here, then regenerate its
patch with `git diff --binary` against the split output (keeping files the
script itself writes out of it), and rerun the split to confirm it reproduces
the tree.

## License

MIT. bails is derived from Wails, copyright (c) 2018-present Lea Anthony; see
[LICENSE](LICENSE).
