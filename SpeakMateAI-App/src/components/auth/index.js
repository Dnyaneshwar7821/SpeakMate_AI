import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const AUTH_COLORS = {
  gradientStart: '#1E1B4B',
  gradientMid: '#4F46E5',
  gradientEnd: '#6366F1',
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#EEF2FF',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  borderFocus: '#4F46E5',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  success: '#10B981',
  successBg: '#ECFDF5',
  placeholder: '#94A3B8',
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
export function Logo({ size = 72, animate = false, animValue }) {
  return (
    <Animated.View
      style={[
        styles.logoContainer,
        { width: size, height: size, borderRadius: size * 0.28 },
        animate && animValue
          ? { opacity: animValue, transform: [{ scale: animValue }] }
          : null,
      ]}
    >
      <LinearGradient
        colors={['#4F46E5', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.logoGradient, { borderRadius: size * 0.28 }]}
      >
        <Text style={[styles.logoText, { fontSize: size * 0.38 }]}>SM</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── AuthHeader ───────────────────────────────────────────────────────────────
export function AuthHeader({ title, subtitle, light = false }) {
  return (
    <View style={styles.authHeader}>
      <Text style={[styles.authHeaderTitle, light && styles.textWhite]}>
        {title}
      </Text>
      {!!subtitle && (
        <Text style={[styles.authHeaderSubtitle, light && styles.textWhiteAlpha]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// ─── AuthCard ─────────────────────────────────────────────────────────────────
export function AuthCard({ children, style }) {
  return <View style={[styles.authCard, style]}>{children}</View>;
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
export function PrimaryButton({ title, onPress, loading, disabled, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={isDisabled ? undefined : onPressIn}
        onPressOut={isDisabled ? undefined : onPressOut}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
        style={[
          styles.primaryBtn,
          isDisabled && styles.primaryBtnDisabled
        ]}
      >
        <LinearGradient
          colors={isDisabled ? ['#C7D2FE', '#E0E7FF'] : ['#4F46E5', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryBtnGradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>{title}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── SecondaryButton ──────────────────────────────────────────────────────────
export function SecondaryButton({ title, onPress, disabled, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={disabled ? undefined : onPressIn}
        onPressOut={disabled ? undefined : onPressOut}
        android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}
        style={[
          styles.secondaryBtn,
          disabled && { opacity: 0.5 }
        ]}
      >
        <Text style={styles.secondaryBtnText}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── AuthInput ────────────────────────────────────────────────────────────────
export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  returnKeyType,
  onSubmitEditing,
  inputRef,
  rightElement,
  style,
  inputStyle,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputGroup, style]}>
      {!!label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapperRow, focused && styles.inputFocused]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AUTH_COLORS.placeholder}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={
            autoCapitalize !== undefined
              ? autoCapitalize
              : keyboardType === 'email-address'
              ? 'none'
              : 'words'
          }
          returnKeyType={returnKeyType || 'next'}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.inputInline, inputStyle]}
        />
        {rightElement}
      </View>
    </View>
  );
}

// ─── PasswordInput ────────────────────────────────────────────────────────────
export function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
  returnKeyType,
  onSubmitEditing,
  inputRef,
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.inputGroup}>
      {!!label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.passwordRow, focused && styles.inputFocused]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || 'Enter password'}
          placeholderTextColor={AUTH_COLORS.placeholder}
          secureTextEntry={!visible} // secureTextEntry is true (Hidden) when visible is false
          autoCapitalize="none"
          returnKeyType={returnKeyType || 'done'}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={visible ? 'eye-outline' : 'eye-off-outline'} // Corrected visibility names
            size={22}
            color={AUTH_COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── PasswordStrength ─────────────────────────────────────────────────────────
export function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 3) return { level: 2, label: 'Fair', color: '#F59E0B' };
    return { level: 3, label: 'Strong', color: '#10B981' };
  };

  const { level, label, color } = getStrength();
  if (!password) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBars}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              { backgroundColor: i <= level ? color : AUTH_COLORS.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── ErrorMessage ─────────────────────────────────────────────────────────────
export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle-outline" size={18} color={AUTH_COLORS.error} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

// ─── LinkText ─────────────────────────────────────────────────────────────────
export function LinkText({ prefix, label, onPress }) {
  return (
    <View style={styles.linkRow}>
      {!!prefix && <Text style={styles.linkPrefix}>{prefix} </Text>}
      <TouchableOpacity onPress={onPress} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
        <Text style={styles.linkLabel}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── BackButton ───────────────────────────────────────────────────────────────
export function BackButton({ onPress, light = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.backBtn}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons
        name="chevron-back"
        size={24}
        color={light ? '#FFFFFF' : AUTH_COLORS.primary}
      />
    </TouchableOpacity>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label = 'or' }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Logo
  logoContainer: {
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -1,
  },

  // AuthHeader
  authHeader: { marginBottom: 6 },
  authHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: AUTH_COLORS.text,
    letterSpacing: -0.5,
  },
  authHeaderSubtitle: {
    fontSize: 15,
    color: AUTH_COLORS.textMuted,
    marginTop: 6,
    lineHeight: 22,
  },
  textWhite: { color: '#FFFFFF' },
  textWhiteAlpha: { color: 'rgba(255,255,255,0.75)' },

  // AuthCard
  authCard: {
    backgroundColor: AUTH_COLORS.surface,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  // PrimaryButton
  primaryBtn: {
    height: 54,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // SecondaryButton
  secondaryBtn: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    backgroundColor: '#EEF2FF',
  },
  secondaryBtnText: {
    color: AUTH_COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  // Input
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: AUTH_COLORS.text,
    marginBottom: 8,
  },
  inputWrapperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: AUTH_COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  inputInline: {
    flex: 1,
    fontSize: 15,
    color: AUTH_COLORS.text,
    height: '100%',
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: AUTH_COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: AUTH_COLORS.text,
    backgroundColor: '#F8FAFC',
  },
  inputFocused: {
    borderColor: AUTH_COLORS.borderFocus,
    backgroundColor: '#FFFFFF',
  },

  // PasswordInput
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: AUTH_COLORS.border,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: AUTH_COLORS.text,
    height: '100%',
  },
  eyeIcon: { paddingLeft: 8 },

  // PasswordStrength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -10,
    marginBottom: 12,
  },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  strengthLabel: { fontSize: 12, fontWeight: '700', width: 48 },

  // ErrorMessage
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AUTH_COLORS.errorBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  errorText: {
    flex: 1,
    color: AUTH_COLORS.error,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  // LinkText
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  linkPrefix: { color: AUTH_COLORS.textMuted, fontSize: 14, fontWeight: '500' },
  linkLabel: {
    color: AUTH_COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  // BackButton
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: AUTH_COLORS.border },
  dividerLabel: { color: AUTH_COLORS.textMuted, fontSize: 13, fontWeight: '600' },
});
