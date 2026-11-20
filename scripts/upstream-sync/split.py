#!/usr/bin/env python3
"""Generate the bails tree from a Wails checkout.

Copies v3/ (tracked and untracked-but-not-ignored files) into DEST as the new
root, removes upstream-only material, and renames Wails to bails throughout
file contents and paths. Re-run it against a newer Wails checkout to sync.

Bails-owned new files live in overlay/; bails-owned changes to upstream files
live in patches/*.patch (git diffs against the renamed tree, applied in order).

Usage: split.py --source ~/Projects/wails --dest ~/Projects/bails.new
"""

import argparse
import hashlib
import os
import re
import shutil
import subprocess
import sys

# --- Identity -----------------------------------------------------------------
NAME = "bails"                        # lowercase name; CLI binary is the same
MODULE = "github.com/blakeglucas/bails"  # Go module path
NPM_SCOPE = "@bails"                  # npm scope for the runtime package
NPM_REGISTRY = "https://npm.bgcl.dev/"  # registry serving NPM_SCOPE (needs credentials)
VERSION = "v0.1.0"                    # initial version (version.txt)
RELEASE_API = "https://api.github.com/repos/blakeglucas/bails"  # update/release-notes
REPO_URL = "https://github.com/blakeglucas/bails"

# --- Upstream-only material (paths relative to v3/) ---------------------------
REMOVE = [
    "AGENTS.md",
    "wep",
    "release_notes.md",
    "release-notes.txt",
    "tasks/release",
    "tasks/releasegate",
    "tasks/contribs",
    "scripts/generate-release-changelog.py",
    "scripts/test_generate_release_changelog.py",
    "scripts/validate-changelog.go",
    "scripts/validate-changelog_test.go",
    # Checks the dropped docs site is in sync with the manifest schema.
    "internal/wake/manifest/documentation_test.go",
    # Generated TypeDoc HTML for the dropped docs site.
    "internal/runtime/desktop/@wailsio/runtime/docs",
]

SELF_DIR = "scripts/upstream-sync"

Name = NAME.capitalize()
UPPER = NAME.upper()

URL_END = r"[^\s\"'<>)\]`]*"

# Links that stay pointing at upstream (docs and project history).
PROTECT = [
    re.compile(r"https?://[A-Za-z0-9.-]*wails\.io" + URL_END),
    re.compile(r"(?:https?://)?github\.com/wailsapp/wails/"
               r"(?:issues|pull|discussions|blob|tree|stargazers|commit|compare|releases)\b" + URL_END),
    # External dependencies published under the wailsapp org.
    re.compile(r"github\.com/wailsapp/(?:task|go-webview2|mimetype|updater-demo)\b"),
    # Historical references to real Wails v2 artifacts.
    re.compile(r"[Ww]ails v2\b"),
    # Identities baked into binary signing-test fixtures.
    re.compile(r"Wails Portable Signing Test Only|org\.wails\.probe"),
]

# Ordered (pattern, replacement) pairs applied after protection.
REPLACE = [
    (re.compile(r"https://api\.github\.com/repos/wailsapp/wails"), RELEASE_API),
    (re.compile(r"https://github\.com/wailsapp/wails\.git"), REPO_URL + ".git"),
    (re.compile(r"https://github\.com/wailsapp/wails\b"), REPO_URL),
    (re.compile(r"github\.com/wailsapp/wails/v3"), MODULE),
    (re.compile(r"github\.com/wailsapp/wails\b"), MODULE),
    (re.compile(r"@wailsio/"), NPM_SCOPE + "/"),
    (re.compile(r"v3\.0\.0-dev"), "v0.0.0-dev"),
    (re.compile(r"wails3"), NAME),
    (re.compile(r"Wails3"), Name),
    (re.compile(r"WAILS3"), UPPER),
    (re.compile(r"wailsapp"), NAME),
    (re.compile(r"wailsio"), NAME),
    (re.compile(r"WAILS"), UPPER),
    (re.compile(r"Wails"), Name),
    (re.compile(r"wails"), NAME),
]


# Applied after renaming: drop the v3 generation from names.
CLEANUP = [
    (re.compile(r"\b(" + Name + "|" + NAME + r") v3\b(?!\.)"), r"\1"),
    (re.compile(NAME + r"-v3-"), NAME + "-"),
]

# Old v3/ layout paths in prose. Not applied to Go files, where v3/ paths are
# legitimate (e.g. the cleanup task supports both layouts).
DOC_PATHS = [
    (re.compile(r"(?<![\w/.-])v3/(examples|pkg|internal|tests|test|scripts|cmd|tasks"
                r"|go\.mod|go\.sum|Taskfile\.yaml)\b"), r"\1"),
    (re.compile(NAME + r"(?:-v3)?/v3/"), NAME + "/"),
    (re.compile(r"(^|[\s`(])/v3/(?=(?:examples|pkg|internal|tests|test|scripts|cmd|tasks)\b)", re.M), r"\1/"),
]


def rename_text(text: str, docs: bool = False) -> str:
    saved = []

    def protect(m):
        saved.append(m.group(0))
        return f"\x00{len(saved) - 1}\x00"

    for pat in PROTECT:
        text = pat.sub(protect, text)
    for pat, repl in REPLACE + CLEANUP + (DOC_PATHS if docs else []):
        text = pat.sub(repl, text)
    return re.sub(r"\x00(\d+)\x00", lambda m: saved[int(m.group(1))], text)


# Files copied into generated projects (upstream paths). Their site and
# community links point at the bails repo; deep links into the Wails docs and
# schema URLs stay, as bails has no docs of its own.
PROJECT_FILES = (
    "internal/templates/",
    "internal/commands/build_assets/",
    "internal/commands/updatable_build_assets/",
    "internal/runtime/desktop/@wailsio/runtime/package.json",
)

PROJECT_LINKS = [
    (re.compile(r"Join the \[" + Name + r" Discord\]\([^)]*\) or visit the \["
                + Name + r" discussions on GitHub\]\([^)]*\)\."),
     f"Open an issue on the [{Name} repository]({REPO_URL}/issues)."),
    (re.compile(r"https://v3\.wails\.io/noit/done/yet"), REPO_URL),
    (re.compile(r"https?://(?:v3\.)?wails\.io/?(?=[\"'\s)<]|$)", re.M), REPO_URL),
]


def rebrand_project_links(rel: str, text: str) -> str:
    if not rel.startswith(PROJECT_FILES):
        return text
    for pat, repl in PROJECT_LINKS:
        text = pat.sub(repl, text)
    return text


def rename_text_path(rel: str) -> str:
    # The module path spans several directories (github.com/wailsapp/wails/v3),
    # so rename the whole relative path, not each component.
    return rename_text(rel)


def read_text(path):
    with open(path, "rb") as f:
        data = f.read()
    if b"\x00" in data:
        return None
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return None


def copy_tree(source_v3, dest):
    files = subprocess.run(
        ["git", "ls-files", "-co", "--exclude-standard", "-z"],
        cwd=source_v3, check=True, capture_output=True).stdout.split(b"\x00")
    for raw in files:
        if not raw:
            continue
        rel = raw.decode()
        src = os.path.join(source_v3, rel)
        if not os.path.isfile(src):  # deleted in the working tree
            continue
        dst = os.path.join(dest, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)


def remove_upstream_only(dest):
    for rel in REMOVE:
        path = os.path.join(dest, rel)
        if os.path.isdir(path):
            shutil.rmtree(path)
        elif os.path.exists(path):
            os.remove(path)
    # Lockfiles pinning the published runtime have registry URLs and hashes
    # that cannot be renamed.
    for root, _, names in os.walk(dest):
        if "package-lock.json" in names and "@wailsio" not in root:
            path = os.path.join(root, "package-lock.json")
            if '"node_modules/@wailsio/runtime"' in (read_text(path) or ""):
                os.remove(path)


def patch_file(dest, rel, pairs):
    path = os.path.join(dest, rel)
    text = read_text(path)
    for old, new in pairs:
        if old not in text:
            sys.exit(f"patch failed: {rel}: {old[:60]!r} not found")
        text = text.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def patch_upstream_specifics(dest):
    patch_file(dest, "Taskfile.yaml", [
        ("""  website:
    taskfile: ./website
    dir: ./website
    optional: true

  docs:
    taskfile: ../docs
    dir: ../docs
    optional: true
""", ""),
        ("""  release:
    summary: Release a new version of Wails. Call with `task v3:release -- <version>`
    dir: tasks/release
    cmds:
      - go run release.go {{.CLI_ARGS}}

""", ""),
    ])
    patch_file(dest, "cmd/wails3/main.go", [
        ('"github.com/wailsapp/wails/v3/internal/wake/manifest"\n',
         '"github.com/wailsapp/wails/v3/internal/wake/manifest"\n'
         '\t"github.com/wailsapp/wails/v3/internal/version"\n'),
        ('clir.NewCli("wails", "The Wails3 CLI", "v3")',
         'clir.NewCli("wails", "The Wails CLI", version.String())'),
    ])
    patch_file(dest, "internal/templates/_common/README.md", [
        ("1. Navigate to your project directory in the terminal.\n",
         "1. Navigate to your project directory in the terminal.\n\n"
         f"   The frontend installs `{NPM_SCOPE}/runtime` from a private registry\n"
         "   (see `frontend/.npmrc`). If you haven't yet, authenticate once:\n\n"
         "   ```\n"
         f"   npm login --registry={NPM_REGISTRY} --scope={NPM_SCOPE}\n"
         "   ```\n"),
    ])
    patch_file(dest, "scripts/generate-manifest-json-schema.go", [
        ('"../docs/mpress/static/schemas/wails.v3.json"', '"manifest.schema.json"'),
    ])
    patch_file(dest, "scripts/generate-manifest-schema.go", [
        ('"../docs/mpress/content/reference/wails-yaml-fields.md"', '"-"'),
    ])


def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def rename_tree(dest):
    # Stored SHA-256 digests of renamed files (migration fingerprints, golden
    # reports) are remapped to the renamed content's digests afterwards.
    digests = {}
    changed_go = []
    for root, dirs, names in os.walk(dest, topdown=True):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git")]
        for name in names:
            path = os.path.join(root, name)
            text = read_text(path)
            if text is None:
                continue
            new = rename_text(text, docs=not name.endswith(".go"))
            new = rebrand_project_links(os.path.relpath(path, dest).replace(os.sep, "/"), new)
            if new != text:
                if name.endswith(".go") and "testdata" not in path.split(os.sep):
                    changed_go.append(path)
                digests[sha256_hex(text)] = sha256_hex(new)
                lf_old, lf_new = text.replace("\r\n", "\n"), new.replace("\r\n", "\n")
                digests[sha256_hex(lf_old)] = sha256_hex(lf_new)
                mode = os.stat(path).st_mode
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new)
                os.chmod(path, mode)
    # The new module path sorts differently, so re-sort import groups.
    for i in range(0, len(changed_go), 200):
        subprocess.run(["gofmt", "-w", *changed_go[i:i + 200]], check=False)
    hex_digest = re.compile(r"\b[0-9a-f]{64}\b")
    for root, dirs, names in os.walk(dest):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git")]
        for name in names:
            path = os.path.join(root, name)
            text = read_text(path)
            if text is None:
                continue
            new = hex_digest.sub(lambda m: digests.get(m.group(0), m.group(0)), text)
            if new != text:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new)
    # Move paths (deepest first so parents are moved after their children).
    moves = []
    for root, dirs, names in os.walk(dest):
        for name in names:
            rel = os.path.relpath(os.path.join(root, name), dest)
            new = rename_text_path(rel)
            if new != rel:
                moves.append((rel, new))
    for rel, new in moves:
        dst = os.path.join(dest, new)
        if os.path.exists(dst):
            sys.exit(f"path collision: {rel} -> {new}")
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        os.rename(os.path.join(dest, rel), dst)
    # Remove directories left empty by the moves.
    for root, dirs, names in os.walk(dest, topdown=False):
        if not os.listdir(root):
            os.rmdir(root)


def set_versions(dest):
    with open(os.path.join(dest, "internal/version/version.txt"), "w") as f:
        f.write(VERSION)
    pkg = os.path.join(dest, f"internal/runtime/desktop/{NPM_SCOPE}/runtime/package.json")
    text = read_text(pkg)
    text = re.sub(r'("version":\s*")[^"]+"', r'\g<1>' + VERSION.lstrip("v") + '"', text, count=1)
    with open(pkg, "w", encoding="utf-8") as f:
        f.write(text)
    # Modules outside the major-version suffix may only use v0/v1 versions.
    for root, dirs, names in os.walk(dest):
        dirs[:] = [d for d in dirs if d != "node_modules"]
        for name in names:
            path = os.path.join(root, name)
            if name == "go.mod":
                text = read_text(path)
                text = re.sub(re.escape(MODULE) + r" v[2-9][^\s]*", MODULE + " v0.0.0", text)
                # Replace paths written against the old layout (e.g. ../../../v3
                # from v3/examples/x) must point at the new root instead.
                rel_dir = os.path.relpath(root, dest)

                def fix_replace(m):
                    old = os.path.normpath(os.path.join("/up/v3", rel_dir, m.group(2)))
                    if old != "/up/v3" or os.path.normpath(os.path.join(root, m.group(2))) == dest:
                        return m.group(0)
                    return m.group(1) + (os.path.relpath(dest, root) or ".")
                text = re.sub(r"(" + re.escape(MODULE) + r"(?: \S+)? => )(\.[^\s]*)", fix_replace, text)
                with open(path, "w", encoding="utf-8") as f:
                    f.write(text)
            elif name == "go.sum":
                lines = read_text(path).splitlines(keepends=True)
                kept = [l for l in lines if not l.startswith(MODULE + " ")]
                with open(path, "w", encoding="utf-8") as f:
                    f.writelines(kept)


NPMRC_SCOPE = f"""# {NPM_SCOPE} packages come from a private registry. Authenticate once with:
#   npm login --registry={NPM_REGISTRY} --scope={NPM_SCOPE}
# Never commit the token here; npm keeps it in your user ~/.npmrc.
{NPM_SCOPE}:registry={NPM_REGISTRY}
"""


def configure_npm(dest):
    import json
    runtime = f"{NPM_SCOPE}/runtime"
    # Generated projects: init renames frontend/npmrc to frontend/.npmrc. This
    # replaces upstream's minimum-release-age setting, which would hold back
    # freshly published @bails/runtime releases.
    npmrc = os.path.join(dest, "internal/templates/_common/frontend/npmrc")
    with open(npmrc, "w", encoding="utf-8") as f:
        f.write(NPMRC_SCOPE)
    # The runtime package publishes to the scope's registry.
    pkg_path = os.path.join(dest, f"internal/runtime/desktop/{runtime}/package.json")
    with open(pkg_path, encoding="utf-8") as f:
        pkg = json.load(f)
    pkg["bugs"] = {"url": REPO_URL + "/issues"}
    pkg["publishConfig"] = {"registry": NPM_REGISTRY}
    with open(pkg_path, "w", encoding="utf-8") as f:
        f.write(json.dumps(pkg, indent=2, ensure_ascii=False) + "\n")
    # Example and test frontends that install the runtime from the registry.
    major = VERSION.lstrip("v").split(".")[0]
    for root, dirs, names in os.walk(dest):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git")]
        if "package.json" not in names or root.startswith(os.path.join(dest, "internal")):
            continue
        path = os.path.join(root, "package.json")
        text = read_text(path)
        m = re.search(r'"' + re.escape(runtime) + r'":\s*"([^"]*)"', text or "")
        if not m or m.group(1).startswith(("file:", "link:", "workspace:")):
            continue
        # Pins to upstream's v3 line can never resolve against bails versions.
        pinned = re.match(r"[\^~]?(\d+)", m.group(1))
        if pinned and pinned.group(1) != major:
            text = text.replace(m.group(0), f'"{runtime}": "^{VERSION.lstrip("v")}"')
            with open(path, "w", encoding="utf-8") as f:
                f.write(text)
        rc = os.path.join(root, ".npmrc")
        if not os.path.exists(rc):
            with open(rc, "w", encoding="utf-8") as f:
                f.write(NPMRC_SCOPE)


def freeze_migration_fixture(dest):
    # Upstream's examples/badge Taskfiles are byte-identical to historical
    # generated projects, and migration tests use them as such. bails edits the
    # examples, so keep the original as a frozen fixture for those tests.
    shutil.copytree(os.path.join(dest, "examples/badge"),
                    os.path.join(dest, "internal/commands/testdata/migration/badge-stock"))


def apply_patches(dest, patches_dir):
    # bails-owned code changes to upstream files, as git diffs against the
    # renamed tree. On conflict after a sync, fix the patch and rerun.
    if not os.path.isdir(patches_dir):
        return
    env = dict(os.environ, GIT_CEILING_DIRECTORIES=os.path.dirname(dest))
    for name in sorted(os.listdir(patches_dir)):
        if not name.endswith(".patch"):
            continue
        result = subprocess.run(["git", "apply", "--binary", "--whitespace=nowarn",
                                 os.path.join(patches_dir, name)],
                                cwd=dest, env=env, capture_output=True, text=True)
        if result.returncode != 0:
            sys.exit(f"patch {name} does not apply:\n{result.stderr}")


def regenerate_goldens(dest):
    # Binding IDs hash fully-qualified Go names, which include the module path.
    gen = os.path.join(dest, "internal/generator")
    out = os.path.join(gen, "testdata/output")
    shutil.rmtree(out)
    os.makedirs(out)
    env = dict(os.environ, CI="true")
    subprocess.run(["go", "test", "-count=1", "-run", "^TestGenerator$", "."],
                   cwd=gen, env=env, capture_output=True)
    for root, _, names in os.walk(out):
        for name in names:
            if ".got." in name:
                os.remove(os.path.join(root, name))


def rebuild_runtime_bundles(dest):
    # The bundler orders exports and names temporaries by identifier, so the
    # embedded bundles must be rebuilt rather than renamed.
    pkg = os.path.join(dest, f"internal/runtime/desktop/{NPM_SCOPE}/runtime")
    runtime_dir = os.path.join(dest, "internal/runtime")
    subprocess.run(["npm", "ci", "--no-audit", "--no-fund", "--loglevel=error"],
                   cwd=pkg, check=True)
    for mode in ("debug", "production"):
        subprocess.run(["node", f"desktop/{NPM_SCOPE}/runtime/scripts/build-embedded.mjs", mode],
                       cwd=runtime_dir, check=True, stdout=subprocess.DEVNULL)
    shutil.rmtree(os.path.join(pkg, "node_modules"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True, help="Wails repository root")
    ap.add_argument("--dest", required=True, help="new directory to create")
    args = ap.parse_args()
    source_v3 = os.path.join(os.path.abspath(args.source), "v3")
    dest = os.path.abspath(args.dest)
    if os.path.exists(dest):
        sys.exit(f"{dest} already exists")
    copy_tree(source_v3, dest)
    shutil.copy2(os.path.join(args.source, "LICENSE"), os.path.join(dest, "LICENSE"))
    remove_upstream_only(dest)
    patch_upstream_specifics(dest)
    rename_tree(dest)
    set_versions(dest)
    configure_npm(dest)
    here = os.path.dirname(os.path.abspath(__file__))
    freeze_migration_fixture(dest)
    apply_patches(dest, os.path.join(here, "patches"))
    regenerate_goldens(dest)
    rebuild_runtime_bundles(dest)
    # Bails-owned files (README etc.) live in overlay/ next to this script.
    overlay = os.path.join(here, "overlay")
    if os.path.isdir(overlay):
        shutil.copytree(overlay, dest, dirs_exist_ok=True)
    self_dst = os.path.join(dest, SELF_DIR)
    os.makedirs(self_dst, exist_ok=True)
    shutil.copy2(os.path.abspath(__file__), os.path.join(self_dst, "split.py"))
    if os.path.isdir(overlay):
        shutil.copytree(overlay, os.path.join(self_dst, "overlay"), dirs_exist_ok=True)
    if os.path.isdir(os.path.join(here, "patches")):
        shutil.copytree(os.path.join(here, "patches"), os.path.join(self_dst, "patches"), dirs_exist_ok=True)
    print(f"Generated {dest}")


if __name__ == "__main__":
    main()
