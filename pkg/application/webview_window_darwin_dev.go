//go:build darwin && !ios && !server && (!production || devtools) && !purego

package application

/*
#cgo CFLAGS: -mmacosx-version-min=10.13 -x objective-c -DBAILS_MAC_DEVTOOLS
#cgo LDFLAGS: -framework Cocoa -framework WebKit

#include "webview_window_darwin.h"
#include "mac_private_api_darwin.h"

void windowEnableDevTools(void *window) {
    NSWindow<BailsWebviewWindow> *nsWindow = (NSWindow<BailsWebviewWindow> *)window;
#if MAC_OS_X_VERSION_MAX_ALLOWED >= 130300
    if (@available(macOS 13.3, *)) {
        nsWindow.webView.inspectable = YES;
        return;
    }
#endif
    bailsPrivateEnableWebInspector(window);
}
*/
import "C"

func (w *macosWebviewWindow) openDevTools() {
	C.bailsPrivateOpenWebInspector(w.nsWindow)
}

func (w *macosWebviewWindow) enableDevTools() {
	C.windowEnableDevTools(w.nsWindow)
}
