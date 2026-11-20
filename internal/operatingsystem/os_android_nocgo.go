//go:build android && !cgo

package operatingsystem

// Without cgo the Android system properties are unavailable.
func platformInfo() (*OS, error) {
	return &OS{
		ID:       "Unknown",
		Name:     "Android",
		Version:  "Unknown",
		Branding: "Android",
	}, nil
}
