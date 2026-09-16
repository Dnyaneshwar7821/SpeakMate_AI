/**
 * Image processing utilities for profile avatars.
 *
 * Enforces the Mobile <-> Backend contract:
 * - Resizes to 256x256 px.
 * - Compresses JPEG quality to ~0.5.
 * - Handles EXIF orientation.
 * - Encodes to Base64 data URI (data:image/jpeg;base64,...).
 * - Validates that payload size stays strictly under 64 KB (65,536 chars).
 */

let ImageManipulator = null;
try {
  ImageManipulator = require('expo-image-manipulator');
} catch (_) {
  ImageManipulator = null;
}

export const MAX_AVATAR_PAYLOAD_CHARS = 65536; // 64 KB backend contract

/**
 * Resizes and compresses a selected image URI for use as a profile avatar.
 *
 * @param {string} imageUri - File URI of the picked/cropped image
 * @returns {Promise<{ dataUri: string, sizeChars: number, approxKb: number }>}
 */
export async function prepareAvatarAsync(imageUri) {
  if (!imageUri) {
    throw new Error('No image URI provided.');
  }

  let base64Data = null;

  if (ImageManipulator && typeof ImageManipulator.manipulateAsync === 'function') {
    try {
      // 1. Resize down to 256x256 square, compress to 0.5 JPEG, handle EXIF orientation
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 256, height: 256 } }],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      base64Data = result.base64;
    } catch (manipError) {
      console.warn('[imageUtils] ImageManipulator failed, checking fallback:', manipError);
    }
  }

  if (!base64Data) {
    throw new Error('Unable to compress and encode image. Please try another photo.');
  }

  const dataUri = `data:image/jpeg;base64,${base64Data}`;
  const sizeChars = dataUri.length;
  const approxKb = Math.round(sizeChars / 1024);

  // Validate contract limit before sending
  if (sizeChars > MAX_AVATAR_PAYLOAD_CHARS) {
    throw new Error(
      `Avatar payload (${approxKb} KB) exceeds the maximum allowed limit (64 KB). Please choose a simpler photo.`
    );
  }

  return {
    dataUri,
    sizeChars,
    approxKb,
  };
}
