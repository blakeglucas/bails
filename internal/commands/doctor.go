package commands

import (
	"example.com/bails/internal/doctor"
	"example.com/bails/internal/flags"
)

func Doctor(options *flags.Doctor) error {
	return doctor.Run(options.JSON)
}
