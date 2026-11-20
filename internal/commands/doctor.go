package commands

import (
	"github.com/blakeglucas/bails/internal/doctor"
	"github.com/blakeglucas/bails/internal/flags"
)

func Doctor(options *flags.Doctor) error {
	return doctor.Run(options.JSON)
}
