import React from 'react';
import { Platform, StyleSheet, UIManager, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

let NativeBlurView = null;
try {
  // Only attempt to load expo-blur on iOS where native blur is robust and performant
  if (
    Platform.OS === 'ios' &&
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
 * On iOS, uses native BlurView if available.
 * On Android, uses a buttery-smooth 60fps translucent gradient overlay
 * that never freezes, never drops frames, and never intercepts touches unintentionally.
 */
export function BlurredBackdrop() {
  const { isDark } = useTheme();

  if (Platform.OS === 'ios' && NativeBlurView) {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(15, 23, 42, 0.45)' }]}>
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
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: isDark ? 'rgba(11, 15, 25, 0.78)' : 'rgba(15, 23, 42, 0.55)',
        },
      ]}
    >
      {/* Specular glass gradient overlay */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(99, 102, 241, 0.15)', 'rgba(15, 23, 42, 0.70)', 'rgba(11, 15, 25, 0.88)']
            : ['rgba(255, 255, 255, 0.40)', 'rgba(241, 245, 249, 0.75)', 'rgba(15, 23, 42, 0.60)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export default BlurredBackdrop;
