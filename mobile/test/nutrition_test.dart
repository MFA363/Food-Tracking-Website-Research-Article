import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:calnut/nutrition.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('macros derive carbohydrate and sum to 100', () {
    final m = macroPercentages(20, 30);
    expect(m['carbohydrate'], 50);
    expect(m.values.reduce((a, b) => a + b), 100);
  });
  test('rejects impossible and nonfinite macro percentages', () {
    for (final v in [-1.0, 101.0, double.nan, double.infinity]) {
      expect(() => macroPercentages(v, 20), throwsFormatException);
    }
    expect(() => macroPercentages(70, 40), throwsFormatException);
  });
  test('Mifflin and 4/4/9 calculation match hand calculation', () {
    final r = calculateAdult(
      weight: 70,
      height: 175,
      age: 30,
      sex: 'male',
      activity: 'sedentary',
      protein: 20,
      fat: 30,
    );
    expect(r.ree, 1648.75);
    expect(r.tdee, 1979);
    expect(r.grams('carbohydrate'), 247.375);
    expect(r.grams('protein'), 98.95);
    expect(r.grams('fat'), closeTo(65.9666667, 1e-6));
    expect(r.bmi, closeTo(22.8571429, 1e-6));
  });
  test('adult scope and invalid measurements are rejected', () {
    for (final age in [0, 18, 79]) {
      expect(
        () => calculateAdult(
          weight: 70,
          height: 175,
          age: age,
          sex: 'male',
          activity: 'light',
          protein: 20,
          fat: 30,
        ),
        throwsFormatException,
      );
    }
    expect(
      () => calculateAdult(
        weight: double.nan,
        height: 175,
        age: 30,
        sex: 'male',
        activity: 'light',
        protein: 20,
        fat: 30,
      ),
      throwsFormatException,
    );
  });
  test('grams scale all twelve nutrients and reject zero', () {
    final f = Food('id', 'name', 'other', {
      for (final k in nutrientKeys) k: 10,
    });
    expect(f.atWeight(250).values.every((v) => v == 25), isTrue);
    expect(() => f.atWeight(0), throwsFormatException);
  });
  test('AKG adult age bands', () {
    expect(referenceIntakes('male', 19)['energy'], 2650);
    expect(referenceIntakes('female', 50)['iron'], 8);
    expect(referenceIntakes('female', 18)['energy'], 0);
  });
  test('bundled source loads, screens and deduplicates', () async {
    final raw = jsonDecode(
      await rootBundle.loadString('assets/tkpi2020_data.json'),
    ) as List;
    expect(raw.length, 1900);
    final foods = await loadFoods();
    expect(foods.length, greaterThan(400));
    expect(foods.map((f) => f.id).toSet().length, foods.length);
    expect(
      foods.every(
        (f) =>
            f.nutrients.length == 12 &&
            f.nutrients.values.every(
              (v) => v == null || v.isFinite && v >= 0,
            ) &&
            nutrientKeys.take(4).every((k) => f.nutrients[k] != null),
      ),
      isTrue,
    );
  });
}
