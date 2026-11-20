# Syncing with Wails

bails is derived from the Wails v3 module and pulls in later Wails changes by
merging.

- The `upstream` branch holds renamed snapshots of Wails, produced by
  `scripts/upstream-sync/split.py`. That script copies Wails' Go module,
  removes upstream-only material, renames Wails to bails and rebuilds files
  derived from the module path. The branch contains no bails changes.
- `main` is upstream plus every bails change, as ordinary commits. Edit any
  file freely; nothing regenerates `main`.

A sync commits a fresh snapshot on `upstream` and merges it into `main`. Git
merges against the previous snapshot, so only what Wails changed since the
last sync arrives, and it conflicts only where bails changed the same lines.

## Requirements

- A Wails checkout (e.g. `~/Projects/wails`).
- Go, Node.js and npm, rsync, Python 3.
- A local `upstream` branch. In a fresh clone, create it from the remote:
  `git branch upstream origin/upstream`.

## 1. Update the Wails checkout

Check out the Wails commit you want, usually the latest `master`:

```bash
git -C ~/Projects/wails pull
```

The snapshot copies the checkout's `v3/` and `LICENSE` as they are on disk,
including uncommitted and untracked (non-ignored) files. Keep the checkout
clean so the snapshot matches a real Wails commit; `sync.sh` notes
"+ local changes" in the commit message when it isn't.

## 2. Commit a snapshot on `upstream`

From the bails repository:

```bash
scripts/upstream-sync/sync.sh ~/Projects/wails
```

This generates the snapshot in a temporary directory, commits it on
`upstream` in a temporary worktree, and leaves your working tree and current
branch alone. If Wails hasn't changed since the last sync it says so and
commits nothing.

To see what Wails changed since the last sync:

```bash
git log -1 upstream
git diff HEAD...upstream --stat
```

## 3. Merge into `main`

With a clean working tree on `main`:

```bash
git merge upstream
```

### Resolving conflicts

Conflicts mean Wails and bails changed the same or adjacent lines. Resolve them
as in any merge. Where Wails fixed something bails also fixed, prefer Wails'
version: every line bails keeps different from upstream is a potential
conflict in later syncs.

Generated files often conflict and should be rebuilt, not merged by hand:

- binding generator goldens (`internal/generator/testdata/output/`)
- embedded runtime bundles (`internal/assetserver/bundledassets/`)
- the setup wizard bundle (`internal/setupwizard/frontend/dist/`)

Resolve the source conflicts first, then rebuild all three:

```bash
python3 scripts/upstream-sync/split.py --regenerate .
git add -A
```

To give up on a merge and start again: `git merge --abort`.

## 4. Test and push

```bash
CI=true go test ./...
git commit               # if the merge stopped for conflicts
git push origin main upstream
```

Push `upstream` as well as `main`: it is the base the next sync merges
against, and a clone without it can't sync.

## What a sync does to bails changes

For a file bails changed, compared with what Wails did to it since the last
sync:

| Wails since the last sync | Result |
|---|---|
| Didn't touch the file | The bails change stays as it is. |
| Changed other parts of the file | Both changes merge automatically. |
| Changed the same or adjacent lines | Conflict on those lines only. |
| Made the identical change | Merges cleanly; the file matches upstream there again. |
| Made a different change for the same problem | Usually a conflict; consider taking Wails' version. |
| Deleted or moved the file | Modify/delete conflict, or git follows the move if the content is similar. |

Changes git sees as adjacent need at least one unchanged line between them to
merge silently.

## Changing `split.py`

Keep `split.py` purely mechanical: copying, stripping upstream-only material,
renaming, and regenerating derived files. A bails decision (a different
default, a removed feature, a rewritten link) belongs in a commit on `main`.
Put in the script it would also land on `upstream`, and the merges would no
longer show what Wails actually changed.

Changing the rename rules or the removal list changes every affected file in
the next snapshot, so that sync's merge is larger than usual and conflicts are
more likely near bails changes. Commit the script change on `main`, then sync
straight away so the snapshot and the script stay in step.

Removed from every snapshot (see `REMOVE` in `split.py`): Wails' README (bails
keeps its own), the docs site, website and CI workflows, release and
governance tooling, and build output Wails tracks despite its `.gitignore`.

## Troubleshooting

- **`error: no 'upstream' branch`**: create it from the remote
  (`git branch upstream origin/upstream`).
- **`'upstream' is already used by worktree`**: a previous sync was interrupted, or
  `upstream` is checked out elsewhere. Run `git worktree prune`, or switch the
  other worktree to another branch.
- **`patch failed: … not found`** from `split.py`: Wails changed a file the
  script edits during stripping (`patch_upstream_specifics`). Update that
  function to match the new upstream text.
