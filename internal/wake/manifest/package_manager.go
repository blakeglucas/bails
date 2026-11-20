package manifest

import (
	"fmt"
	"path/filepath"

	"github.com/blakeglucas/bails/internal/jspm"
)

// DetectPackageManager resolves the frontend package manager when bails.yaml
// leaves frontend.install, frontend.build and frontend.dev unset. Tests may
// replace it for deterministic results.
var DetectPackageManager = func(dir string) (string, error) {
	result, err := jspm.Detect(dir)
	return result.Name, err
}

// resolvePackageManager fills in the package manager for frontends without
// explicit commands: the project's own (package.json packageManager or
// lockfile), else bun, else npm. No usable manager is a load error.
func resolvePackageManager(config *Config) error {
	if config.Frontend.Disabled || config.Frontend.PackageManager != "" {
		return nil
	}
	name, err := DetectPackageManager(filepath.Join(config.Root, config.Frontend.Directory))
	if err != nil {
		return fmt.Errorf("frontend: %w", err)
	}
	config.Frontend.PackageManager = name
	return nil
}
