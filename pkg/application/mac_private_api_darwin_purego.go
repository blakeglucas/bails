//go:build darwin && purego && !ios && !server && private_mac_apis

package application

import "strings"

// This file is the CGO-free counterpart of mac_private_api_darwin.go. It is the
// only purego file that may reference undocumented macOS selectors and KVC
// keys, so App Store builds exclude it with the default !private_mac_apis
// selection of mac_public_api_darwin_purego.go.
//
// Every function here must be called on the main thread, exactly like the
// cgo bridge it mirrors.

// bailsPrivateSetWebviewTransparent draws the webview without a background.
// WKWebView has no public API for this; drawsBackground is a private property
// that WebKit has honoured since WebKit1.
func bailsPrivateSetWebviewTransparent(webView id) {
	bailsSetKVCValue(webView, "drawsBackground", nsNumberBool(false))
}

// bailsPrivateSetWebviewBackgroundColour sets the webview background colour
// through the private backgroundColor key.
func bailsPrivateSetWebviewBackgroundColour(webView id, r, g, b, alpha int) {
	if webView.isNil() {
		return
	}
	colour := class("NSColor").send("colorWithRed:green:blue:alpha:",
		CGFloat(r)/255, CGFloat(g)/255, CGFloat(b)/255, CGFloat(alpha)/255)
	bailsSetKVCValue(webView, "backgroundColor", colour)
}

// bailsPrivateSetGlassStyle applies Bails' historic glass style mapping:
// vibrant borrows the light style, and light/dark are passed through as raw
// style values even though only regular (0) and clear (1) are documented.
func bailsPrivateSetGlassStyle(glassView id, style MacLiquidGlassStyle) {
	if !respondsTo(glassView, "setStyle:") {
		return
	}
	nativeStyle := style
	if style == LiquidGlassStyleVibrant {
		nativeStyle = LiquidGlassStyleLight
	}
	bailsSetKVCValue(glassView, "style", nsNumberInt(int(nativeStyle)))
}

// bailsPrivateSetGlassGrouping groups glass views across windows through the
// private setGroupIdentifier:/setGroupName: and groupSpacing selectors.
func bailsPrivateSetGlassGrouping(glassView id, groupID string, groupSpacing float64) {
	if glassView.isNil() {
		return
	}
	if groupID != "" {
		identifier := nsString(groupID)
		switch {
		case respondsTo(glassView, "setGroupIdentifier:"):
			glassView.send("setGroupIdentifier:", identifier)
		case respondsTo(glassView, "setGroupName:"):
			glassView.send("setGroupName:", identifier)
		}
	}
	if groupSpacing > 0 {
		bailsSetKVCValue(glassView, "groupSpacing", nsNumberDouble(groupSpacing))
	}
}

// bailsPrivateOpenWebInspector shows the Web Inspector through the private
// -[WKWebView _inspector] selector. A missing selector raises an uncatchable
// NSException in Go, so every send is guarded.
func bailsPrivateOpenWebInspector(webView id) {
	if webView.isNil() || !respondsTo(webView, "_inspector") {
		return
	}
	inspector := webView.send("_inspector")
	if !inspector.isNil() && respondsTo(inspector, "show") {
		inspector.send("show")
	}
}

// bailsPrivateEnableWebInspector enables developer extras through the private
// developerExtrasEnabled preference.
func bailsPrivateEnableWebInspector(webView id) {
	if webView.isNil() {
		return
	}
	prefs := webView.send("configuration").send("preferences")
	bailsSetKVCValue(prefs, "developerExtrasEnabled", nsNumberBool(true))
}

// kvcSetterSelectors returns the two setter selectors that KVC looks for when
// writing key: set<Key>: and _set<Key>:, with the first letter of the key
// capitalised. Setting the key itself still goes through setValue:forKey:
// with the original key.
func kvcSetterSelectors(key string) (string, string) {
	setter := "set" + strings.ToUpper(key[:1]) + key[1:] + ":"
	return setter, "_" + setter
}

// bailsSetKVCValue performs the KVC write that the cgo bridge wraps in
// @try/@catch. It skips the write unless the receiver implements a setter for
// the key, because an unsupported key raises an uncatchable NSException.
func bailsSetKVCValue(o id, key string, value id) {
	if o.isNil() {
		return
	}
	setter, privateSetter := kvcSetterSelectors(key)
	if !respondsTo(o, setter) && !respondsTo(o, privateSetter) {
		return
	}
	o.send("setValue:forKey:", value, nsString(key))
}
