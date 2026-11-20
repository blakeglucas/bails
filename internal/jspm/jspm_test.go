package jspm

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func fakeEnv(installed []string, env map[string]string) Environment {
	return Environment{
		LookPath: func(name string) (string, error) {
			for _, n := range installed {
				if n == name {
					return "/usr/bin/" + name, nil
				}
			}
			return "", errors.New("not found")
		},
		Getenv:   func(k string) string { return env[k] },
		ReadFile: os.ReadFile,
		Stat:     os.Stat,
	}
}

func write(t *testing.T, dir, name, content string) {
	t.Helper()
	if err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestDetect(t *testing.T) {
	all := []string{"bun", "pnpm", "yarn", "npm"}
	tests := []struct {
		name      string
		files     map[string]string
		installed []string
		env       map[string]string
		want      string
		wantErr   string
	}{
		{name: "fallback prefers bun", installed: all, want: "bun"},
		{name: "fallback to npm without bun", installed: []string{"npm", "pnpm"}, want: "npm"},
		{name: "nothing installed", installed: nil, wantErr: ErrNotFound.Error()},
		{name: "pnpm lockfile", files: map[string]string{"pnpm-lock.yaml": ""}, installed: all, want: "pnpm"},
		{name: "yarn lockfile", files: map[string]string{"yarn.lock": ""}, installed: all, want: "yarn"},
		{name: "npm lockfile beats bun fallback", files: map[string]string{"package-lock.json": "{}"}, installed: all, want: "npm"},
		{name: "bun text lockfile", files: map[string]string{"bun.lock": ""}, installed: all, want: "bun"},
		{name: "packageManager field beats lockfile", files: map[string]string{"package.json": `{"packageManager":"yarn@4.5.0"}`, "package-lock.json": "{}"}, installed: all, want: "yarn"},
		{name: "env override beats everything", files: map[string]string{"pnpm-lock.yaml": ""}, installed: all, env: map[string]string{EnvOverride: "npm"}, want: "npm"},
		{name: "detected but missing", files: map[string]string{"pnpm-lock.yaml": ""}, installed: []string{"bun", "npm"}, wantErr: "uses pnpm (found pnpm-lock.yaml), but pnpm is not installed"},
		{name: "unsupported override", installed: all, env: map[string]string{EnvOverride: "deno"}, wantErr: `unsupported package manager "deno"`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dir := t.TempDir()
			for name, content := range tt.files {
				write(t, dir, name, content)
			}
			got, err := fakeEnv(tt.installed, tt.env).Detect(dir)
			if tt.wantErr != "" {
				if err == nil || !strings.Contains(err.Error(), tt.wantErr) {
					t.Fatalf("Detect() error = %v, want containing %q", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("Detect() error = %v", err)
			}
			if got.Name != tt.want {
				t.Fatalf("Detect() = %q (%s), want %q", got.Name, got.Reason, tt.want)
			}
		})
	}
}
