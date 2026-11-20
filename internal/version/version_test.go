package version

import (
	"testing"

	"github.com/blakeglucas/bails/internal/debug"
)

func TestStringTrimsEmbeddedVersionWhitespace(t *testing.T) {
	originalVersion := versionString
	originalModulePath := debug.LocalModulePath
	t.Cleanup(func() {
		versionString = originalVersion
		debug.LocalModulePath = originalModulePath
	})

	versionString = "v0.1.0-beta.1\r\n"
	debug.LocalModulePath = ""

	if got := String(); got != "v0.1.0-beta.1" {
		t.Errorf("String() = %q, want %q", got, "v0.1.0-beta.1")
	}
}
