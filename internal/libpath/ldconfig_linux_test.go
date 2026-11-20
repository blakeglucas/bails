//go:build linux

package libpath

import (
	"os"
	"path/filepath"
	"testing"
)

func TestFindFileWithLdconfigMatchesLibraryName(t *testing.T) {
	bin := t.TempDir()
	script := "#!/bin/sh\nprintf '%s\\n' '" +
		"libbails-test-helper.so.1 (libc6,x86-64) => /libs/libbails-test-helper.so.1\n" +
		"libbails-test.so.20 (libc6,x86-64) => /libs/libbails-test.so.20\n" +
		"libbails-test.so.2 (libc6,x86-64) => /libs/libbails-test.so.2\n" +
		"libother.so.1 (libc6,x86-64) => /libs/libbails-missing.so/libother.so.1'\n"
	if err := os.WriteFile(filepath.Join(bin, "ldconfig"), []byte(script), 0755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", bin)
	for _, tt := range []struct {
		name string
		want string
	}{
		{"libbails-test.so", "/libs/libbails-test.so.20"},
		{"libbails-test.so.2", "/libs/libbails-test.so.2"},
		{"libbails-missing.so", ""},
	} {
		t.Run(tt.name, func(t *testing.T) {
			got, err := findFileWithLdconfig(tt.name)
			if got != tt.want || (err != nil) != (tt.want == "") {
				t.Errorf("findFileWithLdconfig = %q, %v; want %q", got, err, tt.want)
			}
		})
	}
}
