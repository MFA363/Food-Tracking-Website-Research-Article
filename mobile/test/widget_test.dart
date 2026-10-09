import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:calnut/main.dart';
import 'package:calnut/calculator.dart';
import 'package:calnut/services.dart';

void main() {
  testWidgets('guest overview renders and exposes setup honestly', (
    tester,
  ) async {
    Cloud.ready = false;
    await tester.pumpWidget(const CalNutApp());
    await tester.pumpAndSettle();
    expect(find.text('CalNut'), findsOneWidget);
    expect(find.text('Account sync is not configured'), findsOneWidget);
    await tester.tap(find.text('Case'));
    await tester.pumpAndSettle();
    expect(find.text('Case calculator'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets('calculator computes a case without changing cloud profile', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: SingleChildScrollView(child: Calculator())),
      ),
    );
    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), '175');
    await tester.enterText(fields.at(1), '70');
    await tester.enterText(fields.at(2), '30');
    await tester.enterText(fields.at(3), '20');
    await tester.enterText(fields.at(4), '30');
    expect(find.text('Carbohydrate (automatic): 50.0%'), findsOneWidget);
    await tester.ensureVisible(find.text('Calculate'));
    await tester.tap(find.text('Calculate'));
    await tester.pumpAndSettle();
    expect(find.text('Planning results'), findsOneWidget);
    await tester.ensureVisible(fields.at(4));
    await tester.enterText(fields.at(4), '40');
    await tester.pump();
    expect(find.text('Planning results'), findsNothing);
    expect(tester.takeException(), isNull);
  });
  testWidgets('small phone layout has no overflow', (tester) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(const CalNutApp());
    await tester.pumpAndSettle();
    await tester.tap(find.text('Case'));
    await tester.pumpAndSettle();
  });
}
