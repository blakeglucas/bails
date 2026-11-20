package application

import (
	"strings"
	"testing"

	"github.com/blakeglucas/bails/internal/runtime"
)

func TestRuntimeScriptIfMissing(t *testing.T) {
	core := runtime.Core(nil)
	got := runtimeScriptIfMissing(core)

	const guard = "if(!(window._bails&&window._bails.environment)){"
	if !strings.HasPrefix(got, guard) || !strings.HasSuffix(got, "}") {
		t.Fatalf("script not wrapped in environment guard: %q", got)
	}
	if !strings.Contains(got, core) {
		t.Fatal("guarded script does not contain the runtime core")
	}
	if !strings.Contains(core, "window._bails.environment=") {
		t.Fatal("runtime core does not set window._bails.environment")
	}
}
