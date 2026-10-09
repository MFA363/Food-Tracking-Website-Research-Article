import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:calnut/nutrition.dart';
import 'package:calnut/screens.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test(
    'regional records preserve source, macros and missing minerals',
    () async {
      final foods = await loadFoods();
      final regional = foods.where((f) => f.id.startsWith('myfcd-')).toList();
      expect(regional.length, 31);
      for (final code in [
        'R106035',
        'R106036',
        'R105006',
        'R101096',
        'R101099',
        'R101102',
        'R105022',
        'R105023',
        'R105024',
        'R106051',
      ]) {
        final complete = regional.firstWhere((f) => f.id == 'myfcd-$code');
        expect(complete.nutrients.length, 12);
        expect(
          complete.nutrients.values.every(
            (v) => v != null && v.isFinite && v >= 0,
          ),
          isTrue,
        );
        expect(complete.atWeight(150).values.every((v) => v != null), isTrue);
      }
      final nasi = regional.firstWhere((f) => f.id == 'myfcd-221019');
      expect(nasi.atWeight(200)['energy'], 338);
      expect(nasi.atWeight(200)['sodium'], 676);
      expect(nasi.atWeight(200)['copper'], isNull);
      expect(nasi.sourceUrl, startsWith('https://myfcd.moh.gov.my/'));
      final total = diaryTotals([
        {'nutrients': nasi.atWeight(200)},
      ]);
      expect(total['energy'], 338);
      expect(total['copper'], isNull);
      expect(diaryTotals([])['copper'], 0);
      expect(
        foods.any((f) => f.matches('tauto') && f.inRegion('Pekalongan')),
        isTrue,
      );
      expect(
        regional.any(
          (f) =>
              f.matches('air kelapa') &&
              f.inRegion('Pekalongan') &&
              f.inRegion('Drinks'),
        ),
        isTrue,
      );
    },
  );
  testWidgets('catalogue search and food detail work on a narrow phone', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.runAsync(() async {
      await tester.pumpWidget(const MaterialApp(home: FoodCatalogue()));
      // Asset decoding runs outside the widget test's fake clock.
      await Future<void>.delayed(const Duration(milliseconds: 300));
    });
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(ChoiceChip, 'Malaysia'));
    await tester.pumpAndSettle();
    expect(
      tester
          .widget<ChoiceChip>(find.widgetWithText(ChoiceChip, 'Malaysia'))
          .selected,
      isTrue,
    );
    await tester.enterText(find.byType(TextField), 'nasi lemak');
    await tester.pumpAndSettle();
    expect(find.text('Nasi lemak'), findsOneWidget);
    await tester.tap(find.text('Nasi lemak'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), '200');
    await tester.pumpAndSettle();
    expect(find.text('338.0 kcal'), findsOneWidget);
    expect(find.text('Not reported'), findsWidgets);
    expect(tester.takeException(), isNull);
  });
}
