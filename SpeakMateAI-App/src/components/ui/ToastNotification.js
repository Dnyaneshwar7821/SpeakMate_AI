import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOAST_THEMES = {
  success: {
    bg: ['#065F46', '#047857'],
    border: '#10B981',
    icon: 'checkmark-circle-sharp',
    iconColor: '#34D399',
    badgeText: 'SUCCESS',
  },
  streak: {
    bg: ['#9A3412', '#C2410C'],
    border: '#F97316',
    icon: 'flame-sharp',
    iconColor: '#FFEDD5',
    badgeText: 'STREAK UPDATE',
  },
  xp: {
    bg: ['#78350F', '#B45309'],
    border: '#F59E0B',
    icon: 'flash-sharp',
    iconColor: '#FDE68A',
    badgeText: 'XP EARNED',
  },
  info: {
    bg: ['#1E1B4B', '#3730A3'],
    border: '#6366F1',
    icon: 'sparkles-sharp',
    iconColor: '#A5B4FC',
    badgeText: 'SPEAKMATE AI',
  },
  warning: {
    bg: ['#854D0E', '#A16207'],
    border: '#EAB308',
    icon: 'snow-sharp',
    iconColor: '#FEF08A',
    badgeText: 'STREAK FREEZE',
  },
  error: {
    bg: ['#881337', '#9F1239'],
    border: '#F43F5E',
    icon: 'alert-circle-sharp',
    iconColor: '#FECDD3',
    badgeText: 'NOTICE',
  },
};

export default function ToastNotification({ toast, onDismiss }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: insets.top + 8,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        dismiss();
      }, toast.duration || 3200);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!toast) return null;

  const config = TOAST_THEMES[toast.type] || TOAST_THEMES.info;

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={dismiss}
        style={{ width: '100%' }}
      >
        <LinearGradient
          colors={config.bg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.toastContainer, { borderColor: config.border }]}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name={config.icon} size={24} color={config.iconColor} />
          </View>

          <View style={styles.textWrapper}>
            <Text style={styles.badgeText}>{config.badgeText}</Text>
            <Text style={styles.titleText}>{toast.message}</Text>
            {toast.subtext && <Text style={styles.subtextText}>{toast.subtext}</Text>}
          </View>

          <TouchableOpacity onPress={dismiss} style={styles.closeIconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    zIndex: 999999,
    elevation: 999999,
    alignItems: 'center',
  },
  toastContainer: {
    width: '100%',
    maxWidth: 500,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  subtextText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  closeIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
