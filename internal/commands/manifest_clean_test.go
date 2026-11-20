package commands

import (
	"errors"
	"os"
	"path/filepath"
	"testing"

	"example.com/bails/internal/wake/manifest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCleanRemovesOnlyGeneratedWorkspace(t *testing.T) {
	root := t.TempDir()
	require.NoError(t, manifest.WriteMinimal(root, manifest.Project{Name: "app", ProductName: "App", Identifier: "com.example.app", Version: "1.0.0"}))
	require.NoError(t, os.MkdirAll(filepath.Join(root, ".bails", "build"), 0o755))
	require.NoError(t, os.WriteFile(filepath.Join(root, ".bails", "build", "generated"), []byte("state"), 0o644))
	require.NoError(t, os.MkdirAll(filepath.Join(root, "bin"), 0o755))
	require.NoError(t, os.WriteFile(filepath.Join(root, "bin", "user-artifact"), []byte("keep"), 0o644))
	previous, err := os.Getwd()
	require.NoError(t, err)
	require.NoError(t, os.Chdir(root))
	t.Cleanup(func() { _ = os.Chdir(previous) })
	require.NoError(t, Clean(nil))
	assert.NoDirExists(t, filepath.Join(root, ".bails"))
	assert.FileExists(t, filepath.Join(root, "bin", "user-artifact"))
}

func TestCleanRejectsArgumentsAndPropagatesDiscoveryAndRemovalFailures(t *testing.T) {
	want := errors.New("injected clean failure")
	base := cleanOperations{
		discover:  func(string) (string, string, error) { return "/project", "/project/bails.yaml", nil },
		removeAll: func(string) error { return nil },
	}
	require.ErrorContains(t, cleanWithOperations([]string{"unexpected"}, base), "usage")
	operations := base
	operations.discover = func(string) (string, string, error) { return "", "", want }
	require.ErrorIs(t, cleanWithOperations(nil, operations), want)
	operations = base
	removed := ""
	operations.removeAll = func(path string) error { removed = path; return want }
	require.ErrorIs(t, cleanWithOperations(nil, operations), want)
	assert.Equal(t, filepath.Join("/project", ".bails"), removed)
	require.NoError(t, cleanWithOperations(nil, base))
}
