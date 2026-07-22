import React, { useRef, useState } from 'react';
import {
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  AuthCard,
  AuthInput,
  BackButton,
  ErrorMessage,
  LinkText,
  PrimaryButton,
} from '../../components/auth';
import { authService } from '../../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'OTP'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const validateEmail = () => {
    if (!email.trim()) return 'Please enter your registered email address.';
    if (!/\S+@\S+\.\S+/.test(email.trim())) return 'Please enter a valid email address.';
    return null;
  };

  const validateOtp = () => {
    if (!otp.trim()) return 'Please enter the 6-digit OTP sent to your email.';
    if (otp.trim().length < 6) return 'OTP must be 6 digits.';
    return null;
  };

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    const validationError = validateEmail();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      await authService.forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setStep('OTP');
      setInfoMessage(`A 6-digit OTP has been sent to ${email.trim().toLowerCase()}`);
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    Keyboard.dismiss();
    setError('');
    setResending(true);

    try {
      await authService.forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setInfoMessage(`A new OTP has been sent to ${email.trim().toLowerCase()}`);
      Alert.alert('OTP Resent', `A fresh 6-digit OTP code has been sent to ${email}`);
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    const validationError = validateOtp();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await authService.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (response && response.token) {
        navigation.navigate('ResetPassword', {
          token: response.token,
          email: email.trim().toLowerCase(),
        });
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.userMessage || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#3730A3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.ring1} />
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <View style={styles.navigationRow}>
            <BackButton
              onPress={() => {
                if (step === 'OTP') {
                  setStep('EMAIL');
                  setError('');
                } else {
                  navigation.goBack();
                }
              }}
              light
            />
          </View>
          <View style={styles.illustrationZone}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.08)']}
              style={styles.illustrationCircle}
            >
              <Ionicons
                name={step === 'EMAIL' ? 'key-outline' : 'shield-checkmark-outline'}
                size={44}
                color="#FFFFFF"
              />
            </LinearGradient>
            <View style={styles.illustrationGlow} />
          </View>
          <Text style={styles.headerTitle}>
            {step === 'EMAIL' ? 'Forgot Password' : 'Verify OTP'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {step === 'EMAIL'
              ? 'Enter your registered email address to receive an OTP'
              : `Enter 6-digit code sent to ${email}`}
          </Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Body */}
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
              <ErrorMessage message={error} />

              {infoMessage ? (
                <View style={styles.infoBanner}>
                  <Ionicons name="information-circle" size={20} color="#4F46E5" />
                  <Text style={styles.infoText}>{infoMessage}</Text>
                </View>
              ) : null}

              {step === 'EMAIL' ? (
                /* ── STEP 1: Enter Registered Email ── */
                <>
                  <Text style={styles.formHint}>
                    We will send a 6-digit Verification OTP code to your registered Gmail address.
                  </Text>

                  <AuthInput
                    label="Registered Email Address"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (error) setError('');
                    }}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSendOtp}
                  />

                  <PrimaryButton
                    title="Send OTP Code"
                    onPress={handleSendOtp}
                    loading={loading}
                    disabled={loading}
                  />

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <LinkText
                    prefix="Remember your password?"
                    label="Sign in"
                    onPress={() => navigation.navigate('Login')}
                  />
                </>
              ) : (
                /* ── STEP 2: Enter 6-Digit OTP Code ── */
                <>
                  <Text style={styles.formHint}>
                    Please check your Gmail inbox for the 6-digit verification code.
                  </Text>

                  <AuthInput
                    label="6-Digit OTP Code"
                    value={otp}
                    onChangeText={(t) => {
                      setOtp(t);
                      if (error) setError('');
                    }}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyOtp}
                    inputStyle={styles.otpInputText}
                  />

                  <PrimaryButton
                    title="Verify OTP & Proceed"
                    onPress={handleVerifyOtp}
                    loading={loading}
                    disabled={loading}
                  />

                  <View style={styles.otpFooterRow}>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={resending}
                      style={styles.resendBtn}
                    >
                      <Text style={styles.resendText}>
                        {resending ? 'Resending...' : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.bulletDot}>•</Text>

                    <TouchableOpacity
                      onPress={() => {
                        setStep('EMAIL');
                        setOtp('');
                        setError('');
                        setInfoMessage('');
                      }}
                      style={styles.resendBtn}
                    >
                      <Text style={styles.changeEmailText}>Change Email</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <LinkText
                    prefix="Remember your password?"
                    label="Sign in"
                    onPress={() => navigation.navigate('Login')}
                  />
                </>
              )}
            </AuthCard>
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
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    top: -60,
    right: -40,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  navigationRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  illustrationZone: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  illustrationGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    zIndex: -1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: '#3730A3',
    fontSize: 13,
    fontWeight: '600',
  },
  formHint: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },
  otpInputText: {
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: '800',
    textAlign: 'center',
  },
  otpFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 12,
  },
  resendBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 14,
  },
  bulletDot: {
    color: '#94A3B8',
    fontSize: 14,
  },
  changeEmailText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
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
});
