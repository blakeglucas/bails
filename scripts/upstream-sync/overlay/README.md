# bails

Build desktop and mobile applications using Go and web technologies.

bails is a fork of [Wails](https://wails.io) v3, split into its own project. It
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

## Status

Android and iOS support is experimental.

## Syncing with Wails

`scripts/upstream-sync/split.py` generates this tree from a Wails checkout:
it copies `v3/`, removes upstream-only material and renames Wails to bails.
Files owned by bails, such as this README, live in
`scripts/upstream-sync/overlay/`.

## License

MIT. bails is derived from Wails, copyright (c) 2018-present Lea Anthony; see
[LICENSE](LICENSE).
