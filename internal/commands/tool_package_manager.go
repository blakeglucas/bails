package commands

import (
	"fmt"
	"os"

	"github.com/blakeglucas/bails/internal/jspm"
)

// PackageManagerOptions holds options for `bails tool package-manager`.
type PackageManagerOptions struct {
	Dir     string `name:"dir" description:"Frontend directory to inspect" default:"frontend"`
	Verbose bool   `name:"v" description:"Explain why the package manager was chosen (on stderr)"`
}

// ToolPackageManager prints the frontend's package manager (bun, pnpm, yarn or
// npm) so Taskfiles and scripts can dispatch on it. On failure it reports the
// reason on stderr and exits non-zero, leaving stdout empty.
func ToolPackageManager(opts *PackageManagerOptions) error {
	DisableFooter = true
	dir := opts.Dir
	if dir == "" {
		dir = "frontend"
	}
	result, err := jspm.Detect(dir)
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		return &applicationExitError{err: err, code: 1}
	}
	if opts.Verbose {
		fmt.Fprintf(os.Stderr, "%s: %s\n", result.Name, result.Reason)
	}
	fmt.Print(result.Name)
	return nil
}
