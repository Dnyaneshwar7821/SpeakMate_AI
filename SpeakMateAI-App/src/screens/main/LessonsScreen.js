/**
 * LessonsScreen — Phase 2
 * Full-featured lesson browser: categories, difficulty tabs, search,
 * continue-learning, recommended, lesson cards, filters.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { lessonModuleService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';

// ─── Constants ───────────────────────────────────────────────────────────────

const DIFFICULTY_TABS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const DIFF_COLORS = {
  Beginner: { bg: '#DCFCE7', text: '#16A34A' },
  Intermediate: { bg: '#FEF9C3', text: '#CA8A04' },
  Advanced: { bg: '#FEE2E2', text: '#DC2626' },
};

const CATEGORY_COLORS = [
  ['#4F46E5', '#7C3AED'],
  ['#0EA5E9', '#0284C7'],
  ['#10B981', '#059669'],
  ['#F59E0B', '#D97706'],
  ['#EF4444', '#DC2626'],
  ['#8B5CF6', '#7C3AED'],
  ['#06B6D4', '#0891B2'],
  ['#F97316', '#EA580C'],
  ['#EC4899', '#DB2777'],
  ['#84CC16', '#65A30D'],
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonBox({ width, height, style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{ width, height, borderRadius: 8, backgroundColor: '#E2E8F0', opacity }, style]}
    />
  );
}

function LessonSkeleton() {
  const { theme } = useTheme();
  return (
    <View style={[styles.cardOuter, { backgroundColor: theme.cardBg }]}>
      <SkeletonBox width="100%" height={120} style={{ borderRadius: 16, marginBottom: 12 }} />
      <SkeletonBox width="70%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonBox width="50%" height={10} />
    </View>
  );
}

function DifficultyBadge({ level }) {
  if (!level) return null;
  const c = DIFF_COLORS[level] || { bg: '#F1F5F9', text: '#64748B' };
  return (
    <View style={[styles.diffBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.diffBadgeText, { color: c.text }]}>{level}</Text>
    </View>
  );
}

function ProgressRing({ percent = 0, size = 44 }) {
  const { isDark } = useTheme();
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (percent / 100) * circ;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 4,
          borderColor: isDark ? '#334155' : '#E2E8F0',
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 4,
          borderColor: percent > 0 ? COLORS.primary : 'transparent',
          position: 'absolute',
          borderRightColor: 'transparent',
          borderBottomColor: percent < 50 ? 'transparent' : COLORS.primary,
          transform: [{ rotate: `${(percent / 100) * 360 - 90}deg` }],
        }}
      />
      <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.primary }}>{percent}%</Text>
    </View>
  );
}

function CategoryCard({ item, index, onPress }) {
  const [start, end] = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  const scale = useRef(new Animated.Value(1)).current;
  const pIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const pOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={pIn} onPressOut={pOut}>
        <LinearGradient colors={[start, end]} style={styles.catCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.catIconCircle}>
            <Ionicons name={item.icon} size={22} color="#FFF" />
          </View>
          <Text style={styles.catName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.catLessons}>{item.lessonCount} lessons</Text>
          {item.completedCount > 0 && (
            <View style={styles.catProgress}>
              <View
                style={[
                  styles.catProgressFill,
                  { width: `${Math.round((item.completedCount / item.lessonCount) * 100)}%` },
                ]}
              />
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function LessonCard({ lesson, onPress }) {
  const { isDark, theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const pIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const pOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const prog = lesson.progressPercent || 0;
  const isCompleted = lesson.completed;
  const isLocked = lesson.locked;

  const btnLabel = isLocked ? 'Locked' : isCompleted ? 'Review' : prog > 0 ? 'Resume' : 'Start';
  const btnColor = isLocked ? '#9CA3AF' : isCompleted ? COLORS.success : COLORS.primary;

  return (
    <Animated.View style={[styles.cardOuter, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }, { transform: [{ scale }] }]}>
      <Pressable onPress={isLocked ? undefined : onPress} onPressIn={pIn} onPressOut={pOut}>
        {/* Gradient header band */}
        <LinearGradient
          colors={isLocked ? ['#94A3B8', '#64748B'] : ['#4F46E5', '#7C3AED']}
          style={styles.cardBand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={28} color="rgba(255,255,255,0.9)" />
            </View>
          )}
          <View style={styles.cardBandRow}>
            <View style={styles.catChip}>
              <Text style={styles.catChipText}>{lesson.category}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              )}
              <View style={styles.xpChip}>
                <Ionicons name="star" size={12} color="#FCD34D" />
                <Text style={styles.xpChipText}>{lesson.xpReward || 0} XP</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Card body */}
        <View style={styles.cardBody}>
          <View style={styles.cardBodyTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={2}>{lesson.title}</Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>{lesson.description}</Text>
            </View>
            {prog > 0 && <ProgressRing percent={prog} />}
          </View>

          <View style={styles.cardMeta}>
            <DifficultyBadge level={lesson.level} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>{lesson.estimatedMinutes || lesson.duration || '—'} min</Text>
            </View>
            {isLocked && lesson.requiredXP > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="lock-closed-outline" size={13} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{lesson.requiredXP} XP needed</Text>
              </View>
            )}
          </View>

          {prog > 0 && !isCompleted && (
            <View style={[styles.progressBarBg, isDark && { backgroundColor: '#334155' }]}>
              <View style={[styles.progressBarFill, { width: `${prog}%` }]} />
            </View>
          )}

          <TouchableOpacity
            style={[styles.cardBtn, { backgroundColor: btnColor, opacity: isLocked ? 0.6 : 1 }]}
            onPress={isLocked ? undefined : onPress}
            activeOpacity={0.8}
          >
            {isLocked && <Ionicons name="lock-closed" size={14} color="#FFF" style={{ marginRight: 4 }} />}
            <Text style={styles.cardBtnText}>{btnLabel}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function ContinueLearningCard({ lesson, onPress }) {
  return (
    <TouchableOpacity style={styles.continueCard} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.continueGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.continueLeft}>
          <Text style={styles.continueLabel}>Continue Learning</Text>
          <Text style={styles.continueTitle} numberOfLines={1}>{lesson.title}</Text>
          <Text style={styles.continueCat}>{lesson.category} · {lesson.level}</Text>
          <View style={styles.continueMeta}>
            <Ionicons name="star" size={13} color="#FCD34D" />
            <Text style={styles.continueXP}>{lesson.xpReward || 0} XP</Text>
            <Text style={styles.continueDot}>·</Text>
            <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.continueTime}>{lesson.estimatedMinutes || lesson.duration || '—'} min</Text>
          </View>
          <View style={styles.continueProg}>
            <View style={[styles.continueProgFill, { width: `${lesson.progressPercent || 0}%` }]} />
          </View>
          <Text style={styles.continueProgText}>{lesson.progressPercent || 0}% complete</Text>
        </View>
        <View style={styles.continueRight}>
          <View style={styles.continuePlayBtn}>
            <Ionicons name="play" size={22} color={COLORS.primary} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, onSeeAll }) {
  const { theme } = useTheme();
  return (
    <View style={styles.secHeader}>
      <Text style={[styles.secTitle, { color: theme.textPrimary }]}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EmptyState({ icon = 'search-outline', title, message }) {
  const { theme } = useTheme();
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={48} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{title}</Text>
      {message && <Text style={[styles.emptyMsg, { color: theme.textSecondary }]}>{message}</Text>}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function LessonsScreen({ navigation }) {
  const { isDark, theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [continueItems, setContinueItems] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('All'); // difficulty tab
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');

  const searchTimer = useRef(null);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-20)).current;

  // ── Load data ──────────────────────────────────────────────────────
  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [cats, recs, cont] = await Promise.all([
        lessonModuleService.categories(),
        lessonModuleService.recommended(),
        lessonModuleService.continueLearning(),
      ]);
      setCategories(cats || []);
      setRecommended(recs || []);
      setContinueItems(cont || []);

      // Load lessons based on current filter
      await applyFilter(selectedCategory, activeTab, silent);
    } catch (e) {
      setError('Unable to load lessons. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, activeTab]);

  const applyFilter = useCallback(async (category, difficulty, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (difficulty && difficulty !== 'All') params.difficulty = difficulty;
      const data = await lessonModuleService.list(params);
      setLessons(data || []);
    } catch {
      // keep existing lessons
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, [])
  );

  // ── Search with debounce ───────────────────────────────────────────
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults(null);
      return;
    }
    clearTimeout(searchTimer.current);
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await lessonModuleService.search(
          searchText.trim(),
          selectedCategory !== 'All' ? selectedCategory : undefined,
          activeTab !== 'All' ? activeTab : undefined
        );
        setSearchResults(results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchText, selectedCategory, activeTab]);

  // ── Filter by tab/category ─────────────────────────────────────────
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchResults(null);
    setSearchText('');
    applyFilter(selectedCategory, tab);
  }, [selectedCategory, applyFilter]);

  const handleCategoryPress = useCallback((catName) => {
    const next = selectedCategory === catName ? null : catName;
    setSelectedCategory(next);
    setSearchResults(null);
    setSearchText('');
    applyFilter(next, activeTab);
  }, [selectedCategory, activeTab, applyFilter]);

  // ── Navigate to detail ─────────────────────────────────────────────
  const openLesson = useCallback((lesson) => {
    navigation.navigate('LessonDetail', { lessonId: lesson.id, lessonTitle: lesson.title });
  }, [navigation]);

  // ── Displayed lessons ──────────────────────────────────────────────
  const displayedLessons = searchResults !== null ? searchResults : lessons;

  // ── Render header (static part used in ListHeaderComponent) ───────
  const ListHeader = useMemo(() => (
    <View>
      {/* ── Hero gradient header ── */}
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#312E81']}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.heroDeco1} />
        <View style={styles.heroDeco2} />
        <SafeAreaView edges={['top']}>
          <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }}>
            <View style={styles.heroRow}>
              <View>
                <Text style={styles.heroHi}>Welcome back 👋</Text>
                <Text style={styles.heroTitle}>Continue your learning</Text>
              </View>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search lessons, categories, topics…"
                placeholderTextColor="#94A3B8"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
              {(searching) && <ActivityIndicator size="small" color={COLORS.primary} />}
              {searchText.length > 0 && !searching && (
                <TouchableOpacity onPress={() => { setSearchText(''); setSearchResults(null); }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Difficulty tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsRow, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {DIFFICULTY_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabChange(tab)}
            style={[styles.tab, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Continue Learning ── */}
      {continueItems.length > 0 && searchResults === null && (
        <View style={styles.section}>
          <SectionHeader title="📚 Continue Learning" />
          {continueItems.map((lesson) => (
            <ContinueLearningCard key={lesson.id} lesson={lesson} onPress={() => openLesson(lesson)} />
          ))}
        </View>
      )}

      {/* ── Categories ── */}
      {searchResults === null && (
        <View style={styles.section}>
          <SectionHeader title="📂 Categories" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          >
            {categories.map((cat, i) => (
              <View key={cat.name} style={{ marginRight: 12 }}>
                <CategoryCard
                  item={cat}
                  index={i}
                  onPress={() => handleCategoryPress(cat.name)}
                />
                {selectedCategory === cat.name && (
                  <View style={styles.catSelected} />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Recommended ── */}
      {searchResults === null && recommended.length > 0 && (
        <View style={[styles.section, { paddingBottom: 0 }]}>
          <SectionHeader title="⭐ Recommended" />
        </View>
      )}

      {/* ── Search / filter heading ── */}
      {(searchResults !== null || selectedCategory || activeTab !== 'All') && (
        <View style={styles.section}>
          <SectionHeader
            title={
              searchResults !== null
                ? `Results for "${searchText}" (${displayedLessons.length})`
                : selectedCategory
                  ? `${selectedCategory} · ${activeTab}`
                  : `${activeTab} Lessons`
            }
          />
        </View>
      )}

      {/* ── Regular lessons heading ── */}
      {searchResults === null && !selectedCategory && activeTab === 'All' && (
        <View style={[styles.section, { paddingBottom: 0 }]}>
          <SectionHeader title="🎓 All Lessons" />
        </View>
      )}
    </View>
  ), [categories, continueItems, recommended, searchResults, searchText, selectedCategory, activeTab, searching, headerOpacity, headerTranslate, isDark, theme]);

  // ── Main render ────────────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <LinearGradient colors={['#0F172A', '#1E1B4B', '#312E81']} style={[styles.hero, { paddingBottom: 60 }]}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroRow}>
              <Text style={styles.heroTitle}>Lessons</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={{ padding: 16 }}>
          {[1, 2, 3].map((k) => <LessonSkeleton key={k} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <FlatList
        data={displayedLessons}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <LessonCard lesson={item} onPress={() => openLesson(item)} />
          </View>
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !loading && (
            <View style={{ paddingHorizontal: 16 }}>
              <EmptyState
                icon={searchResults !== null ? 'search-outline' : 'book-outline'}
                title={error || (searchResults !== null ? 'No lessons found' : 'No lessons yet')}
                message={error ? 'Pull down to retry' : searchResults !== null ? 'Try different keywords' : undefined}
              />
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadAll(true); }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Hero
  hero: { paddingBottom: 24, overflow: 'hidden' },
  heroDeco1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', top: -100, right: -80,
  },
  heroDeco2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', top: 40, left: -60,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12 },
  heroHi: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },
  heroTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  heroIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 16, marginTop: 14, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '400' },

  // Difficulty tabs
  tabsRow: { paddingVertical: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFF' },

  // Sections
  section: { paddingHorizontal: 16, paddingTop: 20 },
  secHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  secTitle: { fontSize: 17, fontWeight: '800', color: COLORS.black },
  seeAll: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // Category cards
  catCard: {
    width: 130, padding: 14, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 5,
  },
  catIconCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  catName: { color: '#FFF', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  catLessons: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '500' },
  catProgress: { height: 3, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, marginTop: 8 },
  catProgressFill: { height: 3, backgroundColor: '#FFF', borderRadius: 2 },
  catSelected: { height: 3, backgroundColor: COLORS.primary, borderRadius: 2, marginTop: 6 },

  // Lesson cards
  cardOuter: {
    borderRadius: 20, overflow: 'hidden', backgroundColor: '#FFF',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  cardBand: { padding: 14, paddingTop: 16, minHeight: 80 },
  lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  completedBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  cardBandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  catChipText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  xpChipText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  cardBody: { padding: 14 },
  cardBodyTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.black, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: COLORS.text, lineHeight: 17 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: COLORS.text, fontWeight: '500' },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  diffBadgeText: { fontSize: 11, fontWeight: '700' },
  progressBarBg: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 10 },
  progressBarFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  cardBtn: { borderRadius: 10, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  cardBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Continue Learning
  continueCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 10, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 5 },
  continueGradient: { flexDirection: 'row', padding: 18, alignItems: 'center' },
  continueLeft: { flex: 1 },
  continueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  continueTitle: { color: '#FFF', fontSize: 17, fontWeight: '900', marginBottom: 2 },
  continueCat: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500', marginBottom: 8 },
  continueMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  continueXP: { color: '#FCD34D', fontSize: 12, fontWeight: '700' },
  continueDot: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  continueTime: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
  continueProg: { height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, marginBottom: 4 },
  continueProgFill: { height: 4, backgroundColor: '#FFF', borderRadius: 2 },
  continueProgText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '500' },
  continueRight: { marginLeft: 14 },
  continuePlayBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#94A3B8', marginTop: 14, textAlign: 'center' },
  emptyMsg: { fontSize: 13, color: '#CBD5E1', marginTop: 6, textAlign: 'center' },
});
