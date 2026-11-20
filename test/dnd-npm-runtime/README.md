# DND NPM Runtime Test

This test verifies that drag-and-drop functionality works correctly when using the `@bails/runtime` npm module instead of the bundled `/bails/runtime.js`.

## Background

There was a bug where the Go backend called `window.bails.Window.HandlePlatformFileDrop()` for native file drops (macOS/Linux), but the npm module only registers the handler at `window._bails.handlePlatformFileDrop`.

The bundled runtime sets `window.bails = Runtime`, so the call worked. But with the npm module, `window.bails` is an empty object.

## The Fix

Changed `pkg/application/webview_window.go` to call the internal path that both runtimes set up:

```go
// Before (only worked with bundled runtime):
"window.bails.Window.HandlePlatformFileDrop(%s, %d, %d);"

// After (works with both):
"window._bails.handlePlatformFileDrop(%s, %d, %d);"
```

## Running the Test

The frontend is pre-built, so you can run directly:

```bash
go run .
```

Then drag files from Finder/Explorer onto the drop zone. Files should be categorized and displayed.

### Rebuilding the Frontend (optional)

Only needed if you modify the frontend code:

```bash
cd frontend
npm install
npm run build
```

## What This Tests

1. `@bails/runtime` npm module initialization
2. Event system (`Events.On('files-dropped', ...)`)
3. Native file drop handling on macOS/Linux via `window._bails.handlePlatformFileDrop`
4. Drop target detection with `data-file-drop-target` attribute
5. Visual feedback with `.file-drop-target-active` class
