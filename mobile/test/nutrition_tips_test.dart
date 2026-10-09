import 'package:calnut/daily_tips.dart';
import 'package:calnut/nutrition.dart';
import 'package:calnut/nutrition_tips.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, dynamic> entry(double calcium) => {
  'nutrients': {for (final key in nutrientKeys) key: 0.0, 'calcium': calcium},
};

void main() {
  testWidgets('meal selection stays selected while diary budget refreshes', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    Future<void> show(double protein) => tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: MealPlanningPrompts(
              profile: const {'age': 30, 'gender': 'female'},
              entries: [
                {
                  'nutrients': {
                    for (final key in nutrientKeys) key: 0.0,
                    'protein': protein,
                  },
                },
              ],
            ),
          ),
        ),
      ),
    );
    await show(10);
    expect(find.text('Protein: 50.0 g'), findsOneWidget);
    await tester.tap(find.byType(DropdownButtonFormField<String>));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Snack').last);
    await tester.pumpAndSettle();
    expect(find.textContaining('If a snack suits your hunger'), findsOneWidget);
    await show(60);
    expect(find.text('Protein: 0.0 g'), findsOneWidget);
    expect(find.textContaining('If a snack suits your hunger'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  test(
    'meal priorities rank relative gaps and exclude sodium and missing data',
    () {
      final tips = nutritionTips(
        entries: [
          {
            'nutrients': {
              'fiber': 36,
              'calcium': 900,
              'phosphorus': 700,
              'iron': 9,
              'potassium': 4700,
              'copper': 0.45,
              'zinc': 11,
              'sodium': 0,
            },
          },
        ],
        sex: 'male',
        age: 30,
      );
      expect(mealPriorities(tips).map((t) => t.nutrient), [
        'copper',
        'calcium',
      ]);
    },
  );
  test('meal budget uses saved macros, reacts to diary and withholds unknown values', () {
    final profile = <String, dynamic>{
      'age': 30,
      'gender': 'female',
      'weight': 60,
      'height': 160,
      'activityLevel': 'light',
      'macroPercentages': {'carbohydrate': 50, 'protein': 20, 'fat': 30},
    };
    final rows = [
      {
        'nutrients': {
          for (final key in nutrientKeys) key: 0.0,
          'energy': 100.0,
          'protein': 10.0,
        },
      },
    ];
    final plan = mealPlan(entries: rows, profile: profile);
    expect(plan.customTargets, isTrue);
    expect(plan.estimatedEnergy, isTrue);
    final energy = plan.budget.firstWhere((b) => b.nutrient == 'energy');
    final protein = plan.budget.firstWhere((b) => b.nutrient == 'protein');
    expect(protein.target, closeTo(energy.target * 0.2 / 4, 0.001));
    expect(protein.remaining, closeTo(protein.target - 10, 0.001));
    final changed = mealPlan(
      entries: [
        {
          'nutrients': {'protein': protein.target + 1},
        },
      ],
      profile: profile,
    );
    expect(
      changed.budget.firstWhere((b) => b.nutrient == 'protein').remaining,
      0,
    );
    expect(
      changed.budget.firstWhere((b) => b.nutrient == 'fat').remaining,
      isNull,
    );
    expect(mealPlan(entries: [], profile: profile).budget, isEmpty);
    expect(
      mealPlan(entries: rows, profile: {...profile, 'age': 30.5}).budget,
      isEmpty,
    );
    final fallback = mealPlan(
      entries: rows,
      profile: {
        ...profile,
        'macroPercentages': {'protein': 90, 'fat': 90, 'carbohydrate': -80},
      },
    );
    expect(fallback.customTargets, isFalse);
    expect(
      fallback.budget.firstWhere((b) => b.nutrient == 'protein').target,
      60,
    );
  });
  test('adding, changing and removing food recalculates the gap', () {
    NutrientTip calcium(List<Map<String, dynamic>> rows) => nutritionTips(
      entries: rows,
      sex: 'female',
      age: 30,
    ).firstWhere((t) => t.nutrient == 'calcium');
    expect(calcium([entry(250)]).gap, 750);
    expect(
      calcium([entry(250), entry(750)]).status,
      TipStatus.referenceReached,
    );
    expect(calcium([entry(250), entry(800)]).gap, 0);
    expect(calcium([entry(250)]).status, TipStatus.belowReference);
  });
  test('references respond to profile age and sex including copper units', () {
    final young = nutritionTips(entries: [entry(1000)], sex: 'female', age: 49);
    final older = nutritionTips(entries: [entry(1000)], sex: 'female', age: 50);
    expect(young.firstWhere((t) => t.nutrient == 'iron').reference, 18);
    expect(older.firstWhere((t) => t.nutrient == 'iron').reference, 8);
    expect(older.firstWhere((t) => t.nutrient == 'calcium').gap, 200);
    expect(older.firstWhere((t) => t.nutrient == 'copper').reference, 0.9);
  });
  test('empty diary and unsupported profile do not imply deficiency', () {
    expect(nutritionTips(entries: [], sex: 'female', age: 30), isEmpty);
    expect(nutritionTips(entries: [entry(1)], sex: '', age: 30), isEmpty);
    expect(nutritionTips(entries: [entry(1)], sex: 'male', age: 18), isEmpty);
  });
  test('missing, negative and nonfinite data is incomplete, never zero', () {
    for (final value in [null, -1, double.nan, double.infinity]) {
      final tips = nutritionTips(
        entries: [
          {
            'nutrients': {'iron': value},
          },
        ],
        sex: 'female',
        age: 30,
      );
      expect(
        tips.firstWhere((t) => t.nutrient == 'iron').status,
        TipStatus.incomplete,
      );
    }
  });
  test('sodium never recommends filling an intake gap', () {
    final low = nutritionTips(entries: [entry(1)], sex: 'male', age: 30).last;
    expect(low.status, TipStatus.sodiumReview);
    expect(low.advice, contains('Do not add salt'));
    final high = nutritionTips(
      entries: [
        {
          'nutrients': {'sodium': 2000},
        },
      ],
      sex: 'male',
      age: 30,
    ).last;
    expect(high.advice, contains('at or above'));
  });
  testWidgets('tips change after diary input changes on a narrow screen', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    Future<void> show(List<Map<String, dynamic>> entries) => tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: NutritionTipsView(
              profile: const {'age': 30, 'gender': 'female'},
              entries: entries,
            ),
          ),
        ),
      ),
    );
    await show([entry(250)]);
    expect(find.text('Below today’s reference · gap 750.0 mg'), findsOneWidget);
    await show([entry(250), entry(750)]);
    expect(find.text('Below today’s reference · gap 750.0 mg'), findsNothing);
    expect(find.text('Reference reached in the diary'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
