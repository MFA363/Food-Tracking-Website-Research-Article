# CalNut for iPhone and iPad

Status: iOS source prepared; no IPA has been compiled or tested on Apple hardware.
Android installs an APK. iOS installs a signed Apple build; renaming an APK to IPA does not work.

## Requirements

- A Mac with Xcode, its iOS SDK, and Flutter compatible with the committed pubspec.lock (this project was checked with Flutter 3.47.2 / Dart 3.13.2).
- CocoaPods if Flutter reports that a native plugin requires it; let Flutter resolve the native dependencies. This Xcode project includes Swift Package Manager integration.
- Firebase Apple app registration for `com.calnut.calnut`, in the existing `food-tracker-aa487` project.
- An Apple account/team for device signing. A free Personal Team can test on personal devices with limitations. TestFlight or ad hoc IPA distribution requires the relevant Apple Developer membership and provisioning.

## Connect Firebase on iOS

1. In Firebase Console, add/select the Apple app with bundle ID `com.calnut.calnut` under `food-tracker-aa487`.
2. Download its `GoogleService-Info.plist`. Android's `google-services.json` cannot substitute for this file.
3. On the Mac, open `ios/Runner.xcworkspace` in Xcode. Add the downloaded file to `ios/Runner/`, select the Runner target, and verify it appears in Runner > Build Phases > Copy Bundle Resources. The file is deliberately excluded from the source handoff.
4. Select your team in Runner > Signing & Capabilities. Keep the bundle ID matched to Firebase. If your team requires a different bundle ID, register that exact ID in Firebase and download its configuration.
5. For debug builds, register the Apple App Check debug token emitted by this iOS installation. An Android token does not automatically authorize an iPhone or iOS simulator.
6. For release builds, configure App Attest with DeviceCheck fallback in Firebase and add the App Attest capability in Xcode. Set `com.apple.developer.devicecheck.appattest-environment` to `production` as Firebase requires. Use signing/provisioning that includes the entitlement.

CalNut now loads the native Apple configuration automatically when no Firebase build overrides are supplied. Complete explicit Firebase build values still work; never use an Android app ID as an Apple app ID.

## Run and verify on a Mac

From the extracted project directory containing `pubspec.yaml`:

```sh
flutter pub get
flutter analyze
flutter test --dart-define=AI_FREE_TIER_ENABLED=true
open ios/Runner.xcworkspace
flutter devices
flutter run --dart-define=AI_FREE_TIER_ENABLED=true
```

Select an iPhone or iOS simulator when prompted. Enable Developer Mode and trust the development team on your physical iPhone if requested by Xcode.

The Gemini flag enables the chat UI/service; Firebase AI Logic, the selected model, App Check and provider quota must also be configured. It does not guarantee free usage or make a live AI connection test pass.

Check email login, profile save, diary changes, nutrition tips, case calculations, camera/gallery consent, and share results on iPhone and iPad. The camera needs a real device. Confirm account and diary data match the same Firebase user on Android. The iOS deployment target is currently 15.0; native compilation must confirm plugin compatibility.

## Produce the separate IPA

After signing and device checks pass:

```sh
flutter build ipa --release --dart-define=AI_FREE_TIER_ENABLED=true
```

Default output: `build/ios/ipa/`. For ad hoc distribution to registered test devices, use `--export-method=ad-hoc` with the appropriate provisioning. A signed IPA cannot simply be installed on arbitrary iPhones; use the distribution method allowed by your Apple team.

Sources:
- https://docs.flutter.dev/deployment/ios
- https://docs.flutter.dev/platform-integration/ios/setup
- https://firebase.google.com/docs/ios/setup
- https://firebase.google.com/docs/app-check/flutter/default-providers
- https://developer.apple.com/support/compare-memberships/
