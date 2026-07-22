/**
 * SpeakingHistoryDetailScreen
 * Review full details of a past speaking practice session.
 * Displays all messages exchanged and the summary tutoring feedback.
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { speakingService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';

// ─── Sub-components ──────────────────────────────────────────────────────────

function HeaderBar({ title, onBack }) {
  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.header}>
      <SafeAreaView edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.headerSub}>Session Review</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SectionHeading({ title, icon, color }) {
  const { theme } = useTheme();
  return (
    <View style={styles.secHeader}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.secTitle, { color: theme.textPrimary }]}>{title}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SpeakingHistoryDetailScreen({ navigation, route }) {
  const { isDark, theme } = useTheme();
  const { sessionId } = route.params || {};

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Transcript'); // 'Transcript' or 'Feedback'

  useEffect(() => {
    if (!sessionId) return;
    loadDetail();
  }, [sessionId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await speakingService.detail(sessionId);
      setDetail(data);
    } catch {
      Alert.alert('Error', 'Could not load speaking session details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <HeaderBar title="Loading Session…" onBack={() => navigation.goBack()} />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  const fb = detail?.feedbackDetail;
  const messages = detail?.messages || [];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <HeaderBar title={detail?.scenario || 'Speaking Practice'} onBack={() => navigation.goBack()} />

      {/* Tabs Selector */}
      <View style={[styles.tabsRow, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Transcript' && styles.tabActive]}
          onPress={() => setActiveTab('Transcript')}
        >
          <Text style={[styles.tabText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'Transcript' && styles.tabTextActive]}>Transcript</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Feedback' && styles.tabActive]}
          onPress={() => setActiveTab('Feedback')}
        >
          <Text style={[styles.tabText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'Feedback' && styles.tabTextActive]}>Feedback Report</Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Transcript list */}
      {activeTab === 'Transcript' && (
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.chatList}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
                {!isUser && (
                  <View style={styles.aiAvatarIcon}>
                    <Ionicons name="sparkles" size={12} color="#FFF" />
                  </View>
                )}
                <View style={[
                  styles.bubble, 
                  isUser 
                    ? styles.userBubble 
                    : [styles.aiBubble, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]
                ]}>
                  <Text style={[styles.bubbleText, isUser ? styles.userText : { color: theme.textPrimary }]}>{item.message}</Text>
                  <Text style={[styles.bubbleTime, isUser ? { color: 'rgba(255,255,255,0.6)' } : { color: theme.textSecondary }]}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbox-ellipses-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No transcript message logged.</Text>
            </View>
          }
        />
      )}

      {/* Tab 2: Feedback report */}
      {activeTab === 'Feedback' && (
        <FlatList
          data={[1]}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={() => (
            <View style={{ gap: 12 }}>
              {/* Score grid */}
              <View style={styles.scoreGrid}>
                <View style={[styles.scoreCell, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                  <Text style={[styles.scoreVal, { color: theme.textPrimary }]}>{Math.round(detail?.overallScore || 0)}%</Text>
                  <Text style={[styles.scoreLbl, { color: theme.textSecondary }]}>Overall</Text>
                </View>
                <View style={[styles.scoreCell, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                  <Text style={[styles.scoreVal, { color: theme.textPrimary }]}>{Math.round(detail?.xpEarned || 0)}</Text>
                  <Text style={[styles.scoreLbl, { color: theme.textSecondary }]}>XP Earned</Text>
                </View>
                <View style={[styles.scoreCell, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                  <Text style={[styles.scoreVal, { color: theme.textPrimary }]}>{Math.round(detail?.duration ? detail.duration / 60 : 0)}m</Text>
                  <Text style={[styles.scoreLbl, { color: theme.textSecondary }]}>Minutes</Text>
                </View>
              </View>

              {/* Feedback cards */}
              <View style={[styles.fbCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                <SectionHeading title="Summary" icon="document-text-outline" color={COLORS.primary} />
                <Text style={[styles.fbBody, { color: theme.textSecondary }]}>{fb?.summary || detail?.feedback || "Completed speaking practice simulation."}</Text>
              </View>

              {fb?.vocabularySuggestions && (
                <View style={[styles.fbCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                  <SectionHeading title="Vocabulary Suggested" icon="bulb-outline" color="#CA8A04" />
                  <Text style={[styles.fbBody, { color: theme.textSecondary }]}>{fb.vocabularySuggestions}</Text>
                </View>
              )}

              {fb?.grammarCorrections && (
                <View style={[styles.fbCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                  <SectionHeading title="Grammar Corrections" icon="checkmark-circle-outline" color={COLORS.success} />
                  <Text style={[styles.fbBody, { color: theme.textSecondary }]}>{fb.grammarCorrections}</Text>
                </View>
              )}

              {fb?.betterSentences && (
                <View style={[styles.fbCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                  <SectionHeading title="Native Expressions" icon="trending-up-outline" color="#0EA5E9" />
                  <Text style={[styles.fbBody, { color: theme.textSecondary }]}>{fb.betterSentences}</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: { paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '500', marginTop: 1 },

  // Tabs
  tabsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: COLORS.primary },

  // Messages list
  chatList: { padding: 16 },
  bubbleWrapper: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  userWrapper: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  aiWrapper: { alignSelf: 'flex-start', justifyContent: 'flex-start', gap: 6 },
  aiAvatarIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EEF2FF' },
  bubbleText: { fontSize: 13, lineHeight: 18 },
  userText: { color: '#FFF', fontWeight: '500' },
  aiText: { color: COLORS.black },
  bubbleTime: { fontSize: 9, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },

  // Feedback Report
  scoreGrid: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  scoreCell: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  scoreVal: { fontSize: 18, fontWeight: '900', color: COLORS.black },
  scoreLbl: { fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 },

  fbCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  secHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  secTitle: { fontSize: 13, fontWeight: '800', color: COLORS.black },
  fbBody: { fontSize: 12, color: COLORS.text, lineHeight: 18 },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 13, color: '#94A3B8', marginTop: 12 },
});
