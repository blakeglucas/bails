//go:build darwin && !ios

#ifndef WebviewPanel_h
#define WebviewPanel_h

#import "webview_window_darwin.h"

@interface WebviewPanel : NSPanel <BailsWebviewWindow>
- (BOOL)canBecomeKeyWindow;
- (BOOL)canBecomeMainWindow;
- (BOOL)acceptsFirstResponder;
- (BOOL)becomeFirstResponder;
- (BOOL)resignFirstResponder;

@property (assign) WKWebView* webView;
@property BOOL disableEscapeExitsFullscreen;

@end

#endif /* WebviewPanel_h */
