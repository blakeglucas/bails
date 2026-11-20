//go:build android && cgo

package operatingsystem

/*
#include <stdlib.h>
#include <sys/system_properties.h>
*/
import "C"

import "unsafe"

func systemProperty(name string) string {
	cname := C.CString(name)
	defer C.free(unsafe.Pointer(cname))
	var buf [C.PROP_VALUE_MAX]C.char
	n := C.__system_property_get(cname, &buf[0])
	return C.GoStringN(&buf[0], n)
}

func platformInfo() (*OS, error) {
	version := systemProperty("ro.build.version.release")
	return &OS{
		ID:       systemProperty("ro.build.id"),
		Name:     "Android",
		Version:  version,
		Branding: "Android " + version,
	}, nil
}
