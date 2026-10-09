import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image/image.dart' as img;
import 'package:image_picker/image_picker.dart';

import 'screens.dart' show confirm;
import 'ai_service.dart';
import 'help_tip.dart';

Uint8List sanitizeImage(Uint8List input) {
  img.Image? decoded;
  try {
    decoded = img.decodeImage(input);
  } catch (_) {
    throw const FormatException(
      'This image is damaged or unsupported. Choose a JPEG or PNG.',
    );
  }
  if (decoded == null) {
    throw const FormatException(
      'This image could not be decoded. Choose a JPEG or PNG.',
    );
  }
  final oriented = img.bakeOrientation(decoded);
  final resized = img.copyResize(
    oriented,
    width: oriented.width >= oriented.height ? 1024 : null,
    height: oriented.height > oriented.width ? 1024 : null,
  );
  // Copy pixels into a new image so EXIF/GPS metadata is not passed to Gemini.
  final clean = img.Image(
    width: resized.width,
    height: resized.height,
    numChannels: 3,
  );
  img.compositeImage(clean, resized);
  return Uint8List.fromList(img.encodeJpg(clean, quality: 80));
}

class AssistantScreen extends StatefulWidget {
  final bool signedIn;
  const AssistantScreen({super.key, required this.signedIn});
  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> {
  final prompt = TextEditingController();
  final picker = ImagePicker();
  final messages = <Map<String, String>>[];
  Uint8List? photo;
  bool busy = false;
  String? error;
  @override
  void initState() {
    super.initState();
    if (defaultTargetPlatform == TargetPlatform.android) {
      recover();
    }
  }

  Future<void> recover() async {
    try {
      final lost = await picker.retrieveLostData();
      if (lost.files?.isNotEmpty ?? false) {
        await prepare(lost.files!.first);
      } else if (lost.exception != null) {
        if (mounted) {
          setState(
            () => error =
                'The camera could not recover the previous image. Try again.',
          );
        }
      }
    } catch (_) {
      if (mounted) {
        setState(
          () => error = 'Photo recovery failed. You can choose a new photo.',
        );
      }
    }
  }

  Future<void> prepare(XFile file) async {
    if (await file.length() > 20 * 1024 * 1024) {
      throw const FormatException('Choose an image smaller than 20 MB.');
    }
    final bytes = await compute(sanitizeImage, await file.readAsBytes());
    if (mounted) setState(() => photo = bytes);
  }

  Future<void> pick(ImageSource source) async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final file = await picker.pickImage(
        source: source,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );
      if (file != null) await prepare(file);
    } catch (e) {
      if (mounted) {
        setState(
          () => error = e is FormatException ? e.message : 'Camera or photo access failed. Check device permissions or choose another photo.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> send() async {
    if (busy) return;
    final text = prompt.text.trim();
    if (text.isEmpty && photo == null) return;
    setState(() {
      busy = true;
      error = null;
    });
    try {
      if (!await confirm(
            context,
            'Send to Gemini?',
            'Your message, recent conversation and optional food photo will be sent through Firebase AI Logic to Gemini. Free-tier content may be used to improve Google products. Use fictional examples; do not send patient identifiers or sensitive health details. AI answers may be wrong.',
          ) ||
          !mounted) {
        return;
      }
      final reply = await askLearningAssistant(
        message: text,
        history: messages,
        photo: photo,
      );
      if (mounted) {
        setState(() {
          messages.add({
            'role': 'user',
            'text':
                '${text.isEmpty ? 'Identify possible foods' : text}${photo != null ? ' [food photo attached]' : ''}',
          });
          messages.add({'role': 'model', 'text': reply});
          prompt.clear();
          photo = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => error = aiError(e));
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  void dispose() {
    prompt.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Row(children: [Expanded(child: Text('Nutrition assistant', style: Theme.of(context).textTheme.headlineSmall)), const HelpTip(title: 'AI assistant', message: 'Gemini provides educational suggestions, not diagnosis or treatment. Verify guidance. Profile and diary data are not sent automatically; review consent before sending. Photo suggestions never add diary entries.')]),
      const SizedBox(height: 8),
      const Text('Ask a question or review a food photo. Verify suggestions.'),
      if (!widget.signedIn)
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 12),
          child: Text(
            'Sign in to use the protected AI service. Camera previews work locally.',
          ),
        ),
      if (!aiFreeTierEnabled)
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 12),
          child: Text(
            'AI chat is awaiting activation. Your automatic Nutrition Tips are available on the dashboard.',
          ),
        ),
      for (final m in messages)
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  m['role'] == 'user' ? 'You' : 'Gemini · verify this guidance',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                SelectableText(m['text']!),
              ],
            ),
          ),
        ),
      const SizedBox(height: 12),
      TextField(
        controller: prompt,
        enabled: !busy,
        maxLength: 2000,
        minLines: 2,
        maxLines: 5,
        decoration: const InputDecoration(
          labelText: 'Ask about nutrition',
          hintText:
              'For example: explain carbohydrate, protein and fat calculations',
        ),
      ),
      Wrap(
        spacing: 8,
        children: [
          OutlinedButton.icon(
            onPressed: busy ? null : () => pick(ImageSource.camera),
            icon: const Icon(Icons.camera_alt_outlined),
            label: const Text('Take food photo'),
          ),
          OutlinedButton.icon(
            onPressed: busy ? null : () => pick(ImageSource.gallery),
            icon: const Icon(Icons.photo_library_outlined),
            label: const Text('Choose photo'),
          ),
        ],
      ),
      if (photo != null) ...[
        const Text('Local preview — not uploaded yet'),
        Image.memory(photo!, height: 220, fit: BoxFit.contain),
        TextButton(
          onPressed: busy ? null : () => setState(() => photo = null),
          child: const Text('Remove photo'),
        ),
      ],
      if (error != null)
        Text(
          error!,
          style: TextStyle(color: Theme.of(context).colorScheme.error),
        ),
      FilledButton.icon(
        onPressed: busy || !widget.signedIn || !aiFreeTierEnabled ? null : send,
        icon: const Icon(Icons.send_outlined),
        label: Text(busy ? 'Please wait…' : 'Review consent & send'),
      ),
      TextButton(
        onPressed: busy
            ? null
            : () => setState(() {
                messages.clear();
                photo = null;
                prompt.clear();
                error = null;
              }),
        child: const Text('Clear conversation & photo'),
      ),
    ],
  );
}
