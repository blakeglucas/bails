package commands

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAndroidPermissionGatedActionsResumeAfterGrant(t *testing.T) {
	// Given
	mainActivity, err := buildAssets.ReadFile("build_assets/android/app/src/main/java/com/bails/app/MainActivity.java")
	require.NoError(t, err)
	bailsBridge, err := buildAssets.ReadFile("build_assets/android/app/src/main/java/com/bails/app/BailsBridge.java")
	require.NoError(t, err)

	mainActivityJava := string(mainActivity)
	bailsBridgeJava := string(bailsBridge)

	// Then
	assert.NotContains(t, mainActivityJava, "tap again once granted")
	assert.Contains(t, mainActivityJava, "public void onRequestPermissionsResult")
	assert.Contains(t, mainActivityJava, "if (requestCode == CAMERA_PERMISSION_REQUEST)")
	assert.Contains(t, mainActivityJava, "launchCameraCapture(pendingCaptureIsVideo)")
	assert.Contains(t, mainActivityJava, "camera permission denied")
	assert.Contains(t, mainActivityJava, "bridge.onRequestPermissionsResult(requestCode, grantResults)")

	assert.NotContains(t, bailsBridgeJava, "tap again once granted")
	assert.Contains(t, bailsBridgeJava, "private static final int LOCATION_PERMISSION_REQUEST = 1002")
	assert.Contains(t, bailsBridgeJava, "private boolean pendingLocationRequest")
	assert.Contains(t, bailsBridgeJava, "pendingLocationRequest = true")
	assert.Contains(t, bailsBridgeJava, "pendingLocationRequest = false")
	assert.Contains(t, bailsBridgeJava, "public void onRequestPermissionsResult")
	assert.Contains(t, bailsBridgeJava, "if (requestCode == LOCATION_PERMISSION_REQUEST)")
	assert.Contains(t, bailsBridgeJava, "getLocation()")
	assert.Contains(t, bailsBridgeJava, "location permission denied")
}
