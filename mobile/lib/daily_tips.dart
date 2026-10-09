import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import 'nutrition.dart';
import 'nutrition_tips.dart';
import 'services.dart';
import 'help_tip.dart';

class DailyTips extends StatefulWidget {
  final Map<String, dynamic> profile;
  const DailyTips({super.key, required this.profile});
  @override
  State<DailyTips> createState() => _DailyTipsState();
}

class _DailyTipsState extends State<DailyTips> with WidgetsBindingObserver {
  late String date;
  late Stream<QuerySnapshot<Map<String, dynamic>>> logs;
  Timer? timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    date = localDate(DateTime.now());
    logs = Cloud.logs(date: date);
    timer = Timer.periodic(const Duration(seconds: 30), (_) => refreshDate());
  }

  void refreshDate() {
    final today = localDate(DateTime.now());
    if (today != date && mounted) {
      setState(() {
        date = today;
        logs = Cloud.logs(date: date);
      });
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) refreshDate();
  }

  @override
  void dispose() {
    timer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => StreamBuilder(
    key: ValueKey(date),
    stream: logs,
    builder: (context, snapshot) {
      if (snapshot.hasError) {
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Nutrition tips unavailable: ${friendlyError(snapshot.error!)}',
            ),
          ),
        );
      }
      if (!snapshot.hasData) return const LinearProgressIndicator();
      return NutritionTipsView(
        profile: widget.profile,
        entries: snapshot.data!.docs.map((d) => d.data()).toList(),
      );
    },
  );
}

class NutritionTipsView extends StatelessWidget {
  final Map<String, dynamic> profile;
  final List<Map<String, dynamic>> entries;
  const NutritionTipsView({
    super.key,
    required this.profile,
    required this.entries,
  });

  @override
  Widget build(BuildContext context) {
    final rawAge = profile['age'];
    final age = number(rawAge).toInt();
    final sex = profile['gender']?.toString() ?? '';
    final supported =
        rawAge is num &&
        rawAge.isFinite &&
        rawAge == age &&
        age >= 19 &&
        age <= 120 &&
        ['male', 'female'].contains(sex);
    final tips = nutritionTips(entries: entries, sex: sex, age: age);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(children: [Expanded(child: Text('Nutrition Tips', style: Theme.of(context).textTheme.titleLarge)), const HelpTip(title: 'About nutrition tips', message: 'Calculated on this device from diary entries and AKG 2019 adult references. Tips update when your diary or profile changes. Intake below a reference is not a diagnosis. Incomplete food values affect comparisons; vitamin totals are unavailable.')]),
            const SizedBox(height: 8),
            if (!supported)
              const Text(
                'Enter your age (19–120) and reference sex in your profile to compare adult intake.',
              )
            else if (entries.isEmpty)
              const Text(
                'Log your first food today to see nutrition tips. An empty diary does not indicate a deficiency.',
              )
            else ...[
              MealPlanningPrompts(profile: profile, entries: entries),
              Text('AKG 2019 adult references · age $age · $sex'),
              for (final tip in tips)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${tip.nutrient[0].toUpperCase()}${tip.nutrient.substring(1)}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      Text(
                        '${tip.recorded.toStringAsFixed(tip.nutrient == 'copper' ? 2 : 1)} / ${tip.reference} ${tip.unit} recorded / AKG reference',
                      ),
                      if (tip.status != TipStatus.incomplete &&
                          tip.nutrient != 'sodium')
                        LinearProgressIndicator(value: tip.progress),
                      Text(switch (tip.status) {
                        TipStatus.belowReference =>
                          'Below today’s reference · gap ${tip.gap.toStringAsFixed(tip.nutrient == 'copper' ? 2 : 1)} ${tip.unit}',
                        TipStatus.referenceReached =>
                          'Reference reached in the diary',
                        TipStatus.incomplete => 'Incomplete nutrient data',
                        TipStatus.sodiumReview => 'Sodium guidance',
                      }),
                      Text(tip.advice),
                    ],
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class MealPlanningPrompts extends StatefulWidget {
  final Map<String, dynamic> profile;
  final List<Map<String, dynamic>> entries;
  const MealPlanningPrompts({
    super.key,
    required this.profile,
    required this.entries,
  });
  @override
  State<MealPlanningPrompts> createState() => _MealPlanningPromptsState();
}

class _MealPlanningPromptsState extends State<MealPlanningPrompts> {
  String meal = 'Lunch';
  static const ideas = {
    'Breakfast': 'For breakfast, consider a staple or whole grain, a protein food, and fruit or vegetables.',
    'Lunch': 'For lunch, combine a staple, a protein food such as tempeh or fish, and vegetables.',
    'Dinner': 'For dinner, vary your staple, protein food and vegetables from earlier meals.',
    'Snack': 'If a snack suits your hunger and plan, consider fruit, plain yogurt or unsalted nuts.',
  };
  String label(String key) => '${key[0].toUpperCase()}${key.substring(1)}';
  @override
  Widget build(BuildContext context) {
    final plan = mealPlan(entries: widget.entries, profile: widget.profile);
    final tips = nutritionTips(
      entries: widget.entries,
      sex: widget.profile['gender']?.toString() ?? '',
      age: number(widget.profile['age']).toInt(),
    );
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(children: [Expanded(child: Text('Plan your next meal', style: Theme.of(context).textTheme.titleLarge)), const HelpTip(title: 'Meal prompts', message: 'Prompts use the remaining daily references and food groups as ideas, not prescribed portions or a clinical meal plan.')]),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: meal,
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Meal to plan'),
            items: ideas.keys
                .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                .toList(),
            onChanged: (value) {
              if (value != null) setState(() => meal = value);
            },
          ),
          const SizedBox(height: 12),
          Text(ideas[meal]!),
          for (final tip in plan.priorities)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Text('${label(tip.nutrient)}: ${tip.advice}'),
            ),
          if (plan.priorities.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Text(
                tips.any((t) => t.status == TipStatus.incomplete)
                    ? 'Complete missing nutrient values before using personalized food priorities.'
                    : 'Tracked references are reached. Keep variety in your meals.',
              ),
            ),
          const SizedBox(height: 16),
          Text(
            'Remaining for the day',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const Text(
            'These are whole-day differences, not prescribed portions for this meal.',
          ),
          const SizedBox(height: 8),
          for (final item in plan.budget)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 3),
              child: Text(
                '${label(item.nutrient)}: ${item.remaining == null ? 'Incomplete data' : '${item.remaining!.toStringAsFixed(1)} ${item.nutrient == 'energy' ? 'kcal' : 'g'}'}',
              ),
            ),
          const SizedBox(height: 8),
          Text(
            plan.customTargets
                ? 'Macros use your saved allocation and estimated TDEE.'
                : 'Macros use adult AKG references. Save an allocation in Profile to personalize them.',
          ),
          Text(
            plan.estimatedEnergy ? 'Energy uses your current estimated TDEE.' : 'Complete adult measurements in Profile to show estimated energy remaining.',
          ),
          const SizedBox(height: 10),
          const Text(
            'Choose foods suitable for your allergies and care plan. Review their catalogue values and portions in Diary before adding them. Food examples do not guarantee that a portion closes a gap. Do not skip meals to compensate for a reached target.',
          ),
        ],
      ),
    );
  }
}
