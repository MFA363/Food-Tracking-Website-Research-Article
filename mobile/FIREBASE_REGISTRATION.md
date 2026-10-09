# Register CalNut in Firebase

Use the **existing website project**: `food-tracker-aa487`.

You register the native application IDs in Firebase; you do not upload an APK to connect the database. Firebase App Distribution is a separate optional way to distribute test builds.

## Android

In Firebase Console → Project settings → Your apps → Add app → Android:

| Field | Value |
| --- | --- |
| Android package name | `com.calnut.calnut` |
| App nickname | `CalNut Android` |
| Debug SHA-1 | `99:3A:03:54:BB:3C:E1:B4:AE:1E:0B:34:27:79:56:4E:90:83:83:CA` |
| Debug SHA-256 | `3B:FA:24:3A:A0:35:A2:C6:AB:2C:C6:C9:DD:F0:4A:E0:79:EC:44:4B:32:3A:DA:BA:07:49:2E:59:4C:72:42:4E` |

Download **google-services.json**. These fingerprints belong to the development APK, not a future production upload/Play signing key. Register the release certificate fingerprints separately before publication.

## iOS

Add app → Apple/iOS:

| Field | Value |
| --- | --- |
| Apple bundle ID | `com.calnut.calnut` |
| App nickname | `CalNut iOS` |
| App Store ID | Leave blank until you have one |

Download **GoogleService-Info.plist**. The iOS source is included in the source ZIP; a signed IPA must be built on macOS/Xcode with your Apple developer team. The Android APK cannot be installed on an iPhone.

## What to provide next

Place the downloaded client configuration files in the project or attach them for integration. These are Firebase *client configuration* files; do not send a service-account private key, signing keystore, password or Gemini API secret.

The supplied Android configuration has now been integrated at `mobile/android/app/google-services.json`; it is excluded from source archives and Git. Android startup uses this native registration automatically. Follow [SETUP.md](SETUP.md) for App Check and the protected AI service. Test registration, account sync, diary writes and Gemini calls against an approved test account before claiming full functionality. iOS configuration is still outstanding.

The user provided the Android registration. No cloud deployment, billing activation, rule change or admin-account creation was performed automatically.

Official setup instructions: https://firebase.google.com/docs/flutter/setup
