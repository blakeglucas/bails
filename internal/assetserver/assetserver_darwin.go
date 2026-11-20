//go:build darwin && !ios

package assetserver

import "net/url"

var baseURL = url.URL{
	Scheme: "bails",
	Host:   "localhost",
}
