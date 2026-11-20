package util

import (
	"example.com/bails/internal/uuid"
	"github.com/go-ole/go-ole"
)

func StringToUUID(str string) *ole.GUID {
	return ole.NewGUID(uuid.NewSHA1(uuid.Nil, []byte(str)).String())
}
