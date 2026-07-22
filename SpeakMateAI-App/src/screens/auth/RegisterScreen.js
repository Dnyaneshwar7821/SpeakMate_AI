import React, { useContext, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import {
  AuthCard,
  AuthInput,
  BackButton,
  ErrorMessage,
  LinkText,
  PasswordInput,
  PasswordStrength,
  PrimaryButton,
} from '../../components/auth';
import { authService } from '../../services/authService';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  // OTP state: 'IDLE' | 'SENDING' | 'SENT' | 'VERIFIED'
  const [otpState, setOtpState] = useState('IDLE');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const otpRef = useRef(null);

  const [registered, setRegistered] = useState(false);
  const successScale = useRef(new Animated.Value(0.7)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const animateSuccess = () => {
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateEmailOnly = () => {
    if (!email.trim()) return 'Please enter an email address first.';
    if (!/\S+@\S+\.\S+/.test(email.trim())) return 'Please enter a valid email address.';
    return null;
  };

  const validateFullForm = () => {
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!email.trim()) return 'Email address is required.';
    if (!/\S+@\S+\.\S+/.test(email.trim())) return 'Please enter a valid email address.';
    if (otpState !== 'SENT' && otpState !== 'VERIFIED') return 'Please click "Verify" next to email to get your OTP code.';
    if (!otp.trim()) return 'Please enter the 6-digit OTP code sent to your email.';
    if (otp.trim().length < 6) return 'OTP code must be 6 digits.';
    if (!password) return 'Password is required.';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
      return 'Password needs uppercase, lowercase, number, and special character.';
    }
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    const emailErr = validateEmailOnly();
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setError('');
    setOtpError('');
    setOtpState('SENDING');

    try {
      const emailLower = email.trim().toLowerCase();
      await authService.sendRegistrationOtp({ email: emailLower });
      setOtpState('SENT');
    } catch (err) {
      setOtpState('IDLE');
      const serverMsg = err.response?.data?.message || err.userMessage || 'Failed to send OTP. Please check email.';
      setError(serverMsg);
    }
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    const validationError = validateFullForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);

    try {
      const emailLower = email.trim().toLowerCase();
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailLower,
        password,
        confirmPassword,
        otp: otp.trim(),
      });
      setOtpState('VERIFIED');
      setRegistered(true);
      animateSuccess();
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.userMessage || 'Registration failed. Please verify your OTP code.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => { if (error) setError(''); };

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
        <View style={styles.ring1} />
        <View style={styles.ring2} />

        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <View style={styles.navigationRow}>
            <BackButton onPress={() => navigation.goBack()} light />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Start your English journey today</Text>
          </View>
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
            {registered ? (
              /* ── Success State ── */
              <Animated.View
                style={[
                  styles.successCard,
                  {
                    opacity: successOpacity,
                    transform: [{ scale: successScale }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#ECFDF5', '#D1FAE5']}
                  style={styles.successIconBg}
                >
                  <Ionicons name="checkmark-circle" size={56} color="#10B981" />
                </LinearGradient>
                <Text style={styles.successTitle}>Account Created!</Text>
                <Text style={styles.successMsg}>
                  Your email has been verified and your account was created successfully.
                </Text>

                <View style={styles.backBtnRow}>
                  <PrimaryButton
                    title="Continue to Login"
                    onPress={() => navigation.replace('Login')}
                    style={styles.backToLogin}
                  />
                </View>
              </Animated.View>
            ) : (
              /* ── Registration Form ── */
              <AuthCard style={styles.card}>
                <ErrorMessage message={error} />

                {/* First Name & Last Name row */}
                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <AuthInput
                      label="First Name"
                      value={firstName}
                      onChangeText={(t) => { setFirstName(t); clearError(); }}
                      placeholder="Jane"
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => lastNameRef.current?.focus()}
                    />
                  </View>
                  <View style={styles.nameField}>
                    <AuthInput
                      label="Last Name"
                      value={lastName}
                      onChangeText={(t) => { setLastName(t); clearError(); }}
                      placeholder="Doe"
                      autoCapitalize="words"
                      returnKeyType="next"
                      inputRef={lastNameRef}
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                  </View>
                </View>

                {/* Email Address with Green "Verify" action text button */}
                <AuthInput
                  label="Email Address"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    clearError();
                    if (otpState !== 'IDLE') setOtpState('IDLE');
                  }}
                  placeholder="jane.doe@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  inputRef={emailRef}
                  onSubmitEditing={handleSendOtp}
                  rightElement={
                    <TouchableOpacity
                      onPress={handleSendOtp}
                      disabled={otpState === 'SENDING'}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.verifyActionBtn}
                    >
                      {otpState === 'SENDING' ? (
                        <ActivityIndicator size="small" color="#10B981" />
                      ) : otpState === 'SENT' ? (
                        <View style={styles.badgeRow}>
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                          <Text style={styles.resendGreenText}>Resend</Text>
                        </View>
                      ) : otpState === 'VERIFIED' ? (
                        <View style={styles.badgeRow}>
                          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                          <Text style={styles.verifiedGreenText}>Verified</Text>
                        </View>
                      ) : (
                        <Text style={styles.verifyGreenText}>Verify</Text>
                      )}
                    </TouchableOpacity>
                  }
                />

                {/* OTP Section (opens directly below Email when OTP is sent) */}
                {(otpState === 'SENT' || otpState === 'VERIFIED') && (
                  <View style={styles.otpSectionContainer}>
                    <View style={styles.otpSectionHeader}>
                      <Ionicons name="mail-outline" size={16} color="#059669" />
                      <Text style={styles.otpSectionTitle}>
                        Enter 6-digit code sent to <Text style={styles.emailTextBold}>{email}</Text>
                      </Text>
                    </View>

                    <AuthInput
                      label="6-Digit Verification Code"
                      value={otp}
                      onChangeText={(t) => { setOtp(t); clearError(); }}
                      placeholder="123456"
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType="next"
                      inputRef={otpRef}
                      inputStyle={styles.otpInputInline}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </View>
                )}

                {/* Password Fields */}
                <PasswordInput
                  label="Password"
                  value={password}
                  onChangeText={(t) => { setPassword(t); clearError(); }}
                  placeholder="Create strong password"
                  returnKeyType="next"
                  inputRef={passwordRef}
                  onSubmitEditing={() => confirmRef.current?.focus()}
                />
                <PasswordStrength password={password} />

                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); clearError(); }}
                  placeholder="Confirm your password"
                  returnKeyType="done"
                  inputRef={confirmRef}
                  onSubmitEditing={handleRegister}
                />

                <PrimaryButton
                  title="Create Account"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                  style={styles.registerBtn}
                />

                <LinkText
                  prefix="Already have an account?"
                  label="Sign in"
                  onPress={() => navigation.navigate('Login')}
                />
              </AuthCard>
            )}

            <Text style={styles.footer}>
              By creating an account you agree to our Terms of Service and Privacy Policy.
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
    paddingBottom: 40,
    overflow: 'hidden',
  },
  ring1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    top: -70,
    right: -50,
  },
  ring2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -10,
    left: -30,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginTop: 8,
    marginBottom: 4,
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
    marginTop: -24,
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  verifyActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyGreenText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  resendGreenText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13,
  },
  verifiedGreenText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  otpSectionContainer: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    marginTop: -6,
  },
  otpSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  otpSectionTitle: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  emailTextBold: {
    fontWeight: '800',
    color: '#047857',
  },
  otpInputInline: {
    fontSize: 20,
    letterSpacing: 4,
    fontWeight: '800',
    color: '#065F46',
  },
  registerBtn: {
    marginTop: 6,
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
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  successIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  successMsg: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  backBtnRow: {
    width: '100%',
    marginTop: 20,
  },
  backToLogin: {
    width: '100%',
  },
});
