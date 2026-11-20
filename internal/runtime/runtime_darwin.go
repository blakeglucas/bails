//go:build darwin

package runtime

var invoke = "window._bails.invoke=function(msg){window.webkit.messageHandlers.external.postMessage(msg);};"
