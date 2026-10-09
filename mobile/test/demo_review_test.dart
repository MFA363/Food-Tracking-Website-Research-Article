import 'package:calnut/ai_service.dart';
import 'package:calnut/assistant.dart';
import 'package:calnut/nutrition.dart';
import 'package:firebase_ai/firebase_ai.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('custom food cannot silently replace unknown or invalid nutrients with zero', () {
    final values = {for (final key in nutrientKeys) key: 1.0};
    expect(usableCustomFood({'nutrients': values}), isTrue);
    for (final key in nutrientKeys) {
      expect(
        usableCustomFood({
          'nutrients': {...values}..remove(key),
        }),
        isFalse,
      );
      expect(
        usableCustomFood({
          'nutrients': {...values, key: double.nan},
        }),
        isFalse,
      );
      expect(
        usableCustomFood({
          'nutrients': {...values, key: -1},
        }),
        isFalse,
      );
    }
    expect(
      usableCustomFood({
        'nutrients': {...values, 'iron': 1e308},
      }),
      isFalse,
    );
  });
  test('AI error messages distinguish setup from quota without exposing provider text', () {
    expect(aiError(QuotaExceeded('secret provider detail')), contains('quota'));
    expect(
      aiError(ServiceApiNotEnabled('project')),
      contains('Enable Firebase AI Logic'),
    );
    expect(
      aiError(InvalidApiKey('secret provider detail')),
      isNot(contains('secret')),
    );
  });
  testWidgets(
    'cancelling AI consent unlocks the screen and does not send a request',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(child: AssistantScreen(signedIn: true)),
          ),
        ),
      );
      await tester.enterText(find.byType(TextField), 'Explain fibre');
      await tester.ensureVisible(find.text('Review consent & send'));
      await tester.tap(find.text('Review consent & send'));
      await tester.pumpAndSettle();
      expect(find.text('Send to Gemini?'), findsOneWidget);
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      expect(find.text('Send to Gemini?'), findsNothing);
      expect(find.text('Please wait…'), findsNothing);
      expect(find.text('Explain fibre'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
    skip: !aiFreeTierEnabled,
  );
}
