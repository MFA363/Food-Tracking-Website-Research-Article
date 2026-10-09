import 'package:calnut/ai_service.dart';
import 'package:calnut/services.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

// Explicit live test: uses the existing device login and one fictional prompt.
// No credentials, diary entries, profile measurements or model output are logged.
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('registered App Check device receives a Gemini response', (
    tester,
  ) async {
    await tester.runAsync(() async {
      await Cloud.initialize();
      expect(Cloud.ready, isTrue, reason: Cloud.setupError);
      final user = await Cloud.auth.authStateChanges().first.timeout(
        const Duration(seconds: 20),
      );
      expect(
        user,
        isNotNull,
        reason: 'Sign in on this emulator before running the live AI check.',
      );
      try {
        final token = await FirebaseAppCheck.instance
            .getToken(true)
            .timeout(const Duration(seconds: 30));
        expect(token, isNotNull);
        expect(token, isNotEmpty);
      } catch (_) {
        fail(
          'App Check rejected or could not verify this emulator. Confirm its debug token is registered and the device is online.',
        );
      }
      try {
        final reply = await askLearningAssistant(
          message: 'For a fictional classroom example, explain dietary fibre in one short sentence.',
          history: [],
        );
        expect(reply.trim(), isNotEmpty);
      } catch (error) {
        fail(
          'Gemini connection failed (${error.runtimeType}): ${aiError(error)}',
        );
      }
    });
  }, timeout: const Timeout(Duration(minutes: 3)));
}
