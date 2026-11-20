package main

import (
	"log"

	"github.com/blakeglucas/bails/internal/generator/testcases/enum_from_imported_package/services"

	"github.com/blakeglucas/bails/pkg/application"
)

// GreetService is great
type GreetService struct {
	SomeVariable int
	lowerCase    string
}

// Greet does XYZ
func (*GreetService) Greet(name string, title services.Title) string {
	return "Hello " + title.String() + " " + name
}

func main() {
	app := application.New(application.Options{
		Services: []application.Service{
			application.NewService(&GreetService{}),
		},
	})

	app.Window.New()

	err := app.Run()

	if err != nil {
		log.Fatal(err)
	}

}
