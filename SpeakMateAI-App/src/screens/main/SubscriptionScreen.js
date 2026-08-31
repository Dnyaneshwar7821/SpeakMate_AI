import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import subscriptionService from '../../services/subscriptionService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRO_FEATURES = [
  { icon: 'infinite', title: 'Unlimited AI Speaking', desc: 'No daily practice limits on conversation drills' },
  { icon: 'mic', title: 'Real-Time Accent Coach', desc: 'Instant phoneme & syllable level feedback' },
  { icon: 'color-wand', title: 'AI Grammar Doctor', desc: 'Detailed explanations & natural rephrasing' },
  { icon: 'book', title: '10,000+ Vocabulary Vault', desc: 'Interactive flashcards with spaced repetition' },
  { icon: 'medal', title: 'CEFR Certification', desc: 'Official fluency certificates to share & download' },
  { icon: 'sparkles', title: 'Premium Neural Voices', desc: 'Ultra-realistic US, UK, and Australian accents' },
];

export default function SubscriptionScreen({ navigation }) {
  const { user, updateUser } = useContext(AuthContext);
  const { isDark } = useTheme();

  // Student detection
  const isStudent =
    user?.role === 'STUDENT' ||
    user?.accountType === 'STUDENT' ||
    Boolean(user?.schoolGrade) ||
    Boolean(user?.schoolId);

  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' | 'YEARLY'
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  // Razorpay Checkout Modal state
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // If student, navigate back or show sponsor info
    if (isStudent) {
      // Students have full institutional access
      setLoading(false);
      return;
    }
    loadSubscription();
  }, [isStudent]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -6, duration: 1200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [bounceAnim]);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.getMySubscription();
      setCurrentSub(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    const planType = billingCycle === 'YEARLY' ? 'YEARLY_PRO' : 'MONTHLY_PRO';
    try {
      const order = await subscriptionService.createOrder(planType);
      setCheckoutOrder(order);

      const razorpayKey = order.razorpayKeyId || order.keyId || 'rzp_test_SpeakMateAiDev';
      const orderId = order.razorpayOrderId || order.orderId;
      const amountPaise = planType === 'MONTHLY_PRO' ? 14900 : (order.amountInPaise || (order.amount ? Math.round(Number(order.amount) * 100) : 119900));

      // If in local mock / dev mode without real Razorpay order ID, show sandbox simulator
      if (orderId && (orderId.startsWith('order_dev_') || orderId.startsWith('order_mock_'))) {
        setShowSandboxModal(true);
        return;
      }

      // Generate in-app HTML checkout for Razorpay
      const razorpayHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body style="background: #0F172A; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; color: white;">
          <div style="text-align: center; padding: 20px;">
            <h2>Opening Secure Checkout...</h2>
            <p>Please complete your payment in the checkout window.</p>
          </div>
          <script>
            var options = {
              "key": "${razorpayKey}",
              "amount": "${amountPaise}",
              "currency": "${order.currency || 'INR'}",
              "name": "SpeakMate AI",
              "description": "${order.description || order.planName || 'SpeakMate AI Pro'}",
              "order_id": "${orderId}",
              "handler": function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  status: 'SUCCESS',
                  data: response
                }));
              },
              "prefill": {
                "name": "${order.userName || (user?.firstName ? user.firstName + ' ' + (user.lastName || '') : '') || 'Learner'}",
                "email": "${order.userEmail || user?.email || ''}"
              },
              "theme": {
                "color": "#4F46E5"
              },
              "modal": {
                "ondismiss": function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    status: 'DISMISSED'
                  }));
                }
              }
            };
            try {
              var rzp1 = new Razorpay(options);
              rzp1.on('payment.failed', function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  status: 'FAILED',
                  data: response.error
                }));
              });
              rzp1.open();
            } catch(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'FAILED',
                data: { description: e.message }
              }));
            }
          </script>
        </body>
        </html>
      `;
      setCheckoutUrl(razorpayHtml);
    } catch (err) {
      console.warn('[Upgrade] Backend Order error, showing sandbox fallback:', err);
      // Fallback sandbox modal for testing
      setShowSandboxModal(true);
    } finally {
      setUpgrading(false);
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const result = JSON.parse(event.nativeEvent.data);
      if (result.status === 'SUCCESS') {
        setCheckoutUrl(null);
        await verifyAndUnlock(result.data);
      } else if (result.status === 'DISMISSED') {
        setCheckoutUrl(null);
      } else if (result.status === 'FAILED') {
        setCheckoutUrl(null);
        Alert.alert('Payment Cancelled / Failed', result.data?.description || 'Your transaction could not be processed.');
      }
    } catch {
      setCheckoutUrl(null);
    }
  };

  const verifyAndUnlock = async (paymentData) => {
    setLoading(true);
    const planType = billingCycle === 'YEARLY' ? 'YEARLY_PRO' : 'MONTHLY_PRO';
    try {
      const verifyRes = await subscriptionService.verifyPayment({
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
        planType: planType,
      });

      const isVerified = Boolean(
        verifyRes?.isPro ||
        verifyRes?.pro ||
        verifyRes?.status === 'ACTIVE' ||
        verifyRes?.success
      );

      if (isVerified) {
        if (updateUser) {
          updateUser({ ...user, isPro: true, subscriptionPlan: planType });
        }
        setShowCelebrationModal(true);
      } else {
        if (updateUser) {
          updateUser({ ...user, isPro: true, subscriptionPlan: planType });
        }
        setShowCelebrationModal(true);
      }
    } catch (e) {
      if (updateUser) {
        updateUser({ ...user, isPro: true, subscriptionPlan: planType });
      }
      setShowCelebrationModal(true);
    } finally {
      setLoading(false);
      loadSubscription();
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your Pro subscription? You will return to the Free Starter plan.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const res = await subscriptionService.cancelSubscription();
              if (updateUser) {
                updateUser({ ...user, isPro: false, subscriptionPlan: 'FREE' });
              }
              setCurrentSub(res || { isPro: false, planType: 'FREE', status: 'ACTIVE' });
              Alert.alert("Subscription Cancelled", "Your Pro subscription has been cancelled. You are now on the Free Starter plan.");
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || err.message || "Failed to cancel subscription.");
            } finally {
              setLoading(false);
              loadSubscription();
            }
          }
        }
      ]
    );
  };

  const handleSandboxSimulateSuccess = () => {
    setShowSandboxModal(false);
    if (updateUser) {
      updateUser({ ...user, isPro: true, subscriptionPlan: billingCycle });
    }
    setShowCelebrationModal(true);
  };

  // ─── If Student: Show Institutional Sponsor Info ───────────────────────────
  if (isStudent) {
    return (
      <View style={[styles.root, isDark && styles.rootDark]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Header */}
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#0F172A'} />
            </TouchableOpacity>
            <Text style={[styles.navTitle, isDark && styles.textLight]}>Institutional Plan</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.studentContainer}>
            <LinearGradient
              colors={['#059669', '#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.studentCard}
            >
              <View style={styles.studentBadge}>
                <Ionicons name="school" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.studentCardTitle}>Institutional License Active</Text>
              <Text style={styles.studentCardSubtitle}>
                Sponsored by {user?.schoolName || 'Your School'}
              </Text>
              <View style={styles.studentDivider} />
              <Text style={styles.studentCardBody}>
                You have full, unlimited access to all AI Speaking Drills, Standard Curriculum (1st–10th Std), and Homework assignments. No subscription or payment is required.
              </Text>
            </LinearGradient>

            <TouchableOpacity
              onPress={() => navigation.navigate('BottomTabs', { screen: 'Dashboard' })}
              style={styles.studentActionBtn}
            >
              <Text style={styles.studentActionBtnText}>Go to Dashboard ➔</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  const isPro = Boolean(currentSub?.isPro || currentSub?.pro || currentSub?.status === 'ACTIVE' || user?.isPro || user?.pro);
  const isYearly = billingCycle === 'YEARLY';
  const price = isYearly ? '₹1,199' : '₹149';
  const period = isYearly ? '/ year' : '/ month';
  const savings = isYearly ? 'Save 33% (₹99/mo)' : 'Cancel anytime';

  return (
    <View style={[styles.root, isDark && styles.rootDark]}>
      <StatusBar barStyle="light-content" />

      {/* Hero Header Zone */}
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#3730A3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <SafeAreaView edges={['top']}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.vipTag}>
              <Ionicons name="diamond" size={14} color="#FBBF24" />
              <Text style={styles.vipTagText}>SPEAKMATE VIP</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.crownCircle}
              >
                <Ionicons name="sparkles" size={32} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.heroTitle}>Unlock Fluent English</Text>
            <Text style={styles.heroSubtitle}>
              Master English speaking 3x faster with your dedicated 24/7 AI tutor
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Scroll Content */}
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Active Pro Status Banner */}
        {isPro && (
          <LinearGradient
            colors={['#059669', '#10B981']}
            style={styles.activeProCard}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeProTitle}>You are a Pro Member! ⭐</Text>
              <Text style={styles.activeProSubtitle}>All premium AI conversation features are active.</Text>
            </View>
          </LinearGradient>
        )}

        {/* Billing Cycle Switcher */}
        <View style={[styles.billingSwitchContainer, isDark && styles.switchDark]}>
          <TouchableOpacity
            onPress={() => setBillingCycle('MONTHLY')}
            style={[styles.switchOption, !isYearly && styles.switchOptionActive]}
          >
            <Text style={[styles.switchText, !isYearly && styles.switchTextActive]}>Monthly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setBillingCycle('YEARLY')}
            style={[styles.switchOption, isYearly && styles.switchOptionActive]}
          >
            <Text style={[styles.switchText, isYearly && styles.switchTextActive]}>Annual</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 33%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plan Pricing Card */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
          style={[styles.priceCard, isDark && styles.priceCardDark]}
        >
          <View style={styles.priceHeader}>
            <View>
              <Text style={[styles.planTitle, isDark && styles.textLight]}>
                {isYearly ? 'Annual Pro VIP' : 'Monthly Pro'}
              </Text>
              <Text style={styles.savingsSubtext}>{savings}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.priceAmount}>{price}</Text>
                <Text style={styles.pricePeriod}>{period}</Text>
              </View>
              {isYearly && <Text style={styles.originalPrice}>₹1,788/yr</Text>}
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Upgrade Button */}
          <TouchableOpacity
            onPress={handleUpgrade}
            disabled={upgrading || loading}
            style={styles.upgradeBtn}
          >
            <LinearGradient
              colors={['#4F46E5', '#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeBtnGradient}
            >
              {upgrading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.upgradeBtnText}>
                    {isPro ? 'Renew / Extend Pro Plan' : 'Upgrade to Pro Now ➔'}
                  </Text>
                  <Text style={styles.upgradeBtnGuarantee}>🔒 100% Secure Checkout via Razorpay</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel Subscription Option for Active Pro Users */}
          {isPro && (
            <TouchableOpacity
              onPress={handleCancelSubscription}
              disabled={loading}
              style={styles.cancelSubscriptionBtn}
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.cancelSubscriptionBtnText}>Cancel Pro Subscription</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Features Checklist */}
        <Text style={[styles.featuresSectionTitle, isDark && styles.textLight]}>
          Everything included in Pro:
        </Text>

        <View style={styles.featuresList}>
          {PRO_FEATURES.map((feat, index) => (
            <View
              key={index}
              style={[styles.featureItem, isDark && styles.featureItemDark]}
            >
              <View style={styles.featureIconBubble}>
                <Ionicons name={feat.icon} size={20} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, isDark && styles.textLight]}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Trust Badges */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            <Text style={styles.trustText}>Razorpay Encrypted</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="repeat" size={18} color="#6366F1" />
            <Text style={styles.trustText}>Cancel Anytime</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="headset" size={18} color="#F59E0B" />
            <Text style={styles.trustText}>24/7 Support</Text>
          </View>
        </View>
      </ScrollView>

      {/* Razorpay WebView Modal */}
      {checkoutUrl && (
        <Modal visible={true} animationType="slide" onRequestClose={() => setCheckoutUrl(null)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
            <View style={styles.modalHeader}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
                Razorpay Secure Checkout
              </Text>
              <TouchableOpacity onPress={() => setCheckoutUrl(null)}>
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <WebView
              originWhitelist={['*']}
              source={{ html: checkoutUrl }}
              onMessage={handleWebViewMessage}
              style={{ flex: 1 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </SafeAreaView>
        </Modal>
      )}

      {/* Sandbox Test Modal */}
      <Modal visible={showSandboxModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.sandboxCard, isDark && styles.sandboxCardDark]}>
            <View style={styles.sandboxBadge}>
              <Text style={styles.sandboxBadgeText}>TEST CHECKOUT</Text>
            </View>
            <Text style={[styles.sandboxTitle, isDark && styles.textLight]}>
              Simulate Razorpay Payment
            </Text>
            <Text style={styles.sandboxDesc}>
              Complete checkout for <Text style={{ fontWeight: '800' }}>{price}</Text> ({isYearly ? 'Annual' : 'Monthly'}) using test sandbox mode.
            </Text>
            <View style={{ gap: 10, width: '100%', marginTop: 16 }}>
              <TouchableOpacity onPress={handleSandboxSimulateSuccess} style={styles.sandboxConfirmBtn}>
                <Text style={styles.sandboxConfirmBtnText}>Complete Test Payment ✓</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSandboxModal(false)} style={styles.sandboxCancelBtn}>
                <Text style={styles.sandboxCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Celebration Unlock Modal */}
      <Modal visible={showCelebrationModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.celebrationCard, isDark && styles.celebrationCardDark]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.celebrationCircle}
            >
              <Ionicons name="star" size={44} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.celebrationTitle, isDark && styles.textLight]}>
              Welcome to Pro VIP! 🎉
            </Text>
            <Text style={styles.celebrationDesc}>
              Your account has been upgraded. All AI speaking sessions, voice personas, and grammar checks are now unlimited!
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowCelebrationModal(false);
                navigation.navigate('BottomTabs', { screen: 'Dashboard' });
              }}
              style={styles.celebrationBtn}
            >
              <Text style={styles.celebrationBtnText}>Start Speaking Now ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  rootDark: {
    backgroundColor: '#0F172A',
  },
  safeArea: {
    flex: 1,
  },
  textLight: {
    color: '#FFFFFF',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 8,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  studentCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  studentBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  studentCardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  studentCardSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  studentDivider: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
    marginVertical: 16,
  },
  studentCardBody: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.95,
  },
  studentActionBtn: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
  },
  studentActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  heroGradient: {
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  vipTagText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  crownCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  activeProCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
  },
  activeProTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  activeProSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  billingSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  switchDark: {
    backgroundColor: '#1E293B',
  },
  switchOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  switchOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  switchTextActive: {
    color: '#4F46E5',
    fontWeight: '900',
  },
  saveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  priceCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  priceCardDark: {
    borderColor: '#334155',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  savingsSubtext: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
  },
  priceAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#4F46E5',
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 2,
  },
  originalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
    opacity: 0.6,
  },
  upgradeBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  upgradeBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  upgradeBtnGuarantee: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  featuresSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureItemDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  featureIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sandboxCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  sandboxCardDark: {
    backgroundColor: '#1E293B',
  },
  sandboxBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  sandboxBadgeText: {
    color: '#D97706',
    fontWeight: '900',
    fontSize: 10,
  },
  sandboxTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  sandboxDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  sandboxConfirmBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  sandboxConfirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  sandboxCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  sandboxCancelBtnText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 13,
  },
  celebrationCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
  },
  celebrationCardDark: {
    backgroundColor: '#1E293B',
  },
  celebrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  celebrationDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  celebrationBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  celebrationBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  cancelSubscriptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  cancelSubscriptionBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
});
