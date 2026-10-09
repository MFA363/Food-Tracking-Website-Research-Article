import 'dart:async';

import 'package:flutter/material.dart';

import 'nutrition.dart';
import 'services.dart';
import 'calculator.dart';
import 'assistant.dart';
import 'admin.dart';
import 'daily_tips.dart';

Widget section(String title, String detail, IconData icon) => Card(
  child: Padding(
    padding: const EdgeInsets.all(18),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              Text(detail),
            ],
          ),
        ),
      ],
    ),
  ),
);
Widget page(Widget child) => SingleChildScrollView(
  padding: const EdgeInsets.all(20),
  child: Align(
    alignment: Alignment.topCenter,
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 850),
      child: child,
    ),
  ),
);
Future<bool> confirm(BuildContext context, String title, String body) async =>
    await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text(title),
        content: Text(body),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(c, true),
            child: const Text('Confirm'),
          ),
        ],
      ),
    ) ??
    false;
void notify(BuildContext context, Object error) =>
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(friendlyError(error))));
String unit(String key) => key == 'energy'
    ? 'kcal'
    : ['protein', 'fat', 'carbohydrate', 'fiber'].contains(key)
    ? 'g'
    : 'mg';

class Home extends StatefulWidget {
  final bool signedIn;
  const Home({super.key, required this.signedIn});
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> with WidgetsBindingObserver {
  int selected = 0;
  late Timer dayTimer;
  String today = localDate(DateTime.now());
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    dayTimer = Timer.periodic(const Duration(minutes: 1), (_) => refreshDate());
  }

  void refreshDate() {
    final current = localDate(DateTime.now());
    if (mounted && today != current) {
      setState(() => today = current);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      refreshDate();
    }
  }

  @override
  void dispose() {
    dayTimer.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('CalNut'),
      actions: [
        IconButton(
          tooltip: 'Sources & privacy',
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const Information()),
          ),
          icon: const Icon(Icons.info_outline),
        ),
        if (widget.signedIn)
          IconButton(
            tooltip: 'Sign out',
            onPressed: () async {
              if (await confirm(
                context,
                'Sign out?',
                'Unsaved case and assistant information will be cleared.',
              )) {
                try {
                  await Cloud.auth.signOut();
                } catch (e) {
                  if (context.mounted) notify(context, e);
                }
              }
            },
            icon: const Icon(Icons.logout),
          ),
      ],
    ),
    body: SafeArea(
      child: widget.signedIn
          ? StreamBuilder(
              stream: Cloud.profile(),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return page(
                    section(
                      'Profile unavailable',
                      friendlyError(snapshot.error!),
                      Icons.cloud_off,
                    ),
                  );
                }
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final profile = snapshot.data!.data();
                if (profile == null) {
                  return page(
                    section(
                      'Profile missing',
                      'Contact the administrator to restore this account profile. Sign out is available above.',
                      Icons.person_off_outlined,
                    ),
                  );
                }
                return content(profile);
              },
            )
          : content(null),
    ),
    bottomNavigationBar: NavigationBar(
      selectedIndex: selected,
      onDestinationSelected: (v) => setState(() => selected = v),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.dashboard_outlined),
          label: 'Overview',
        ),
        NavigationDestination(
          icon: Icon(Icons.restaurant_outlined),
          label: 'Diary',
        ),
        NavigationDestination(
          icon: Icon(Icons.calculate_outlined),
          label: 'Case',
        ),
        NavigationDestination(
          icon: Icon(Icons.auto_awesome_outlined),
          label: 'Assistant',
        ),
        NavigationDestination(
          icon: Icon(Icons.person_outline),
          label: 'Profile',
        ),
      ],
    ),
  );
  Widget content(Map<String, dynamic>? profile) => IndexedStack(
    index: selected,
    children: [
      page(
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            section(
              profile == null
                  ? 'Nutrition, made clear'
                  : 'Welcome, ${profile['name'] ?? 'CalNut user'}',
              'Track your own intake. Explore an independent case. Learn with transparent calculations.',
              Icons.eco_outlined,
            ),
            if (!Cloud.ready)
              section(
                'Account sync is not configured',
                Cloud.setupError ?? 'Configure Firebase for this native app.',
                Icons.cloud_off,
              ),
            if (profile != null) ...[
              if (profile['role'] == 'admin')
                FilledButton.icon(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AdminScreen()),
                  ),
                  icon: const Icon(Icons.admin_panel_settings_outlined),
                  label: const Text('Open administration workspace'),
                ),
              PersonalEstimate(profile: profile),
              DailyTotals(profile: profile),
              DailyTips(profile: profile),
              OutlinedButton.icon(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => HistoryScreen(profile: profile),
                  ),
                ),
                icon: const Icon(Icons.history),
                label: const Text('Intake history & nutrient summary'),
              ),
            ],
            FilledButton.icon(
              onPressed: () => setState(() => selected = 2),
              icon: const Icon(Icons.calculate_outlined),
              label: const Text('Patient / teaching calculator'),
            ),
            OutlinedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const FoodCatalogue()),
              ),
              icon: const Icon(Icons.search),
              label: const Text('Explore Indonesian foods'),
            ),
            section(
              'Professional support, not a diagnosis',
              'CalNut provides estimates for education and guided planning. Verify food records, measurements and clinical suitability before using a result.',
              Icons.verified_user_outlined,
            ),
          ],
        ),
      ),
      profile == null ? page(const AccountScreen()) : const DiaryScreen(),
      page(const Calculator()),
      page(AssistantScreen(signedIn: widget.signedIn)),
      profile == null
          ? page(const AccountScreen())
          : page(
              Calculator(
                key: ValueKey(profile['uid']),
                profile: profile,
                personal: true,
              ),
            ),
    ],
  );
}

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});
  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  final email = TextEditingController(), password = TextEditingController();
  bool register = false, busy = false;
  String? message;
  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> perform({bool reset = false}) async {
    setState(() {
      busy = true;
      message = null;
    });
    try {
      if (reset) {
        await Cloud.auth.sendPasswordResetEmail(email: email.text.trim());
        if (mounted) {
          setState(
            () => message =
                'If this account is eligible, a reset email will arrive.',
          );
        }
      } else if (register) {
        await Cloud.register(email.text, password.text);
      } else {
        await Cloud.auth.signInWithEmailAndPassword(
          email: email.text.trim(),
          password: password.text,
        );
      }
    } catch (e) {
      if (mounted) setState(() => message = friendlyError(e));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(
        register ? 'Create your CalNut account' : 'Sign in to sync your diary',
        style: Theme.of(context).textTheme.headlineSmall,
      ),
      const SizedBox(height: 12),
      const Text(
        'Use the same email account as the CalNut website. Personal records sync through your existing Firebase project.',
      ),
      if (!Cloud.ready)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Text(Cloud.setupError ?? 'Native Firebase setup required.'),
        ),
      const SizedBox(height: 16),
      TextField(
        controller: email,
        keyboardType: TextInputType.emailAddress,
        autofillHints: const [AutofillHints.email],
        decoration: const InputDecoration(labelText: 'Email'),
      ),
      const SizedBox(height: 12),
      TextField(
        controller: password,
        obscureText: true,
        autofillHints: const [AutofillHints.password],
        decoration: const InputDecoration(labelText: 'Password'),
      ),
      if (message != null)
        Padding(padding: const EdgeInsets.all(8), child: Text(message!)),
      const SizedBox(height: 12),
      FilledButton(
        onPressed: busy || !Cloud.ready ? null : perform,
        child: Text(
          busy
              ? 'Please wait…'
              : register
              ? 'Register'
              : 'Sign in',
        ),
      ),
      TextButton(
        onPressed: busy ? null : () => setState(() => register = !register),
        child: Text(
          register ? 'Already registered? Sign in' : 'Create an account',
        ),
      ),
      TextButton(
        onPressed: busy || !Cloud.ready ? null : () => perform(reset: true),
        child: const Text('Reset password'),
      ),
      const Text(
        'Registration collects email and password only. Add personal measurements later in Profile. Do not enter patient identifiers into a personal account.',
      ),
    ],
  );
}

class PersonalEstimate extends StatelessWidget {
  final Map<String, dynamic> profile;
  const PersonalEstimate({super.key, required this.profile});
  @override
  Widget build(BuildContext context) {
    try {
      final m = profile['macroPercentages'] as Map?;
      final r = calculateAdult(
        weight: number(profile['weight']),
        height: number(profile['height']),
        age: number(profile['age']).toInt(),
        sex: profile['gender'] ?? '',
        activity: profile['activityLevel'] ?? '',
        protein: number(m?['protein'] ?? 20),
        fat: number(m?['fat'] ?? 30),
      );
      return section(
        'TDEE · ${r.tdee} kcal/day',
        'BMI ${r.bmi.toStringAsFixed(1)} kg/m² · Estimated resting energy ${r.ree.round()} kcal/day\nCarbohydrate ${r.grams('carbohydrate').toStringAsFixed(1)} g · Protein ${r.grams('protein').toStringAsFixed(1)} g · Fat ${r.grams('fat').toStringAsFixed(1)} g',
        Icons.monitor_weight_outlined,
      );
    } catch (_) {
      return section(
        'Complete your personal measurements',
        'Open Profile to calculate an adult planning estimate. The separate Case calculator never changes your profile.',
        Icons.edit_outlined,
      );
    }
  }
}

class DailyTotals extends StatelessWidget {
  final Map<String, dynamic> profile;
  const DailyTotals({super.key, required this.profile});
  @override
  Widget build(BuildContext context) => StreamBuilder(
    key: ValueKey(localDate(DateTime.now())),
    stream: Cloud.logs(date: localDate(DateTime.now())),
    builder: (context, s) {
      if (s.hasError) {
        return section(
          'Diary unavailable',
          friendlyError(s.error!),
          Icons.cloud_off,
        );
      }
      if (!s.hasData) return const LinearProgressIndicator();
      final totals = totalsFor(s.data!.docs.map((d) => d.data()));
      return section(
        'Today · ${totals['energy']!.toStringAsFixed(0)} kcal',
        '${s.data!.docs.length} food entries\nCarbohydrate ${totals['carbohydrate']!.toStringAsFixed(1)} g · Protein ${totals['protein']!.toStringAsFixed(1)} g · Fat ${totals['fat']!.toStringAsFixed(1)} g',
        Icons.restaurant_menu,
      );
    },
  );
}

Map<String, double?> totalsFor(Iterable<Map<String, dynamic>> docs) =>
    diaryTotals(docs);

class DiaryScreen extends StatefulWidget {
  const DiaryScreen({super.key});
  @override
  State<DiaryScreen> createState() => _DiaryScreenState();
}

class _DiaryScreenState extends State<DiaryScreen> {
  DateTime date = DateTime.now();
  @override
  Widget build(BuildContext context) => page(
    Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Food diary', style: Theme.of(context).textTheme.headlineSmall),
        OutlinedButton.icon(
          onPressed: () async {
            final d = await showDatePicker(
              context: context,
              initialDate: date,
              firstDate: DateTime(2000),
              lastDate: DateTime.now(),
            );
            if (d != null && mounted) setState(() => date = d);
          },
          icon: const Icon(Icons.calendar_month),
          label: Text(localDate(date)),
        ),
        FilledButton.icon(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => FoodCatalogue(logDate: localDate(date)),
            ),
          ),
          icon: const Icon(Icons.add),
          label: const Text('Add food'),
        ),
        StreamBuilder(
          key: ValueKey(localDate(date)),
          stream: Cloud.logs(date: localDate(date)),
          builder: (context, s) {
            if (s.hasError) return Text(friendlyError(s.error!));
            if (!s.hasData) return const LinearProgressIndicator();
            if (s.data!.docs.isEmpty) {
              return section(
                'No entries for this date',
                'Search the food catalogue and confirm an edible weight to begin.',
                Icons.restaurant_outlined,
              );
            }
            return Column(
              children: s.data!.docs.map((d) {
                final item = d.data();
                return Card(
                  child: ListTile(
                    title: Text(item['foodName'] ?? 'Food'),
                    subtitle: Text(
                      '${item['mealType']} · ${item['weightGrams']} g\n${number((item['nutrients'] as Map?)?['energy']).toStringAsFixed(1)} kcal',
                    ),
                    isThreeLine: true,
                    trailing: IconButton(
                      tooltip: 'Delete entry',
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () async {
                        if (await confirm(
                          context,
                          'Delete diary entry?',
                          'This removes this food from the selected date.',
                        )) {
                          try {
                            await d.reference.delete();
                          } catch (e) {
                            if (context.mounted) notify(context, e);
                          }
                        }
                      },
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
      ],
    ),
  );
}

class FoodCatalogue extends StatefulWidget {
  final String? logDate;
  const FoodCatalogue({super.key, this.logDate});
  @override
  State<FoodCatalogue> createState() => _FoodCatalogueState();
}

class _FoodCatalogueState extends State<FoodCatalogue> {
  late Future<List<Food>> foods = loadFoods();
  String query = '';
  String region = 'All';
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(
        widget.logDate == null
            ? 'Food catalogue'
            : 'Add food · ${widget.logDate}',
      ),
    ),
    body: SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: const InputDecoration(
                labelText: 'Search foods & drinks',
                hintText: 'Try tauto, nasi lemak or air kelapa',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (v) => setState(() => query = v.toLowerCase().trim()),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Wrap(
              children: [
                for (final label in ['All', 'Pekalongan', 'Malaysia', 'Drinks'])
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(label),
                      selected: region == label,
                      onSelected: (_) => setState(() => region = label),
                    ),
                  ),
              ],
            ),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Text('TKPI & MyFCD · Per 100 g edible portion'),
          ),
          Expanded(
            child: FutureBuilder(
              future: foods,
              builder: (context, s) {
                if (s.hasError) {
                  return const Center(
                    child: Text(
                      'Food data could not be loaded. Reopen this screen to retry.',
                    ),
                  );
                }
                if (!s.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (Cloud.ready && Cloud.auth.currentUser != null) {
                  return StreamBuilder(
                    stream: Cloud.db.collection('foods').snapshots(),
                    builder: (context, c) => Column(
                      children: [
                        if (c.hasData &&
                            c.data!.docs.any(
                              (d) => !usableCustomFood(d.data()),
                            ))
                          const Text(
                            'Some custom foods have incomplete or invalid nutrient data and cannot be logged until corrected.',
                          ),
                        if (c.hasError)
                          Text(
                            'Custom foods unavailable: ${friendlyError(c.error!)}',
                          ),
                        Expanded(
                          child: foodList([
                            ...s.data!,
                            ...?(c.data?.docs
                                .where((d) => usableCustomFood(d.data()))
                                .map((d) => Food.custom(d.id, d.data()))),
                          ]),
                        ),
                      ],
                    ),
                  );
                }
                return foodList(s.data!);
              },
            ),
          ),
        ],
      ),
    ),
  );
  Widget foodList(List<Food> all) {
    final matches = all
        .where((f) => f.matches(query) && f.inRegion(region))
        .toList();
    return ListView.builder(
      itemCount: matches.length + 1,
      itemBuilder: (context, i) {
        if (i == 0) {
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              matches.isEmpty
                  ? 'No matches. Try another spelling or region.'
                  : '${matches.length} foods & drinks',
            ),
          );
        }
        final f = matches[i - 1];
        return ListTile(
          title: Text(f.name),
          subtitle: Text('${f.nutrients['energy']} kcal / 100 g · ${f.source}'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => FoodDetail(food: f, logDate: widget.logDate),
            ),
          ),
        );
      },
    );
  }
}

class FoodDetail extends StatefulWidget {
  final Food food;
  final String? logDate;
  const FoodDetail({super.key, required this.food, this.logDate});
  @override
  State<FoodDetail> createState() => _FoodDetailState();
}

class _FoodDetailState extends State<FoodDetail> {
  final grams = TextEditingController(text: '100');
  String meal = 'lunch';
  bool busy = false;
  String? error;
  @override
  void dispose() {
    grams.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final weight = double.tryParse(grams.text);
    final valid =
        weight != null && weight.isFinite && weight > 0 && weight <= 10000;
    final values = valid ? widget.food.atWeight(weight) : null;
    return Scaffold(
      appBar: AppBar(title: Text(widget.food.name)),
      body: page(
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: ExpansionTile(
                title: const Text('Food reference'),
                subtitle: Text(widget.food.source),
                childrenPadding: const EdgeInsets.all(16),
                children: [
                  const Text(
                    'Values are per 100 g edible portion. Recipes and brands vary. Match the preparation and weigh your portion. Unreported nutrients are not zero; affected diary totals are marked incomplete.',
                  ),
                  if (widget.food.sourceUrl.isNotEmpty)
                    SelectableText(widget.food.sourceUrl),
                ],
              ),
            ),
            TextField(
              controller: grams,
              enabled: !busy,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: const InputDecoration(
                labelText: 'Edible portion weight (g)',
                helperText: 'Enter 0–10,000 g, excluding inedible parts.',
              ),
              onChanged: (_) => setState(() => error = null),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: meal,
              decoration: const InputDecoration(labelText: 'Meal'),
              items: [
                'breakfast',
                'lunch',
                'dinner',
                'snack',
              ].map((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
              onChanged: busy ? null : (m) => setState(() => meal = m!),
            ),
            if (values != null)
              for (final k in nutrientKeys)
                ListTile(
                  dense: true,
                  title: Text(k),
                  trailing: Text(
                    values[k] == null
                        ? 'Not reported'
                        : '${values[k]} ${unit(k)}',
                  ),
                ),
            if (!valid)
              const Text('Enter a valid positive weight (maximum 10,000 g).'),
            if (error != null) Text(error!),
            if (widget.logDate != null)
              FilledButton(
                onPressed: !valid || busy
                    ? null
                    : () async {
                        setState(() => busy = true);
                        try {
                          await Cloud.addFood(
                            widget.food,
                            weight,
                            widget.logDate!,
                            meal,
                          );
                          if (context.mounted) {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Food saved to your diary.'),
                              ),
                            );
                          }
                        } catch (e) {
                          if (mounted) setState(() => error = friendlyError(e));
                        } finally {
                          if (mounted) setState(() => busy = false);
                        }
                      },
                child: Text(busy ? 'Saving…' : 'Confirm & save to diary'),
              ),
          ],
        ),
      ),
    );
  }
}

class HistoryScreen extends StatelessWidget {
  final Map<String, dynamic> profile;
  const HistoryScreen({super.key, required this.profile});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Intake history')),
    body: StreamBuilder(
      stream: Cloud.logs(),
      builder: (context, s) {
        if (s.hasError) return page(Text(friendlyError(s.error!)));
        if (!s.hasData) return const Center(child: CircularProgressIndicator());
        final groups = <String, List<Map<String, dynamic>>>{};
        for (final d in s.data!.docs) {
          groups
              .putIfAbsent(d.data()['date']?.toString() ?? 'Unknown', () => [])
              .add(d.data());
        }
        final dates = groups.keys.toList()..sort((a, b) => b.compareTo(a));
        final ref = referenceIntakes(
          profile['gender'] ?? '',
          number(profile['age']).toInt(),
        );
        return page(
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Reference: Indonesian AKG 2019 adult age/sex bands. These population references are not individualized treatment targets. Sodium is not a goal to reach.',
              ),
              if (dates.isEmpty) const Text('No diary entries yet.'),
              for (final date in dates)
                Card(
                  child: ExpansionTile(
                    title: Text(date),
                    subtitle: Text(
                      '${totalsFor(groups[date]!)['energy']!.round()} kcal · ${groups[date]!.length} entries',
                    ),
                    children: [
                      for (final k in nutrientKeys)
                        ListTile(
                          dense: true,
                          title: Text(k),
                          subtitle: Text('AKG reference: ${ref[k]} ${unit(k)}'),
                          trailing: Text(
                            totalsFor(groups[date]!)[k] == null
                                ? 'Incomplete data'
                                : '${totalsFor(groups[date]!)[k]!.toStringAsFixed(1)} ${unit(k)}',
                          ),
                        ),
                    ],
                  ),
                ),
            ],
          ),
        );
      },
    ),
  );
}

class Information extends StatelessWidget {
  const Information({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Sources, safety & privacy')),
    body: page(
      const SelectableText(
        'CalNut — educational nutrition planning\n\nFood data: bundled tkpi2020_data.json, screened for missing, negative and physically implausible values and conflicting codes. Screening is not laboratory or clinical validation. Additional foods: MOH Malaysia MyFCD (1997/current editions), https://myfcd.moh.gov.my/. Each regional food shows its source. Unreported nutrients remain unavailable, not zero. Malaysian references may differ from local recipes. Food preparation and portion estimates affect results.\n\nEnergy: Mifflin MD et al. (1990), Am J Clin Nutr 51:241–247. DOI: 10.1093/ajcn/51.2.241. Activity multipliers are planning assumptions, not a measured TDEE.\n\nAdult AMDR: National Academies Dietary Reference Intakes (2005): carbohydrate 45–65%, protein 10–35%, fat 20–35%. https://nap.nationalacademies.org/catalog/10490/\n\nMicronutrient reference: Indonesian Ministry of Health Regulation No. 28 of 2019 (AKG). https://peraturan.bpk.go.id/Details/138621/permenkes-no-28-tahun-2019\n\nNot for autonomous diagnosis, prescribing, emergency care, pediatric calculations, pregnancy/lactation or disease-specific treatment. A qualified professional must assess suitability.\n\nPrivacy: signed-in profile and diary records use the same Firebase collections as the website. Authorized administrators can access records. The separate case calculator stays in memory and is not saved to Firebase. Sharing results leaves CalNut and is your choice. Sign out on shared devices.\n\nAI is optional. Only messages and photos you explicitly send are transmitted through Firebase to Gemini. No profile or diary data is automatically attached. Avoid names, faces and patient identifiers. Images are resized and metadata is removed before upload. Gemini output may be incorrect. Confirm food identity and edible weight against the catalogue; photos cannot measure portions reliably. Chat is not saved by this app, but cloud provider processing and retention policies still apply.\n\nBefore public release, the operator must publish their privacy policy, contact and deletion process, configure provider data handling, and complete store disclosures. This development build is not clinically validated.',
      ),
    ),
  );
}
