//go:build android && !server

package application

import "github.com/blakeglucas/bails/internal/runtime"

// androidRuntimeScript returns the runtime bootstrap (window._bails, including
// the environment). app may be nil: the shell fetches it before Go main runs.
// NOTE: flags are therefore omitted from the document-start script; if Android
// ever returns flags from GetFlags, they must be delivered separately.
func androidRuntimeScript(app *App) string {
	var flags map[string]any
	if app != nil && app.impl != nil {
		flags = app.impl.GetFlags(app.options)
	}
	return runtime.Core(flags)
}
