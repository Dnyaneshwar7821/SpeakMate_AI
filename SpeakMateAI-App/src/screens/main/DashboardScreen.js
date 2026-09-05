import React, { useCallback, useContext, useMemo, useState, useEffect } from 'react';
import {
  Alert,
  AppState,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { useDrawer } from '../../context/DrawerContext';
import {
  chatService,
  dashboardService,
  grammarService,
  lessonService,
  notificationService,
  onboardingService,
  profileService,
  progressService,
  speakingService,
  vocabularyService,
  assignmentService,
  announcementService,
} from '../../services/appServices';
import {
  ContinueLearningCard,
  DailyGoalCard,
  DashboardHeader,
  DashboardSkeleton,
  EmptyDashboardState,
  QuickStatistics,
  QuoteCard,
  RecentActivityTimeline,
  UpcomingLessons,
  WeeklyProgressChart,
  QuickActionsCard,
  LearningStreakCard,
  DailyMotivationCard,
  UpcomingRecommendations,
  AchievementsCard,
  AssignmentsCard,
  SchoolAnnouncementsCard,
} from '../../components/dashboard';
import { StateView } from '../../components/ui';
import { COLORS } from '../../constants/colors';

// Simple in-memory cache to make page transitions instant
let cachedDashboardData = null;
export const DashboardCache = {
  get: () => cachedDashboardData,
  set: (data) => {
    cachedDashboardData = data;
  },
  clear: () => {
    cachedDashboardData = null;
  },
};

import { useToast } from '../../context/ToastContext';

export default function DashboardScreen({ navigation }) {
  const { user, updateUser } = useContext(AuthContext);
  const { openDrawer, setProfile, setProgress } = useDrawer();
  const { isDark } = useTheme();
  const { showToast, triggerConfetti } = useToast();

  const isStudentUser = Boolean(
    user?.accountType === 'STUDENT' ||
    user?.role === 'STUDENT' ||
    user?.schoolId ||
    user?.schoolCode
  );
  
  const [state, setState] = useState(() => ({
    loading: !DashboardCache.get(),
    refreshing: false,
    error: '',
    dashboard: DashboardCache.get(),
  }));

  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const loadDashboard = useCallback(async (refreshing = false) => {
    setState((current) => ({
      ...current,
      loading: refreshing ? current.loading : !current.dashboard,
      refreshing,
      error: '',
    }));

    try {

      const [dashboard, myAssignments, schoolAnnouncements] = await Promise.all([
        dashboardService.summary(),
        isStudentUser ? assignmentService.myAssignments().catch(() => []) : Promise.resolve([]),
        isStudentUser ? announcementService.list().catch(() => []) : Promise.resolve([]),
      ]);

      setAssignments(isStudentUser ? (myAssignments || []) : []);
      setAnnouncements(isStudentUser ? (schoolAnnouncements || []) : []);

      if (dashboard) {
        if (dashboard.profile) {
          setProfile(dashboard.profile);
          if (updateUser) {
            updateUser({
              ...(dashboard.profile.avatar ? { avatar: dashboard.profile.avatar } : {}),
              ...(dashboard.profile.firstName ? { firstName: dashboard.profile.firstName } : {}),
              ...(dashboard.profile.lastName ? { lastName: dashboard.profile.lastName } : {}),
              ...(dashboard.profile.ageGroup ? { ageGroup: dashboard.profile.ageGroup } : {}),
              ...(dashboard.profile.englishLevel ? { englishLevel: dashboard.profile.englishLevel } : {}),
              ...(dashboard.profile.schoolGrade ? { schoolGrade: dashboard.profile.schoolGrade } : {}),
              ...(dashboard.progress?.xp !== undefined ? { xp: dashboard.progress.xp } : {}),
              ...(dashboard.progress?.currentStreak !== undefined ? { streak: dashboard.progress.currentStreak } : {}),
            });
          }
        }
        if (dashboard.progress) {
          setProgress(dashboard.progress);
        }
        // Save to cache
        DashboardCache.set(dashboard);
      }

      setState({
        loading: false,
        refreshing: false,
        error: '',
        dashboard,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        refreshing: false,
        error: error.userMessage || 'Unable to load dashboard. Check your connection and try again.',
      }));
    }
  }, [setProfile, setProgress, isStudentUser, updateUser]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard(false);
    }, [loadDashboard])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadDashboard(false);
      }
    });
    return () => {
      sub.remove();
    };
  }, [loadDashboard]);

  const viewModel = useMemo(() => {
    if (!state.dashboard) {
      return {
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Learner',
        avatar: user?.avatar,
        isStudent: isStudentUser,
        schoolGrade: isStudentUser ? (user?.schoolGrade || '1st Std') : null,
        ageGroup: isStudentUser ? null : (user?.ageGroup || 'Professional'),
        englishLevel: isStudentUser ? null : (user?.englishLevel || 'Beginner'),
        level: 1,
        xp: Number(user?.xp) || 0,
        streak: Number(user?.streak) || 0,
        rank: user?.rank || null,
        activeLesson: null,
        upcomingLessons: [],
        dailyGoal: {
          title: "Today Practice Goal",
          lessonsCompletedToday: 0,
          speakingMinutesToday: 0,
          vocabularyCompleted: 0,
          vocabularyTarget: 5,
          percentage: 0,
          remainingLessons: 1,
        },
        weeklyProgress: [],
        recentActivity: [],
        statistics: {
          totalLessons: 0,
          completedLessons: 0,
          speakingSessions: 0,
          vocabularyLearned: 0,
          grammarExercises: 0,
          totalStudyHours: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageScore: 0,
        },
        quote: null,
        continueLearning: null,
        wordOfTheDay: null,
        englishTip: '',
        recommendations: [],
        achievements: [],
        notifications: [],
        unreadCount: 0,
        hasAnyData: false,
      };
    }

    const d = state.dashboard;
    const profile = d.profile || {};
    const progress = d.progress || {};
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const name = fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Learner';

    const effectiveGrade = isStudentUser ? (profile.schoolGrade || user?.schoolGrade || '1st Std') : null;
    const effectiveAge = isStudentUser ? null : (profile.ageGroup || user?.ageGroup || 'Professional');
    const effectiveLevel = isStudentUser ? null : (profile.englishLevel || user?.englishLevel || 'Beginner');

    return {
      name,
      avatar: profile.avatar || user?.avatar,
      isStudent: isStudentUser,
      schoolGrade: effectiveGrade,
      ageGroup: effectiveAge,
      englishLevel: effectiveLevel,
      level: Number(progress.level) || 1,
      xp: Number(progress.xp) || 0,
      streak: Number(progress.currentStreak ?? progress.streak ?? d.streak ?? user?.streak ?? 0),
      rank: d.rank,
      activeLesson: d.activeLessons?.[0] || null,
      upcomingLessons: d.upcomingLessons || [],
      dailyGoal: d.dailyGoal || {},
      weeklyProgress: d.weeklyProgress || [],
      recentActivity: d.recentActivity || [],
      statistics: {
        ...(d.statistics || {}),
        currentStreak: Number(d.statistics?.currentStreak ?? progress.currentStreak ?? progress.streak ?? 0),
        longestStreak: Number(d.statistics?.longestStreak ?? progress.longestStreak ?? 0),
      },
      quote: d.quote,
      continueLearning: d.continueLearning,
      wordOfTheDay: d.wordOfTheDay,
      englishTip: d.englishTip,
      recommendations: d.recommendations || [],
      achievements: d.achievements || [],
      notifications: d.notifications || [],
      unreadCount: Number(d.unreadNotificationsCount) || 0,
      hasAnyData: Boolean(d.progress || d.profile),
    };
  }, [state.dashboard, user, isStudentUser]);

  const handleLessonPress = useCallback((lesson) => {
    navigation.navigate('Lessons', { screen: 'LessonDetail', params: { lessonId: lesson?.id, lessonTitle: lesson?.title } });
  }, [navigation]);

  const handleNotificationsNav = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleContinueLearningPress = useCallback((item) => {
    if (!item) {
      navigation.navigate('Lessons');
      return;
    }
    if (item.module === 'Speaking Session') {
      navigation.navigate('BottomTabs', { screen: 'Speaking' });
    } else if (item.module === 'Lesson') {
      navigation.navigate('Lessons', {
        screen: 'LessonDetail',
        params: { lessonId: item.targetId, lessonTitle: item.title }
      });
    } else if (item.module === 'Vocabulary Quiz') {
      navigation.navigate('Vocabulary');
    } else if (item.module === 'Grammar Exercise') {
      navigation.navigate('Grammar');
    } else if (item.module === 'AI Chat') {
      navigation.navigate('BottomTabs', {
        screen: 'AIChat',
        params: {
          screen: 'ConversationChat',
          params: { sessionId: item.targetId, title: item.title }
        }
      });
    } else {
      navigation.navigate('Lessons');
    }
  }, [navigation]);

  const [purchasedFreezes, setPurchasedFreezes] = useState(0);

  // Load persisted streak freezes from local storage
  useEffect(() => {
    const loadFreezes = async () => {
      try {
        const freezeKey = `@speakmate_streak_freezes_${user?.id || 'default'}`;
        const stored = await AsyncStorage.getItem(freezeKey);
        if (stored !== null) {
          setPurchasedFreezes(Number(stored) || 0);
        }
      } catch {
        // ignore
      }
    };
    loadFreezes();
  }, [user?.id]);

  const handleBuyFreeze = useCallback(async () => {
    const currentXp = viewModel.xp;
    if (currentXp >= 100) {
      const nextFreezes = purchasedFreezes + 1;
      setPurchasedFreezes(nextFreezes);
      try {
        const freezeKey = `@speakmate_streak_freezes_${user?.id || 'default'}`;
        await AsyncStorage.setItem(freezeKey, String(nextFreezes));
        if (updateUser) {
          updateUser({ ...user, xp: Math.max(0, currentXp - 100) });
        }
      } catch {
        // ignore
      }
      triggerConfetti();
      showToast('Streak Freeze Purchased! ❄️', 'warning', '1 Streak Freeze added to your reserve (-100 XP)');
    } else {
      showToast('Earn More XP ❄️', 'info', 'You need at least 100 XP to buy a Streak Freeze');
    }
  }, [viewModel.xp, purchasedFreezes, user, updateUser, showToast, triggerConfetti]);

  const handleRecommendationPress = useCallback((rec) => {
    if (!rec) return;
    if (rec.type === 'lesson') {
      if (rec.targetId) {
        navigation.navigate('Lessons', { screen: 'LessonDetail', params: { lessonId: rec.targetId, lessonTitle: rec.title } });
      } else {
        navigation.navigate('Lessons');
      }
    } else if (rec.type === 'speaking') {
      navigation.navigate('BottomTabs', { screen: 'Speaking' });
    } else if (rec.type === 'vocabulary') {
      navigation.navigate('Vocabulary');
    } else if (rec.type === 'grammar') {
      navigation.navigate('Grammar');
    } else if (rec.type === 'chat') {
      navigation.navigate('BottomTabs', { screen: 'AIChat' });
    } else {
      navigation.navigate('Lessons');
    }
  }, [navigation]);

  const handleOpenMenu = useCallback(() => {
    try {
      if (navigation?.openDrawer) {
        navigation.openDrawer();
      } else if (navigation?.getParent) {
        navigation.getParent()?.openDrawer?.();
      } else {
        openDrawer();
      }
    } catch {
      openDrawer();
    }
  }, [navigation, openDrawer]);

  const topSafeBg = '#0F172A';
  const contentBg = isDark ? '#0F172A' : '#F8FAFC';

  if (state.loading) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: topSafeBg }]} edges={['top', 'left', 'right']}>
        <ScrollView style={[styles.scroll, { backgroundColor: contentBg }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <DashboardSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (state.error && !state.dashboard) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: topSafeBg }]} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <StateView error={state.error} onRetry={() => loadDashboard(false)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: topSafeBg }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: contentBg }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={() => loadDashboard(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* SECTION 1: PERSONALIZED HEADER */}
        <DashboardHeader
          name={viewModel.name}
          avatar={viewModel.avatar}
          isStudent={viewModel.isStudent}
          isPro={!isStudentUser && Boolean(user?.isPro || user?.pro)}
          schoolGrade={viewModel.schoolGrade}
          ageGroup={viewModel.ageGroup}
          englishLevel={viewModel.englishLevel}
          level={viewModel.level}
          xp={viewModel.xp}
          streak={viewModel.streak}
          rank={viewModel.rank}
          unreadCount={viewModel.unreadCount}
          onMenuPress={handleOpenMenu}
          onNotificationPress={handleNotificationsNav}
          onProfilePress={() => navigation.navigate('BottomTabs', { screen: 'Profile' })}
          isDark={isDark}
        />

        {!viewModel.hasAnyData && <EmptyDashboardState onRetry={() => loadDashboard(false)} />}

        {/* SECTION 2: TODAY'S GOAL */}
        <DailyGoalCard goal={viewModel.dailyGoal} onContinue={() => handleContinueLearningPress(viewModel.continueLearning)} isDark={isDark} />

        {/* SECTION 2.5: SCHOOL ANNOUNCEMENTS & ASSIGNMENTS (STUDENTS ONLY) */}
        {isStudentUser && (
          <>
            <SchoolAnnouncementsCard announcements={announcements} />
            <AssignmentsCard
              assignments={assignments}
              onStartAssignment={(item) => {
                if (item.type === 'Speaking Session') {
                  navigation.navigate('BottomTabs', {
                    screen: 'Speaking',
                    params: {
                      screen: 'Conversation',
                      params: { scenarioId: item.targetId, assignmentId: item.id },
                    },
                  });
                } else if (item.type === 'Lesson') {
                  navigation.navigate('Lessons', { screen: 'LessonDetail', params: { lessonId: item.targetId } });
                } else {
                  navigation.navigate('Assignments');
                }
              }}
              onViewAll={() => navigation.navigate('Assignments')}
            />
          </>
        )}

        {/* SECTION 3: CONTINUE LEARNING */}
        {viewModel.continueLearning && (
          <ContinueLearningCard item={viewModel.continueLearning} onResume={handleContinueLearningPress} isDark={isDark} />
        )}

        {/* SECTION 4: QUICK ACTIONS */}
        <QuickActionsCard navigation={navigation} isDark={isDark} />

        {/* SECTION 5: LEARNING STATISTICS */}
        <QuickStatistics stats={viewModel.statistics} isDark={isDark} />

        {/* SECTION 6: WEEKLY ACTIVITY */}
        <WeeklyProgressChart data={viewModel.weeklyProgress} isDark={isDark} />

        {/* SECTION 7: LEARNING STREAK */}
        <LearningStreakCard
          streak={viewModel.streak}
          longestStreak={viewModel.statistics?.longestStreak || 0}
          streakFreezes={1 + purchasedFreezes}
          xp={viewModel.xp}
          onBuyFreeze={handleBuyFreeze}
          isDark={isDark}
        />

        {/* SECTION 8: RECENT ACTIVITY */}
        <RecentActivityTimeline items={viewModel.recentActivity} isDark={isDark} />

        {/* SECTION 9: DAILY MOTIVATION */}
        <DailyMotivationCard
          quote={viewModel.quote}
          tip={viewModel.englishTip}
          word={viewModel.wordOfTheDay}
          isDark={isDark}
        />

        {/* SECTION 10: UPCOMING RECOMMENDATIONS */}
        <UpcomingRecommendations
          recommendations={viewModel.recommendations}
          onPress={handleRecommendationPress}
          isDark={isDark}
        />

        {/* SECTION 11: ACHIEVEMENTS */}
        <AchievementsCard
          achievements={viewModel.achievements}
          onViewAll={() => navigation.navigate('Achievements')}
          isDark={isDark}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

