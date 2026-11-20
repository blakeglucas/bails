# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Bails bridge classes
-keep class com.bails.app.BailsBridge { *; }
-keep class com.bails.app.BailsJSBridge { *; }
