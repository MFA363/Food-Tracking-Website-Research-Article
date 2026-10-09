import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:flutter/foundation.dart';

import 'nutrition.dart';

class Cloud {
  static bool ready = false;
  static String? setupError;
  static FirebaseAuth get auth => FirebaseAuth.instance;
  static FirebaseFirestore get db => FirebaseFirestore.instance;
  static Future<void> initialize() async {
    ready = false;
    setupError = null;
    const key = String.fromEnvironment('FIREBASE_API_KEY');
    const appId = String.fromEnvironment('FIREBASE_APP_ID');
    const project = String.fromEnvironment('FIREBASE_PROJECT_ID');
    const sender = String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID');
    final values = [key, appId, project, sender];
    final useNativeMobile =
        !kIsWeb &&
        (defaultTargetPlatform == TargetPlatform.android ||
            defaultTargetPlatform == TargetPlatform.iOS) &&
        values.every((s) => s.isEmpty);
    if (!useNativeMobile && values.any((s) => s.isEmpty)) {
      setupError = 'Mobile Firebase registration is required. The anonymous calculator and food catalogue work without an account.';
      return;
    }
    try {
      if (useNativeMobile) {
        // Android uses resources generated from google-services.json; iOS uses
        // GoogleService-Info.plist included in the Runner target's resources.
        // Both registrations must belong to the same Firebase project.
        await Firebase.initializeApp();
      } else {
        await Firebase.initializeApp(
          options: const FirebaseOptions(
            apiKey: key,
            appId: appId,
            messagingSenderId: sender,
            projectId: project,
            iosBundleId: 'com.calnut.calnut',
          ),
        );
      }
      // Avoid retaining health records in an on-disk Firestore cache on shared devices.
      db.settings = const Settings(persistenceEnabled: false);
      await FirebaseAppCheck.instance.activate(
        providerAndroid: kDebugMode
            ? const AndroidDebugProvider()
            : const AndroidPlayIntegrityProvider(),
        providerApple: kDebugMode
            ? const AppleDebugProvider()
            : const AppleAppAttestWithDeviceCheckFallbackProvider(),
      );
      ready = true;
    } catch (_) {
      setupError = 'Cloud initialization failed. Check the native Firebase registration and App Check setup.';
    }
  }

  static Stream<DocumentSnapshot<Map<String, dynamic>>> profile() =>
      db.collection('users').doc(auth.currentUser!.uid).snapshots();
  static Future<void> register(String email, String password) async {
    final credential = await auth.createUserWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    final user = credential.user!;
    final now = DateTime.now().toUtc().toIso8601String();
    try {
      await db.collection('users').doc(user.uid).set({
        'uid': user.uid,
        'email': user.email,
        'name': email.split('@').first,
        'role': 'user',
        'height': 0,
        'weight': 0,
        'age': 0,
        'gender': 'female',
        'job': '',
        'activityLevel': 'light',
        'language': 'en',
        'createdAt': now,
        'updatedAt': now,
      });
    } catch (_) {
      try {
        await user.delete();
      } catch (_) {
        await auth.signOut();
      }
      rethrow;
    }
  }

  static Future<void> saveProfile(Map<String, dynamic> data) => db
      .collection('users')
      .doc(auth.currentUser!.uid)
      .update({...data, 'updatedAt': DateTime.now().toUtc().toIso8601String()});
  static Stream<QuerySnapshot<Map<String, dynamic>>> logs({String? date}) {
    Query<Map<String, dynamic>> query = db
        .collection('foodLogs')
        .where('userId', isEqualTo: auth.currentUser!.uid);
    if (date != null) {
      query = query.where('date', isEqualTo: date);
    }
    return query.snapshots();
  }

  static Future<void> addFood(
    Food food,
    double grams,
    String date,
    String meal,
  ) async {
    final doc = db.collection('foodLogs').doc();
    await doc.set({
      'id': doc.id,
      'userId': auth.currentUser!.uid,
      'foodId': food.id,
      'foodName': food.name,
      'date': date,
      'mealType': meal,
      'weightGrams': grams,
      'unit': 'gram (g)',
      'unitGrams': 1,
      'quantity': grams,
      'nutrients': food.atWeight(grams),
      'loggedAt': DateTime.now().toUtc().toIso8601String(),
    });
  }
}

String friendlyError(Object error) {
  if (error is FormatException) return error.message;
  if (error is FirebaseException) {
    return switch (error.code) {
      'permission-denied' => 'Access denied. Check your account permissions and deployed Firestore rules.',
      'unavailable' || 'network-request-failed' => 'Network unavailable. Your operation has not been confirmed. Please retry.',
      'invalid-credential' => 'The email or password was not accepted.',
      'email-already-in-use' =>
        'This email already has an account. Sign in instead.',
      'weak-password' =>
        'Use a stronger password with at least six characters.',
      'invalid-email' => 'Enter a valid email address.',
      'unauthenticated' => 'Sign in before using this feature.',
      _ =>
        'The operation could not be completed (${error.code}). Please retry.',
    };
  }
  return 'The operation could not be completed. Please retry.';
}
