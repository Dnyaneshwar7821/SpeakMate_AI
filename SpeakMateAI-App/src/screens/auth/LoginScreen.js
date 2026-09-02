import React, { useContext, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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

  const [loginType, setLoginType] = useState('STANDARD'); // 'STANDARD' | 'SCHOOL'
  const [schoolCode, setSchoolCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validate = () => {
    if (loginType === 'SCHOOL') {
      if (!schoolCode.trim()) return 'Please enter your School Code (e.g. SCH-1082).';
      if (!email.trim()) return 'Please enter your Student ID or Email.';
      if (!password) return 'Please enter your password.';
      return null;
    }

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
      if (loginType === 'SCHOOL') {
        await AsyncStorage.setItem('speakmate_account_type', 'STUDENT');
        await AsyncStorage.setItem('speakmate_school_code', schoolCode.trim().toUpperCase());
      }
      await login({
        email: email.trim().toLowerCase(),
        password,
        schoolCode: loginType === 'SCHOOL' ? schoolCode.trim().toUpperCase() : undefined,
      });
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.userMessage || 'Invalid login details. Please check your credentials and try again.';
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
          <Pressable onPress={Keyboard.dismiss} style={styles.pressableContainer}>
            <AuthCard style={styles.card}>
              
              {/* LOGIN TYPE TAB SEGMENT */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabBtn, loginType === 'STANDARD' && styles.activeTabBtn]}
                  onPress={() => { setLoginType('STANDARD'); setError(''); }}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={16}
                    color={loginType === 'STANDARD' ? '#4F46E5' : '#64748B'}
                  />
                  <Text style={[styles.tabBtnText, loginType === 'STANDARD' && styles.activeTabBtnText]}>
                    Personal
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, loginType === 'SCHOOL' && styles.activeTabBtn]}
                  onPress={() => { setLoginType('SCHOOL'); setError(''); }}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="school-outline"
                    size={16}
                    color={loginType === 'SCHOOL' ? '#4F46E5' : '#64748B'}
                  />
                  <Text style={[styles.tabBtnText, loginType === 'SCHOOL' && styles.activeTabBtnText]}>
                    Student 🎓
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Validation Error Message */}
              <ErrorMessage message={error} />

              {loginType === 'SCHOOL' ? (
                <>
                  <AuthInput
                    label="School Code"
                    value={schoolCode}
                    onChangeText={(t) => { setSchoolCode(t.toUpperCase()); if (error) setError(''); }}
                    placeholder="e.g. SCH-1082"
                    autoCapitalize="characters"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />

                  <AuthInput
                    label="Student ID or Email"
                    value={email}
                    onChangeText={(t) => { setEmail(t); if (error) setError(''); }}
                    placeholder="e.g. STU-1082 or student@school.edu"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    inputRef={emailRef}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </>
              ) : (
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
              )}

              <PasswordInput
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); if (error) setError(''); }}
                placeholder={loginType === 'SCHOOL' ? 'Enter student password' : 'Your password'}
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
                title={loginType === 'SCHOOL' ? 'Sign In as Student 🎓' : 'Sign In'}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabBtnText: {
    color: '#4F46E5',
    fontWeight: '800',
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
