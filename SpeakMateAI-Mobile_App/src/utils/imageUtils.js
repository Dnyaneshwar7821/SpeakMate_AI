/**
 * Image processing utilities for profile avatars.
 *
 * Enforces the Mobile <-> Backend contract:
 * - If expo-image-manipulator is available: Resizes to 256x256 px, compresses JPEG quality to 0.5.
 * - If expo-image-manipulator is not in current native build: Seamlessly uses native ImagePicker
 *   compressed Base64 (quality ~0.2) or FileSystem fallback.
 * - Encodes to clean Base64 data URI (data:image/jpeg;base64,...).
 * - Validates that payload size stays strictly under 64 KB (65,536 chars).
 */

export const MAX_AVATAR_PAYLOAD_CHARS = 65536; // 64 KB backend contract

/**
 * Resizes and compresses a selected image URI for use as a profile avatar.
 *
 * @param {string} imageUri - File URI of the picked/cropped image
 * @param {string|null} fallbackBase64 - Base64 data from native ImagePicker if available
 * @returns {Promise<{ dataUri: string, sizeChars: number, approxKb: number }>}
 */
export async function prepareAvatarAsync(imageUri, fallbackBase64 = null) {
  if (!imageUri && !fallbackBase64) {
    throw new Error('No image provided.');
  }

  let base64Data = null;

  // 1. Try hardware-accelerated expo-image-manipulator if available in current runtime
  try {
    const ImageManipulator = require('expo-image-manipulator');
    const manipFunc =
      ImageManipulator?.manipulateAsync ||
      ImageManipulator?.ImageManipulator?.manipulateAsync;

    if (typeof manipFunc === 'function') {
      const result = await manipFunc(
        imageUri,
        [{ resize: { width: 256, height: 256 } }],
        {
          compress: 0.5,
          format: 'jpeg', // string literal avoids any undefined SaveFormat enum
          base64: true,
        }
      );

      if (result && result.base64) {
        base64Data = result.base64;
      }
    }
  } catch (manipError) {
    console.warn(
      '[imageUtils] expo-image-manipulator not available in current native build, using native picker/filesystem fallback:',
      manipError?.message
    );
  }

  // 2. Fallback to native ImagePicker base64 if available
  if (!base64Data && fallbackBase64) {
    base64Data = fallbackBase64;
  }

  // 3. Fallback to FileSystem base64 read if still needed
  if (!base64Data && imageUri) {
    try {
      const FileSystem = require('expo-file-system');
      if (FileSystem && typeof FileSystem.readAsStringAsync === 'function') {
        base64Data = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType?.Base64 || 'base64',
        });
      }
    } catch (fsErr) {
      console.warn('[imageUtils] FileSystem read fallback failed:', fsErr?.message);
    }
  }

  if (!base64Data) {
    throw new Error('Unable to compress and encode image. Please try another photo.');
  }

  // Strip any existing data URI prefix
  let cleanBase64 = base64Data;
  if (cleanBase64.startsWith('data:')) {
    const commaIndex = cleanBase64.indexOf(',');
    if (commaIndex !== -1) {
      cleanBase64 = cleanBase64.substring(commaIndex + 1);
    }
  }

  const dataUri = `data:image/jpeg;base64,${cleanBase64}`;
  const sizeChars = dataUri.length;
  const approxKb = Math.round(sizeChars / 1024);

  // Validate contract limit before sending
  if (sizeChars > MAX_AVATAR_PAYLOAD_CHARS) {
    throw new Error(
      `Avatar payload (${approxKb} KB) exceeds the maximum allowed limit (64 KB). Please crop closer or choose a simpler photo.`
    );
  }

  return {
    dataUri,
    sizeChars,
    approxKb,
  };
}

