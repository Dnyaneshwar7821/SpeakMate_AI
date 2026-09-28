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

/**
 * Checks whether an avatar value is a renderable image URI (remote HTTP/HTTPS URL, file URI, data URI, or blob).
 * If false and non-empty, the value should be rendered as an emoji or text symbol.
 *
 * @param {string|null|undefined} val
 * @returns {boolean}
 */
export function isImageUri(val) {
  if (!val || typeof val !== 'string') return false;
  const s = val.trim();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('file://') ||
    s.startsWith('content://') ||
    s.startsWith('blob:')
  );
}

/**
 * Preset DiceBear avatar collections grouped into rich thematic categories.
 */
export const AVATAR_CATEGORIES = [
  {
    key: 'illustrated',
    label: 'Illustrated',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/png?seed=Felix&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Jack&backgroundType=gradientLinear&backgroundColor=d1d4f9,b6e3f4',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Sophia&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Luna&backgroundType=gradientLinear&backgroundColor=c0aede,ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Marco&backgroundType=gradientLinear&backgroundColor=b6e3f4,ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Zoe&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Leo&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Chloe&backgroundType=gradientLinear&backgroundColor=d1d4f9,b6e3f4',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Max&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Mia&backgroundType=gradientLinear&backgroundColor=c0aede,ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Oliver&backgroundType=gradientLinear&backgroundColor=b6e3f4,ffd5dc',
    ],
  },
  {
    key: 'anime',
    label: 'Anime',
    avatars: [
      'https://api.dicebear.com/7.x/lorelei/png?seed=Kaito&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Akira&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Hana&backgroundType=gradientLinear&backgroundColor=d1d4f9,b6e3f4',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Ryo&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Miku&backgroundType=gradientLinear&backgroundColor=c0aede,ffd5dc',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Taro&backgroundType=gradientLinear&backgroundColor=b6e3f4,ffd5dc',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Yuki&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Kenji&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Sora&backgroundType=gradientLinear&backgroundColor=d1d4f9,b6e3f4',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Ren&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Aoi&backgroundType=gradientLinear&backgroundColor=c0aede,ffd5dc',
      'https://api.dicebear.com/7.x/lorelei/png?seed=Haruto&backgroundType=gradientLinear&backgroundColor=b6e3f4,ffd5dc',
    ],
  },
  {
    key: 'adventurer',
    label: 'Adventurer',
    avatars: [
      'https://api.dicebear.com/7.x/adventurer/png?seed=Oliver&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Alexander&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Sophia&backgroundType=gradientLinear&backgroundColor=d1d4f9,b6e3f4',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Emily&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc',
      'https://api.dicebear.com/7.x/adventurer/png?seed=James&backgroundType=gradientLinear&backgroundColor=c0aede,ffd5dc',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Lucas&backgroundType=gradientLinear&backgroundColor=b6e3f4,ffd5dc',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Mia&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Benjamin&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Charlotte&backgroundType=gradientLinear&backgroundColor=d1d4f9,b6e3f4',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Zoe&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Daniel&backgroundType=gradientLinear&backgroundColor=c0aede,ffd5dc',
      'https://api.dicebear.com/7.x/adventurer/png?seed=Grace&backgroundType=gradientLinear&backgroundColor=b6e3f4,ffd5dc',
    ],
  },
  {
    key: 'pixel',
    label: 'Pixel',
    avatars: [
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelA&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelB&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelC&backgroundType=gradientLinear&backgroundColor=d1d4f9,b6e3f4',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelD&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelE&backgroundType=gradientLinear&backgroundColor=c0aede,ffd5dc',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelF&backgroundType=gradientLinear&backgroundColor=b6e3f4,ffd5dc',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelG&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelH&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelI&backgroundType=gradientLinear&backgroundColor=d1d4f9,b6e3f4',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelJ&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelK&backgroundType=gradientLinear&backgroundColor=c0aede,ffd5dc',
      'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelL&backgroundType=gradientLinear&backgroundColor=b6e3f4,ffd5dc',
    ],
  },
  {
    key: 'cartoon',
    label: 'Cartoon & Kids',
    avatars: [
      'https://api.dicebear.com/7.x/bottts/png?seed=RoboPaws&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede',
      'https://api.dicebear.com/7.x/bottts/png?seed=Bolt&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/bottts/png?seed=Sparky&backgroundType=gradientLinear&backgroundColor=d1d4f9,b6e3f4',
      'https://api.dicebear.com/7.x/bottts/png?seed=Echo&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc',
      'https://api.dicebear.com/7.x/bottts/png?seed=LunaBot&backgroundType=gradientLinear&backgroundColor=c0aede,ffd5dc',
      'https://api.dicebear.com/7.x/bottts/png?seed=Gizmo&backgroundType=gradientLinear&backgroundColor=b6e3f4,ffd5dc',
    ],
  },
];

/**
 * Rich preset avatar emoji options.
 */
export const PRESET_EMOJI_AVATARS = [
  '🎓', '🦁', '🚀', '🦉', '👑', '⚡', '🦊', '🎯',
  '💎', '🌟', '🔥', '🏆', '🐱', '🐶', '🐼', '🐨',
  '🐯', '🦄', '🎨', '📚', '💡', '🌍', '🪐', '🎖️',
];


