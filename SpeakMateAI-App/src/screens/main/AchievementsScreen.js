import React, { useCallback, useState, useMemo } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Card, Screen, StateView } from '../../components/ui';
import { achievementService, dashboardService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// Comprehensive Master Achievement Definitions
const MASTER_ACHIEVEMENTS = [
  // --- Speaking & Fluency ---
  {
    id: "spk_1",
    category: "SPEAKING",
    icon: "mic",
    tier: 1,
    tierName: "Bronze",
    title: "First Voice Conversation",
    description: "Complete your very 1st AI speaking practice session.",
    target: 1,
    metricKey: "speakingSessions",
    xpReward: 50,
  },
  {
    id: "spk_2",
    category: "SPEAKING",
    icon: "chatbubbles",
    tier: 2,
    tierName: "Silver",
    title: "Confident Conversationalist",
    description: "Complete 5 distinct AI speaking conversations.",
    target: 5,
    metricKey: "speakingSessions",
    xpReward: 120,
  },
  {
    id: "spk_3",
    category: "SPEAKING",
    icon: "flash",
    tier: 3,
    tierName: "Gold",
    title: "Fluency Champion",
    description: "Complete 15 speaking sessions across various scenarios.",
    target: 15,
    metricKey: "speakingSessions",
    xpReward: 250,
  },
  {
    id: "spk_4",
    category: "SPEAKING",
    icon: "trophy",
    tier: 4,
    tierName: "Diamond",
    title: "Orator Supreme",
    description: "Complete 30 speaking sessions with high conversational stamina.",
    target: 30,
    metricKey: "speakingSessions",
    xpReward: 500,
  },

  // --- Grammar & Accuracy ---
  {
    id: "grm_1",
    category: "GRAMMAR",
    icon: "text",
    tier: 1,
    tierName: "Bronze",
    title: "Grammar Inspector",
    description: "Perform your first instant sentence grammar analysis.",
    target: 1,
    metricKey: "grammarExercises",
    xpReward: 40,
  },
  {
    id: "grm_2",
    category: "GRAMMAR",
    icon: "school",
    tier: 2,
    tierName: "Silver",
    title: "Syntax Detective",
    description: "Complete 10 sentence grammar checks and error corrections.",
    target: 10,
    metricKey: "grammarExercises",
    xpReward: 100,
  },
  {
    id: "grm_3",
    category: "GRAMMAR",
    icon: "ribbon",
    tier: 3,
    tierName: "Gold",
    title: "Tense Master",
    description: "Analyze 25 sentences and explore handbook rules.",
    target: 25,
    metricKey: "grammarExercises",
    xpReward: 200,
  },
  {
    id: "grm_4",
    category: "GRAMMAR",
    icon: "medal",
    tier: 4,
    tierName: "Diamond",
    title: "Grammar Scholar",
    description: "Complete 50 comprehensive grammar checks.",
    target: 50,
    metricKey: "grammarExercises",
    xpReward: 450,
  },

  // --- Vocabulary & Word Bank ---
  {
    id: "voc_1",
    category: "VOCABULARY",
    icon: "library",
    tier: 1,
    tierName: "Bronze",
    title: "Word Collector",
    description: "Save and master 5 vocabulary words in your word bank.",
    target: 5,
    metricKey: "vocabularyLearned",
    xpReward: 50,
  },
  {
    id: "voc_2",
    category: "VOCABULARY",
    icon: "bookmarks",
    tier: 2,
    tierName: "Silver",
    title: "Lexicon Expander",
    description: "Master 20 vocabulary flashcards and collocations.",
    target: 20,
    metricKey: "vocabularyLearned",
    xpReward: 120,
  },
  {
    id: "voc_3",
    category: "VOCABULARY",
    icon: "book",
    tier: 3,
    tierName: "Gold",
    title: "Vocabulary Maestro",
    description: "Build an active lexicon of 50 mastered words.",
    target: 50,
    metricKey: "vocabularyLearned",
    xpReward: 300,
  },

  // --- Streaks & Consistency ---
  {
    id: "stk_1",
    category: "STREAKS",
    icon: "flame",
    tier: 1,
    tierName: "Bronze",
    title: "3-Day Habit Starter",
    description: "Maintain a consecutive 3-day learning streak.",
    target: 3,
    metricKey: "streak",
    xpReward: 60,
  },
  {
    id: "stk_2",
    category: "STREAKS",
    icon: "shield-checkmark",
    tier: 2,
    tierName: "Silver",
    title: "7-Day Week Warrior",
    description: "Complete daily practice for 7 days in a row.",
    target: 7,
    metricKey: "streak",
    xpReward: 150,
  },
  {
    id: "stk_3",
    category: "STREAKS",
    icon: "sparkles",
    tier: 3,
    tierName: "Gold",
    title: "14-Day Dedication",
    description: "Maintain an unbroken 14-day study streak.",
    target: 14,
    metricKey: "streak",
    xpReward: 300,
  },
  {
    id: "stk_4",
    category: "STREAKS",
    icon: "planet",
    tier: 4,
    tierName: "Diamond",
    title: "30-Day Legend",
    description: "Achieve a monumental 30-day streak of daily English growth.",
    target: 30,
    metricKey: "streak",
    xpReward: 600,
  },

  // --- Mastery & Experience ---
  {
    id: "mst_1",
    category: "MASTERY",
    icon: "star",
    tier: 1,
    tierName: "Bronze",
    title: "XP Explorer",
    description: "Earn a total of 250 XP across all learning activities.",
    target: 250,
    metricKey: "xp",
    xpReward: 75,
  },
  {
    id: "mst_2",
    category: "MASTERY",
    icon: "diamond",
    tier: 2,
    tierName: "Silver",
    title: "Level 5 Achiever",
    description: "Earn 500 XP and reach Level 5 Learner status.",
    target: 500,
    metricKey: "xp",
    xpReward: 200,
  },
  {
    id: "mst_3",
    category: "MASTERY",
    icon: "crown",
    tier: 4,
    tierName: "Diamond",
    title: "Mastery Grandmaster",
    description: "Accumulate 2,000 XP to establish true English mastery.",
    target: 2000,
    metricKey: "xp",
    xpReward: 1000,
  },
];

const CATEGORIES = [
  { id: "ALL", name: "All Medals", icon: "🏆" },
  { id: "SPEAKING", name: "Speaking", icon: "🎙️" },
  { id: "GRAMMAR", name: "Grammar", icon: "📚" },
  { id: "VOCABULARY", name: "Vocab", icon: "💡" },
  { id: "STREAKS", name: "Streaks", icon: "⚡" },
  { id: "MASTERY", name: "Mastery", icon: "👑" },
];

export default function AchievementsScreen() {
  const { isDark, theme } = useTheme();
  const [state, setState] = useState({ loading: true, error: '', dashboard: null });
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'UNLOCKED' | 'LOCKED'
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    setState((curr) => ({ ...curr, loading: true, error: '' }));
    try {
      const [backendAchievements, dashboard] = await Promise.all([
        achievementService.all().catch(() => []),
        dashboardService.summary().catch(() => null),
      ]);
      setState({ loading: false, error: '', dashboard, backendAchievements });
    } catch (error) {
      setState({ loading: false, error: error.userMessage || 'Unable to load achievements.', dashboard: null });
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const stats = state.dashboard?.statistics || {};
  const progress = state.dashboard?.progress || {};

  // Resolve dynamic live metrics
  const liveMetrics = {
    speakingSessions: stats.speakingSessions || 0,
    grammarExercises: stats.grammarExercises || 0,
    vocabularyLearned: stats.vocabularyLearned || 0,
    streak: Math.max(progress.currentStreak || 0, progress.longestStreak || 0),
    xp: progress.xp || 0,
  };

  // Merge master achievements with live progress and unlock status
  const enrichedAchievements = useMemo(() => {
    return MASTER_ACHIEVEMENTS.map((ach) => {
      const currentVal = liveMetrics[ach.metricKey] || 0;
      const unlocked = currentVal >= ach.target;
      const progressPercent = Math.min(100, Math.max(0, (currentVal / ach.target) * 100));

      return {
        ...ach,
        currentVal,
        unlocked,
        progressPercent,
      };
    });
  }, [liveMetrics]);

  // Filtered achievements
  const filteredItems = useMemo(() => {
    return enrichedAchievements.filter((item) => {
      // Category match
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Status match
      if (selectedFilter === 'UNLOCKED' && !item.unlocked) return false;
      if (selectedFilter === 'LOCKED' && item.unlocked) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [enrichedAchievements, selectedCategory, selectedFilter, searchQuery]);

  const totalEarnedXp = enrichedAchievements
    .filter((i) => i.unlocked)
    .reduce((acc, curr) => acc + curr.xpReward, 0);

  const totalUnlockedCount = enrichedAchievements.filter((i) => i.unlocked).length;
  const totalCount = enrichedAchievements.length;
  const showcasePercentage = Math.round((totalUnlockedCount / totalCount) * 100);

  const getTierColors = (tier) => {
    if (tier === 1) return ['#92400E', '#B45309']; // Bronze
    if (tier === 2) return ['#64748B', '#94A3B8']; // Silver
    if (tier === 3) return ['#F59E0B', '#FCD34D']; // Gold
    return ['#6366F1', '#A855F7']; // Diamond
  };

  return (
    <Screen title="Medal Showcase" subtitle="Unlock milestones, claim rewards, and build your trophy room.">
      <StateView loading={state.loading} error={state.error} onRetry={load}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Header Showcase Banner */}
          <LinearGradient
            colors={['#0F172A', '#1E1B4B', '#312E81']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerTop}>
              <View style={{ flex: 1 }}>
                <View style={styles.trophyPill}>
                  <Text style={styles.trophyPillText}>🏆 Hall of Fame</Text>
                </View>
                <Text style={styles.headerTitle}>Medals & Achievements</Text>
                <Text style={styles.headerSub}>
                  {totalUnlockedCount} of {totalCount} Medals Unlocked ({showcasePercentage}%)
                </Text>
              </View>

              <View style={styles.xpRewardBox}>
                <Text style={styles.xpRewardVal}>+{totalEarnedXp}</Text>
                <Text style={styles.xpRewardLbl}>XP Claimed</Text>
              </View>
            </View>

            <View style={styles.barBg}>
              <LinearGradient
                colors={['#F59E0B', '#FCD34D', '#FEF08A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: `${showcasePercentage}%` }]}
              />
            </View>
          </LinearGradient>

          {/* Search Bar */}
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                color: theme.textPrimary,
                borderColor: theme.cardBorder,
              },
            ]}
            placeholder="🔍 Search medals or objectives..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Category Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    active ? styles.catChipActive : { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                    {cat.icon} {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Status Filter Tabs */}
          <View style={[styles.statusToggle, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            {[
              { id: 'ALL', label: `All (${enrichedAchievements.length})` },
              { id: 'UNLOCKED', label: `Unlocked (${totalUnlockedCount})` },
              { id: 'LOCKED', label: `In Progress (${totalCount - totalUnlockedCount})` },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.statusBtn, selectedFilter === f.id && styles.statusBtnActive]}
                onPress={() => setSelectedFilter(f.id)}
              >
                <Text style={[styles.statusBtnText, selectedFilter === f.id && styles.statusBtnTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Achievement Cards List */}
          {filteredItems.length === 0 ? (
            <Card style={[styles.emptyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🏅</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No achievements match this filter.</Text>
            </Card>
          ) : (
            filteredItems.map((item) => {
              const tierColors = getTierColors(item.tier);
              return (
                <Card
                  key={item.id}
                  style={[
                    styles.badgeCard,
                    { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
                    !item.unlocked && { opacity: 0.85, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
                    item.unlocked && { borderColor: '#F59E0B', borderWidth: 1.5 },
                  ]}
                >
                  <View style={styles.badgeRow}>
                    {item.unlocked ? (
                      <LinearGradient colors={tierColors} style={styles.iconCircle}>
                        <Ionicons name="trophy" size={24} color="#FFFFFF" />
                      </LinearGradient>
                    ) : (
                      <View style={[styles.lockedCircle, isDark && { backgroundColor: '#334155' }]}>
                        <Ionicons name="lock-closed" size={20} color={theme.textSecondary} />
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Text style={[styles.badgeTitle, { color: theme.textPrimary }]}>
                          {item.title}
                        </Text>
                        <View style={[styles.tierTag, { backgroundColor: `${tierColors[0]}20` }]}>
                          <Text style={[styles.tierTagText, { color: tierColors[0] }]}>{item.tierName}</Text>
                        </View>
                      </View>

                      <Text style={[styles.badgeDesc, { color: theme.textSecondary }]}>
                        {item.description}
                      </Text>

                      {/* Progress Bar for In-Progress Medals */}
                      {!item.unlocked && (
                        <View style={styles.itemProgressContainer}>
                          <View style={styles.itemProgressBarBg}>
                            <View style={[styles.itemProgressBarFill, { width: `${item.progressPercent}%` }]} />
                          </View>
                          <Text style={[styles.itemProgressText, { color: theme.textSecondary }]}>
                            {item.currentVal} / {item.target} ({item.progressPercent.toFixed(0)}%)
                          </Text>
                        </View>
                      )}

                      {item.unlocked && (
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981', marginTop: 4 }}>
                          ✅ Unlocked & Completed
                        </Text>
                      )}
                    </View>

                    <View style={styles.rewardCol}>
                      <View style={[styles.xpPill, item.unlocked ? styles.xpPillUnlocked : styles.xpPillLocked]}>
                        <Text style={[styles.xpPillText, item.unlocked ? styles.xpPillTextUnlocked : styles.xpPillTextLocked]}>
                          +{item.xpReward} XP
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })
          )}

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
  headerCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 14,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  trophyPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  trophyPillText: {
    color: '#FDE047',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  headerSub: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  xpRewardBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  xpRewardVal: {
    color: '#FDE047',
    fontSize: 18,
    fontWeight: '900',
  },
  xpRewardLbl: {
    color: '#E0E7FF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  searchInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  catScroll: {
    marginBottom: 10,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  statusToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 9,
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: COLORS.primary,
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  badgeCard: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  tierTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  tierTagText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  badgeDesc: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  itemProgressContainer: {
    marginTop: 6,
  },
  itemProgressBarBg: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 3,
  },
  itemProgressBarFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  itemProgressText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rewardCol: {
    alignItems: 'flex-end',
  },
  xpPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpPillUnlocked: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  xpPillLocked: {
    backgroundColor: '#F1F5F9',
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: '900',
  },
  xpPillTextUnlocked: {
    color: '#92400E',
  },
  xpPillTextLocked: {
    color: '#94A3B8',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 18,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
