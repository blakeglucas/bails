package templates

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestCommonTemplateLeavesBuildConfigurationToTheManifestWriter(t *testing.T) {
	_, err := templates.ReadFile("_common/bails.tmpl.toml")
	require.Error(t, err)
	_, err = templates.ReadFile("_common/bails.tmpl.yaml")
	require.Error(t, err)
	_, err = templates.ReadFile("_common/Taskfile.tmpl.yml")
	require.Error(t, err)
}
