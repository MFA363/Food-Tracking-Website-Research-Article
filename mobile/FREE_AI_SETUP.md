# CalNut: local Nutrition Tips and optional free-tier AI chat

## Daily guidance and meal planning (28 September 2026)

Both the Flutter app Overview and website Dashboard now include personalized
daily tips and a meal selector for breakfast, lunch, dinner or a snack. Prompts
highlight up to three supported nutrient gaps, ranked by recorded/reference ratio,
and show remaining daily macros and energy. Remaining values are not prescribed
meal portions. Saved macro percentages use TDEE and 4/4/9 kcal per gram; without
valid saved percentages, macro comparisons use adult AKG references. Energy is
shown only when measurements support the adult TDEE calculation.

The mobile app follows today's diary; the website follows its selected diary
date and listens for Firestore entry updates. Age/sex references use the current
profile. The website alone has expandable "Why this suggestion?" explanations
with calculations, individual diary contributions, and sources.

These guidance features use local rules and do not call Gemini or require an AI
debug token. Loading the signed-in diary still requires Firebase access. They do
not automatically add food or change the profile. Missing nutrient values do not
become food priorities. Sodium is never recommended to fill a gap.

The active website source is the repository-root `src/` selected by `vite.config.ts`.
The nested `Food tracking system for Indonesia/` folder is not its build input.

## Existing nutrition references

Nutrition Tips need no AI setup. Dashboard tips recalculate locally when today's
Firestore diary or the profile changes. They compare fibre and six minerals
against AKG 2019 adult age/sex references. Sodium has separate guidance: never add
salt to fill the AKG reference. References are not diagnoses or safety upper limits.
Missing nutrient fields are marked incomplete. Vitamins are not assessed because
the current catalogue does not provide vitamin totals. Pregnancy, breastfeeding
and condition-specific adjustments are outside these general comparisons.

Sources checked 2026-09-23:
- https://jdih.kemkes.go.id/storage/documents/pdfs/2019permenkes028.pdf (adult mineral tables; copper converted from micrograms to mg)
- https://www.who.int/news-room/fact-sheets/detail/sodium-reduction

## Activate separate Gemini learning chat without Cloud Functions

1. In Firebase Console select **food-tracker-aa487**. Verify **Spark** is the
   project's plan and no Cloud Billing account is linked. Do not upgrade for this
   workflow. App code cannot determine or enforce the project's billing plan.
2. Open **Firebase AI Logic**, choose **Get started**, and select **Gemini Developer
   API**. Complete the console setup. Do not select the paid Vertex/Agent Platform
   provider. If the chosen model or feature requests billing, stop and select an
   eligible free-tier text-and-image model instead.
3. Configure/enforce App Check for Firebase AI Logic. CalNut already initializes
   App Check. Register your debug device token for debug builds; use Play Integrity
   for Android releases. Do not share debug tokens. Sign in to CalNut.
4. Review the current model quota in AI Studio. The default model is
   `gemini-3.8-flash`, listed with free input/output on the pricing page on the date
   above. Availability and quotas vary; the build can override it via `AI_MODEL`.
5. From the `mobile` folder run:

```powershell
flutter pub get
flutter run --dart-define=AI_FREE_TIER_ENABLED=true
```

For a showcase APK after the console setup:

```powershell
flutter build apk --debug --dart-define=AI_FREE_TIER_ENABLED=true
```

The result is `build/app/outputs/flutter-apk/app-debug.apk`. The build flag confirms
that the operator has configured a free-tier project; it cannot prevent billing
if someone later upgrades that project. Keep Spark to avoid paid API overages.
There is no paid provider fallback, no background AI call and no automatic retry.
Quota failures show a message while local tips continue working.

There is no Gemini secret in the app. **Do not run `functions:secrets:set` or deploy
the old Cloud Function for this setup.** `nutritionAssistant` is shelved in local
source and no longer called by this app. If a previous version was deployed, this
local change does not delete or disable that remote deployment; disable/delete
that specific legacy function separately in its Firebase project if necessary.
The old server's 20/user/day and 200/global/day quotas no longer govern this chat;
configure provider quotas and Firebase AI Logic limits in the console.

Free-tier content may be used to improve provider products. Use fictional examples
for demonstrations; do not submit patient identifiers or sensitive health details.
The consent screen covers messages, recent conversation and an optional photo.
Daily diary and profile data are never automatically sent to the AI.

Verify on a configured phone: sign in, ask one educational question, test a food
photo, check quota/network failures, then add/change/delete a diary food and verify
Nutrition Tips update without any AI request. Clinical suitability is not certified.

Official setup/pricing:
- https://firebase.google.com/docs/ai-logic/get-started?platform=flutter
- https://firebase.google.com/docs/ai-logic/pricing
- https://firebase.google.com/docs/ai-logic/app-check
- https://ai.google.dev/gemini-api/docs/pricing
