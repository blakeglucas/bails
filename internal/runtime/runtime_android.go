//go:build android

package runtime

// window.bails is the Android JavascriptInterface; it only accepts strings.
var invoke = "window._bails.invoke=function(m){return window.bails.invoke(typeof m==='string'?m:JSON.stringify(m));};"
var flags = ""
