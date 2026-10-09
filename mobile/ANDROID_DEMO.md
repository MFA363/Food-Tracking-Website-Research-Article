# CalNut Android demonstration build

Install `CalNut-Android-demo.apk` on an Android phone. Allow installation from the file manager/browser if Android requests it. This is a debug-signed demonstration build, not a Play Store release.

Firebase Android registration is included in the compiled APK. For protected cloud features, each debug installation needs its own App Check token registered under the Android app in Firebase. An emulator's registered token may not match your phone. AI chat is enabled at build time; successful requests still depend on Firebase AI Logic, the configured model and quota.

The APK includes Android ARMv7, ARM64 and x86_64 libraries. It cannot run on iPhones. iOS source and Mac build instructions are delivered separately.

Source build command, from `mobile/`:

```powershell
flutter build apk --debug --no-pub --dart-define=AI_FREE_TIER_ENABLED=true
```

Production release signing is not configured. Configure your own signing key before a release APK/AAB build.
