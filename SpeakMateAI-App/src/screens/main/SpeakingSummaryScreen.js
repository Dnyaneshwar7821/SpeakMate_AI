/**
 * SpeakingSummaryScreen
 * Premium post-session report showing metrics, score, mistakes,
 * vocabulary list, and motivational feedback.
 */
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';

import { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { assignmentService } from '../../services/appServices';

export default function SpeakingSummaryScreen({ navigation, route }) {
  const { isDark, theme } = useTheme();
  const { summary } = route.params || {};
  const { showToast, triggerConfetti } = useToast();

  const score = summary?.score || 0;
  const xp = summary?.xpEarned ?? summary?.xp ?? 0;
  const durationSecs = summary?.durationSeconds ?? summary?.duration ?? 0;
  const mins = Math.floor(durationSecs / 60);
  const secs = durationSecs % 60;

  useEffect(() => {
    triggerConfetti();
    if (xp > 0) {
      showToast(`Session Complete! +${xp} XP`, 'xp', `Practiced for ${mins}m ${secs}s`);
    } else {
      showToast('Session Complete! 🎙️', 'info', 'Keep practicing daily to earn XP!');
    }

    // Auto submit student homework assignment if completed
    const assignmentId = summary?.assignmentId || route.params?.assignmentId || 101;
    if (assignmentId && score >= 70) {
      assignmentService.submit(assignmentId, { score: Math.round(score), status: 'SUBMITTED' })
        .then(() => {
          showToast('Homework Submitted to Teacher! 📝', 'success', `Scored ${Math.round(score)}% (Target >= 70%)`);
        })
        .catch(() => {});
    }
  }, []);

  const handleFinish = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.popToTop();
      } else {
        navigation.navigate('SpeakingHome');
      }
    } catch (_) {
      navigation.navigate('SpeakingHome');
    }
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} showsVerticalScrollIndicator={false}>
      {/* ── Top Header ── */}
      <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Session Results</Text>
        </View>

        {/* Score Ring */}
        <View style={styles.scoreRingWrapper}>
          <View style={styles.scoreRing}>
            <Text style={styles.scoreText}>{Math.round(score)}%</Text>
            <Text style={styles.scoreLabel}>Overall Score</Text>
          </View>
        </View>

        <Text style={styles.congratsText}>
          {score >= 80 ? 'Excellent Work! 🎉' : score >= 50 ? 'Good Practice! 👍' : score > 0 ? 'Keep Going! 💪' : 'Session Ended 🎙️'}
        </Text>
        <Text style={styles.motivationText}>
          {summary?.motivationalMessage || "Keep practicing every day to sound more natural and confident."}
        </Text>
      </LinearGradient>

      {/* ── Key Metrics ── */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
          <Ionicons name="flash-outline" size={20} color="#F59E0B" />
          <Text style={[styles.metricVal, { color: theme.textPrimary }]}>+{xp} XP</Text>
          <Text style={[styles.metricLbl, { color: theme.textSecondary }]}>XP Awarded</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
          <Ionicons name="time-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.metricVal, { color: theme.textPrimary }]}>
            {mins > 0 ? `${mins}m ` : ''}{secs}s
          </Text>
          <Text style={[styles.metricLbl, { color: theme.textSecondary }]}>Time Spent</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
          <Ionicons name="chatbubbles-outline" size={20} color={COLORS.secondary} />
          <Text style={[styles.metricVal, { color: theme.textPrimary }]}>{summary?.messagesExchanged || 0}</Text>
          <Text style={[styles.metricLbl, { color: theme.textSecondary }]}>Turns Made</Text>
        </View>
      </View>

      {/* ── Feedback Sections ── */}
      <View style={styles.detailsContainer}>
        {/* Skill Scores Breakdown */}
        {score > 0 && (summary?.fluencyScore || summary?.grammarScore || summary?.vocabularyScore || summary?.pronunciationScore) ? (
          <View style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={styles.detailHeader}>
              <Ionicons name="stats-chart-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>Skill Evaluation Breakdown</Text>
            </View>
            <View style={{ gap: 10, marginTop: 4 }}>
              {[
                { label: '🗣️ Fluency & Flow', val: summary?.fluencyScore || score, color: '#3B82F6' },
                { label: '✍️ Grammar Accuracy', val: summary?.grammarScore || score, color: '#10B981' },
                { label: '📖 Vocabulary Variety', val: summary?.vocabularyScore || score, color: '#8B5CF6' },
                { label: '🎙️ Speech Clarity', val: summary?.pronunciationScore || score, color: '#F59E0B' },
              ].map((skill, idx) => (
                <View key={idx}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textPrimary }}>{skill.label}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: skill.color }}>{Math.round(skill.val)}%</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: isDark ? '#334155' : '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ width: `${Math.min(100, Math.max(0, skill.val))}%`, height: '100%', backgroundColor: skill.color, borderRadius: 3 }} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Summary */}
        <View style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
          <View style={styles.detailHeader}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>Session Summary</Text>
          </View>
          <Text style={[styles.detailBody, { color: theme.textSecondary }]}>
            {summary?.summary || "Completed speaking practice simulation."}
          </Text>
        </View>

        {/* Vocabulary learned */}
        {summary?.vocabularyLearned && (
          <View style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={styles.detailHeader}>
              <Ionicons name="bulb-outline" size={18} color="#CA8A04" />
              <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>Vocabulary Suggested</Text>
            </View>
            <Text style={[styles.detailBody, { color: theme.textSecondary }]}>{summary.vocabularyLearned}</Text>
          </View>
        )}

        {/* Grammar corrections summary */}
        {summary?.grammarCorrections && (
          <View style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={styles.detailHeader}>
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
              <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>Grammar Notes</Text>
            </View>
            <Text style={[styles.detailBody, { color: theme.textSecondary }]}>{summary.grammarCorrections}</Text>
          </View>
        )}

        {/* Better sentences summary */}
        {summary?.betterSentences && (
          <View style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={styles.detailHeader}>
              <Ionicons name="trending-up-outline" size={18} color="#0EA5E9" />
              <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>Native Expressions</Text>
            </View>
            <Text style={[styles.detailBody, { color: theme.textSecondary }]}>{summary.betterSentences}</Text>
          </View>
        )}

        {/* Done Button */}
        <TouchableOpacity style={styles.doneBtn} onPress={handleFinish}>
          <Text style={styles.doneBtnText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: { alignItems: 'center', paddingBottom: 28, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { paddingTop: 48, marginBottom: 12 },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  scoreRingWrapper: { marginVertical: 14, alignItems: 'center' },
  scoreRing: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 4, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  scoreText: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  scoreLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  congratsText: { color: '#FFF', fontSize: 18, fontWeight: '900', marginTop: 4 },
  motivationText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center', paddingHorizontal: 32, marginTop: 6, lineHeight: 18 },

  // Metrics
  metricsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: -20 },
  metricCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  metricVal: { fontSize: 14, fontWeight: '800', color: COLORS.black, marginTop: 6 },
  metricLbl: { fontSize: 10, color: '#64748B', fontWeight: '500', marginTop: 2 },

  // Details
  detailsContainer: { padding: 16, gap: 12 },
  detailCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  detailTitle: { fontSize: 14, fontWeight: '800', color: COLORS.black },
  detailBody: { fontSize: 13, color: COLORS.text, lineHeight: 20 },

  doneBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  doneBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
