# CalNut verification record

Checked on 23 September 2026 using Flutter 3.47.2 / Dart 3.13.2 on Windows.

## Nutrition Tips / Firebase AI Logic update

- `flutter analyze --no-pub`: no issues found after the migration.
- `flutter build apk --debug --dart-define=AI_FREE_TIER_ENABLED=true`: succeeded.
  Artifact: `output/mobile/CalNut-NutritionTips-test.apk` relative to repository root.
  This showcase build exposes AI chat, but the console's Spark/AI Logic/App Check
  setup is still required. No live provider response was tested.
- `flutter test`: 18 tests passed, including changes to food intake, age/sex
  references, absent/invalid nutrients, sodium handling and a narrow-screen tips
  widget updating from below-reference to reference-reached.
- Legacy backend tests: 7 passed. The callable is now explicitly shelved in source.
- Mobile no longer imports `cloud_functions` or calls `nutritionAssistant`.
- AI chat uses `firebase_ai` and requires console activation/App Check on a Spark
  project. No live Gemini request or remote configuration change was performed.
- Earlier emulator/cloud checks below predate this update and do not constitute
  verification of the new AI connection. Follow FREE_AI_SETUP.md for device checks.

## Earlier baseline checks

- `flutter analyze --no-pub`: no issues found.
- `flutter test --no-pub`: 12 tests passed. Coverage includes macro percentages and invalid inputs, Mifflin/4-4-9 arithmetic, adult age bounds, portion scaling, AKG age bands, screened/deduplicated TKPI loading, guest setup messaging, independent case calculation, stale-result clearing, 360-pixel layout, image resizing/EXIF stripping, and corrupt-image rejection.
- Backend `npm test`: 7 tests passed. Input/history/image validation, rejection without authentication, and AI disabled by default were checked without contacting paid services.
- Backend syntax checks and module import passed.
- The Android Firebase-enabled APK installed and cold-launched successfully on the emulator. The previous missing-configuration warning is absent, confirming the native Firebase initialization path completed. CalNut remained running and the sampled Flutter/Android error log was empty. This is a startup smoke test, not authenticated cloud-flow validation.
- Backend dependency audit: zero reported vulnerabilities after updating Firebase SDKs and overriding the vulnerable UUID dependency used by gaxios 6.7.1. This is not a comprehensive security audit.

## Not yet verified / release gates

- Android Firebase registration has been supplied and integrated for `com.calnut.calnut` in `food-tracker-aa487` using Google Services plugin 4.5.0. The read-only native configuration probe passed: Auth project configuration HTTP 200; unauthenticated Firestore access HTTP 403. Live native sign-up, profile/diary reads and writes, access-control rules, App Check enforcement and account synchronization have not been end-to-end tested.
- The legacy callable is shelved locally. Remote deployment state has not been checked. The new Firebase AI Logic connection still needs live configuration/testing; no paid AI request was made.
- Camera permissions/capture, process recovery and iOS hardware behavior require device testing; image processing has automated tests only.
- iOS build/signing requires macOS and Xcode. No IPA has been produced on Windows.
- Release signing, privacy policy, account/data deletion, store artwork, full localization and store disclosures remain outstanding. Admin mobile views are capped at 200 records.
- The Android Firebase-enabled debug build succeeded (`assembleDebug`, 401 tasks), including `processDebugGoogleServices`. The delivered APK uses the supplied native registration. Native integration test source is included but must not be described as passed without a successful device run.
- Android dependencies emit Kotlin/Gradle migration and SDK XML compatibility warnings. These are distinct from Dart analyzer errors; retain compatible pinned SDK/plugin versions and review migration before major upgrades.

The supplied development APK cannot be called a fully functional cloud-connected or production-ready release until the above setup and acceptance checks are complete. No software test suite can establish that all possible errors are absent.

## Demo review: 28 September 2026

### Personalized daily guidance and meal prompts update

- Added meal selection and personalized food prompts to the app Overview and active website Dashboard. Up to three nutrient gaps are ranked by recorded/reference ratio; sodium and unknown values cannot become intake-gap priorities.
- Remaining daily energy uses estimated TDEE for supported measurements. Saved valid macro percentages use 4/4/9 conversion; otherwise adult AKG macro references are shown explicitly. Reached amounts clamp at zero, incomplete amounts remain unknown, and empty diaries do not imply deficiencies.
- Website-only expandable explanations include reference age/sex, gap arithmetic, individual diary contributions, ranking criteria and source links. The Dashboard now subscribes to Firestore diary updates and deduplicates added records.
- Website type checking passed; all 13 selected website tests passed; production build succeeded. Vite reports a bundle-size advisory. Generated Flutter/output folders are excluded from the Vite watcher after a Windows EBUSY crash was reproduced.
- Flutter analysis: no issues found. All 24 mobile tests passed, including the 360-pixel meal-selector interaction, preserving selection during diary changes, saved macro calculations and invalid-data handling.
- Website component loaded in a local browser with synthetic data. Interactive browser automation later stalled/relaunched, so a complete browser interaction run and authenticated cross-device Firestore flow are not claimed as verified.
- Fresh normal debug APK built successfully: `output/mobile/CalNut-DailyGuidance-2026-09-28.apk` (235,582,087 bytes). Guidance uses local rules and does not invoke Gemini. Existing optional Gemini/App Check limitations below still apply.
- Website changes have been built locally, not deployed. No Firebase rules or production records were changed in this update.

- Fixed repeated AI-send consent dialogs, added distinct AI quota/setup errors without displaying raw provider messages, and prevented incomplete/invalid custom-food nutrient records from being logged as zero nutrients.
- Personal and separate case calculators both expose result sharing; the personal button now says "Share my results".
- `flutter analyze --no-pub`: no issues found.
- `flutter test --no-pub --dart-define=AI_FREE_TIER_ENABLED=true`: all 21 tests passed, including consent cancellation, invalid custom-food data and AI error handling.
- Live Android AI connection test initialized Firebase and found an existing signed-in user, but failed while obtaining an App Check token. No successful Gemini response was verified. Check the debug token for the actual presentation device, its Firebase app registration, and connectivity; do not disable enforcement or enable billing to bypass this failure.
- The native calculator/catalogue integration test built and installed but stalled before reporting results; it was stopped and is NOT counted as passed. Unit/widget results do not replace on-device acceptance testing.
- The delivery APK is a normal `lib/main.dart` debug build, not the integration-test harness, with `AI_FREE_TIER_ENABLED=true`. Install the delivery APK before presenting. Debug tokens are device-specific and must remain private.
- Build succeeded and the normal APK installed successfully on `emulator-5554`, replacing the test harness without clearing app data. Delivery: `output/mobile/CalNut-Demo-2026-09-28.apk` (235,575,294 bytes). Installation success alone does not prove every screen or cloud workflow works.
- Remaining gates above still apply, particularly authenticated Firestore writes/security, live AI, camera hardware and result sharing through installed phone apps. This is a demonstration build, not a production release certification.
