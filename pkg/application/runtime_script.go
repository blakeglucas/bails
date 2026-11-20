package application

// runtimeScriptIfMissing guards a runtime bootstrap so a late injection does
// not overwrite one already installed at document start.
func runtimeScriptIfMissing(script string) string {
	return "if(!(window._bails&&window._bails.environment)){" + script + "}"
}
