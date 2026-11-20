//go:build ios

package main

import "example.com/bails/pkg/application"

// modifyOptionsForIOS adjusts the application options for iOS
func modifyOptionsForIOS(opts *application.Options) {
	// Disable signal handlers on iOS to prevent crashes
	opts.DisableDefaultSignalHandler = true
}
