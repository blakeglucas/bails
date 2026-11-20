package main

// An exported but internal model.
//
//bails:internal
type InternalModel struct {
	Field string
}

// An exported but internal service.
//
//bails:internal
type InternalService struct{}

func (InternalService) Method(InternalModel) {}
