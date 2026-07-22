import React, { useCallback, useState } from 'react';
import {
  Alert,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen, StateView } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { notificationService } from '../../services/appServices';
import { formatDate } from '../../utils/format';
import { COLORS } from '../../constants/colors';

export default function NotificationsScreen() {
  const { isDark } = useTheme();
  const { refreshUnread } = useNotifications();
  const [state, setState] = useState({ loading: true, error: '', items: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  const load = async (isRef = false) => {
    if (!isRef) {
      setState((curr) => ({ ...curr, loading: true, error: '' }));
    } else {
      setRefreshing(true);
    }
    try {
      const items = await notificationService.all();
      setState({ loading: false, error: '', items });
    } catch (error) {
      setState({ loading: false, error: error.userMessage || 'Unable to load notifications.', items: [] });
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Mark local state as read
      setState((curr) => ({
        ...curr,
        items: curr.items.map((i) => (i.id === id ? { ...i, isRead: true } : i)),
      }));
      refreshUnread();
    } catch (error) {
      Alert.alert('Notification failed', error.userMessage || 'Unable to mark as read.');
    }
  };

  const markAllAsRead = async () => {
    const unread = state.items.filter((i) => !i.isRead);
    if (!unread.length) return;
    try {
      await notificationService.markAllRead();
      setState((curr) => ({
        ...curr,
        items: curr.items.map((i) => ({ ...i, isRead: true })),
      }));
      refreshUnread();
    } catch (error) {
      Alert.alert('Error', 'Unable to mark all as read.');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.delete(id);
      setState((curr) => ({
        ...curr,
        items: curr.items.filter((i) => i.id !== id),
      }));
      refreshUnread();
    } catch (error) {
      Alert.alert('Error', 'Unable to delete notification.');
    }
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearAll();
              setState((curr) => ({ ...curr, items: [] }));
              refreshUnread();
            } catch {
              Alert.alert('Error', 'Unable to clear notifications.');
            }
          },
        },
      ]
    );
  };

  const getNotifIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('welcome')) return 'sparkles';
    if (t.includes('streak') || t.includes('flame')) return 'flame';
    if (t.includes('vocab') || t.includes('word')) return 'library';
    if (t.includes('lesson')) return 'book';
    if (t.includes('speak') || t.includes('session')) return 'mic';
    return 'notifications';
  };

  const getNotifColor = (title) => {
    const t = title.toLowerCase();
    if (t.includes('welcome')) return '#7C3AED';
    if (t.includes('streak')) return '#F97316';
    if (t.includes('vocab')) return '#EC4899';
    if (t.includes('lesson')) return COLORS.primary;
    if (t.includes('speak')) return '#0284C7';
    return COLORS.primary;
  };

  const unreadCount = state.items.filter((i) => !i.isRead).length;

  const filteredItems = filter === 'UNREAD'
    ? state.items.filter((i) => !i.isRead)
    : state.items;

  return (
    <Screen title="Notifications" subtitle="Reminders and system notifications.">
      <StateView loading={state.loading} error={state.error} empty={!state.items.length ? 'No notifications found.' : null} onRetry={() => load()}>
        
        {/* Header Ribbon */}
        {state.items.length > 0 && (
          <View style={[styles.headerRibbon, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                style={[styles.filterChip, filter === 'ALL' && styles.activeFilterChip]}
                onPress={() => setFilter('ALL')}
              >
                <Text style={[styles.filterChipText, filter === 'ALL' && styles.activeFilterText]}>All ({state.items.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filter === 'UNREAD' && styles.activeFilterChip]}
                onPress={() => setFilter('UNREAD')}
              >
                <Text style={[styles.filterChipText, filter === 'UNREAD' && styles.activeFilterText]}>Unread ({unreadCount})</Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 6 }}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.markAllBtn}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={clearAll}>
                <Text style={[styles.markAllBtn, { color: '#EF4444' }]}>Clear all</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {!filteredItems.length ? (
            <Text style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', fontStyle: 'italic', textAlign: 'center', marginVertical: 24 }}>
              {filter === 'UNREAD' ? 'No unread notifications.' : 'No notifications.'}
            </Text>
          ) : (
            filteredItems.map((item) => {
              const iconName = getNotifIcon(item.title);
              const iconColor = getNotifColor(item.title);

              return (
                <Card key={item.id} style={[styles.notifCard, !item.isRead && (isDark ? styles.unreadCardDark : styles.unreadCard)]}>
                  <View style={styles.notifRow}>
                    <View style={[styles.iconCircle, { backgroundColor: `${iconColor}18` }]}>
                      <Ionicons name={iconName} size={20} color={iconColor} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.notifTitleText, isDark && { color: '#F8FAFC' }, !item.isRead && styles.boldText]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.notifMessageText, isDark && { color: '#94A3B8' }]}>{item.message}</Text>
                      <Text style={styles.notifDateText}>{formatDate(item.createdAt)}</Text>
                    </View>

                    <View style={styles.actionColumn}>
                      {!item.isRead && (
                        <TouchableOpacity style={styles.readActionBtn} onPress={() => markRead(item.id)}>
                          <Ionicons name="checkmark-done" size={18} color="#16A34A" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={styles.deleteActionBtn} onPress={() => deleteNotification(item.id)}>
                        <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      </StateView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  badgeCount: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  unreadTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.black,
  },
  markAllBtn: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  notifCard: {
    padding: 16,
    marginBottom: 12,
    borderColor: '#F1F5F9',
  },
  unreadCard: {
    borderColor: `${COLORS.primary}20`,
    borderWidth: 1.5,
    backgroundColor: '#EEF2FF',
  },
  unreadCardDark: {
    borderColor: 'rgba(99, 102, 241, 0.35)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(79, 70, 229, 0.12)',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  boldText: {
    fontWeight: '900',
  },
  notifMessageText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '600',
  },
  notifDateText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
  },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 2,
  },
  readActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
