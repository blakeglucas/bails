package commands

import (
	"github.com/blakeglucas/bails/internal/templates"
)

func GenerateTemplate(options *templates.BaseTemplate) error {
	return templates.GenerateTemplate(options)
}
