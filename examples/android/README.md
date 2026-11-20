# Bails Android Example

This example runs on Android (emulator and device) as well as desktop. See
[`ANDROID.md`](../../ANDROID.md) for the full Android guide.

```bash
bails task android:run        # build + launch in the Android Emulator
bails task android:package    # production release APK
bails task android:logs       # stream logcat output
```

It demonstrates service bindings, Go->JS events, native AlertDialog message
dialogs, clipboard, device info, and screen metrics.
