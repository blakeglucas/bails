package main

import (
	"embed"

	"log"

	"example.com/bails/pkg/application"
)

//go:embed assets/*
var assets embed.FS

func main() {

	app := application.New(application.Options{
		Name:        "Bails ML Demo",
		Description: "A demo of the Bails ML API",
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		Assets: application.AssetOptions{
			Handler: application.BundledAssetFileServer(assets),
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:  "Bails ML Demo",
		Width:  1280,
		Height: 1024,
		Mac: application.MacWindow{
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInsetUnified,
			InvisibleTitleBarHeight: 50,
		},
	})

	app.Event.On("button-pressed", func(_ *application.CustomEvent) {
		println("Button Pressed!")
	})
	app.Event.On("hover", func(_ *application.CustomEvent) {
		println("Hover time!")
	})

	err := app.Run()

	if err != nil {
		log.Fatal(err.Error())
	}
}
