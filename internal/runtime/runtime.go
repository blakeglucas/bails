package runtime

import (
	"fmt"

	"encoding/json"
)

var runtimeInit = `window._bails=window._bails||{};window._bails.flags=window._bails.flags||{};window.bails=window.bails||{};`
var runtimeConfigReady = `Promise.resolve().then(function(){window.dispatchEvent(new Event("bails:runtime-config-ready"));});`

func Core(flags map[string]any) string {
	flagsStr := ""
	if len(flags) > 0 {
		f, err := json.Marshal(flags)
		if err == nil {
			flagsStr += fmt.Sprintf("window._bails.flags=%s;", f)
		}
	}

	return runtimeInit + flagsStr + invoke + environment + runtimeConfigReady
}
