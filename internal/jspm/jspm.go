// Package jspm detects which JavaScript package manager a frontend uses.
//
// Detection order:
//  1. the PACKAGE_MANAGER environment variable (explicit override);
//  2. the "packageManager" field of package.json (e.g. "pnpm@9.12.0");
//  3. a lockfile in the frontend directory;
//  4. bun, when it is installed;
//  5. npm, when it is installed.
//
// When none applies, or the detected manager is not installed, Detect fails:
// silently switching managers would ignore the project's lockfile.
package jspm

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
)

// EnvOverride names the environment variable that forces a package manager.
const EnvOverride = "PACKAGE_MANAGER"

// Supported lists the package managers bails can drive.
var Supported = []string{"bun", "pnpm", "yarn", "npm"}

// lockfiles maps lockfile names to their package manager, in precedence order
// for directories that (unusually) contain more than one.
var lockfiles = []struct{ file, manager string }{
	{"bun.lock", "bun"},
	{"bun.lockb", "bun"},
	{"pnpm-lock.yaml", "pnpm"},
	{"yarn.lock", "yarn"},
	{"package-lock.json", "npm"},
	{"npm-shrinkwrap.json", "npm"},
}

// ErrNotFound reports that no supported package manager is installed.
var ErrNotFound = errors.New("no JavaScript package manager found: install bun (https://bun.sh) or npm (https://nodejs.org)")

// Result is a detected package manager and why it was chosen.
type Result struct {
	Name   string
	Reason string
}

// Environment abstracts process lookups so detection is testable.
type Environment struct {
	LookPath func(string) (string, error)
	Getenv   func(string) string
	ReadFile func(string) ([]byte, error)
	Stat     func(string) (os.FileInfo, error)
}

// System is the real process environment.
var System = Environment{LookPath: exec.LookPath, Getenv: os.Getenv, ReadFile: os.ReadFile, Stat: os.Stat}

// Detect returns the package manager for the frontend in dir.
func Detect(dir string) (Result, error) { return System.Detect(dir) }

// Detect returns the package manager for the frontend in dir.
func (env Environment) Detect(dir string) (Result, error) {
	if name := strings.TrimSpace(env.Getenv(EnvOverride)); name != "" {
		return env.require(name, EnvOverride+" is set")
	}
	if name, ok := env.declared(dir); ok {
		return env.require(name, `package.json declares "packageManager"`)
	}
	for _, lock := range lockfiles {
		if _, err := env.Stat(filepath.Join(dir, lock.file)); err == nil {
			return env.require(lock.manager, "found "+lock.file)
		}
	}
	for _, name := range []string{"bun", "npm"} {
		if _, err := env.LookPath(name); err == nil {
			return Result{Name: name, Reason: "no lockfile; using installed " + name}, nil
		}
	}
	return Result{}, ErrNotFound
}

func (env Environment) declared(dir string) (string, bool) {
	data, err := env.ReadFile(filepath.Join(dir, "package.json"))
	if err != nil {
		return "", false
	}
	var pkg struct {
		PackageManager string `json:"packageManager"`
	}
	if json.Unmarshal(data, &pkg) != nil || pkg.PackageManager == "" {
		return "", false
	}
	name, _, _ := strings.Cut(pkg.PackageManager, "@")
	return name, true
}

func (env Environment) require(name, reason string) (Result, error) {
	if !slices.Contains(Supported, name) {
		return Result{}, fmt.Errorf("unsupported package manager %q (%s); supported: %s", name, reason, strings.Join(Supported, ", "))
	}
	if _, err := env.LookPath(name); err != nil {
		return Result{}, fmt.Errorf("the frontend uses %s (%s), but %s is not installed", name, reason, name)
	}
	return Result{Name: name, Reason: reason}, nil
}
