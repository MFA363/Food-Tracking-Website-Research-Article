import 'package:flutter/material.dart';

class HelpTip extends StatelessWidget {
  final String title;
  final String message;
  const HelpTip({super.key, required this.title, required this.message});

  @override
  Widget build(BuildContext context) => IconButton(
    tooltip: 'Help: $title',
    visualDensity: VisualDensity.compact,
    constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
    icon: const Icon(Icons.info_outline, size: 19),
    onPressed: () => showModalBottomSheet<void>(
      context: context,
      useSafeArea: true,
      builder: (sheetContext) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Text(message),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => Navigator.pop(sheetContext),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
