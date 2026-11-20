//bails:inject console.log("Hello everywhere!");
//bails:inject **:console.log("Hello everywhere again!");
//bails:inject *c:console.log("Hello Classes!");
//bails:inject *i:console.log("Hello Interfaces!");
//bails:inject j*:console.log("Hello JS!");
//bails:inject jc:console.log("Hello JS Classes!");
//bails:inject ji:console.log("Hello JS Interfaces!");
//bails:inject t*:console.log("Hello TS!");
//bails:inject tc:console.log("Hello TS Classes!");
//bails:inject ti:console.log("Hello TS Interfaces!");
package main

import (
	"log"

	"example.com/bails/internal/generator/testcases/directives/otherpackage"
	"example.com/bails/pkg/application"
)

type IgnoredType struct {
	Field int
}

//bails:inject j*:/**
//bails:inject j*: * @param {string} arg
//bails:inject j*: * @returns {Promise<void>}
//bails:inject j*: */
//bails:inject j*:export async function CustomMethod(arg) {
//bails:inject t*:export async function CustomMethod(arg: string): Promise<void> {
//bails:inject     await InternalMethod("Hello " + arg + "!");
//bails:inject }
type Service struct{}

func (*Service) VisibleMethod(otherpackage.Dummy) {}

//bails:ignore
func (*Service) IgnoredMethod(IgnoredType) {}

//bails:internal
func (*Service) InternalMethod(string) {}

func main() {
	app := application.New(application.Options{
		Services: []application.Service{
			application.NewService(&Service{}),
			application.NewService(&unexportedService{}),
			application.NewService(&InternalService{}),
		},
	})

	app.Window.New()

	err := app.Run()

	if err != nil {
		log.Fatal(err)
	}

}
