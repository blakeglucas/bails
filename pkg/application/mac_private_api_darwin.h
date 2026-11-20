//go:build darwin && !ios && !server

#ifndef BailsMacPrivateAPI_h
#define BailsMacPrivateAPI_h

// Internal bridge only; the public Go API is identical in both builds.
// mac_private_api_darwin.go implements all private macOS calls and requires
// -tags private_mac_apis. mac_public_api_darwin.go supplies public alternatives
// or no-ops by default. Do not put private selectors or keys in this header.

void bailsPrivateSetWebviewTransparent(void *webView);
void bailsPrivateSetWebviewBackgroundColour(void *webView, int r, int g, int b, int alpha);
void bailsPrivateSetGlassStyle(void *glassView, int style);
void bailsPrivateSetGlassGrouping(void *glassView, const char *groupID, double groupSpacing);

#ifdef BAILS_MAC_DEVTOOLS
void bailsPrivateOpenWebInspector(void *window);
void bailsPrivateEnableWebInspector(void *window);
#endif

#endif /* BailsMacPrivateAPI_h */
