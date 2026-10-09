import 'package:flutter/material.dart';

import 'services.dart';
import 'screens.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Cloud.initialize();
  runApp(const CalNutApp());
}

class CalNutApp extends StatelessWidget {
  const CalNutApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'CalNut',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff126b60)),
      scaffoldBackgroundColor: const Color(0xfff6f9f8),
      inputDecorationTheme: const InputDecorationTheme(
        border: OutlineInputBorder(),
        filled: true,
      ),
      cardTheme: const CardThemeData(
        margin: EdgeInsets.symmetric(vertical: 8),
        elevation: 0,
      ),
    ),
    home: Cloud.ready
        ? StreamBuilder(
            stream: Cloud.auth.authStateChanges(),
            builder: (context, snapshot) => Home(
              key: ValueKey(snapshot.data?.uid),
              signedIn: snapshot.data != null,
            ),
          )
        : const Home(signedIn: false),
  );
}
