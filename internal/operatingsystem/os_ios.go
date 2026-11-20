//go:build ios

package operatingsystem

import "syscall"

// platformInfo reads the version via sysctl(3); iOS apps cannot exec the
// sysctl binary the macOS implementation uses.
func platformInfo() (*OS, error) {
	version, err := syscall.Sysctl("kern.osproductversion")
	if err != nil {
		return nil, err
	}
	build, err := syscall.Sysctl("kern.osversion")
	if err != nil {
		return nil, err
	}
	return &OS{
		ID:       build,
		Name:     "iOS",
		Version:  version,
		Branding: "iOS " + version,
	}, nil
}
