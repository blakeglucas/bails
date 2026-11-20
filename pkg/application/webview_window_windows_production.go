//go:build windows && !server && production && !devtools

package application

import "example.com/bails/internal/webview2/pkg/edge"

func (w *windowsWebviewWindow) openDevTools() {}

func (w *windowsWebviewWindow) enableDevTools(settings *edge.ICoreWebViewSettings) error {
	return settings.PutAreDevToolsEnabled(false)
}
