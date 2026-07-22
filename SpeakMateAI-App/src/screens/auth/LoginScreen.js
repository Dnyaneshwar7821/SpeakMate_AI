import React, { useContext, useRef, useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  View,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import {
  AuthCard,
  AuthInput,
  ErrorMessage,
  LinkText,
  PasswordInput,
  PrimaryButton,
} from '../../components/auth';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRef = useRef(null);

  const validate = () => {
    if (!email.trim()) return 'Please enter your email address.';
    if (!/\S+@\S+\.\S+/.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Please enter your password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.userMessage || 'Invalid email or password. Please try again.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Header Zone */}
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#3730A3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative Light Ambient Rings */}
        <View style={styles.ring1} />
        <View style={styles.ring2} />

        <SafeAreaView edges={['top']} style={styles.headerContent}>
          {/* Logo Container */}
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.08)']}
              style={styles.logoGlass}
            >
              <Text style={styles.logoText}>SM</Text>
            </LinearGradient>
          </View>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to continue learning</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Keyboard Avoiding Container */}
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Tap-dismiss inner container to replace buggy outer wrapper */}
          <Pressable onPress={Keyboard.dismiss} style={styles.pressableContainer}>
            <AuthCard style={styles.card}>
              {/* Form Validation Error Message */}
              <ErrorMessage message={error} />

              <AuthInput
                label="Email Address"
                value={email}
                onChangeText={(t) => { setEmail(t); if (error) setError(''); }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <PasswordInput
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); if (error) setError(''); }}
                placeholder="Your password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                inputRef={passwordRef}
              />

              {/* Forgot Password Row */}
              <View style={styles.rememberForgotRow}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <PrimaryButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginBtn}
              />

              <LinkText
                prefix="Don't have an account?"
                label="Create one"
                onPress={() => navigation.navigate('Register')}
              />
            </AuthCard>

            <Text style={styles.footer}>
              By continuing you agree to our Terms of Service and Privacy Policy.
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingBottom: 48,
    overflow: 'hidden',
  },
  ring1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    top: -80,
    right: -60,
  },
  ring2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -20,
    left: -40,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 16,
  },
  logoWrapper: {
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGlass: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 6,
  },
  body: {
    flex: 1,
    marginTop: -32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  pressableContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: -2,
    marginBottom: 22,
    width: '100%',
  },
  forgotText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
  },
  loginBtn: {
    marginBottom: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  googleButton: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 24,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
});

