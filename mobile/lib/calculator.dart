import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import 'nutrition.dart';
import 'services.dart';
import 'help_tip.dart';

class Calculator extends StatefulWidget {
  final Map<String, dynamic>? profile;
  final bool personal;
  const Calculator({super.key, this.profile, this.personal = false});
  @override
  State<Calculator> createState() => _CalculatorState();
}

class _CalculatorState extends State<Calculator> {
  final fields = <String, TextEditingController>{};
  String sex = 'female', activity = 'light';
  NutritionResult? result;
  String? error, notice;
  bool saving = false;
  @override
  void initState() {
    super.initState();
    final p = widget.profile ?? {};
    for (final key in ['height', 'weight', 'age', 'protein', 'fat', 'name']) {
      final value = ['protein', 'fat'].contains(key)
          ? ((p['macroPercentages'] as Map?)?[key])
          : p[key];
      fields[key] = TextEditingController(
        text:
            value?.toString() ??
            (key == 'protein'
                ? '20'
                : key == 'fat'
                ? '30'
                : ''),
      );
    }
    sex = ['male', 'female'].contains(p['gender']) ? p['gender'] : 'female';
    activity = activityFactors.containsKey(p['activityLevel'])
        ? p['activityLevel']
        : 'light';
  }

  @override
  void dispose() {
    for (final c in fields.values) {
      c.dispose();
    }
    super.dispose();
  }

  void changed() {
    setState(() {
      result = null;
      error = null;
      notice = null;
    });
  }

  NutritionResult calculate() => calculateAdult(
    weight: double.tryParse(fields['weight']!.text) ?? double.nan,
    height: double.tryParse(fields['height']!.text) ?? double.nan,
    age: int.tryParse(fields['age']!.text) ?? 0,
    sex: sex,
    activity: activity,
    protein: double.tryParse(fields['protein']!.text) ?? double.nan,
    fat: double.tryParse(fields['fat']!.text) ?? double.nan,
  );
  Future<void> submit() async {
    setState(() {
      error = null;
      notice = null;
    });
    try {
      final value = calculate();
      if (widget.personal) {
        setState(() => saving = true);
        await Cloud.saveProfile({
          'name': fields['name']!.text.trim(),
          'height': double.parse(fields['height']!.text),
          'weight': double.parse(fields['weight']!.text),
          'age': int.parse(fields['age']!.text),
          'gender': sex,
          'activityLevel': activity,
          'macroPercentages': value.percentages,
        });
      }
      if (mounted) {
        setState(() {
          result = value;
          notice = widget.personal ? 'Personal profile saved.' : null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = friendlyError(e));
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final protein = double.tryParse(fields['protein']!.text),
        fat = double.tryParse(fields['fat']!.text);
    final carbohydrate =
        protein != null && fat != null && protein.isFinite && fat.isFinite
        ? 100 - protein - fat
        : null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(children: [Expanded(child: Text(widget.personal ? 'My profile' : 'Case calculator', style: Theme.of(context).textTheme.headlineSmall)), HelpTip(title: 'About this calculator', message: widget.personal ? 'Profile values update your account and personalize estimates.' : 'Use for adult teaching scenarios. Measurements stay on this screen and are not saved to Firebase.')]),
        const SizedBox(height: 16),
        if (widget.personal)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: TextField(
              controller: fields['name'],
              enabled: !saving,
              decoration: const InputDecoration(labelText: 'Display name'),
              onChanged: (_) => changed(),
            ),
          ),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final item in {
              'height': 'Height (cm)',
              'weight': 'Weight (kg)',
              'age': 'Age (years)',
              'protein': 'Protein (%)',
              'fat': 'Fat (%)',
            }.entries)
              SizedBox(
                width: 180,
                child: TextField(
                  controller: fields[item.key],
                  enabled: !saving,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: InputDecoration(labelText: item.value),
                  onChanged: (_) => changed(),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          'Carbohydrate (automatic): ${carbohydrate?.toStringAsFixed(1) ?? "—"}%',
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          isExpanded: true,
          initialValue: sex,
          decoration: const InputDecoration(
            labelText: 'Sex used by the equation',
          ),
          items: [
            'female',
            'male',
          ].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
          onChanged: saving
              ? null
              : (v) {
                  sex = v!;
                  changed();
                },
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          isExpanded: true,
          initialValue: activity,
          decoration: const InputDecoration(
            labelText: 'Activity multiplier (estimate)',
          ),
          items: activityFactors.entries
              .map(
                (e) => DropdownMenuItem(
                  value: e.key,
                  child: Text('${e.key.replaceAll('_', ' ')} · ${e.value}'),
                ),
              )
              .toList(),
          onChanged: saving
              ? null
              : (v) {
                  activity = v!;
                  changed();
                },
        ),
        const SizedBox(height: 12),
        Row(children: [const Expanded(child: Text('Adult estimate · not a prescription.')), HelpTip(title: 'Methods and limits', message: 'For adults aged 19–78. Carbohydrate = 100% − protein − fat; allocation must total 100%. General adult AMDR: carbohydrate 45–65%, protein 10–35%, fat 20–35%. Special clinical needs require professional assessment.')]),
        const SizedBox(height: 12),
        if (error != null)
          Text(
            error!,
            style: TextStyle(color: Theme.of(context).colorScheme.error),
          ),
        if (notice != null) Text(notice!),
        FilledButton.icon(
          onPressed: saving ? null : submit,
          icon: const Icon(Icons.calculate_outlined),
          label: Text(
            saving
                ? 'Saving…'
                : widget.personal
                ? 'Save & calculate'
                : 'Calculate',
          ),
        ),
        if (!widget.personal)
          TextButton(
            onPressed: () {
              for (final c in fields.values) {
                c.clear();
              }
              fields['protein']!.text = '20';
              fields['fat']!.text = '30';
              changed();
            },
            child: const Text('New case / clear measurements'),
          ),
        if (result != null)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Planning results',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  SelectableText(result!.report()),
                  const SizedBox(height: 8),
                  Row(children: [const Expanded(child: Text('Planning estimate · screening measures are not diagnoses.')), HelpTip(title: 'Calculation methods', message: 'Mifflin–St Jeor estimates resting energy: 10 × kg + 6.25 × cm − 5 × age + (5 male / −161 female). TDEE = estimate × activity factor. BMI = kg / m².')]),
                  TextButton.icon(
                    onPressed: () async {
                      final box = context.findRenderObject() as RenderBox?;
                      try {
                        await SharePlus.instance.share(
                          ShareParams(
                            text: result!.report(),
                            sharePositionOrigin: box == null
                                ? null
                                : box.localToGlobal(Offset.zero) & box.size,
                          ),
                        );
                      } catch (e) {
                        if (mounted) setState(() => error = friendlyError(e));
                      }
                    },
                    icon: const Icon(Icons.share_outlined),
                    label: Text(
                      widget.personal
                          ? 'Share my results'
                          : 'Share case results',
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
