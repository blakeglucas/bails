package version

import (
	_ "embed"
	"strings"

	"example.com/bails/internal/debug"
)

//go:embed version.txt
var versionString string

const DevVersion = "v0.0.0-dev"

func String() string {
	if !IsDev() {
		return strings.TrimSpace(versionString)
	}
	return DevVersion
}

func LatestStable() string {
	return strings.TrimSpace(versionString)
}

func IsDev() bool {
	return debug.LocalModulePath != ""
}
