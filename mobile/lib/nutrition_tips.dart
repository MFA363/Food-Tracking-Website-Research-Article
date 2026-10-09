import 'nutrition.dart';

const tipFoods = <String, String>{
  'fiber': 'Include vegetables, fruit, beans or whole grains in your meals.',
  'calcium': 'Consider milk or yogurt, calcium-fortified alternatives, or fish eaten with edible bones.',
  'phosphorus':
      'Beans, tempeh, eggs, fish and dairy can contribute phosphorus.',
  'iron': 'Consider beans, tempeh, lean meat or fish. Pair plant sources with vitamin-C-rich fruit or vegetables.',
  'potassium':
      'Vegetables, beans, potatoes and fruit can contribute potassium.',
  'copper': 'Nuts, seeds, legumes and whole grains can contribute copper.',
  'zinc': 'Consider meat, fish, eggs, legumes, nuts or seeds.',
};

enum TipStatus { belowReference, referenceReached, incomplete, sodiumReview }

class NutrientTip {
  final String nutrient, advice;
  final double recorded, reference;
  final TipStatus status;
  const NutrientTip(
    this.nutrient,
    this.recorded,
    this.reference,
    this.status,
    this.advice,
  );
  double get gap => (reference - recorded).clamp(0, double.infinity);
  double get progress => (recorded / reference).clamp(0, 1);
  String get unit => nutrient == 'fiber' ? 'g' : 'mg';
}

/// AKG 2019 adult references, not upper limits. Unknown values stay unknown.
List<NutrientTip> nutritionTips({
  required Iterable<Map<String, dynamic>> entries,
  required String sex,
  required int age,
}) {
  final refs = referenceIntakes(sex, age);
  if (refs['calcium'] == 0) return [];
  final rows = entries.toList();
  if (rows.isEmpty) return [];
  return [...tipFoods.keys, 'sodium'].map((key) {
    double total = 0;
    var complete = true;
    for (final row in rows) {
      final nutrients = row['nutrients'];
      final value = nutrients is Map ? nutrients[key] : null;
      if (value is! num || !value.isFinite || value < 0) {
        complete = false;
      } else {
        total += value.toDouble();
      }
    }
    final ref = refs[key]!;
    if (!complete || !total.isFinite) {
      return NutrientTip(
        key,
        total.isFinite ? total : 0,
        ref,
        TipStatus.incomplete,
        'Some food entries have missing or invalid values. Complete those entries before comparing intake.',
      );
    }
    if (key == 'sodium') {
      return NutrientTip(
        key,
        total,
        ref,
        TipStatus.sodiumReview,
        total >= 2000
            ? 'Recorded sodium is at or above the WHO adult recommendation of less than 2,000 mg/day. Review salty seasonings and packaged foods; do not compensate by skipping meals.'
            : 'Do not add salt to reach the AKG reference. WHO recommends less than 2,000 mg sodium/day for adults; unlogged salt and sauces can increase intake.',
      );
    }
    return NutrientTip(
      key,
      total,
      ref,
      total < ref ? TipStatus.belowReference : TipStatus.referenceReached,
      total < ref ? tipFoods[key]! : 'Recorded intake has reached this reference. Continue varied meals; this value is not a safety upper limit.',
    );
  }).toList();
}

/// Lowest recorded/reference ratios first; this is not a clinical urgency score.
List<NutrientTip> mealPriorities(List<NutrientTip> tips) {
  final priorities = tips
      .where((t) => t.status == TipStatus.belowReference)
      .toList();
  final order = tipFoods.keys.toList();
  priorities.sort((a, b) {
    final comparison = (a.recorded / a.reference).compareTo(
      b.recorded / b.reference,
    );
    return comparison != 0
        ? comparison
        : order.indexOf(a.nutrient).compareTo(order.indexOf(b.nutrient));
  });
  return priorities.take(3).toList();
}

class MealBudget {
  final String nutrient;
  final double target, recorded;
  final bool complete;
  const MealBudget(this.nutrient, this.target, this.recorded, this.complete);
  double? get remaining =>
      complete ? (target - recorded).clamp(0, double.infinity) : null;
}

class MealPlan {
  final List<NutrientTip> priorities;
  final List<MealBudget> budget;
  final bool customTargets, estimatedEnergy;
  const MealPlan(
    this.priorities,
    this.budget,
    this.customTargets,
    this.estimatedEnergy,
  );
}

MealPlan mealPlan({
  required List<Map<String, dynamic>> entries,
  required Map<String, dynamic> profile,
}) {
  final rawAge = profile['age'];
  if (rawAge is! num || !rawAge.isFinite || rawAge != rawAge.roundToDouble()) {
    return const MealPlan([], [], false, false);
  }
  final age = rawAge.toInt();
  final sex = profile['gender']?.toString() ?? '';
  final refs = referenceIntakes(sex, age);
  if (entries.isEmpty || refs['calcium'] == 0) {
    return const MealPlan([], [], false, false);
  }
  final tips = nutritionTips(entries: entries, sex: sex, age: age);
  final targets = {...refs}..remove('energy');
  var custom = false;
  var estimatedEnergy = false;
  try {
    final result = calculateAdult(
      weight: number(profile['weight']),
      height: number(profile['height']),
      age: age,
      sex: sex,
      activity: profile['activityLevel']?.toString() ?? '',
      protein: 0,
      fat: 0,
    );
    targets['energy'] = result.tdee.toDouble();
    estimatedEnergy = true;
    final macros = profile['macroPercentages'];
    if (macros is Map) {
      const keys = ['carbohydrate', 'protein', 'fat'];
      final valid = keys.every(
        (k) =>
            macros[k] is num &&
            (macros[k] as num).isFinite &&
            macros[k] >= 0 &&
            macros[k] <= 100,
      );
      if (valid &&
          ((macros['carbohydrate'] as num) +
                      (macros['protein'] as num) +
                      (macros['fat'] as num) -
                      100)
                  .abs() <=
              0.000001) {
        for (final k in keys) {
          targets[k] =
              result.tdee *
              (macros[k] as num).toDouble() /
              100 /
              (k == 'fat' ? 9 : 4);
        }
        custom = true;
      }
    }
  } on FormatException {
    // Adult references still apply when TDEE measurements are unavailable.
  }
  final budget = <MealBudget>[];
  for (final key in ['energy', 'carbohydrate', 'protein', 'fat']) {
    if (!targets.containsKey(key)) continue;
    var total = 0.0;
    var complete = true;
    for (final entry in entries) {
      final nutrients = entry['nutrients'];
      final value = nutrients is Map ? nutrients[key] : null;
      if (value is! num || !value.isFinite || value < 0) {
        complete = false;
      } else {
        total += value.toDouble();
      }
    }
    budget.add(
      MealBudget(
        key,
        targets[key]!,
        total.isFinite ? total : 0,
        complete && total.isFinite,
      ),
    );
  }
  return MealPlan(mealPriorities(tips), budget, custom, estimatedEnergy);
}
