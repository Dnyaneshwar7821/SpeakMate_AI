import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Automatically detect developer's host machine IP on local Wi-Fi from Expo Packager
export const getDevHostIp = () => {
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoClient?.hostUri || '';
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') return ip;
    }
  } catch (_) {}
  return '192.168.1.27';
};

const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    if (Platform.OS === 'android' && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      const hostIp = getDevHostIp();
      return envUrl.replace(/localhost|127\.0\.0\.1/, hostIp);
    }
    return envUrl;
  }
  if (__DEV__) {
    return `http://${getDevHostIp()}:9091`;
  }
  return 'https://speakmate-ai-28z5.onrender.com';
};

export const BASE_URL = resolveBaseUrl();

export const getWebAvatarEmbedUrl = (model = 'haru') => {
  const customUrl = process.env.EXPO_PUBLIC_WEB_AVATAR_URL;
  if (customUrl) {
    return `${customUrl}?model=${model}&framing=faceToChest`;
  }
  // Android 100% Offline Standalone Embed
  if (Platform.OS === 'android') {
    return `file:///android_asset/live2d/avatar_embed.html?model=${model}&framing=faceToChest`;
  }
  const hostIp = getDevHostIp();
  return `http://${hostIp}:5173/avatar-embed?model=${model}&framing=faceToChest`;
};