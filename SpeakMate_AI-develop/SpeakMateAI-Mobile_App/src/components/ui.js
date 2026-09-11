import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/colors';

export function Screen({ children, title, subtitle, scroll = true, rightAction }) {
  const Wrapper = scroll ? ScrollView : View;
  const { isDark } = useTheme();

  const safeBg = isDark ? '#0F172A' : '#F8FAFC';
  const textColor = isDark ? '#F8FAFC' : COLORS.black;
  const subColor = isDark ? '#94A3B8' : COLORS.text;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <Wrapper
        style={styles.wrapper}
        contentContainerStyle={scroll ? styles.content : undefined}
        keyboardShouldPersistTaps="handled"
      >
        {(title || subtitle || rightAction) && (
          <View style={styles.header}>
            <View style={styles.headerText}>
              {!!title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}
              {!!subtitle && <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text>}
            </View>
            {rightAction}
          </View>
        )}
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}

export function Card({ children, style }) {
  const { isDark } = useTheme();

  const cardBg = isDark ? '#1E293B' : COLORS.white;
  const cardBorder = isDark ? '#334155' : COLORS.border;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }, style]}>
      {children}
    </View>
  );
}

export function AppButton({ title, onPress, loading, variant = 'primary', disabled, style }) {
  const isSecondary = variant === 'secondary';
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();
  const isDisabled = disabled || loading;
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={isDisabled ? undefined : onPressIn}
        onPressOut={isDisabled ? undefined : onPressOut}
        hitSlop={0}
        style={[
          styles.button,
          isSecondary && styles.secondaryButton,
          isDisabled && styles.disabledButton,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isSecondary ? COLORS.primary : COLORS.white} />
        ) : (
          <Text style={[styles.buttonText, isSecondary && styles.secondaryButtonText]}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function AppInput({ label, value, onChangeText, multiline, secureTextEntry, placeholder, keyboardType }) {
  const { isDark } = useTheme();

  const labelColor = isDark ? '#E2E8F0' : COLORS.black;
  const inputBg = isDark ? '#334155' : COLORS.white;
  const inputColor = isDark ? '#FFF' : COLORS.black;
  const inputBorder = isDark ? '#475569' : COLORS.border;

  return (
    <View style={styles.inputGroup}>
      {!!label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        style={[
          styles.input, 
          { backgroundColor: inputBg, color: inputColor, borderColor: inputBorder },
          multiline && styles.textarea
        ]}
      />
    </View>
  );
}

export function StateView({ loading, error, empty, onRetry, children }) {
  const { isDark } = useTheme();
  const textColor = isDark ? '#94A3B8' : COLORS.text;
  if (loading) {
    return (
      <View style={styles.stateBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.stateText, { color: textColor }]}>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.stateBox}>
        <Text style={styles.errorText}>{error}</Text>
        {!!onRetry && <AppButton title="Retry" onPress={onRetry} variant="secondary" style={styles.retryButton} />}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.stateBox}>
        <Text style={[styles.stateText, { color: textColor }]}>{empty}</Text>
      </View>
    );
  }
  return children;
}

export function Metric({ label, value }) {
  const { isDark } = useTheme();
  const labelColor = isDark ? '#94A3B8' : COLORS.text;
  return (
    <Card style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={[styles.metricLabel, { color: labelColor }]}>{label}</Text>
    </Card>
  );
}

export function Pill({ label }) {
  const { isDark } = useTheme();
  const pillBg = isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF';
  return (
    <View style={[styles.pill, { backgroundColor: pillBg }]}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  wrapper: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: COLORS.black,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  button: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: COLORS.black,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    color: COLORS.black,
    fontSize: 15,
  },
  textarea: {
    minHeight: 112,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  stateBox: {
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  stateText: {
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    lineHeight: 21,
  },
  retryButton: {
    marginTop: 14,
  },
  metric: {
    flex: 1,
    marginBottom: 0,
  },
  metricValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 4,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginTop: 8,
  },
  pillText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
