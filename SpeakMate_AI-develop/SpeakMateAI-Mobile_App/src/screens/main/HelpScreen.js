import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Screen, Card } from '../../components/ui';
import { COLORS } from '../../constants/colors';

const FAQS = [
  {
    q: 'How does SpeakMateAI help me speak better?',
    a: 'SpeakMateAI uses advanced generative AI models to analyze your pronunciation, grammar, and fluency. It provides real-time conversational feedback as if you are speaking to a native speaker.',
  },
  {
    q: 'What is CEFR level rating?',
    a: 'CEFR (Common European Framework of Reference for Languages) is an international standard for describing language ability. It ranges from A1 (Beginner) to C2 (Proficient). Your progress is tracked using this scale.',
  },
  {
    q: 'How do I earn XP and badges?',
    a: 'You earn Experience Points (XP) by practicing speaking, checking grammar, and learning new vocabulary. Accumulating XP unlocks achievements and levels up your profile.',
  },
  {
    q: 'Can I change my learning preferences?',
    a: 'Yes, navigate to the Settings screen in the drawer sidebar to change your target learning language, preferred AI voice settings, notifications, and reminders.',
  },
];

export default function HelpScreen({ navigation }) {
  const { isDark, theme } = useTheme();

  const handleContactSupport = () => {
    Linking.openURL('mailto:dnyaneshwaralgule2003@gmail.com?subject=SpeakMateAI%20Support%20Request');
  };

  return (
    <Screen
      title="Help & Support"
      subtitle="Find answers to common questions or contact our support team."
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, isDark && { backgroundColor: '#334155' }]}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      }
    >
      <View style={styles.sectionHeader}>
        <Ionicons name="help-circle" size={22} color={COLORS.primary} />
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Frequently Asked Questions</Text>
      </View>

      {FAQS.map((faq, i) => (
        <Card key={i} style={[styles.faqCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <Text style={styles.question}>{faq.q}</Text>
          <Text style={[styles.answer, { color: theme.textSecondary }]}>{faq.a}</Text>
        </Card>
      ))}

      <View style={[styles.contactContainer, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF', borderColor: theme.cardBorder }]}>
        <Text style={styles.contactTitle}>Still need help?</Text>
        <Text style={[styles.contactDesc, { color: theme.textSecondary }]}>
          Our support team is available 24/7. Contact us directly at{' '}
          <Text style={{ fontWeight: '700', color: COLORS.primary }}>dnyaneshwaralgule2003@gmail.com</Text>
        </Text>
        <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8} onPress={handleContactSupport}>
          <Ionicons name="mail" size={18} color="#FFFFFF" />
          <Text style={styles.contactBtnText}>Contact Support Team</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: '#EEF2FF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
  },
  faqCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  question: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  contactContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  contactDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
