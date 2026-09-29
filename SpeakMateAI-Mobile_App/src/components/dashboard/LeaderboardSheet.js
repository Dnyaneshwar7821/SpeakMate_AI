import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { progressService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';

const { height } = Dimensions.get('window');

export function LeaderboardSheet({ visible, onClose, currentUser, isDark = false }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    progressService
      .leaderboard(10)
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setLeaderboard(data);
          } else {
            setLeaderboard([
              {
                rank: 1,
                userId: currentUser?.id || 1,
                name: currentUser?.firstName || currentUser?.name || 'You',
                avatar: currentUser?.avatar || '🎓',
                xp: currentUser?.xp || 0,
                streak: currentUser?.streak || 0,
                rankTier: currentUser?.rank || 'Bronze III',
                isCurrentUser: true,
              },
            ]);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Failed to load mobile leaderboard:', err);
          setError('Unable to load leaderboard. Showing local standing.');
          setLeaderboard([
            {
              rank: 1,
              userId: currentUser?.id || 1,
              name: currentUser?.firstName || currentUser?.name || 'You',
              avatar: currentUser?.avatar || '🎓',
              xp: currentUser?.xp || 0,
              streak: currentUser?.streak || 0,
              rankTier: currentUser?.rank || 'Bronze III',
              isCurrentUser: true,
            },
          ]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [visible, currentUser]);

  if (!visible) return null;

  const getRankBadge = (rank) => {
    if (rank === 1) return <Text style={styles.medalEmoji}>🥇</Text>;
    if (rank === 2) return <Text style={styles.medalEmoji}>🥈</Text>;
    if (rank === 3) return <Text style={styles.medalEmoji}>🥉</Text>;
    return (
      <View style={[styles.numBadge, isDark && { backgroundColor: '#334155' }]}>
        <Text style={[styles.numBadgeText, isDark && { color: '#94A3B8' }]}>#{rank}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.sheetContainer, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
          {/* Header */}
          <View style={[styles.sheetHeader, isDark && { borderBottomColor: '#1E293B' }]}>
            <View style={styles.headerLeft}>
              <View style={styles.trophyCircle}>
                <Text style={{ fontSize: 22 }}>🏆</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.title, isDark && { color: '#F1F5F9' }]}>Learner Leaderboard</Text>
                  <View style={styles.topBadge}>
                    <Text style={styles.topBadgeText}>TOP 10</Text>
                  </View>
                </View>
                <Text style={[styles.subtitle, isDark && { color: '#94A3B8' }]}>
                  Ranked by XP and continuous practice streak
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, isDark && { backgroundColor: '#1E293B' }]}>
              <Ionicons name="close" size={20} color={isDark ? '#F1F5F9' : '#0F172A'} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.loadingText, isDark && { color: '#94A3B8' }]}>Loading rankings...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {!loading && leaderboard.map((item) => {
              const isUser = item.isCurrentUser || item.userId === currentUser?.id;
              const rank = item.rank || 1;

              return (
                <View
                  key={item.userId || rank}
                  style={[
                    styles.rankRow,
                    isDark && { backgroundColor: '#1E293B', borderColor: '#334155' },
                    isUser && styles.userHighlightRow,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    {getRankBadge(rank)}

                    <LinearGradient
                      colors={['#6366F1', '#8B5CF6']}
                      style={styles.avatarCircle}
                    >
                      <Text style={styles.avatarText}>
                        {item.avatar && item.avatar.length <= 2
                          ? item.avatar
                          : (item.name || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>

                    <View style={styles.nameBlock}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[styles.userName, isDark && { color: '#F1F5F9' }, isUser && { color: COLORS.primary }]}
                          numberOfLines={1}
                        >
                          {item.name || 'Learner'}
                        </Text>
                        {isUser && (
                          <View style={styles.youBadge}>
                            <Text style={styles.youBadgeText}>YOU</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.tierText, isDark && { color: '#94A3B8' }]}>
                        {item.rankTier || 'Bronze Speaker'} • {item.streak || 0}d streak 🔥
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rowRight}>
                    <Text style={styles.xpText}>{item.xp || 0} XP</Text>
                    <Text style={[styles.scoreLabel, isDark && { color: '#64748B' }]}>⭐ Score</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, isDark && { borderTopColor: '#1E293B', backgroundColor: '#0F172A' }]}>
            <Text style={[styles.footerText, isDark && { color: '#94A3B8' }]}>
              💡 Practice speaking lessons daily to climb the leaderboard!
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.78,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  trophyCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  topBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  topBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    marginBottom: 10,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  userHighlightRow: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: '#EEF2FF',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  medalEmoji: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  numBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nameBlock: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  youBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tierText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F59E0B',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 1,
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
});

export default LeaderboardSheet;
