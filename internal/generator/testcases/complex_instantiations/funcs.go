package main

import "example.com/bails/pkg/application"

func ServiceInitialiser[T any]() func(*T) application.Service {
	return application.NewService[T]
}

func CustomNewServices[T any, U any]() []application.Service {
	return []application.Service{
		application.NewService(new(T)),
		application.NewService(new(U)),
	}
}
