package commands

import (
	"example.com/bails/internal/version"
)

type VersionOptions struct{}

func Version(_ *VersionOptions) error {
	DisableFooter = true
	println(version.String())
	return nil
}
