import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:calnut/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('native guest calculator and TKPI catalogue flow', (
    tester,
  ) async {
    await app.main();
    await tester.pumpAndSettle();
    expect(find.text('CalNut'), findsOneWidget);
    await tester.tap(find.text('Case'));
    await tester.pumpAndSettle();
    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), '175');
    await tester.enterText(fields.at(1), '70');
    await tester.enterText(fields.at(2), '30');
    FocusManager.instance.primaryFocus?.unfocus();
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Calculate'));
    await tester.tap(find.text('Calculate'));
    await tester.pumpAndSettle();
    expect(find.text('Planning results'), findsOneWidget);
    await tester.tap(find.text('Overview'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Explore Indonesian foods'));
    await tester.tap(find.text('Explore Indonesian foods'));
    await tester.pumpAndSettle();
    expect(find.text('Food catalogue'), findsOneWidget);
    await tester.enterText(find.byType(TextField), 'beras');
    await tester.pumpAndSettle();
    expect(find.byType(ListTile), findsWidgets);
    await tester.tap(find.byType(ListTile).first);
    await tester.pumpAndSettle();
    expect(find.text('Edible portion weight (g)'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
