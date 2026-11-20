package config

// BailsAppPkgPath is the official import path of Bails's application package.
const BailsAppPkgPath = "example.com/bails/pkg/application"

// BailsInternalPkgPath is the official import path of Bails's internal package.
const BailsInternalPkgPath = "example.com/bails/internal"

// SystemPaths holds resolved paths of required system packages.
type SystemPaths struct {
	ContextPackage     string
	TimePackage        string
	ApplicationPackage string
	InternalPackage    string
}
