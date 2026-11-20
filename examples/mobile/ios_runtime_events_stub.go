//go:build !ios

package main

import "example.com/bails/pkg/application"

// Non-iOS: no-op so examples build on other platforms
func registerIOSRuntimeEventHandlers(app *application.App) {}
