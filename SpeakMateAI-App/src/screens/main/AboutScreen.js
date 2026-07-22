import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Screen, Card } from '../../components/ui';
import { COLORS } from '../../constants/colors';

export default function AboutScreen({ navigation }) {
  const { isDark, theme } = useTheme();

  return (
    <Screen
      title="About SpeakMateAI"
      subtitle="Learn more about our mission, vision, and technology stack."
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, isDark && { backgroundColor: '#334155' }]}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      }
    >
      <View style={styles.logoContainer}>
        <LinearGradient
          colors={['#4F46E5', '#6366F1']}
          style={styles.logoInner}
        >
          <Text style={styles.logoText}>SM</Text>
        </LinearGradient>
        <Text style={[styles.versionTitle, { color: theme.textPrimary }]}>SpeakMateAI Mobile</Text>
        <Text style={[styles.versionNumber, { color: theme.textSecondary }]}>Version 1.0.0 (Production-Ready)</Text>
      </View>

      <Card style={[styles.descCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={styles.descTitle}>Our Vision</Text>
        <Text style={[styles.descText, { color: theme.textSecondary }]}>
          SpeakMateAI is a premier mobile-first language assistant that leverages high-fidelity AI models to democratize conversational language learning. We believe that everyone should have access to a friendly, personalized language tutor anytime, anywhere.
        </Text>
      </Card>

      <Card style={[styles.techCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={styles.descTitle}>Built With Premium Tech Stack</Text>
        <View style={styles.techList}>
          <View style={styles.techItem}>
            <Ionicons name="logo-react" size={20} color="#61DAFB" />
            <Text style={[styles.techText, { color: theme.textPrimary }]}>React Native & Expo SDK 57</Text>
          </View>
          <View style={styles.techItem}>
            <Ionicons name="cog-outline" size={20} color="#6DB33F" />
            <Text style={[styles.techText, { color: theme.textPrimary }]}>Spring Boot Backend Architecture</Text>
          </View>
          <View style={styles.techItem}>
            <Ionicons name="cloud-outline" size={20} color="#0EA5E9" />
            <Text style={[styles.techText, { color: theme.textPrimary }]}>Secure JWT & Axios Services</Text>
          </View>
        </View>
      </Card>

      <Text style={[styles.copyrightText, { color: theme.textSecondary }]}>
        © {new Date().getFullYear()} SpeakMateAI. All rights reserved. Made with ❤️ by the Google DeepMind team.
      </Text>
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
    marginVertical: 24,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  versionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
  },
  versionNumber: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
  },
  descCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
  },
  techCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  techList: {
    gap: 12,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  techText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 18,
  },
});
