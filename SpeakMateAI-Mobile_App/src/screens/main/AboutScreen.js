import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Screen, Card } from '../../components/ui';
import { COLORS } from '../../constants/colors';

export default function AboutScreen({ navigation }) {
  const { isDark } = useTheme();

  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDark ? '#334155' : '#E2E8F0';
  const titleColor = isDark ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const rowBg = isDark ? '#0F172A' : '#F8FAFC';

  const handleOpenLink = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@speakmateai.com?subject=SpeakMateAI%20App%20Feedback').catch(() => {
      Alert.alert('Contact Support', 'You can reach us directly at support@speakmateai.com');
    });
  };

  return (
    <Screen
      title="About SpeakMateAI"
      subtitle="Your companion for mastering fluent English speaking."
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, isDark && { backgroundColor: '#334155' }]}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* App Hero Branding */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoInner}
          >
            <Text style={styles.logoText}>SM</Text>
          </LinearGradient>
          <Text style={[styles.appName, { color: titleColor }]}>SpeakMateAI</Text>
          <Text style={[styles.appTagline, { color: COLORS.primary }]}>AI English Speaking & Conversation Tutor</Text>
          <View style={[styles.versionBadge, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
            <Text style={styles.versionText}>Version 1.0.0 (Build 2026)</Text>
          </View>
        </View>

        {/* About App Card */}
        <Card style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF' }]}>
              <Ionicons name="sparkles" size={18} color={COLORS.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: titleColor }]}>About SpeakMateAI</Text>
          </View>
          <Text style={[styles.bodyText, { color: subtextColor }]}>
            SpeakMateAI is an intelligent English conversation and fluency companion designed to help you speak with confidence. Whether preparing for job interviews, everyday conversations, travel, or exams, SpeakMateAI provides interactive roleplays and real-time feedback anytime, anywhere.
          </Text>
        </Card>

        {/* What You Can Do Card */}
        <Card style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
              <Ionicons name="chatbubbles" size={18} color="#10B981" />
            </View>
            <Text style={[styles.cardTitle, { color: titleColor }]}>Key Highlights</Text>
          </View>

          <View style={styles.featureList}>
            <View style={styles.featureRow}>
              <Text style={styles.featureEmoji}>🗣️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: titleColor }]}>Realistic Conversational Scenarios</Text>
                <Text style={[styles.featureDesc, { color: subtextColor }]}>Practice speaking in cafes, hotels, interviews, and daily routines.</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureEmoji}>🎯</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: titleColor }]}>Instant Speech & Grammar Feedback</Text>
                <Text style={[styles.featureDesc, { color: subtextColor }]}>Receive actionable tips to polish pronunciation, fluency, and vocabulary.</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureEmoji}>🔊</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: titleColor }]}>Natural English Tutor Voices</Text>
                <Text style={[styles.featureDesc, { color: subtextColor }]}>Listen and learn with friendly American, British, and Indian tutor accents.</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureEmoji}>🏆</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: titleColor }]}>Gamified Learning & Streaks</Text>
                <Text style={[styles.featureDesc, { color: subtextColor }]}>Earn XP, track your daily practice streak, and level up your skills.</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Legal & Support Links */}
        <Card style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(14, 165, 233, 0.2)' : '#F0F9FF' }]}>
              <Ionicons name="information-circle-outline" size={18} color="#0EA5E9" />
            </View>
            <Text style={[styles.cardTitle, { color: titleColor }]}>App Info & Support</Text>
          </View>

          <View style={styles.linksContainer}>
            <TouchableOpacity
              style={[styles.linkRow, { backgroundColor: rowBg }]}
              onPress={handleContactSupport}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <Text style={[styles.linkText, { color: titleColor }]}>Contact Support & Feedback</Text>
              <Ionicons name="chevron-forward" size={16} color={subtextColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkRow, { backgroundColor: rowBg }]}
              onPress={() => handleOpenLink('Privacy Policy', 'SpeakMateAI prioritizes your privacy. Your spoken audio and conversation data are processed securely to provide personalized language tutoring.')}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
              <Text style={[styles.linkText, { color: titleColor }]}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color={subtextColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkRow, { backgroundColor: rowBg }]}
              onPress={() => handleOpenLink('Terms of Service', 'By using SpeakMateAI, you agree to standard mobile app terms of service for interactive language educational tools.')}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={20} color="#8B5CF6" />
              <Text style={[styles.linkText, { color: titleColor }]}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={16} color={subtextColor} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Footer Copyright */}
        <View style={styles.footer}>
          <Text style={[styles.copyright, { color: subtextColor }]}>
            © {new Date().getFullYear()} SpeakMateAI. All rights reserved.
          </Text>
          <Text style={[styles.footerSub, { color: subtextColor }]}>
            Crafted for confident English speakers worldwide.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: '#EEF2FF',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logoInner: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  appTagline: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 21,
  },
  featureList: {
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureEmoji: {
    fontSize: 18,
    marginTop: 1,
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  featureDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  linksContainer: {
    gap: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  copyright: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerSub: {
    fontSize: 11,
    marginTop: 4,
  },
});
