import React, { useCallback, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Screen, StateView } from '../../components/ui';
import { dashboardService } from '../../services/appServices';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// CEFR Level Configuration
const CEFR_LEVELS = [
  { code: 'A1', name: 'Beginner', minXp: 0, maxXp: 250, color: '#3B82F6', desc: 'Can understand basic phrases & introduce oneself.' },
  { code: 'A2', name: 'Elementary', minXp: 250, maxXp: 600, color: '#06B6D4', desc: 'Can communicate in routine conversational tasks.' },
  { code: 'B1', name: 'Intermediate', minXp: 600, maxXp: 1200, color: '#10B981', desc: 'Can handle most everyday conversations with ease.' },
  { code: 'B2', name: 'Upper Intermediate', minXp: 1200, maxXp: 2500, color: '#8B5CF6', desc: 'Can converse fluently with native speakers.' },
  { code: 'C1', name: 'Advanced', minXp: 2500, maxXp: 5000, color: '#EC4899', desc: 'Can express ideas fluently and spontaneously.' },
  { code: 'C2', name: 'Mastery / Native', minXp: 5000, maxXp: 10000, color: '#F59E0B', desc: 'Complete effortless fluency in complex discourse.' },
];

export default function ProgressScreen({ navigation }) {
  const { isDark, theme } = useTheme();
  const [state, setState] = useState({ loading: true, error: '', dashboard: null });
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d'); // '7d' | '30d'

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const dashboard = await dashboardService.summary();
      setState({ loading: false, error: '', dashboard });
    } catch (error) {
      setState({ loading: false, error: error.userMessage || 'Unable to load progress analytics.', dashboard: null });
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const d = state.dashboard;
  const progress = d?.progress || {};
  const stats = d?.statistics || {};
  const weeklyData = d?.weeklyProgress || [
    { day: 'Mon', studyMinutes: 20 },
    { day: 'Tue', studyMinutes: 35 },
    { day: 'Wed', studyMinutes: 15 },
    { day: 'Thu', studyMinutes: 40 },
    { day: 'Fri', studyMinutes: 25 },
    { day: 'Sat', studyMinutes: 50 },
    { day: 'Sun', studyMinutes: 30 },
  ];

  // Level & XP calculations
  const xp = progress.xp || 0;
  const level = progress.level || Math.max(1, Math.floor(xp / 100) + 1);
  const currentLevelBaseXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const levelXpProgress = Math.max(0, xp - currentLevelBaseXp);
  const levelPercentage = Math.min(100, Math.max(0, (levelXpProgress / 100) * 100));

  // Determine current CEFR Level
  const currentCefr = CEFR_LEVELS.find((c) => xp >= c.minXp && xp < c.maxXp) || CEFR_LEVELS[CEFR_LEVELS.length - 1];
  const nextCefrIndex = CEFR_LEVELS.findIndex((c) => c.code === currentCefr.code) + 1;
  const nextCefr = nextCefrIndex < CEFR_LEVELS.length ? CEFR_LEVELS[nextCefrIndex] : null;
  const cefrRange = currentCefr.maxXp - currentCefr.minXp;
  const cefrProgress = Math.min(100, Math.max(0, ((xp - currentCefr.minXp) / cefrRange) * 100));

  // 6-Dimensional Skill Breakdown calculations
  const speakingScore = Math.min(98, Math.max(65, 70 + (stats.speakingSessions || 0) * 3));
  const grammarScore = Math.min(96, Math.max(60, 68 + (stats.grammarExercises || 0) * 4));
  const vocabScore = Math.min(95, Math.max(55, 62 + (stats.vocabularyLearned || 0) * 2));
  const pronunciationScore = Math.min(98, Math.max(72, 75 + (stats.speakingSessions || 0) * 2.5));
  const listeningScore = Math.min(97, Math.max(70, 74 + (stats.completedLessons || 0) * 4));
  const staminaScore = Math.min(99, Math.max(50, 60 + (stats.totalStudyHours || 0) * 5));

  const skillMatrix = [
    { name: 'Speaking Fluency', score: Math.round(speakingScore), icon: 'mic', color: '#6366F1', status: speakingScore > 85 ? 'Strong' : 'Developing' },
    { name: 'Grammar Accuracy', score: Math.round(grammarScore), icon: 'text', color: '#10B981', status: grammarScore > 85 ? 'Advanced' : 'Improving' },
    { name: 'Vocabulary Lexicon', score: Math.round(vocabScore), icon: 'library', color: '#F59E0B', status: vocabScore > 80 ? 'Rich' : 'Expanding' },
    { name: 'Pronunciation Clarity', score: Math.round(pronunciationScore), icon: 'volume-high', color: '#EC4899', status: pronunciationScore > 85 ? 'Clear' : 'Refining' },
    { name: 'Audio Comprehension', score: Math.round(listeningScore), icon: 'ear', color: '#06B6D4', status: listeningScore > 85 ? 'Sharp' : 'Practicing' },
    { name: 'Conversation Stamina', score: Math.round(staminaScore), icon: 'speedometer', color: '#8B5CF6', status: staminaScore > 80 ? 'High' : 'Building' },
  ];

  // Scale chart
  const maxMins = Math.max(10, ...weeklyData.map((d) => d.studyMinutes || 0));
  const totalWeeklyMinutes = weeklyData.reduce((acc, curr) => acc + (curr.studyMinutes || 0), 0);

  return (
    <Screen title="Progress & Analytics" subtitle="Track your CEFR proficiency, skills, and learning rhythm.">
      <StateView loading={state.loading} error={state.error} onRetry={load}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* CEFR Level Banner */}
          <LinearGradient
            colors={['#1E1B4B', '#312E81', '#4338CA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cefrBanner}
          >
            <View style={styles.cefrTopRow}>
              <View>
                <View style={styles.cefrTagRow}>
                  <View style={[styles.cefrBadge, { backgroundColor: currentCefr.color }]}>
                    <Text style={styles.cefrBadgeText}>{currentCefr.code}</Text>
                  </View>
                  <Text style={styles.cefrLevelTitle}>{currentCefr.name}</Text>
                </View>
                <Text style={styles.cefrSubtitle}>{currentCefr.desc}</Text>
              </View>
              <View style={styles.xpCircle}>
                <Text style={styles.xpCircleVal}>{xp}</Text>
                <Text style={styles.xpCircleLbl}>Total XP</Text>
              </View>
            </View>

            {nextCefr && (
              <View style={styles.cefrProgressSection}>
                <View style={styles.cefrProgressLabelRow}>
                  <Text style={styles.cefrNextTargetText}>Target: {nextCefr.code} ({nextCefr.name})</Text>
                  <Text style={styles.cefrPercentText}>{cefrProgress.toFixed(0)}%</Text>
                </View>
                <View style={styles.cefrBarBg}>
                  <LinearGradient
                    colors={['#38BDF8', '#818CF8', '#C084FC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.cefrBarFill, { width: `${cefrProgress}%` }]}
                  />
                </View>
                <Text style={styles.cefrRemainingText}>
                  Earn {Math.max(0, currentCefr.maxXp - xp)} more XP to advance to {nextCefr.code}
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Level & Streak Stats Ribbon */}
          <View style={styles.ribbonRow}>
            {/* Level Box */}
            <Card style={[styles.ribbonCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={styles.ribbonCardHeader}>
                <View style={[styles.ribbonIconCircle, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="sparkles" size={18} color="#6366F1" />
                </View>
                <Text style={[styles.ribbonValue, { color: theme.textPrimary }]}>Lvl {level}</Text>
              </View>
              <Text style={[styles.ribbonLabel, { color: theme.textSecondary }]}>Level Progress ({levelPercentage.toFixed(0)}%)</Text>
              <View style={[styles.ribbonBarBg, isDark && { backgroundColor: '#334155' }]}>
                <View style={[styles.ribbonBarFill, { width: `${levelPercentage}%`, backgroundColor: '#6366F1' }]} />
              </View>
            </Card>

            {/* Streak & Freeze Box */}
            <Card style={[styles.ribbonCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={styles.ribbonCardHeader}>
                <View style={[styles.ribbonIconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="flame" size={20} color="#F97316" />
                </View>
                <Text style={[styles.ribbonValue, { color: '#F97316' }]}>{progress.currentStreak || 0} Days</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.ribbonLabel, { color: theme.textSecondary }]}>Best: {progress.longestStreak || 0}d</Text>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#06B6D4' }}>❄️ Shield Active</Text>
              </View>
            </Card>
          </View>

          {/* 6-Dimensional Skill Breakdown */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Core Skill Competencies</Text>
          <Card style={[styles.skillsCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            {skillMatrix.map((skill, index) => (
              <View key={index} style={[styles.skillItem, index !== skillMatrix.length - 1 && { borderBottomColor: isDark ? '#334155' : '#F1F5F9', borderBottomWidth: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.skillIconCircle, { backgroundColor: `${skill.color}15` }]}>
                      <Ionicons name={skill.icon} size={16} color={skill.color} />
                    </View>
                    <Text style={[styles.skillName, { color: theme.textPrimary }]}>{skill.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.skillStatusBadge, { backgroundColor: `${skill.color}15` }]}>
                      <Text style={[styles.skillStatusText, { color: skill.color }]}>{skill.status}</Text>
                    </View>
                    <Text style={[styles.skillScore, { color: theme.textPrimary }]}>{skill.score}%</Text>
                  </View>
                </View>
                <View style={[styles.skillBarBg, isDark && { backgroundColor: '#334155' }]}>
                  <View style={[styles.skillBarFill, { width: `${skill.score}%`, backgroundColor: skill.color }]} />
                </View>
              </View>
            ))}
          </Card>

          {/* Weekly Practice Rhythm & Goal Tracker */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 }}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 0, marginTop: 0 }]}>
              Weekly Rhythm ({totalWeeklyMinutes} mins)
            </Text>
            <View style={[styles.timeframeToggle, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[styles.timeframeBtn, selectedTimeframe === '7d' && styles.timeframeBtnActive]}
                onPress={() => setSelectedTimeframe('7d')}
              >
                <Text style={[styles.timeframeText, selectedTimeframe === '7d' && styles.timeframeTextActive]}>7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timeframeBtn, selectedTimeframe === '30d' && styles.timeframeBtnActive]}
                onPress={() => setSelectedTimeframe('30d')}
              >
                <Text style={[styles.timeframeText, selectedTimeframe === '30d' && styles.timeframeTextActive]}>30 Days</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Card style={[styles.chartCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartSubtitle, { color: theme.textSecondary }]}>Daily Speaking & Practice Minutes</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981' }}>🎯 Daily Goal: 20m</Text>
            </View>
            <View style={styles.barChartContainer}>
              {weeklyData.map((item, index) => {
                const barHeight = ((item.studyMinutes || 0) / maxMins) * 110;
                const isGoalMet = (item.studyMinutes || 0) >= 20;
                return (
                  <View key={index} style={styles.chartColumn}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(6, barHeight),
                            backgroundColor: isGoalMet ? '#10B981' : COLORS.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.chartDayText, { color: theme.textSecondary }]}>{item.day}</Text>
                    <Text style={[styles.chartMinText, { color: isGoalMet ? '#10B981' : theme.textSecondary }]}>
                      {item.studyMinutes || 0}m
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Lifetime Learning Statistics */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 14 }]}>Lifetime Milestones</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="time" size={18} color="#6366F1" />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.totalStudyHours || 0}h</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Study Hours</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="mic" size={18} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.speakingSessions || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Speaking Chats</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FDF2F8' }]}>
                <Ionicons name="library" size={18} color="#EC4899" />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.vocabularyLearned || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Words Mastered</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="text" size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.grammarExercises || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Grammar Checks</Text>
            </View>
          </View>

          {/* AI Smart Action Recommendations */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 8 }]}>AI Practice Recommendations</Text>
          <Card style={[styles.aiCard, { backgroundColor: isDark ? '#1E1B4B' : '#F5F3FF', borderColor: '#C4B5FD' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 24 }}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiTitle, { color: isDark ? '#EDE9FE' : '#4C1D95' }]}>Next High-Yield Practice Steps</Text>
                <Text style={[styles.aiDesc, { color: isDark ? '#C4B5FD' : '#5B21B6' }]}>
                  • Practice 1 real-world conversation scenario to strengthen Speaking Stamina.{'\n'}
                  • Review 10 flashcards in Vocabulary to unlock your next CEFR badge.{'\n'}
                  • Explore Verb Tenses in the Grammar Handbook.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.aiActionBtn}
              onPress={() => navigation.navigate('Achievements')}
              activeOpacity={0.85}
            >
              <Text style={styles.aiActionBtnText}>View Medal Showcase & Achievements 🏆</Text>
            </TouchableOpacity>
          </Card>

          <View style={{ height: 30 }} />
        </ScrollView>
      </StateView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  cefrBanner: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cefrTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cefrTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  cefrBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cefrBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  cefrLevelTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  cefrSubtitle: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: width * 0.55,
    lineHeight: 16,
  },
  xpCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpCircleVal: {
    color: '#FDE047',
    fontSize: 17,
    fontWeight: '900',
  },
  xpCircleLbl: {
    color: '#E0E7FF',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cefrProgressSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  cefrProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cefrNextTargetText: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '700',
  },
  cefrPercentText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
  },
  cefrBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  cefrBarFill: {
    height: 8,
    borderRadius: 4,
  },
  cefrRemainingText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '600',
  },
  ribbonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  ribbonCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
  },
  ribbonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ribbonIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  ribbonLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  ribbonBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  ribbonBarFill: {
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skillsCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  skillItem: {
    paddingVertical: 10,
  },
  skillIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillName: {
    fontSize: 13,
    fontWeight: '800',
  },
  skillStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skillStatusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  skillScore: {
    fontSize: 13,
    fontWeight: '900',
    width: 36,
    textAlign: 'right',
  },
  skillBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
  },
  skillBarFill: {
    height: 6,
    borderRadius: 3,
  },
  timeframeToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2,
  },
  timeframeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeframeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  timeframeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  chartCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  chartSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 6,
  },
  chartColumn: {
    alignItems: 'center',
  },
  barWrapper: {
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 14,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  chartDayText: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
  },
  chartMinText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 50) / 2,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  aiCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  aiDesc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  aiActionBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
