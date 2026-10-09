# CalNut mobile

Flutter/Dart app for Android and iOS with shared Firebase data, nutrition calculations, a private case calculator, food diary, camera review and optional Gemini guidance.

Nutrition Tips now recalculate locally from the diary and adult age/sex references.
Optional chat uses Firebase AI Logic's Gemini Developer API free-tier route; see
[FREE_AI_SETUP.md](FREE_AI_SETUP.md) for activation on Spark. The old callable is
shelved and no longer used by the app. No Cloud Function deployment is needed.

See [SETUP.md](SETUP.md) for native Firebase registration, testing and release signing.
An Android APK does not run on iOS.
