/**
 * Image processing utilities for profile avatars.
 *
 * Enforces the Mobile <-> Backend contract:
 * - Uses native ImagePicker built-in cropping (1:1 square) and compression (quality: 0.65, base64: true).
 * - Formats to clean Base64 data URI (data:image/jpeg;base64,...).
 * - Validates that payload size stays strictly under 500 KB (512,000 characters).
 */

export const MAX_AVATAR_PAYLOAD_CHARS = 500 * 1024; // 500 KB limit (512,000 chars)

/**
 * Validates and formats a selected image for use as a profile avatar.
 *
 * @param {string} imageUri - File URI of the picked/cropped image
 * @param {string|null} pickerBase64 - Base64 data produced natively by ImagePicker (base64: true)
 * @returns {Promise<{ dataUri: string, sizeChars: number, approxKb: number }>}
 */
export async function prepareAvatarAsync(imageUri, pickerBase64 = null) {
  if (!imageUri && !pickerBase64) {
    throw new Error('No image provided.');
  }

  let base64Data = pickerBase64;

  // If base64 was not provided directly by ImagePicker, try reading file via FileSystem
  if (!base64Data && imageUri) {
    try {
      const FileSystem = require('expo-file-system');
      if (FileSystem && typeof FileSystem.readAsStringAsync === 'function') {
        base64Data = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType?.Base64 || 'base64',
        });
      }
    } catch (fsErr) {
      console.warn('[imageUtils] FileSystem fallback skipped or failed:', fsErr?.message);
    }
  }

  if (!base64Data) {
    throw new Error('Unable to encode image. Please try another photo.');
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

  // Validate contract limit before sending (strict 500 KB limit)
  if (sizeChars > MAX_AVATAR_PAYLOAD_CHARS) {
    throw new Error(
      `Avatar payload (${approxKb} KB) exceeds the maximum allowed limit (500 KB). Please crop closer or choose a simpler photo.`
    );
  }

  return {
    dataUri,
    sizeChars,
    approxKb,
  };
}


