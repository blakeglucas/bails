package commands

import (
	"github.com/blakeglucas/bails/internal/version"
)

type VersionOptions struct{}

func Version(_ *VersionOptions) error {
	DisableFooter = true
	println(version.String())
	return nil
}
