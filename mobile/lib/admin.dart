import 'package:flutter/material.dart';

import 'nutrition.dart';
import 'screens.dart' show page, confirm, notify, section, unit;
import 'services.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Administration')),
    body: StreamBuilder(
      stream: Cloud.profile(),
      builder: (context, p) {
        if (p.hasError) return page(Text(friendlyError(p.error!)));
        if (!p.hasData) return const Center(child: CircularProgressIndicator());
        if (p.data!.data()?['role'] != 'admin') {
          return const Center(child: Text('Administrator access required.'));
        }
        return DefaultTabController(
          length: 3,
          child: Column(
            children: [
              const TabBar(
                tabs: [
                  Tab(text: 'Users'),
                  Tab(text: 'Foods'),
                  Tab(text: 'Logs'),
                ],
              ),
              Expanded(
                child: TabBarView(
                  children: [
                    collection(context, 'users'),
                    collection(context, 'foods'),
                    collection(context, 'foodLogs'),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    ),
  );
  Widget collection(BuildContext context, String name) => Column(
    children: [
      if (name == 'foods')
        Padding(
          padding: const EdgeInsets.all(12),
          child: FilledButton.icon(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const FoodEditor()),
            ),
            icon: const Icon(Icons.add),
            label: const Text('Add custom food'),
          ),
        ),
      Expanded(
        child: StreamBuilder(
          stream: Cloud.db.collection(name).limit(200).snapshots(),
          builder: (context, s) {
            if (s.hasError) return page(Text(friendlyError(s.error!)));
            if (!s.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            return ListView(
              children: [
                section(
                  '${s.data!.docs.length} records shown',
                  'Maximum 200 records in this mobile view. Food catalogue editing affects custom records only; the bundled TKPI file is unchanged.',
                  Icons.admin_panel_settings_outlined,
                ),
                for (final doc in s.data!.docs)
                  Builder(
                    builder: (context) {
                      final d = doc.data();
                      if (name == 'users') {
                        return ListTile(
                          title: Text(d['name']?.toString() ?? doc.id),
                          subtitle: Text('${d['email']} · ${d['role']}'),
                          trailing: doc.id == Cloud.auth.currentUser!.uid
                              ? const Text('You')
                              : TextButton(
                                  onPressed: () async {
                                    final role = d['role'] == 'admin'
                                        ? 'user'
                                        : 'admin';
                                    if (await confirm(
                                      context,
                                      'Change account role?',
                                      'Set ${d['email']} to $role? Administrators can access user records.',
                                    )) {
                                      try {
                                        await doc.reference.update({
                                          'role': role,
                                          'updatedAt': DateTime.now()
                                              .toUtc()
                                              .toIso8601String(),
                                        });
                                      } catch (e) {
                                        if (context.mounted) notify(context, e);
                                      }
                                    }
                                  },
                                  child: const Text('Change role'),
                                ),
                        );
                      }
                      if (name == 'foods') {
                        return ListTile(
                          title: Text(Food.custom(doc.id, d).name),
                          subtitle: Text('${d['category']}'),
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => FoodEditor(id: doc.id, data: d),
                            ),
                          ),
                          trailing: IconButton(
                            tooltip: 'Delete custom food',
                            icon: const Icon(Icons.delete_outline),
                            onPressed: () => remove(
                              context,
                              doc.reference.delete,
                              'Remove custom food?',
                              'Existing diary snapshots are retained.',
                            ),
                          ),
                        );
                      }
                      return ListTile(
                        title: Text(d['foodName'] ?? doc.id),
                        subtitle: Text(
                          '${d['date']} · ${d['userId']}\n${d['weightGrams']} g',
                        ),
                        trailing: IconButton(
                          tooltip: 'Delete food log',
                          icon: const Icon(Icons.delete_outline),
                          onPressed: () => remove(
                            context,
                            doc.reference.delete,
                            'Remove food log?',
                            'This changes the user’s intake history.',
                          ),
                        ),
                      );
                    },
                  ),
              ],
            );
          },
        ),
      ),
    ],
  );
  Future<void> remove(
    BuildContext context,
    Future<void> Function() action,
    String title,
    String detail,
  ) async {
    if (await confirm(context, title, detail)) {
      try {
        await action();
      } catch (e) {
        if (context.mounted) notify(context, e);
      }
    }
  }
}

class FoodEditor extends StatefulWidget {
  final String? id;
  final Map<String, dynamic>? data;
  const FoodEditor({super.key, this.id, this.data});
  @override
  State<FoodEditor> createState() => _FoodEditorState();
}

class _FoodEditorState extends State<FoodEditor> {
  final fields = <String, TextEditingController>{};
  bool busy = false;
  String? error;
  @override
  void initState() {
    super.initState();
    final d = widget.data ?? {};
    fields['name'] = TextEditingController(
      text: (d['name'] as Map?)?['id'] ?? '',
    );
    fields['category'] = TextEditingController(text: d['category'] ?? 'other');
    for (final k in nutrientKeys) {
      fields[k] = TextEditingController(
        text: ((d['nutrients'] as Map?)?[k] ?? '').toString(),
      );
    }
  }

  @override
  void dispose() {
    for (final c in fields.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> save() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final values = <String, double>{};
      for (final k in nutrientKeys) {
        final n = double.tryParse(fields[k]!.text);
        if (n == null || !n.isFinite || n < 0) {
          throw FormatException(
            'Enter a non-negative measured value for $k. Do not substitute zero for unknown data.',
          );
        }
        values[k] = n;
      }
      if (fields['name']!.text.trim().isEmpty) {
        throw const FormatException('Enter a food name.');
      }
      if (!usableCustomFood({'nutrients': values})) {
        throw const FormatException(
          'Check all nutrient amounts and units for a 100 g portion.',
        );
      }
      if (values['energy']! > 900 ||
          [
            'protein',
            'fat',
            'carbohydrate',
            'fiber',
          ].any((k) => values[k]! > 100) ||
          values['protein']! + values['fat']! + values['carbohydrate']! > 105) {
        throw const FormatException(
          'Nutrients are implausible for a 100 g portion. Check the source.',
        );
      }
      final doc = widget.id == null
          ? Cloud.db.collection('foods').doc()
          : Cloud.db.collection('foods').doc(widget.id);
      await doc.set({
        ...?widget.data,
        'id': doc.id,
        'name': {
          for (final lang in ['id', 'en', 'ms', 'jv', 'ar'])
            lang: fields['name']!.text.trim(),
        },
        'category': fields['category']!.text.trim(),
        'nutrients': values,
        'defaultUnit': 'gram (g)',
        'defaultWeight': 100,
        'isCustom': true,
        'createdBy': widget.data?['createdBy'] ?? Cloud.auth.currentUser!.uid,
      });
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) setState(() => error = friendlyError(e));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(widget.id == null ? 'Add custom food' : 'Edit custom food'),
    ),
    body: page(
      Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'All nutrients are per 100 g edible portion. Verify against an authoritative source before saving.',
          ),
          for (final k in ['name', 'category', ...nutrientKeys])
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: TextField(
                controller: fields[k],
                enabled: !busy,
                keyboardType: nutrientKeys.contains(k)
                    ? const TextInputType.numberWithOptions(decimal: true)
                    : TextInputType.text,
                decoration: InputDecoration(
                  labelText: nutrientKeys.contains(k) ? '$k (${unit(k)})' : k,
                ),
              ),
            ),
          if (error != null) Text(error!),
          FilledButton(
            onPressed: busy ? null : save,
            child: Text(busy ? 'Saving…' : 'Save food'),
          ),
        ],
      ),
    ),
  );
}
