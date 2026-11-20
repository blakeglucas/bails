//go:build !ios && !android

package main

import "example.com/bails/pkg/application"

// registerNativeFeatures is a no-op on desktop: the "common:*" mobile features
// are only available on iOS and Android.
func registerNativeFeatures(app *application.App) {}
