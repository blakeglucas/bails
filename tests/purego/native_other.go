//go:build !darwin

package main

import "github.com/blakeglucas/bails/pkg/application"

func checkPlatform(*application.App, *application.WebviewWindow) error { return nil }
