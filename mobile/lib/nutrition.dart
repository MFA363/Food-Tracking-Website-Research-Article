import 'dart:convert';

import 'package:flutter/services.dart';

const activityFactors = <String, double>{
  'sedentary': 1.2,
  'light': 1.375,
  'moderate': 1.55,
  'active': 1.725,
  'very_active': 1.9,
};
const nutrientKeys = [
  'energy',
  'protein',
  'fat',
  'carbohydrate',
  'fiber',
  'calcium',
  'phosphorus',
  'iron',
  'sodium',
  'potassium',
  'copper',
  'zinc',
];
const tkpiKeys = [
  'energi_kal',
  'protein_g',
  'lemak_g',
  'karbohidrat_g',
  'serat_g',
  'kalsium_mg',
  'fosfor_mg',
  'besi_mg',
  'natrium_mg',
  'kalium_mg',
  'tembaga_mg',
  'seng_mg',
];
double number(dynamic value) =>
    value is num && value.isFinite ? value.toDouble() : 0;
String localDate(DateTime date) =>
    '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';

Map<String, double> macroPercentages(double protein, double fat) {
  if (![protein, fat].every((v) => v.isFinite && v >= 0 && v <= 100) ||
      protein + fat > 100 + 1e-9) {
    throw const FormatException(
      'Protein and fat must be 0–100%, with a combined total no greater than 100%.',
    );
  }
  return {
    'carbohydrate': double.parse(
      (100 - protein - fat).clamp(0, 100).toStringAsFixed(8),
    ),
    'protein': protein,
    'fat': fat,
  };
}

class NutritionResult {
  final double bmi, ree, factor;
  final int tdee;
  final Map<String, double> percentages;
  const NutritionResult(
    this.bmi,
    this.ree,
    this.factor,
    this.tdee,
    this.percentages,
  );
  double kcal(String macro) => tdee * percentages[macro]! / 100;
  double grams(String macro) => kcal(macro) / (macro == 'fat' ? 9 : 4);
  String report() =>
      'CalNut adult planning estimate\nBMI: ${bmi.toStringAsFixed(1)} kg/m²\nREE: ${ree.toStringAsFixed(2)} kcal/day\nActivity factor: $factor\nTDEE: $tdee kcal/day\n${percentages.keys.map((k) => '$k: ${percentages[k]}% | ${kcal(k).toStringAsFixed(1)} kcal | ${grams(k).toStringAsFixed(1)} g').join('\n')}\nCarbohydrate = 100 - protein - fat. Grams = TDEE × percentage / 100 / (4 or 9).\nNot a diagnosis or prescription. Pregnancy, lactation and disease-specific adjustments are not included.';
}

NutritionResult calculateAdult({
  required double weight,
  required double height,
  required int age,
  required String sex,
  required String activity,
  required double protein,
  required double fat,
}) {
  if (!weight.isFinite ||
      !height.isFinite ||
      weight < 20 ||
      weight > 300 ||
      height < 50 ||
      height > 250 ||
      age < 19 ||
      age > 78 ||
      !['male', 'female'].contains(sex) ||
      !activityFactors.containsKey(activity)) {
    throw const FormatException(
      'Use adult values: age 19–78, height 50–250 cm and weight 20–300 kg.',
    );
  }
  final percentages = macroPercentages(protein, fat);
  final ree =
      10 * weight + 6.25 * height - 5 * age + (sex == 'male' ? 5 : -161);
  final factor = activityFactors[activity]!;
  final tdee = (ree * factor).round();
  if (tdee <= 0) {
    throw const FormatException(
      'These inputs produce a non-positive estimate. Check the measurements.',
    );
  }
  return NutritionResult(
    weight / ((height / 100) * (height / 100)),
    ree,
    factor,
    tdee,
    percentages,
  );
}

Map<String, double> referenceIntakes(String sex, int age) {
  if (age < 19 || age > 120 || !['male', 'female'].contains(sex)) {
    return {for (final key in nutrientKeys) key: 0};
  }
  const male = [
    [2650, 65, 75, 430, 37, 1500],
    [2550, 65, 70, 415, 36, 1500],
    [2150, 65, 60, 340, 30, 1300],
    [1800, 64, 50, 275, 25, 1100],
    [1600, 64, 45, 235, 22, 1000],
  ];
  const female = [
    [2250, 60, 65, 360, 32, 1500],
    [2150, 60, 60, 340, 30, 1500],
    [1800, 60, 50, 280, 25, 1400],
    [1550, 58, 45, 230, 22, 1200],
    [1400, 58, 40, 200, 20, 1000],
  ];
  final band = age < 30
      ? 0
      : age < 50
      ? 1
      : age < 65
      ? 2
      : age < 80
      ? 3
      : 4;
  final row = (sex == 'male' ? male : female)[band];
  return {
    'energy': row[0].toDouble(),
    'protein': row[1].toDouble(),
    'fat': row[2].toDouble(),
    'carbohydrate': row[3].toDouble(),
    'fiber': row[4].toDouble(),
    'sodium': row[5].toDouble(),
    'calcium': age < 50 ? 1000 : 1200,
    'phosphorus': 700,
    'iron': sex == 'male'
        ? 9
        : age < 50
        ? 18
        : 8,
    'potassium': 4700,
    'copper': 0.9,
    'zinc': sex == 'male' ? 11 : 8,
  };
}

bool usableNutrients(Map<String, dynamic> n) {
  if (!tkpiKeys.every(
    (k) => n[k] is num && (n[k] as num).isFinite && n[k] >= 0,
  )) {
    return false;
  }
  if (n.values.any((v) => v != null && (v is! num || !v.isFinite || v < 0))) {
    return false;
  }
  if ([
    'air',
    'protein_g',
    'lemak_g',
    'karbohidrat_g',
    'serat_g',
    'abu_g',
  ].any((k) => n[k] != null && number(n[k]) > 100)) {
    return false;
  }
  final mass = [
    'air',
    'protein_g',
    'lemak_g',
    'karbohidrat_g',
    'abu_g',
  ].fold<double>(0, (sum, k) => sum + number(n[k]));
  return number(n['energi_kal']) <= 900 && mass <= 105;
}

class Food {
  final String id, name, category;
  final Map<String, double?> nutrients;
  final String region, source, sourceUrl;
  final List<String> aliases;
  const Food(
    this.id,
    this.name,
    this.category,
    this.nutrients, {
    this.region = 'Indonesia',
    this.source = 'TKPI 2020',
    this.sourceUrl = '',
    this.aliases = const [],
  });
  bool matches(String query) => [
    name,
    ...aliases,
  ].join(' ').toLowerCase().contains(query.trim().toLowerCase());
  bool inRegion(String filter) =>
      filter == 'All' ||
      (filter == 'Drinks'
          ? category == 'beverages' || category.startsWith('Minuman')
          : region == filter || region == 'Both');
  Map<String, double?> atWeight(double grams) {
    if (!grams.isFinite || grams <= 0) {
      throw const FormatException('Enter a positive edible weight.');
    }
    return {
      for (final k in nutrientKeys)
        k: nutrients[k] == null
            ? null
            : double.parse(
                (nutrients[k]! * grams / 100).toStringAsFixed(
                  k == 'copper'
                      ? 3
                      : [
                          'energy',
                          'calcium',
                          'phosphorus',
                          'sodium',
                          'potassium',
                        ].contains(k)
                      ? 1
                      : 2,
                ),
              ),
    };
  }

  factory Food.custom(String id, Map<String, dynamic> data) => Food(
    id,
    (data['name'] as Map?)?['id']?.toString() ?? id,
    data['category']?.toString() ?? 'other',
    {
      for (final key in nutrientKeys)
        key: number((data['nutrients'] as Map?)?[key]),
    },
    source: 'Custom food',
    region: 'Custom',
  );
}

bool usableCustomFood(Map<String, dynamic> data) {
  final nutrients = data['nutrients'];
  if (nutrients is! Map) return false;
  if (!nutrientKeys.every((key) {
    final value = nutrients[key];
    return value is num &&
        value.isFinite &&
        value >= 0 &&
        value <=
            (key == 'energy'
                ? 900
                : ['protein', 'fat', 'carbohydrate', 'fiber'].contains(key)
                ? 100
                : 100000);
  })) {
    return false;
  }
  return number(nutrients['protein']) +
          number(nutrients['fat']) +
          number(nutrients['carbohydrate']) <=
      105;
}

Future<List<Food>> loadFoods() async {
  final data = jsonDecode(
    await rootBundle.loadString('assets/tkpi2020_data.json'),
  ) as List;
  final groups = <String, List<Map<String, dynamic>>>{};
  for (final raw in data) {
    if (raw is! Map<String, dynamic> ||
        raw['kode'] is! String ||
        raw['nama'] is! String ||
        raw['per100g'] is! Map<String, dynamic> ||
        !usableNutrients(raw['per100g'])) {
      continue;
    }
    groups.putIfAbsent(raw['kode'], () => []).add(raw);
  }
  final tkpi = groups.entries
      .where(
        (group) => group.value.every(
          (r) =>
              r['nama'] == group.value.first['nama'] &&
              jsonEncode(r['per100g']) ==
                  jsonEncode(group.value.first['per100g']),
        ),
      )
      .map((group) {
        final r = group.value.first;
        return Food(
          'tkpi-${group.key}',
          r['nama'],
          r['kategori']?.toString() ?? 'other',
          {
            for (var i = 0; i < nutrientKeys.length; i++)
              nutrientKeys[i]: number(r['per100g'][tkpiKeys[i]]),
          },
          region: group.key == 'FP081' ? 'Pekalongan' : 'Indonesia',
          aliases: group.key == 'FP081'
              ? ['tauto', 'soto tauto', 'Pekalongan']
              : const [],
        );
      })
      .toList();
  final regional = jsonDecode(
    await rootBundle.loadString('assets/regional_foods.json'),
  ) as List;
  return [
    ...tkpi,
    ...regional.map((raw) => regionalFood(raw as Map<String, dynamic>)),
  ];
}

Food regionalFood(Map<String, dynamic> raw) {
  final n = raw['nutrients'] as Map;
  for (final key in nutrientKeys) {
    final value = n[key];
    if (value == null && !nutrientKeys.take(4).contains(key)) continue;
    if (value is! num ||
        !value.isFinite ||
        value < 0 ||
        value >
            (key == 'energy'
                ? 900
                : nutrientKeys.skip(1).take(4).contains(key)
                ? 100
                : 100000)) {
      throw FormatException('Invalid regional food: ${raw['id']} / $key');
    }
  }
  if (number(n['protein']) + number(n['fat']) + number(n['carbohydrate']) >
      105) {
    throw const FormatException('Invalid regional food composition.');
  }
  return Food(
    raw['id'],
    raw['name'],
    raw['category'],
    {
      for (final key in nutrientKeys)
        key: n[key] == null ? null : (n[key] as num).toDouble(),
    },
    region: raw['region'],
    source: raw['source'],
    sourceUrl: raw['sourceUrl'],
    aliases: List<String>.from(raw['aliases'] as List),
  );
}

Map<String, double?> diaryTotals(Iterable<Map<String, dynamic>> docs) => {
  for (final key in nutrientKeys)
    key: docs.any((d) => (d['nutrients'] as Map?)?[key] is! num)
        ? null
        : docs.fold<double>(
            0,
            (total, d) => total + number((d['nutrients'] as Map?)?[key]),
          ),
};
