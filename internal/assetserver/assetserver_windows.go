package assetserver

import "net/url"

var baseURL = url.URL{
	Scheme: "http",
	Host:   "bails.localhost",
}
