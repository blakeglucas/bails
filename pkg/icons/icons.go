package icons

import _ "embed"

//go:embed DefaultMacTemplateIcon.png
var SystrayMacTemplate []byte

//go:embed systray-light.png
var SystrayLight []byte

//go:embed icon.ico
var DefaultWindowsIcon []byte

//go:embed systray-dark.png
var SystrayDark []byte

//go:embed ApplicationDarkMode-256.png
var ApplicationDarkMode256 []byte

//go:embed ApplicationLightMode-256.png
var ApplicationLightMode256 []byte

//go:embed BailsLogoBlack.png
var BailsLogoBlack []byte

//go:embed BailsLogoBlackTransparent.png
var BailsLogoBlackTransparent []byte

//go:embed BailsLogoWhite.png
var BailsLogoWhite []byte

//go:embed BailsLogoWhiteTransparent.png
var BailsLogoWhiteTransparent []byte
