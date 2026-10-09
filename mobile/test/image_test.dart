import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:calnut/assistant.dart';

void main() {
  test('photo sanitizer resizes and produces JPEG without EXIF', () {
    final original = img.Image(width: 1800, height: 1200);
    original.exif.imageIfd[0x010e] = 'private image description';
    final result = sanitizeImage(Uint8List.fromList(img.encodeJpg(original)));
    final decoded = img.decodeJpg(result)!;
    expect(decoded.width, 1024);
    expect(decoded.height, 683);
    expect(decoded.exif.imageIfd.containsKey(0x010e), isFalse);
    expect(result[0], 255);
    expect(result[1], 216);
  });
  test('invalid photos fail without upload', () {
    expect(
      () => sanitizeImage(Uint8List.fromList([1, 2, 3])),
      throwsFormatException,
    );
  });
}
