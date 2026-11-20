//go:build !darwin

package main

import "example.com/bails/pkg/application"

func checkPlatform(*application.App, *application.WebviewWindow) error { return nil }
