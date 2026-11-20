package commands

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"golang.org/x/image/draw"
	"gopkg.in/yaml.v3"
)

// IOSXcodeGenOptions holds parameters for Xcode project generation.
type IOSXcodeGenOptions struct {
	Icon   string `description:"Path to the application icon PNG"`
	OutDir string `description:"Output directory for generated Xcode project" default:"build/ios/xcode"`
	Config string `description:"Path to build/config.yml (optional)" default:"build/config.yml"`
	Force  bool   `description:"Regenerate even if the project is up to date"`
}

// generateIOSAppIcons creates required iOS AppIcon PNGs into appIconsetDir using inputIcon PNG.
func generateIOSAppIcons(inputIcon string, appIconsetDir string) error {
	in, err := os.Open(inputIcon)
	if err != nil {
		return err
	}
	defer in.Close()
	return generateIOSAppIconsFromReader(in, appIconsetDir)
}

// generateIOSAppIconsFromReader decodes an image source and writes all required sizes.
func generateIOSAppIconsFromReader(r io.Reader, appIconsetDir string) error {
	src, _, err := image.Decode(r)
	if err != nil {
		return fmt.Errorf("decode appicon: %w", err)
	}

	// Mapping: filename -> size(px) (unique keys only)
	sizes := map[string]int{
		"icon-20.png":      20,
		"icon-20@2x.png":   40,
		"icon-20@3x.png":   60,
		"icon-29.png":      29,
		"icon-29@2x.png":   58,
		"icon-29@3x.png":   87,
		"icon-40.png":      40,
		"icon-40@2x.png":   80,
		"icon-40@3x.png":   120,
		"icon-60@2x.png":   120,
		"icon-60@3x.png":   180,
		"icon-76.png":      76,
		"icon-76@2x.png":   152,
		"icon-83.5@2x.png": 167,
		"icon-1024.png":    1024,
	}

	// To avoid duplicate work, use a small cache of resized images by dimension
	cache := map[int]image.Image{}
	resize := func(dim int) image.Image {
		if img, ok := cache[dim]; ok {
			return img
		}
		dst := image.NewRGBA(image.Rect(0, 0, dim, dim))
		draw.CatmullRom.Scale(dst, dst.Bounds(), src, src.Bounds(), draw.Over, nil)
		cache[dim] = dst
		return dst
	}

	for filename, dim := range sizes {
		// Create output file
		outPath := filepath.Join(appIconsetDir, filename)
		f, err := os.Create(outPath)
		if err != nil {
			return err
		}
		if err := png.Encode(f, resize(dim)); err != nil {
			_ = f.Close()
			return fmt.Errorf("encode %s: %w", filename, err)
		}
		if err := f.Close(); err != nil {
			return err
		}
	}
	return nil
}

// iosBuildYAML is a permissive schema used to populate iOS project config from build/config.yml.
type iosBuildYAML struct {
	IOS struct {
		BundleID      string `yaml:"bundleID"`
		DisplayName   string `yaml:"displayName"`
		Version       string `yaml:"version"`
		Company       string `yaml:"company"`
		Comments      string `yaml:"comments"`
		MinIOSVersion string `yaml:"minIOSVersion"`
		// BackgroundModes templates UIBackgroundModes into Info.plist (e.g.
		// "fetch", "processing", "location", "audio", "voip", "remote-notification").
		BackgroundModes []string `yaml:"backgroundModes"`
		// DevelopmentTeam is the Apple Developer Team ID used for automatic signing.
		DevelopmentTeam string `yaml:"developmentTeam"`
	} `yaml:"ios"`
	Info struct {
		ProductName       string `yaml:"productName"`
		ProductIdentifier string `yaml:"productIdentifier"`
		Version           string `yaml:"version"`
		CompanyName       string `yaml:"companyName"`
		Comments          string `yaml:"comments"`
		Copyright         string `yaml:"copyright"`
		Description       string `yaml:"description"`
	} `yaml:"info"`
}

// loadIOSProjectConfig merges defaults with values from build/config.yml if present.
func loadIOSProjectConfig(configPath string, cfg *iOSProjectConfig) error {
	if configPath == "" {
		return nil
	}
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return nil
	}
	data, err := os.ReadFile(configPath)
	if err != nil {
		return err
	}
	var in iosBuildYAML
	if err := yaml.Unmarshal(data, &in); err != nil {
		return err
	}
	// Prefer ios.* if set, otherwise fall back to info.* where applicable
	if in.IOS.DisplayName != "" {
		cfg.ProductName = in.IOS.DisplayName
	} else if in.Info.ProductName != "" {
		cfg.ProductName = in.Info.ProductName
	}
	if in.IOS.BundleID != "" {
		cfg.ProductIdentifier = in.IOS.BundleID
	} else if in.Info.ProductIdentifier != "" {
		cfg.ProductIdentifier = in.Info.ProductIdentifier
	}
	if in.IOS.Version != "" {
		cfg.ProductVersion = in.IOS.Version
	} else if in.Info.Version != "" {
		cfg.ProductVersion = in.Info.Version
	}
	if in.IOS.Company != "" {
		cfg.ProductCompany = in.IOS.Company
	} else if in.Info.CompanyName != "" {
		cfg.ProductCompany = in.Info.CompanyName
	}
	if in.IOS.Comments != "" {
		cfg.ProductComments = in.IOS.Comments
	} else if in.Info.Comments != "" {
		cfg.ProductComments = in.Info.Comments
	}
	// Copyright comes from info.* for now (no iOS override defined yet)
	if in.Info.Copyright != "" {
		cfg.ProductCopyright = in.Info.Copyright
	}
	// Description comes from info.* for now (no iOS override defined yet)
	if in.Info.Description != "" {
		cfg.ProductDescription = in.Info.Description
	}
	if in.IOS.MinIOSVersion != "" {
		cfg.MinIOSVersion = in.IOS.MinIOSVersion
	}
	if len(in.IOS.BackgroundModes) > 0 {
		cfg.BackgroundModes = in.IOS.BackgroundModes
	}
	if team := in.IOS.DevelopmentTeam; team != "" {
		if !isAlphanumeric(team) {
			return fmt.Errorf("ios.developmentTeam must be alphanumeric, got %q", team)
		}
		cfg.DevelopmentTeam = team
	}
	return nil
}

// iOSProjectConfig is a minimal config used to fill templates. Extend later to read build/config.yml.
type iOSProjectConfig struct {
	ProductName        string
	BinaryName         string
	ProductIdentifier  string
	ProductVersion     string
	ProductCompany     string
	ProductComments    string
	ProductCopyright   string
	ProductDescription string
	MinIOSVersion      string
	BackgroundModes    []string
	DevelopmentTeam    string
}

// IOSXcodeGen generates an Xcode project skeleton for the current app.
func IOSXcodeGen(options *IOSXcodeGenOptions) error {
	outDir := options.OutDir
	if outDir == "" {
		outDir = filepath.Join("build", "ios", "xcode")
	}
	if err := os.MkdirAll(outDir, 0o755); err != nil {
		return err
	}

	// Create standard layout
	mainDir := filepath.Join(outDir, "main")
	if err := os.MkdirAll(mainDir, 0o755); err != nil {
		return err
	}
	// Create placeholder .xcodeproj dir
	xcodeprojDir := filepath.Join(outDir, "main.xcodeproj")
	if err := os.MkdirAll(xcodeprojDir, 0o755); err != nil {
		return err
	}

	// Prepare config with defaults, then merge from build/config.yml if present
	// BinaryName is left to Xcode, which names the executable after PRODUCT_NAME.
	cfg := iOSProjectConfig{
		ProductName:        "Bails App",
		BinaryName:         "$(EXECUTABLE_NAME)",
		ProductIdentifier:  "com.bails.app",
		ProductVersion:     "0.1.0",
		ProductCompany:     "",
		ProductComments:    "",
		ProductCopyright:   "",
		ProductDescription: "",
		MinIOSVersion:      "15.0",
	}
	if err := loadIOSProjectConfig(options.Config, &cfg); err != nil {
		return fmt.Errorf("parse config: %w", err)
	}

	inputIcon := options.Icon
	if inputIcon == "" {
		inputIcon = filepath.Join("build", "appicon.png")
	}
	fingerprint, err := iosXcodeFingerprint(cfg, inputIcon)
	if err != nil {
		return err
	}
	stampFile := filepath.Join(outDir, iosXcodeStampFile)
	if !options.Force && iosXcodeUpToDate(outDir, stampFile, fingerprint) {
		fmt.Println("Xcode project is up to date")
		return nil
	}

	// Render Info.plist
	if err := renderTemplateTo(updatableBuildAssets, "updatable_build_assets/ios/Info.plist.tmpl", filepath.Join(mainDir, "Info.plist"), cfg); err != nil {
		return fmt.Errorf("render Info.plist: %w", err)
	}
	// Render LaunchScreen.storyboard
	if err := renderTemplateTo(updatableBuildAssets, "updatable_build_assets/ios/LaunchScreen.storyboard.tmpl", filepath.Join(mainDir, "LaunchScreen.storyboard"), cfg); err != nil {
		return fmt.Errorf("render LaunchScreen.storyboard: %w", err)
	}

	// Copy main.m from assets (lives under build_assets)
	if err := copyEmbeddedFile(buildAssets, "build_assets/ios/main.m", filepath.Join(mainDir, "main.m")); err != nil {
		return fmt.Errorf("copy main.m: %w", err)
	}

	// Create Assets.xcassets/AppIcon.appiconset and Contents.json
	assetsDir := filepath.Join(mainDir, "Assets.xcassets", "AppIcon.appiconset")
	if err := os.MkdirAll(assetsDir, 0o755); err != nil {
		return err
	}
	if err := renderTemplateTo(updatableBuildAssets, "updatable_build_assets/ios/Assets.xcassets.tmpl", filepath.Join(assetsDir, "Contents.json"), cfg); err != nil {
		return fmt.Errorf("render AppIcon Contents.json: %w", err)
	}

	// Generate iOS AppIcon PNGs from build/appicon.png if present; otherwise use embedded default
	if _, err := os.Stat(inputIcon); err == nil || options.Icon != "" {
		if err := generateIOSAppIcons(inputIcon, assetsDir); err != nil {
			return fmt.Errorf("generate iOS icons: %w", err)
		}
	} else {
		if data, rerr := buildAssets.ReadFile("build_assets/appicon.png"); rerr == nil {
			if err := generateIOSAppIconsFromReader(bytes.NewReader(data), assetsDir); err != nil {
				return fmt.Errorf("generate default iOS icons: %w", err)
			}
		}
	}

	// Render project.pbxproj from template
	projectPbxproj := filepath.Join(xcodeprojDir, "project.pbxproj")
	if err := renderTemplateTo(updatableBuildAssets, "updatable_build_assets/ios/project.pbxproj.tmpl", projectPbxproj, cfg); err != nil {
		return fmt.Errorf("render project.pbxproj: %w", err)
	}
	// The template is shared with build-assets generation, so the team is added here.
	if cfg.DevelopmentTeam != "" {
		data, err := os.ReadFile(projectPbxproj)
		if err != nil {
			return err
		}
		const style = "CODE_SIGN_STYLE = Automatic;"
		data = []byte(strings.ReplaceAll(string(data), style, style+"\n\t\t\t\tDEVELOPMENT_TEAM = "+cfg.DevelopmentTeam+";"))
		if err := os.WriteFile(projectPbxproj, data, 0o644); err != nil {
			return err
		}
	}
	return os.WriteFile(stampFile, []byte(fingerprint+"\n"), 0o644)
}

// iosXcodeStampFile records the fingerprint of the last generation.
const iosXcodeStampFile = ".bails-xcodegen"

// iosXcodeGenFormat must be bumped when generator logic changes the output
// without a template change.
const iosXcodeGenFormat = "1"

// iosXcodeOutputs are the files a complete generation leaves behind.
var iosXcodeOutputs = []string{
	"main/Info.plist",
	"main/LaunchScreen.storyboard",
	"main/main.m",
	"main/Assets.xcassets/AppIcon.appiconset/Contents.json",
	"main.xcodeproj/project.pbxproj",
}

// iosXcodeFingerprint hashes everything the generated project depends on: the
// resolved config, the icon, and the embedded templates (so upgrading Bails
// regenerates the project).
func iosXcodeFingerprint(cfg iOSProjectConfig, icon string) (string, error) {
	h := sha256.New()
	h.Write([]byte(iosXcodeGenFormat))
	cfgJSON, err := json.Marshal(cfg)
	if err != nil {
		return "", err
	}
	h.Write(cfgJSON)
	if data, err := os.ReadFile(icon); err == nil {
		h.Write(data)
	}
	embedded := []struct {
		fsys fs.FS
		path string
	}{
		{updatableBuildAssets, "updatable_build_assets/ios/Info.plist.tmpl"},
		{updatableBuildAssets, "updatable_build_assets/ios/LaunchScreen.storyboard.tmpl"},
		{updatableBuildAssets, "updatable_build_assets/ios/Assets.xcassets.tmpl"},
		{updatableBuildAssets, "updatable_build_assets/ios/project.pbxproj.tmpl"},
		{buildAssets, "build_assets/ios/main.m"},
		{buildAssets, "build_assets/appicon.png"},
	}
	for _, e := range embedded {
		data, err := fs.ReadFile(e.fsys, e.path)
		if err != nil {
			return "", err
		}
		h.Write(data)
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}

func iosXcodeUpToDate(outDir, stampFile, fingerprint string) bool {
	stamp, err := os.ReadFile(stampFile)
	if err != nil || strings.TrimSpace(string(stamp)) != fingerprint {
		return false
	}
	for _, f := range iosXcodeOutputs {
		if _, err := os.Stat(filepath.Join(outDir, f)); err != nil {
			return false
		}
	}
	return true
}

// renderTemplateTo reads a template file from an embed FS and writes it to dest using data.
func renderTemplateTo(efs fs.FS, templatePath, dest string, data any) error {
	raw, err := fs.ReadFile(efs, templatePath)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return err
	}
	t, err := template.New(filepath.Base(templatePath)).Parse(string(raw))
	if err != nil {
		return err
	}
	f, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer func() { _ = f.Close() }()
	return t.Execute(f, data)
}

// copyEmbeddedFile writes a file from an embed FS path to dest.
func copyEmbeddedFile(efs fs.FS, src, dest string) error {
	data, err := fs.ReadFile(efs, src)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return err
	}
	return os.WriteFile(dest, data, 0o644)
}

// IOSXcodeGenCmd is a CLI entry compatible with NewSubCommandFunction.
// Defaults:
//
//	config: ./build/config.yml (optional)
//	out:    ./build/ios/xcode
func IOSXcodeGenCmd() error {
	out := filepath.Join("build", "ios", "xcode")
	cfg := filepath.Join("build", "config.yml")
	return IOSXcodeGen(&IOSXcodeGenOptions{OutDir: out, Config: cfg})
}

func isAlphanumeric(s string) bool {
	for _, r := range s {
		if !(r >= 'A' && r <= 'Z' || r >= 'a' && r <= 'z' || r >= '0' && r <= '9') {
			return false
		}
	}
	return true
}
