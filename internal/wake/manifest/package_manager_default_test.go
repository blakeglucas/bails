package manifest_test

import "github.com/blakeglucas/bails/internal/wake/manifest"

// Pin frontend package-manager detection so results do not depend on which
// managers the test host has installed. internal/jspm covers detection itself.
func init() {
	manifest.DetectPackageManager = func(string) (string, error) { return "npm", nil }
}
