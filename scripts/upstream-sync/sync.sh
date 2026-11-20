#!/usr/bin/env bash
# Commit a fresh renamed snapshot of a Wails checkout on the `upstream` branch.
#
# Usage: scripts/upstream-sync/sync.sh ~/Projects/wails
#
# Then merge it into main (see "Syncing with Wails" in the README):
#   git merge upstream
#   python3 scripts/upstream-sync/split.py --regenerate .   # if generated files conflict
set -euo pipefail

source_repo=$(cd "${1:?usage: sync.sh <wails checkout>}" && pwd)
repo=$(git rev-parse --show-toplevel)
branch=upstream

if ! git -C "$repo" rev-parse --verify --quiet "refs/heads/$branch" >/dev/null; then
    echo "error: no '$branch' branch in $repo" >&2
    exit 1
fi

revision=$(git -C "$source_repo" rev-parse --short HEAD)
if [ -n "$(git -C "$source_repo" status --porcelain -- v3 LICENSE)" ]; then
    # The snapshot includes uncommitted and untracked (non-ignored) files.
    revision="$revision + local changes"
fi

work=$(mktemp -d)
cleanup() {
    git -C "$repo" worktree remove --force "$work/worktree" 2>/dev/null || true
    rm -rf "$work"
}
trap cleanup EXIT

python3 "$repo/scripts/upstream-sync/split.py" --source "$source_repo" --dest "$work/snapshot"

git -C "$repo" worktree add --quiet "$work/worktree" "$branch"
rsync -a --delete --exclude=.git "$work/snapshot/" "$work/worktree/"
# Force-add: the snapshot holds exactly the files upstream wants tracked.
git -C "$work/worktree" add -A -f
if git -C "$work/worktree" diff --cached --quiet; then
    echo "$branch already matches Wails $revision; nothing to merge."
    exit 0
fi
git -C "$work/worktree" commit --quiet -m "upstream: sync Wails $revision"
echo "Committed $(git -C "$repo" rev-parse --short "$branch") on $branch (Wails $revision)."
echo "Next: git merge $branch"
