package main

import (
	"log"

	nobindingshere "example.com/bails/internal/generator/testcases/no_bindings_here"
	"example.com/bails/internal/generator/testcases/no_bindings_here/other"
	"example.com/bails/pkg/application"
)

// GreetService is great
type GreetService int

// EmbedService is tricky.
type EmbedService struct {
	nobindingshere.SomeMethods
}

// EmbedOther is even trickier.
type EmbedOther struct {
	other.OtherMethods
}

// Greet someone
func (*GreetService) Greet(string) {}

func main() {
	app := application.New(application.Options{
		Services: []application.Service{
			application.NewService(new(GreetService)),
			application.NewService(&EmbedService{}),
			application.NewService(&EmbedOther{}),
			application.NewService(&nobindingshere.SomeMethods{}),
			application.NewService(&other.OtherMethods{}),
		},
	})

	app.Window.New()

	err := app.Run()

	if err != nil {
		log.Fatal(err)
	}

}
