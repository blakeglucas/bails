package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"runtime"

	"github.com/blakeglucas/bails/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

type AcceptanceService struct{}

func (*AcceptanceService) Ping(value string) string { return "go-response:" + value }
func (*AcceptanceService) Confirm(value string) {
	log.Print("YAML_STDERR_LOG_PASS")
	fmt.Printf("YAML_BINDING_ROUNDTRIP %s platform=%s/%s\n", value, runtime.GOOS, runtime.GOARCH)
}
func main() {
	args, _ := json.Marshal(os.Args[1:])
	fmt.Printf("YAML_APP_ARGS %s\n", args)
	app := application.New(application.Options{Name: "Bails Dev Acceptance", Services: []application.Service{application.NewService(&AcceptanceService{})}, Assets: application.AssetOptions{Handler: application.AssetFileServerFS(assets)}})
	app.Window.NewWithOptions(application.WebviewWindowOptions{Title: "Bails Dev Acceptance", URL: "/"})
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
