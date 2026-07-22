import React, { useCallback, useContext, useMemo, useState, useEffect } from 'react';
import {
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
  NotificationsCard,
} from '../../components/dashboard';
import { StateView } from '../../components/ui';
import { COLORS } from '../../constants/colors';

// Simple in-memory cache to make page transitions instant
let cachedDashboardData = null;
const DashboardCache = {
  get: () => cachedDashboardData,
  set: (data) => {
    cachedDashboardData = data;
  },
};

export default function DashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { openDrawer, setProfile, setProgress } = useDrawer();
  const { isDark } = useTheme();
  
  const [state, setState] = useState(() => ({
    loading: !DashboardCache.get(),
    refreshing: false,
    error: '',
    dashboard: DashboardCache.get(),
  }));

  const loadDashboard = useCallback(async (refreshing = false) => {
    setState((current) => ({
      ...current,
      loading: refreshing ? current.loading : !current.dashboard,
      refreshing,
      error: '',
    }));

    try {
      const dashboard = await dashboardService.summary();

      if (dashboard) {
        if (dashboard.profile) {
          setProfile(dashboard.profile);
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
  }, [setProfile, setProgress]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard(false);
    }, [loadDashboard])
  );

  const viewModel = useMemo(() => {
    if (!state.dashboard) {
      return {
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Learner',
        avatar: user?.avatar,
        level: 1,
        xp: 0,
        streak: 0,
        rank: null,
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

    return {
      name,
      avatar: profile.avatar || user?.avatar,
      level: Number(progress.level) || 1,
      xp: Number(progress.xp) || 0,
      streak: Number(progress.currentStreak) || 0,
      rank: d.rank,
      activeLesson: d.activeLessons?.[0] || null,
      upcomingLessons: d.upcomingLessons || [],
      dailyGoal: d.dailyGoal || {},
      weeklyProgress: d.weeklyProgress || [],
      recentActivity: d.recentActivity || [],
      statistics: d.statistics || {},
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
  }, [state.dashboard, user]);

  const handleLessonPress = useCallback((lesson) => {
    navigation.navigate('Lessons', { screen: 'LessonDetail', params: { lessonId: lesson?.id, lessonTitle: lesson?.title } });
  }, [navigation]);

  const handleNotificationsNav = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleContinueLearningPress = useCallback((item) => {
    if (!item) return;
    if (item.module === 'Speaking Session') {
      navigation.navigate('Speaking', {
        screen: 'Conversation',
        params: { sessionId: item.targetId, scenario: item.title }
      });
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
      navigation.navigate('AIChat', {
        screen: 'ConversationChat',
        params: { sessionId: item.targetId, title: item.title }
      });
    }
  }, [navigation]);

  const handleRecommendationPress = useCallback((rec) => {
    if (!rec) return;
    if (rec.type === 'lesson') {
      if (rec.targetId) {
        navigation.navigate('Lessons', { screen: 'LessonDetail', params: { lessonId: rec.targetId, lessonTitle: rec.title } });
      } else {
        navigation.navigate('Lessons');
      }
    } else if (rec.type === 'speaking') {
      navigation.navigate('Speaking');
    } else if (rec.type === 'vocabulary') {
      navigation.navigate('Vocabulary');
    } else if (rec.type === 'grammar') {
      navigation.navigate('Grammar');
    } else if (rec.type === 'chat') {
      navigation.navigate('AIChat');
    }
  }, [navigation]);

  const safeBg = isDark ? '#0F172A' : '#F8FAFC';

  if (state.loading) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: safeBg }]} edges={['top', 'left', 'right']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <DashboardSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (state.error && !state.dashboard) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: safeBg }]} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <StateView error={state.error} onRetry={() => loadDashboard(false)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: safeBg }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
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
          level={viewModel.level}
          xp={viewModel.xp}
          streak={viewModel.streak}
          rank={viewModel.rank}
          unreadCount={viewModel.unreadCount}
          onNotificationPress={handleNotificationsNav}
          onProfilePress={() => navigation.navigate('BottomTabs', { screen: 'Profile' })}
          isDark={isDark}
        />

        {!viewModel.hasAnyData && <EmptyDashboardState onRetry={() => loadDashboard(false)} />}

        {/* SECTION 2: TODAY'S GOAL */}
        <DailyGoalCard goal={viewModel.dailyGoal} onContinue={() => handleContinueLearningPress(viewModel.continueLearning)} isDark={isDark} />

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
        <LearningStreakCard streak={viewModel.streak} longestStreak={viewModel.statistics?.longestStreak || 0} isDark={isDark} />

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

        {/* SECTION 12: NOTIFICATIONS */}
        <NotificationsCard
          notifications={viewModel.notifications}
          onPress={handleNotificationsNav}
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

