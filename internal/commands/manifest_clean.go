package commands

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/blakeglucas/bails/internal/wake/manifest"
)

// Clean removes only disposable Bails-owned state. It intentionally leaves
// build output and every user-owned path untouched; final artifacts require a
// future recorded-digest cleanup pass rather than a directory-wide delete.
func Clean(args []string) error {
	return cleanWithOperations(args, cleanOperations{
		discover:  manifest.Discover,
		removeAll: os.RemoveAll,
	})
}

type cleanOperations struct {
	discover  func(string) (string, string, error)
	removeAll func(string) error
}

func cleanWithOperations(args []string, operations cleanOperations) error {
	if len(args) != 0 {
		return fmt.Errorf("usage: bails clean")
	}
	root, _, err := operations.discover(".")
	if err != nil {
		return err
	}
	workspace := filepath.Join(root, ".bails")
	if err := operations.removeAll(workspace); err != nil {
		return fmt.Errorf("clean Bails workspace: %w", err)
	}
	fmt.Println("Removed .bails/ generated workspace; user-owned files and final artifacts were preserved")
	return nil
}
