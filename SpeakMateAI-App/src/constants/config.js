import Constants from 'expo-constants';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://speakmateai-backend.onrender.com';

// Automatically detect developer's host machine IP on local Wi-Fi from Expo Packager
const getDevHostIp = () => {
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || '';
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost') return ip;
    }
  } catch (_) {}
  return '192.168.1.10';
};

export const getWebAvatarEmbedUrl = (model = 'haru') => {
  const customUrl = process.env.EXPO_PUBLIC_WEB_AVATAR_URL;
  if (customUrl) {
    return `${customUrl}?model=${model}&framing=faceToChest`;
  }
  const hostIp = getDevHostIp();
  return `http://${hostIp}:5173/avatar-embed?model=${model}&framing=faceToChest`;
};