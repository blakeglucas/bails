package commands

import (
	"example.com/bails/internal/templates"
)

func GenerateTemplate(options *templates.BaseTemplate) error {
	return templates.GenerateTemplate(options)
}
