package commands

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"example.com/bails/internal/flags"
)

func TestBuildDoesNotRunTaskfileForDanglingManifest(t *testing.T) {
	t.Setenv("BAILS_EXP_USE_WAKE", "1")
	root := t.TempDir()
	t.Chdir(root)
	if err := os.Symlink("missing-native.yaml", filepath.Join(root, "bails.yaml")); err != nil {
		t.Skipf("symlinks unavailable: %v", err)
	}
	if err := os.WriteFile(filepath.Join(root, "go.mod"), []byte("module example.com/dangling-manifest\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	taskfile := "version: '3'\ntasks:\n  build:\n    cmds:\n      - 'echo legacy-executed > legacy-marker'\n"
	if err := os.WriteFile(filepath.Join(root, "Taskfile.yml"), []byte(taskfile), 0o644); err != nil {
		t.Fatal(err)
	}
	err := Build(&flags.Build{}, nil)
	if err == nil || !strings.Contains(err.Error(), "bails.yaml") {
		t.Errorf("build should report the unreadable native manifest, got %v", err)
	}
	if _, err := os.Stat(filepath.Join(root, "legacy-marker")); !os.IsNotExist(err) {
		t.Errorf("legacy task must never run, marker stat: %v", err)
	}
	footer := DisableFooter
	t.Cleanup(func() { DisableFooter = footer })
	if err := RunApplication(&RunOptions{Plan: true}, nil); err == nil || !strings.Contains(err.Error(), "bails.yaml") {
		t.Errorf("run must reject the manifest instead of planning go run, got %v", err)
	}
	if err := SigningSetup(&flags.SigningSetup{}); err == nil || !strings.Contains(err.Error(), "bails.yaml") {
		t.Errorf("signing setup must reject the manifest before selecting legacy configuration, got %v", err)
	}
}
