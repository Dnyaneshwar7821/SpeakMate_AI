import React, { useCallback, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Card, Screen, StateView } from '../../components/ui';
import { achievementService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';

export default function AchievementsScreen() {
  const { isDark, theme } = useTheme();
  const [state, setState] = useState({ loading: true, error: '', items: [] });

  const load = async () => {
    setState((curr) => ({ ...curr, loading: true, error: '' }));
    try {
      const items = await achievementService.all();
      setState({ loading: false, error: '', items });
    } catch (error) {
      setState({ loading: false, error: error.userMessage || 'Unable to load achievements.', items: [] });
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const maxTier = state.items.length > 0 ? Math.max(...state.items.map((i) => i.tier || 1)) : 1;
  const activeTierItems = state.items.filter((i) => (i.tier || 1) === maxTier);
  const pastTierItems = state.items.filter((i) => (i.tier || 1) < maxTier);

  const activeUnlockedCount = activeTierItems.filter((i) => i.unlocked).length;
  const activeTotalCount = activeTierItems.length;
  const totalUnlockedCount = state.items.filter((i) => i.unlocked).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? 'Recently'
      : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTierName = (t) => {
    if (t === 1) return 'Starter (Tier 1)';
    if (t === 2) return 'Intermediate (Tier 2)';
    if (t === 3) return 'Advanced (Tier 3)';
    return `Legendary (Tier ${t})`;
  };

  return (
    <Screen title="Achievements" subtitle="Rewards and learning milestones.">
      <StateView loading={state.loading} error={state.error} empty={!state.items.length ? 'No achievements found.' : null} onRetry={load}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Progress Header Card */}
          <Card style={[styles.progressHeaderCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <LinearGradient colors={['#FCD34D', '#F59E0B']} style={styles.headerIconCircle}>
                <Ionicons name="ribbon" size={32} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Medal Case: {getTierName(maxTier)}</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {activeUnlockedCount === activeTotalCount && activeTotalCount > 0
                    ? `Tier ${maxTier} Completed! Tier ${maxTier + 1} Unlocked!`
                    : `Unlocked ${activeUnlockedCount} of ${activeTotalCount} medals in Tier ${maxTier}`}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#6366F1', marginTop: 3 }}>
                  🏆 Total Medals Earned: {totalUnlockedCount}
                </Text>
              </View>
            </View>
            <View style={[styles.barBg, isDark && { backgroundColor: '#334155' }]}>
              <View style={[styles.barActive, { width: activeTotalCount ? `${(activeUnlockedCount / activeTotalCount) * 100}%` : '0%' }]} />
            </View>
          </Card>

          {/* Active Medal Case */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Active Medal Case (Tier {maxTier})</Text>
          {activeTierItems.map((item) => (
            <Card key={item.id} style={[
              styles.badgeCard, 
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
              !item.unlocked && { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', opacity: 0.85 }
            ]}>
              <View style={styles.badgeRow}>
                {item.unlocked ? (
                  <LinearGradient colors={['#FCD34D', '#F59E0B']} style={styles.badgeIconCircle}>
                    <Ionicons name="trophy" size={24} color="#FFFFFF" />
                  </LinearGradient>
                ) : (
                  <View style={[styles.lockedIconCircle, isDark && { backgroundColor: '#334155' }]}>
                    <Ionicons name="lock-closed" size={20} color={theme.textSecondary} />
                  </View>
                )}
                
                <View style={{ flex: 1 }}>
                  <Text style={[styles.badgeTitleText, { color: theme.textPrimary }, !item.unlocked && { color: theme.textSecondary }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.badgeDescText, { color: theme.textSecondary }]}>
                    {item.description}
                  </Text>
                  {item.unlocked && item.unlockedAt && (
                    <Text style={[styles.unlockDateText, { color: theme.textSecondary }]}>
                      Unlocked {formatDate(item.unlockedAt)}
                    </Text>
                  )}
                </View>

                <View style={styles.xpRewardColumn}>
                  <View style={[styles.xpPill, item.unlocked ? styles.xpPillUnlocked : [styles.xpPillLocked, isDark && { backgroundColor: '#334155' }]]}>
                    <Text style={[styles.xpPillText, item.unlocked ? styles.xpPillTextUnlocked : [styles.xpPillTextLocked, isDark && { color: theme.textSecondary }]]}>
                      +{item.xpReward || 50} XP
                    </Text>
                  </View>
                  {!item.unlocked && (
                    <Text style={[styles.lockedStatusText, { color: theme.textSecondary }]}>Locked</Text>
                  )}
                </View>
              </View>
            </Card>
          ))}

          {/* Past Completed Medal Cases */}
          {pastTierItems.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 16 }]}>Completed Medal Cases History</Text>
              {pastTierItems.map((item) => (
                <Card key={item.id} style={[
                  styles.badgeCard, 
                  { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, opacity: 0.9 }
                ]}>
                  <View style={styles.badgeRow}>
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.badgeIconCircle}>
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    </LinearGradient>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.badgeTitleText, { color: theme.textPrimary }]}>
                          {item.title}
                        </Text>
                        <View style={{ backgroundColor: '#E0E7FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#4338CA' }}>Tier {item.tier || 1}</Text>
                        </View>
                      </View>
                      <Text style={[styles.badgeDescText, { color: theme.textSecondary }]}>
                        {item.description}
                      </Text>
                      {item.unlockedAt && (
                        <Text style={[styles.unlockDateText, { color: theme.textSecondary }]}>
                          Unlocked {formatDate(item.unlockedAt)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.xpRewardColumn}>
                      <View style={[styles.xpPill, styles.xpPillUnlocked]}>
                        <Text style={[styles.xpPillText, styles.xpPillTextUnlocked]}>
                          +{item.xpReward || 50} XP
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}
        </ScrollView>
      </StateView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  progressHeaderCard: {
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
  },
  headerIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginTop: 14,
  },
  barActive: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  badgeCard: {
    padding: 16,
    marginBottom: 12,
    borderColor: '#F1F5F9',
  },
  lockedCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  badgeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitleText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.black,
  },
  lockedText: {
    color: '#64748B',
  },
  badgeDescText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 16,
  },
  unlockDateText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  xpRewardColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  xpPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpPillUnlocked: {
    backgroundColor: '#DCFCE7',
  },
  xpPillLocked: {
    backgroundColor: '#E2E8F0',
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  xpPillTextUnlocked: {
    color: '#15803D',
  },
  xpPillTextLocked: {
    color: '#64748B',
  },
  lockedStatusText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
