//go:build windows && !server && (!production || devtools)

package application

import "github.com/blakeglucas/bails/internal/webview2/pkg/edge"

func (w *windowsWebviewWindow) openDevTools() {
	w.chromium.OpenDevToolsWindow()
}

func (w *windowsWebviewWindow) enableDevTools(settings *edge.ICoreWebViewSettings) error {
	return settings.PutAreDevToolsEnabled(true)
}
