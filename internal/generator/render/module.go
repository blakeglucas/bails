package render

import (
	"example.com/bails/internal/flags"
	"example.com/bails/internal/generator/collect"
	"golang.org/x/tools/go/types/typeutil"
)

// module gathers data that is used when rendering a single JS/TS module.
type module struct {
	*Renderer
	*flags.GenerateBindingsOptions

	Imports *collect.ImportMap

	postponedCreates typeutil.Map
}

// Runtime returns the import path for the Bails JS runtime module.
func (m *module) Runtime() string {
	if m.UseBundledRuntime {
		return "/bails/runtime.js"
	} else {
		return "@bails/runtime"
	}
}
