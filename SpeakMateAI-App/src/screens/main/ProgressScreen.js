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
import { Card, Screen, StateView } from '../../components/ui';
import { dashboardService } from '../../services/appServices';

import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function ProgressScreen({ navigation }) {
  const { isDark, theme } = useTheme();
  const [state, setState] = useState({ loading: true, error: '', dashboard: null });

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      // Use consolidated summary to fetch all progress metrics and weekly progress
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
  const weeklyData = d?.weeklyProgress || [];

  // Level calculations
  const level = progress.level || 1;
  const xp = progress.xp || 0;
  const currentLevelBaseXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const levelXpProgress = xp - currentLevelBaseXp;
  const levelPercentage = Math.min(100, Math.max(0, (levelXpProgress / 100) * 100));

  // Find max minutes to scale chart
  const maxMins = Math.max(10, ...weeklyData.map((d) => d.studyMinutes || 0));

  return (
    <Screen title="Progress" subtitle="Learning analytics and weekly progress rhythm.">
      <StateView loading={state.loading} error={state.error} onRetry={load}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Level Tracker */}
          <Card style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{level}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelTitle, { color: theme.textPrimary }]}>Level {level} Learner</Text>
                <Text style={[styles.levelSubText, { color: theme.textSecondary }]}>Earn {nextLevelXp - xp} XP to unlock Level {level + 1}</Text>
              </View>
            </View>
            <View style={[styles.progressBarBg, isDark && { backgroundColor: '#334155' }]}>
              <View style={[styles.progressBarActive, { width: `${levelPercentage}%` }]} />
            </View>
            <View style={styles.xpRow}>
              <Text style={[styles.xpText, { color: theme.textSecondary }]}>{xp} XP Total</Text>
              <Text style={[styles.xpText, { color: theme.textSecondary }]}>{levelPercentage.toFixed(0)}% Complete</Text>
            </View>
          </Card>

          {/* Quick Stats Grid */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Learning Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : '#EEF2FF' }]}>
                <Ionicons name="time" size={18} color={COLORS.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.totalStudyHours || 0}h</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Study Hours</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : '#ECFDF5' }]}>
                <Ionicons name="mic" size={18} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.speakingSessions || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Speaking Sessions</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: isDark ? 'rgba(236,72,153,0.2)' : '#FDF2F8' }]}>
                <Ionicons name="library" size={18} color="#EC4899" />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.vocabularyLearned || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Words Saved</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: isDark ? 'rgba(245,158,11,0.2)' : '#FFFBEB' }]}>
                <Ionicons name="text" size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.grammarExercises || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Grammar Checks</Text>
            </View>
          </View>

          {/* Streak & Achievements Shortcuts */}
          <Card style={styles.shortcutCard}>
            <View style={styles.shortcutRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="flame" size={24} color="#F97316" />
                <View>
                  <Text style={[styles.shortcutTitle, { color: theme.textPrimary }]}>{progress.currentStreak || 0} Day Streak</Text>
                  <Text style={[styles.shortcutSub, { color: theme.textSecondary }]}>Longest streak: {progress.longestStreak || 0} days</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
                <Text style={styles.shortcutBtn}>Badges &gt;</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Custom Weekly Bar Chart */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Weekly Study Rhythm</Text>
          <Card style={styles.chartCard}>
            <Text style={[styles.chartSubtitle, { color: theme.textSecondary }]}>Daily Practice Minutes</Text>
            <View style={styles.barChartContainer}>
              {weeklyData.map((item, index) => {
                const barHeight = ((item.studyMinutes || 0) / maxMins) * 110; // scale to max 110px
                return (
                  <View key={index} style={styles.chartColumn}>
                    <View style={styles.barWrapper}>
                      <View style={[styles.bar, { height: Math.max(4, barHeight) }]} />
                    </View>
                    <Text style={[styles.chartDayText, { color: theme.textSecondary }]}>{item.day}</Text>
                    <Text style={[styles.chartMinText, { color: theme.textSecondary }]}>{item.studyMinutes || 0}m</Text>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Reports & Challenge Info */}
          <Card style={[styles.reportCard, { borderColor: theme.cardBorder }]}>
            <Ionicons name="analytics" size={24} color={COLORS.primary} />
            <Text style={[styles.reportTitle, { color: theme.textPrimary }]}>Monthly Overview Report</Text>
            <Text style={[styles.reportDesc, { color: theme.textSecondary }]}>
              You have completed {stats.completedLessons || 0} lessons and spent {stats.totalStudyHours || 0} study hours this period. Keep learning to boost your fluency score!
            </Text>
          </Card>
        </ScrollView>
      </StateView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  levelCard: {
    padding: 18,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.black,
  },
  levelSubText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  progressBarActive: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  shortcutCard: {
    padding: 14,
    marginBottom: 16,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.black,
  },
  shortcutSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  shortcutBtn: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  chartCard: {
    padding: 18,
    marginBottom: 16,
  },
  chartSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 14,
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
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  chartDayText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 6,
  },
  chartMinText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  reportCard: {
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.black,
    marginTop: 8,
  },
  reportDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginTop: 6,
    fontWeight: '600',
  },
});
