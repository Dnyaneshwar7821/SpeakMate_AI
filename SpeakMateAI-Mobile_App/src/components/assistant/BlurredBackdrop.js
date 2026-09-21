import React from 'react';
import { StyleSheet, UIManager, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

let NativeBlurView = null;
try {
  // Only attempt to load expo-blur if the native dev client actually exports ExpoBlurView
  if (
    typeof UIManager !== 'undefined' &&
    UIManager.getViewManagerConfig &&
    Boolean(UIManager.getViewManagerConfig('ExpoBlurView'))
  ) {
    NativeBlurView = require('expo-blur')?.BlurView;
  }
} catch (_) {
  NativeBlurView = null;
}

/**
 * Universal Blurred Backdrop for Mobile Assistant.
 * If ExpoBlurView is compiled into the native binary, it renders native BlurView.
 * Otherwise, it renders a stunning frosted glassmorphic gradient overlay that
 * never throws native warnings in existing Dev Client or Expo Go builds.
 */
export function BlurredBackdrop() {
  const { isDark } = useTheme();

  if (NativeBlurView) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(15, 23, 42, 0.45)' }]}>
        <NativeBlurView
          intensity={55}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: isDark ? 'rgba(11, 15, 25, 0.82)' : 'rgba(241, 245, 249, 0.85)',
        },
      ]}
    >
      {/* Specular glass gradient overlay */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(99, 102, 241, 0.12)', 'rgba(15, 23, 42, 0.60)', 'rgba(11, 15, 25, 0.90)']
            : ['rgba(255, 255, 255, 0.60)', 'rgba(241, 245, 249, 0.82)', 'rgba(226, 232, 240, 0.92)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export default BlurredBackdrop;
