package commands

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestIOSXcodeProjectRetainsObjectiveCClasses(t *testing.T) {
	output := filepath.Join(t.TempDir(), "project.pbxproj")
	err := renderTemplateTo(
		updatableBuildAssets,
		"updatable_build_assets/ios/project.pbxproj.tmpl",
		output,
		iOSProjectConfig{ProductName: "Test App", ProductIdentifier: "com.bails.test"},
	)
	require.NoError(t, err)

	data, err := os.ReadFile(output)
	require.NoError(t, err)
	project := string(data)

	for _, configuration := range []string{"Debug", "Release"} {
		t.Run(configuration, func(t *testing.T) {
			marker := "/* " + configuration + " */ = {"
			_, remainder, found := strings.Cut(project, marker)
			require.True(t, found, "%s build configuration should be present", configuration)
			buildSettings, _, found := strings.Cut(remainder, "\n\t\t};")
			require.True(t, found, "%s build configuration should be complete", configuration)

			assert.Equal(t, 1, strings.Count(buildSettings, "OTHER_LDFLAGS = ("),
				"build configuration should define linker flags once")
			assert.Equal(t, 1, strings.Count(buildSettings, `"$(inherited)",`),
				"build configuration should preserve inherited linker flags")
			assert.Equal(t, 1, strings.Count(buildSettings, `"-ObjC",`),
				"build configuration should retain Objective-C classes from the Go archive")
		})
	}
}

func TestIOSXcodeGenSigningAndExecutable(t *testing.T) {
	dir := t.TempDir()
	config := filepath.Join(dir, "config.yml")
	require.NoError(t, os.WriteFile(config, []byte("info:\n  productName: \"My Product\"\nios:\n  developmentTeam: \"ABCDE12345\"\n"), 0o644))
	out := filepath.Join(dir, "xcode")
	require.NoError(t, IOSXcodeGen(&IOSXcodeGenOptions{OutDir: out, Config: config}))

	plist, err := os.ReadFile(filepath.Join(out, "main", "Info.plist"))
	require.NoError(t, err)
	assert.Contains(t, string(plist), "<key>CFBundleExecutable</key>\n    <string>$(EXECUTABLE_NAME)</string>")

	project, err := os.ReadFile(filepath.Join(out, "main.xcodeproj", "project.pbxproj"))
	require.NoError(t, err)
	assert.NotContains(t, string(project), "CODE_SIGNING_ALLOWED")
	assert.Equal(t, 2, strings.Count(string(project), "CODE_SIGN_STYLE = Automatic;"))
	assert.Equal(t, 2, strings.Count(string(project), "DEVELOPMENT_TEAM = ABCDE12345;"))
}

func TestIOSXcodeGenRejectsInvalidTeam(t *testing.T) {
	dir := t.TempDir()
	config := filepath.Join(dir, "config.yml")
	require.NoError(t, os.WriteFile(config, []byte("ios:\n  developmentTeam: \"AB; X = Y\"\n"), 0o644))
	err := IOSXcodeGen(&IOSXcodeGenOptions{OutDir: filepath.Join(dir, "xcode"), Config: config})
	assert.ErrorContains(t, err, "developmentTeam")
}

func TestIOSXcodeGenSkipsWhenUpToDate(t *testing.T) {
	dir := t.TempDir()
	config := filepath.Join(dir, "config.yml")
	require.NoError(t, os.WriteFile(config, []byte("info:\n  productName: \"One\"\n"), 0o644))
	out := filepath.Join(dir, "xcode")
	opts := &IOSXcodeGenOptions{OutDir: out, Config: config}
	require.NoError(t, IOSXcodeGen(opts))

	project := filepath.Join(out, "main.xcodeproj", "project.pbxproj")
	const marker = "// manual edit"
	appendMarker := func() {
		f, err := os.OpenFile(project, os.O_APPEND|os.O_WRONLY, 0)
		require.NoError(t, err)
		_, err = f.WriteString(marker)
		require.NoError(t, err)
		require.NoError(t, f.Close())
	}
	hasMarker := func() bool {
		data, err := os.ReadFile(project)
		require.NoError(t, err)
		return strings.Contains(string(data), marker)
	}

	appendMarker()
	require.NoError(t, IOSXcodeGen(opts))
	assert.True(t, hasMarker(), "unchanged inputs should not regenerate")

	opts.Force = true
	require.NoError(t, IOSXcodeGen(opts))
	assert.False(t, hasMarker(), "-force should regenerate")
	opts.Force = false

	appendMarker()
	require.NoError(t, os.WriteFile(config, []byte("info:\n  productName: \"Two\"\n"), 0o644))
	require.NoError(t, IOSXcodeGen(opts))
	assert.False(t, hasMarker(), "config change should regenerate")

	appendMarker()
	require.NoError(t, os.Remove(filepath.Join(out, "main", "Info.plist")))
	require.NoError(t, IOSXcodeGen(opts))
	assert.False(t, hasMarker(), "missing output should regenerate")
	assert.FileExists(t, filepath.Join(out, "main", "Info.plist"))
}
