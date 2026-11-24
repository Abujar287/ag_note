-keepclassmembers class com.abujar.agnotepad.MainActivity$AndroidBridge {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes *Annotation*,JavascriptInterface
-dontwarn android.webkit.**
