import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { assignmentService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';
import { useToast } from '../../context/ToastContext';

export default function AssignmentsScreen({ navigation }) {
  const { isDark, theme } = useTheme();
  const { showToast } = useToast();
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'SUBMITTED'

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assignmentService.myAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.warn('Failed to load assignments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const filteredAssignments = assignments.filter((item) => {
    if (filter === 'PENDING') return item.status === 'PENDING';
    if (filter === 'SUBMITTED') return item.status === 'SUBMITTED';
    return true;
  });

  const handleStartAssignment = (item) => {
    if (item.type === 'Speaking Session') {
      navigation.navigate('BottomTabs', {
        screen: 'Speaking',
        params: {
          screen: 'ConversationScreen',
          params: { scenarioId: item.targetId, assignmentId: item.id },
        },
      });
    } else if (item.type === 'Lesson') {
      navigation.navigate('Lessons', {
        screen: 'LessonDetail',
        params: { lessonId: item.targetId, assignmentId: item.id },
      });
    } else if (item.type === 'Vocabulary Quiz') {
      navigation.navigate('Vocabulary');
    } else {
      showToast(`Starting ${item.title}`, 'info');
    }
  };

  const renderItem = ({ item }) => {
    const isSubmitted = item.status === 'SUBMITTED';

    return (
      <View
        style={[
          styles.assignmentCard,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          },
        ]}
      >
        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isSubmitted ? '#DCFCE7' : '#FEF3C7' },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: isSubmitted ? '#166534' : '#92400E' },
              ]}
            >
              {isSubmitted ? 'SUBMITTED ✅' : `DUE: ${item.dueDate}`}
            </Text>
          </View>
          <Text style={styles.teacherText}>
            {item.teacherName} • {item.className}
          </Text>
        </View>

        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
          {item.description}
        </Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricChip}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={[styles.metricText, { color: theme.text }]}>
              Target: {item.targetMinutes} Mins
            </Text>
          </View>
          <View style={styles.metricChip}>
            <Ionicons name="ribbon-outline" size={14} color="#F59E0B" />
            <Text style={[styles.metricText, { color: theme.text }]}>
              Min Score: {item.minimumScore}%
            </Text>
          </View>
        </View>

        {!isSubmitted ? (
          <TouchableOpacity
            onPress={() => handleStartAssignment(item)}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>Start Homework ➔</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.submittedBanner}>
            <Ionicons name="checkmark-circle-sharp" size={16} color="#15803D" />
            <Text style={styles.submittedBannerText}>
              Submitted to Teacher • {item.score}% Score Achieved 🎉
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ── Top Gradient Header ── */}
      <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My School Homework 📝</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSub}>
          Complete assignments set by your teacher to level up your class score!
        </Text>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {['ALL', 'PENDING', 'SUBMITTED'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterPill,
                filter === f && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === f && styles.filterPillTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadAssignments();
            }}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkbox-outline" size={48} color="#94A3B8" />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Assignments Found</Text>
              <Text style={styles.emptySub}>You have completed all school homework assignments!</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterPillTextActive: {
    color: '#1E1B4B',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  assignmentCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  teacherText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  metricText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  submittedBannerText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});
