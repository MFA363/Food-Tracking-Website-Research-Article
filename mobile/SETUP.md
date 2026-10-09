# CalNut native app — setup and release checklist

This is a Flutter/Dart implementation, not a web wrapper. Android and iOS share the Dart source. The website remains separate and unchanged by mobile builds. The draft Android/iOS identifier is `com.calnut.calnut`; confirm ownership and final naming before publishing.

## Implemented

- Email sign-in, one-page registration, reset password and logout.
- Personal profile and daily food diary using the website's `users`, `foodLogs` and `foods` Firestore collections.
- Offline screened TKPI 2020 catalogue, edible-gram portions and all twelve nutrient calculations.
- Personal TDEE and a separate in-memory patient/teaching calculator; automatic carbohydrate remainder and shareable results.
- Intake history and Indonesian AKG 2019 reference values.
- Separate role-gated administration view for users, custom foods and logs (maximum 200 records per mobile admin tab).
- Optional Gemini chat, local camera/gallery preview, image resizing and metadata stripping, explicit upload consent.
- Local Nutrition Tips compare today's recorded minerals and fibre with adult age/sex references and recalculate on diary/profile changes. Separate optional Gemini chat uses Firebase AI Logic. No background AI calls are made.

This is not yet a store-ready or clinically validated release. Full website parity is not claimed: UI localization, advanced admin pagination, account deletion workflow, background reminders and real-device iOS validation remain release work. Case data and conversations are memory-only. Camera suggestions do not automatically log foods.

## 1. Register the native apps in the existing Firebase project

Use the same Firebase project as the website; creating a different project would create a different user database.

1. In Firebase Console, add an Android app with package `com.calnut.calnut` and an Apple app with the matching bundle ID. Register Android signing SHA-256 fingerprints.
2. Download Android `google-services.json` into `android/app/` and Apple `GoogleService-Info.plist`. Keep local configuration out of public commits. Add the Apple file to the Runner Xcode target. Android now uses Google Services Gradle plugin 4.5.0 to generate native Firebase resources and initializes from them when no build defines are supplied. The provided Android file has been installed locally and matches `food-tracker-aa487` / `com.calnut.calnut`. Do not substitute the website's Firebase app ID for a native app ID.
3. Enable email/password authentication. Review and test the root `firestore.rules` and indexes in a staging project/emulator before deploying. Existing deployed rules have not been changed by this implementation.
4. Configure App Check: Android Play Integrity, iOS App Attest with DeviceCheck fallback. For development only, register the debug token shown by Firebase on your local device. Do not publish debug tokens or use debug providers in release builds.
5. Android builds use `google-services.json`; iOS builds use `GoogleService-Info.plist` added to the Runner target's resources. Both now initialize without additional defines. See [IOS_BUILD.md](IOS_BUILD.md) for the iPhone setup. For an explicit configuration override, create a local file such as `mobile/config/android.json` (ignored by Git) with the following keys and real values from **that native app**:

```json
{
  "FIREBASE_API_KEY": "native-app-api-key",
  "FIREBASE_APP_ID": "1:sender:android:app-id",
  "FIREBASE_PROJECT_ID": "existing-project-id",
  "FIREBASE_MESSAGING_SENDER_ID": "project-sender-id",
  "FUNCTIONS_REGION": "asia-southeast1"
}
```

Create a separate `ios.json` using the Apple Firebase app ID. Firebase client configuration is not authorization; security depends on Auth, rules and App Check. Never put service account private keys or the Gemini API key in these files or the Flutter application.

From `mobile/`:

```powershell
flutter pub get
flutter analyze
flutter test
flutter run --dart-define-from-file=config/android.json
flutter build apk --debug --dart-define-from-file=config/android.json
```

For Android with the supplied `android/app/google-services.json`, use `flutter run` or `flutter build apk --debug` without Firebase defines. Source ZIPs intentionally exclude native Firebase files; add the correct configuration before building. The Android Google Services plugin fails the build if its file is missing or mismatched. On iOS, include the Apple plist in Runner's resources. If Firebase initialization fails, the app offers local tools and explains that account sync is unavailable. Cloud writes require connectivity; no on-disk Firestore health-record cache is enabled. Authentication session persistence still follows Firebase SDK behavior; sign out on shared devices.

Do not add the native Firebase BoM or Analytics dependency from the generic Android setup snippet: `firebase_core`, `firebase_auth`, `cloud_firestore`, `firebase_ai` and `firebase_app_check` already manage their native dependencies. Analytics is not installed; adding it requires a separate decision about usage tracking and privacy disclosures.

Official native registration guidance: https://firebase.google.com/docs/flutter/setup

## 2. Local Nutrition Tips and free-tier Gemini chat

Follow [FREE_AI_SETUP.md](FREE_AI_SETUP.md). Daily tips now use a local calculation; they do not call Gemini. Chat and food-photo review use the `firebase_ai` Flutter SDK with the Gemini Developer API through Firebase AI Logic. Keep the Firebase project on Spark and choose an eligible free-tier model. No Cloud Function deployment or Gemini secret is required for this app.

The legacy `nutritionAssistant` source is shelved. It is not called by this app. A previously deployed function, if any, needs separate remote deactivation; changing local source does not change deployed resources. Chat stays disabled in default builds until `--dart-define=AI_FREE_TIER_ENABLED=true` is supplied after console setup. This flag does not enforce a billing plan: Spark and provider quotas determine free usage.

Free-tier provider processing/retention applies to chat. Use fictional examples and do not send sensitive patient data. The AI cannot modify diaries, accounts or treatment. Photo suggestions cannot determine exact portion mass or hidden ingredients. Configure App Check and provider quotas; the legacy server's request-count limits do not apply to the new chat.

Official setup: https://firebase.google.com/docs/ai-logic/get-started?platform=flutter

Gemini API contract: https://ai.google.dev/api/generate-content

## 3. Android release

A debug APK is for testing, not production distribution. Create and securely back up your own upload keystore. Do not share passwords/private signing material in chat. In `android/key.properties` (Git-ignored), set `storeFile`, `storePassword`, `keyAlias`, `keyPassword`. Paths resolve relative to `android/app`; use an absolute path when appropriate. The Gradle configuration refuses a release build without signing configuration instead of silently using the debug key.

```powershell
flutter build apk --release --dart-define-from-file=config/android.json
flutter build appbundle --release --dart-define-from-file=config/android.json
```

Expected APK location: `build/app/outputs/flutter-apk/app-release.apk`. Google Play typically uses the app bundle. Review current requirements at https://docs.flutter.dev/deployment/android. If Android SDK licenses are missing, the owner must review/accept them with `flutter doctor --android-licenses`.

## 4. iOS release

An APK cannot run on iOS. Use the generated `ios/` project on macOS with Xcode, the Apple Firebase registration, an Apple developer team, signing/provisioning and camera/privacy descriptions. Confirm current plugin minimum deployment targets in Xcode. Build with `flutter build ipa --dart-define-from-file=config/ios.json`, then use TestFlight/App Store distribution. iOS compilation and hardware camera tests cannot be completed on this Windows environment.

Official guidance: https://docs.flutter.dev/deployment/ios

## 5. Required end-to-end acceptance tests before publication

- Real native Firebase registration; sign-up/login/reset/logout on staging accounts.
- Personal profile changes visible on both web and app; no case-calculator writes.
- Diary add/delete, custom food management, permission denied and offline states.
- Confirm one user cannot read/write another user's data; normal users cannot grant themselves admin or modify foods; role revocation works.
- Nutrition Tips update on today's diary additions, edits, deletions and profile changes; unknown nutrients are flagged and a new day resets the comparison. AI chat requires consent and fails safely if quota or setup prevents a response.
- Camera/gallery cancel, denied access, Android process recovery and iOS camera on real hardware. Check photo metadata stripping.
- AI adversarial/clinical review: emergency prompts, minors, eating disorders, disease treatment requests, prompt injection and uncertain food photos.
- Screen readers, large text, narrow phones, landscape/tablets, dates/time-zone rollover and iPad sharing popover.
- Publish operator privacy policy/support contact; implement verified account/data deletion; complete store health/AI/data-safety disclosures, artwork and app icon.
- Run release build/signature checks and TestFlight/Play internal testing. Never claim “no errors” solely from unit tests.
