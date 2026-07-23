import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    AsyncStorage.getItem('speakmate_dark_mode').then((val) => {
      setIsDark(val === 'true');
    });
  }, [isFocused]);

  return {
    isDark,
    cardBg: isDark ? '#1E293B' : '#FFFFFF',
    cardBorder: isDark ? '#334155' : '#F1F5F9',
    textPrimary: isDark ? '#F1F5F9' : '#111827',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    divider: isDark ? '#334155' : '#F1F5F9',
    bgPill: isDark ? '#334155' : '#F1F5F9',
  };
};

const { width } = Dimensions.get('window');
const CARD_RADIUS = 20;
const HORIZONTAL_CARD_WIDTH = Math.min(280, width * 0.76);
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Practice is the quiet bridge between wanting and becoming.', author: 'SpeakMateAI' },
  { text: 'Small steps every day become confident conversations.', author: 'SpeakMateAI' },
  { text: 'Learning never exhausts the mind when it has purpose.', author: 'Leonardo da Vinci' },
  { text: 'One more sentence today is one more door tomorrow.', author: 'SpeakMateAI' },
  { text: 'Confidence grows when effort becomes a habit.', author: 'SpeakMateAI' },
  { text: 'Start where you are. Speak what you can. Improve what comes next.', author: 'SpeakMateAI' },
];

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));

const initials = (name) => {
  const parts = `${name || 'Speak Mate'}`.trim().split(/\s+/);
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const formatNumber = (value) => `${Math.round(Number(value) || 0)}`;

const formatDuration = (minutes) => `${Math.max(0, Number(minutes) || 0)} min`;

const timeAgo = (dateValue) => {
  if (!dateValue) return 'Recently';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

function AnimatedCounter({ value, style, suffix = '' }) {
  const animated = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const id = animated.addListener(({ value: current }) => setDisplayValue(Math.round(current)));
    Animated.timing(animated, {
      toValue: Number(value) || 0,
      duration: 650,
      useNativeDriver: false,
    }).start();
    return () => animated.removeListener(id);
  }, [animated, value]);

  return <Text style={style}>{displayValue}{suffix}</Text>;
}

export const ProgressBar = memo(function ProgressBar({ progress, color = COLORS.primary, height = 10 }) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const safeProgress = clamp(progress);

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: safeProgress,
      tension: 36,
      friction: 9,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, safeProgress]);

  return (
    <View style={[styles.progressTrack, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            height,
            borderRadius: height / 2,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
});

function Avatar({ name, uri, size = 56 }) {
  const radius = Math.round(size / 2);
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius }} />;
  }
  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={[styles.avatarFallback, { width: size, height: size, borderRadius: radius }]}>
      <Text style={styles.avatarFallbackText}>{initials(name)}</Text>
    </LinearGradient>
  );
}

export const DashboardHeader = memo(function DashboardHeader({
  name,
  avatar,
  ageGroup,
  level,
  xp,
  streak,
  rank,
  unreadCount,
  onNotificationPress,
  onProfilePress,
  onMenuPress,
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const bellScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, tension: 45, friction: 9, useNativeDriver: true }).start();
  }, [entrance]);

  useEffect(() => {
    if (unreadCount > 0) {
      Animated.sequence([
        Animated.timing(bellScale, { toValue: 1.12, duration: 160, useNativeDriver: true }),
        Animated.spring(bellScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [bellScale, unreadCount]);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }}
    >
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#312E81']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.headerToolbar}>
          <View style={styles.brandPill}>
            <Ionicons name="sparkles" size={14} color="#818CF8" />
            <Text style={styles.brandPillText}>SpeakMate AI</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: bellScale }] }}>
            <TouchableOpacity style={styles.iconButtonLight} onPress={onNotificationPress} activeOpacity={0.85}>
              <Ionicons name="notifications-outline" size={21} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.notificationDot}>
                  <Text style={styles.notificationDotText}>{Math.min(unreadCount, 9)}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.heroContent}>
          <TouchableOpacity onPress={onProfilePress} activeOpacity={0.85} style={{ position: 'relative' }}>
            <Avatar name={name} uri={avatar} size={66} />
            <View style={styles.onlineStatusDot} />
          </TouchableOpacity>
          <View style={styles.heroText}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.heroName} numberOfLines={1}>{name || 'Learner'}</Text>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroChip}>
                <Ionicons name="trophy" size={12} color="#818CF8" />
                <Text style={styles.heroChipText}>Level {level || 1}</Text>
              </View>
              <View style={styles.heroChip}>
                <Ionicons name="flash" size={12} color="#FCD34D" />
                <Text style={styles.heroChipText}>{formatNumber(xp)} XP</Text>
              </View>
              <View style={styles.heroChip}>
                <Ionicons name="flame" size={12} color="#F97316" />
                <Text style={styles.heroChipText}>{formatNumber(streak)}d streak</Text>
              </View>
              {ageGroup && (
                <View style={[styles.heroChip, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
                  <Text style={[styles.heroChipText, { color: '#FCD34D', fontWeight: '700' }]}>
                    {ageGroup === 'Kids' ? '🎈 Kids' : ageGroup === 'Teens' ? '⚡ Teen' : ageGroup === 'Young Adult' ? '🎓 Young Adult' : ageGroup === 'Senior' ? '☕ Senior' : '💼 Professional'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {!!rank && (
          <View style={styles.rankBadge}>
            <Ionicons name="ribbon" size={16} color="#FDE68A" />
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
});

export const DailyGoalCard = memo(function DailyGoalCard({ goal, onContinue }) {
  const celebration = useRef(new Animated.Value(0)).current;
  const pct = clamp(goal.percentage);
  const completed = pct >= 100;
  const theme = useTheme();

  useEffect(() => {
    if (completed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(celebration, { toValue: 1, duration: 650, useNativeDriver: true }),
          Animated.timing(celebration, { toValue: 0, duration: 650, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start();
    }
  }, [celebration, completed]);

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Daily Goal</Text>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{goal.title || 'Today Practice Goal'}</Text>
        </View>
        <View style={[styles.percentPill, completed && styles.completedPill, theme.isDark && { backgroundColor: '#334155' }]}>
          <Animated.View style={completed ? { transform: [{ scale: celebration.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] } : null}>
            <Ionicons name={completed ? 'medal' : 'flag'} size={16} color={completed ? '#92400E' : COLORS.primary} />
          </Animated.View>
          <Text style={[styles.percentText, { color: COLORS.primary }, completed && styles.completedText]}>{Math.round(pct)}%</Text>
        </View>
      </View>

      <ProgressBar progress={pct} color={completed ? COLORS.warning : COLORS.success} height={12} />

      <View style={styles.goalGrid}>
        <GoalMetric icon="checkmark-done" label="Lessons Today" value={goal.lessonsCompletedToday} />
        <GoalMetric icon="mic" label="Speaking Min" value={goal.speakingMinutesToday} />
        <GoalMetric icon="library" label="Vocabulary" value={`${goal.vocabularyCompleted}/${goal.vocabularyTarget}`} />
      </View>

      <View style={styles.goalFooter}>
        <Text style={[styles.goalFooterText, { color: theme.textSecondary }]}>
          {completed ? 'Goal completed. Keep the streak alive.' : `${Math.max(0, goal.remainingLessons || 0)} lessons remaining today.`}
        </Text>
        {completed && <View style={styles.celebrationBadge}><Text style={styles.celebrationText}>Completed</Text></View>}
      </View>

      {!completed && onContinue && (
        <TouchableOpacity style={styles.primaryButton} onPress={onContinue} activeOpacity={0.9}>
          <Text style={styles.primaryButtonText}>Continue Learning</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
});

function GoalMetric({ icon, label, value }) {
  const theme = useTheme();
  return (
    <View style={[styles.goalMetric, theme.isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={[styles.goalMetricValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.goalMetricLabel, { color: theme.textSecondary }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export const ContinueLearningCard = memo(function ContinueLearningCard({ item, onResume }) {
  const theme = useTheme();
  if (!item) {
    return null;
  }

  const getModuleIcon = (mod) => {
    switch (mod) {
      case 'Speaking Session': return 'mic';
      case 'Lesson': return 'book';
      case 'Vocabulary Quiz': return 'library';
      case 'Grammar Exercise': return 'text';
      case 'AI Chat': return 'sparkles';
      default: return 'arrow-forward-circle';
    }
  };

  const getModuleColor = (mod) => {
    switch (mod) {
      case 'Speaking Session': return '#0284C7';
      case 'Lesson': return COLORS.primary;
      case 'Vocabulary Quiz': return '#7C3AED';
      case 'Grammar Exercise': return '#DB2777';
      case 'AI Chat': return '#F59E0B';
      default: return COLORS.primary;
    }
  };

  const iconName = getModuleIcon(item.module);
  const accentColor = getModuleColor(item.module);

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Continue Learning</Text>
      
      <View style={styles.continueLayout}>
        <LinearGradient colors={[accentColor, `${accentColor}D0`]} style={[styles.lessonImageFallback, { width: 72, height: 72, borderRadius: 16 }]}>
          <Ionicons name={iconName} size={30} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.continueInfo}>
          <Text style={[styles.lessonTitle, { color: theme.textPrimary }]} numberOfLines={2}>{item.title}</Text>
          <View style={styles.pillRow}>
            <SmallPill label={item.module} />
            <SmallPill label={`${item.estimatedMinutesRemaining} min remaining`} />
          </View>
          <ProgressBar progress={item.progressPercent || 0} color={accentColor} height={8} />
          <Text style={[styles.progressHint, { color: theme.textSecondary }]}>{Math.round(clamp(item.progressPercent || 0))}% complete</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.primaryButton, { backgroundColor: accentColor }]} onPress={() => onResume(item)} activeOpacity={0.9}>
        <Text style={styles.primaryButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
});

export const UpcomingLessons = memo(function UpcomingLessons({ lessons, onStart }) {
  if (!lessons.length) {
    return <EmptyCard title="Upcoming Lessons" icon="calendar-outline" message="Recommended lessons will appear here once the backend provides them." />;
  }

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionEyebrow}>Upcoming Lessons</Text>
      <FlatList
        data={lessons}
        horizontal
        keyExtractor={(item, index) => `${item.id || item.title || 'lesson'}-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => <UpcomingLessonCard lesson={item} onStart={onStart} />}
      />
    </View>
  );
});

const UpcomingLessonCard = memo(function UpcomingLessonCard({ lesson, onStart }) {
  return (
    <View style={styles.upcomingCard}>
      <LessonImage lesson={lesson} size={70} />
      <Text style={styles.upcomingTitle} numberOfLines={2}>{lesson.title}</Text>
      <View style={styles.pillRow}>
        <SmallPill label={lesson.category || 'General'} />
        <SmallPill label={lesson.difficulty || lesson.level || 'Beginner'} />
      </View>
      <View style={styles.lessonMetaRow}>
        <Text style={styles.lessonMeta}>{formatDuration(lesson.duration)}</Text>
        <Text style={styles.xpReward}>+{lesson.xpReward || 20} XP</Text>
      </View>
      <TouchableOpacity style={styles.startButton} onPress={() => onStart(lesson)} activeOpacity={0.9}>
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
});

function LessonImage({ lesson, size }) {
  const uri = lesson.image || lesson.imageUrl || lesson.thumbnail;
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: 16 }} />;
  }
  return (
    <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={[styles.lessonImageFallback, { width: size, height: size }]}>
      <Ionicons name="book" size={Math.round(size * 0.42)} color={COLORS.primary} />
    </LinearGradient>
  );
}

export const WeeklyProgressChart = memo(function WeeklyProgressChart({ data }) {
  const maxValue = Math.max(30, ...data.map((item) => (item.studyMinutes || 0) + (item.lessonsCompleted || 0) * 12 + (item.speakingSessions || 0) * 10));
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Weekly Progress</Text>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Study Rhythm</Text>
        </View>
        <Ionicons name="stats-chart" size={22} color={COLORS.primary} />
      </View>
      <View style={styles.chartLegend}>
        <LegendDot color={COLORS.primary} label="Minutes" />
        <LegendDot color={COLORS.success} label="Lessons" />
        <LegendDot color={COLORS.warning} label="Speaking" />
      </View>
      <View style={styles.chart}>
        {data.map((item, index) => (
          <ChartColumn key={item.day || index} item={item} maxValue={maxValue} />
        ))}
      </View>
    </View>
  );
});

function ChartColumn({ item, maxValue }) {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const total = (item.studyMinutes || 0) + (item.lessonsCompleted || 0) * 12 + (item.speakingSessions || 0) * 10;
  const target = Math.max(8, Math.round((total / maxValue) * 110));
  const theme = useTheme();

  useEffect(() => {
    Animated.spring(heightAnim, { toValue: target, tension: 35, friction: 8, useNativeDriver: false }).start();
  }, [heightAnim, target]);

  return (
    <View style={styles.chartColumn}>
      <View style={[styles.chartBarTrack, theme.isDark && { backgroundColor: '#334155' }]}>
        <Animated.View style={[styles.chartBar, { height: heightAnim }]} />
      </View>
      <Text style={[styles.chartDay, { color: theme.textSecondary }]}>{item.day}</Text>
      <Text style={[styles.chartValue, { color: theme.textPrimary }]}>{item.studyMinutes || 0}m</Text>
    </View>
  );
}

function LegendDot({ color, label }) {
  const theme = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

export const RecentActivityTimeline = memo(function RecentActivityTimeline({ items }) {
  const theme = useTheme();
  if (!items.length) {
    return <EmptyCard title="Recent Activity" icon="time-outline" message="Your completed lessons, vocabulary practice, speaking sessions, grammar checks, and AI conversations will appear here." />;
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Recent Activity</Text>
      {items.slice(0, 6).map((item, index) => (
        <View key={`${item.type}-${item.id || index}`} style={styles.timelineItem}>
          <View style={styles.timelineIconWrap}>
            <Ionicons name={item.icon} size={18} color={COLORS.primary} />
            {index < Math.min(items.length, 6) - 1 && <View style={[styles.timelineLine, theme.isDark && { backgroundColor: '#334155' }]} />}
          </View>
          <View style={styles.timelineContent}>
            <Text style={[styles.timelineTitle, { color: theme.textPrimary }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.timelineTime, { color: theme.textSecondary }]}>{timeAgo(item.time)}</Text>
          </View>
          <Text style={styles.timelineXp}>+{item.xp || 0} XP</Text>
        </View>
      ))}
    </View>
  );
});

export const QuoteCard = memo(function QuoteCard({ quote }) {
  const fade = useRef(new Animated.Value(0)).current;
  const theme = useTheme();
  const dailyQuote = useMemo(() => {
    if (quote?.text) return quote;
    const dayIndex = Math.floor(Date.now() / 86400000) % QUOTES.length;
    return QUOTES[dayIndex];
  }, [quote]);

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fade, dailyQuote.text]);

  return (
    <Animated.View style={{ opacity: fade }}>
      <LinearGradient 
        colors={theme.isDark ? ['#1E293B', '#1E293B'] : ['#EEF2FF', '#F8FAFC']} 
        style={[styles.quoteCard, theme.isDark && { borderColor: '#334155', borderWidth: 1 }]}
      >
        <Ionicons name="chatbox-ellipses" size={30} color={theme.isDark ? '#334155' : '#C7D2FE'} />
        <Text style={[styles.quoteText, { color: theme.textPrimary }]}>{dailyQuote.text}</Text>
        <Text style={[styles.quoteAuthor, { color: theme.textSecondary }]}>{dailyQuote.author || 'SpeakMateAI'}</Text>
      </LinearGradient>
    </Animated.View>
  );
});

export const QuickStatistics = memo(function QuickStatistics({ stats }) {
  const theme = useTheme();
  const cards = [
    { label: 'Total Lessons', value: stats.totalLessons, icon: 'albums', color: COLORS.primary },
    { label: 'Completed Lessons', value: stats.completedLessons, icon: 'checkmark-done-circle', color: COLORS.success },
    { label: 'Speaking Sessions', value: stats.speakingSessions, icon: 'mic', color: '#0284C7' },
    { label: 'Vocabulary Learned', value: stats.vocabularyLearned, icon: 'library', color: '#7C3AED' },
    { label: 'Grammar Exercises', value: stats.grammarExercises, icon: 'text', color: '#DB2777' },
    { label: 'Study Hours', value: stats.totalStudyHours, icon: 'hourglass', color: COLORS.warning },
    { label: 'Current Streak', value: stats.currentStreak, icon: 'flame', color: '#EA580C' },
    { label: 'Longest Streak', value: stats.longestStreak, icon: 'trophy', color: '#CA8A04' },
    { label: 'Average Score', value: stats.averageScore, icon: 'analytics', color: '#059669', suffix: '%' },
  ];

  return (
    <View style={styles.sectionBlock}>
      <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Statistics</Text>
      <View style={styles.statsGrid}>
        {cards.map((item) => (
          <View key={item.label} style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : `${item.color}18` }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <AnimatedCounter value={item.value} suffix={item.suffix || ''} style={[styles.statValue, { color: theme.textPrimary }]} />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]} numberOfLines={2}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  const opacity = useRef(new Animated.Value(0.32)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.72, duration: 850, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.32, duration: 850, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View>
      <Animated.View style={[styles.skeletonHero, { opacity }]} />
      <Animated.View style={[styles.skeletonCard, { opacity }]} />
      <Animated.View style={[styles.skeletonCard, { opacity, height: 180 }]} />
      <View style={styles.skeletonRow}>
        <Animated.View style={[styles.skeletonSmall, { opacity }]} />
        <Animated.View style={[styles.skeletonSmall, { opacity }]} />
      </View>
      <Animated.View style={[styles.skeletonCard, { opacity, height: 210 }]} />
    </View>
  );
});

export const EmptyDashboardState = memo(function EmptyDashboardState({ onRetry }) {
  return (
    <View style={styles.emptyDashboard}>
      <LinearGradient colors={['#EEF2FF', '#F8FAFC']} style={styles.emptyIllustration}>
        <Ionicons name="sparkles" size={34} color={COLORS.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Your learning dashboard is ready</Text>
      <Text style={styles.emptyMessage}>Start a lesson, practice speaking, or save vocabulary to populate your progress.</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={onRetry} activeOpacity={0.9}>
        <Text style={styles.primaryButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
});

function EmptyCard({ title, icon, message }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionEyebrow}>{title}</Text>
      <View style={styles.emptyInline}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name={icon} size={26} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyInlineText}>{message}</Text>
      </View>
    </View>
  );
}

function SmallPill({ label }) {
  return (
    <View style={styles.smallPill}>
      <Text style={styles.smallPillText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

// SECTION 4: QUICK ACTIONS
export const QuickActionsCard = memo(function QuickActionsCard({ navigation }) {
  const theme = useTheme();
  const actions = [
    { label: 'Speaking Practice', subtitle: 'Voice Roleplay & AI Feedback', icon: 'mic', gradient: ['#7C3AED', '#6D28D9'], badge: 'AI Voice', route: 'Speaking' },
    { label: 'AI Tutor Chat', subtitle: 'Real-time Conversational Tutor', icon: 'sparkles', gradient: ['#4F46E5', '#3730A3'], badge: 'Instant AI', route: 'AIChat' },
    { label: 'Interactive Lessons', subtitle: 'Guided Learning Modules', icon: 'book', gradient: ['#0284C7', '#0369A1'], badge: 'Step by Step', route: 'Lessons' },
    { label: 'Vocabulary Builder', subtitle: 'Save & Practice Key Words', icon: 'library', gradient: ['#059669', '#047857'], badge: 'Smart Flashcards', route: 'Vocabulary' },
  ];

  return (
    <View style={styles.sectionBlock}>
      <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Core Modules</Text>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: 19, marginBottom: 14 }]}>Start Learning Now</Text>
      <View style={styles.heroActionGrid}>
        {actions.map((item) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.88}
            style={styles.heroActionWrapper}
            onPress={() => {
              if (item.route === 'Speaking' || item.route === 'AIChat') {
                navigation.navigate('BottomTabs', { screen: item.route });
              } else {
                navigation.navigate(item.route);
              }
            }}
          >
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroActionCard}
            >
              <View style={styles.heroActionTop}>
                <View style={styles.heroActionIconCircle}>
                  <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.heroActionBadge}>
                  <Text style={styles.heroActionBadgeText}>{item.badge}</Text>
                </View>
              </View>

              <View>
                <Text style={styles.heroActionTitle}>{item.label}</Text>
                <Text style={styles.heroActionDesc}>{item.subtitle}</Text>
              </View>

              <View style={styles.heroActionArrowRow}>
                <Text style={styles.heroActionStartText}>Launch Module</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

// SECTION 7: LEARNING STREAK
export const LearningStreakCard = memo(function LearningStreakCard({ streak, longestStreak }) {
  const theme = useTheme();
  const currentDayOfWeek = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
  const WEEK_DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Streak Overview</Text>
      <View style={styles.streakMetricRow}>
        <View style={styles.streakColumn}>
          <Ionicons name="flame" size={32} color="#F97316" />
          <View>
            <Text style={[styles.streakNumber, { color: theme.textPrimary }]}>{streak}</Text>
            <Text style={[styles.streakSubText, { color: theme.textSecondary }]}>Current Streak</Text>
          </View>
        </View>
        <View style={styles.streakColumn}>
          <Ionicons name="trophy" size={30} color="#CA8A04" />
          <View>
            <Text style={[styles.streakNumber, { color: theme.textPrimary }]}>{longestStreak}</Text>
            <Text style={[styles.streakSubText, { color: theme.textSecondary }]}>Longest Streak</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.streakSubText, { color: theme.textPrimary, marginBottom: 10 }]}>Weekly Heatmap</Text>
      <View style={styles.streakDaysRow}>
        {WEEK_DAYS_SHORT.map((day, idx) => {
          const isActive = idx <= currentDayOfWeek && streak > 0;
          return (
            <View 
              key={idx} 
              style={[
                styles.streakDayCircle, 
                theme.isDark && { backgroundColor: '#334155', borderColor: '#475569' },
                isActive && styles.streakDayActive
              ]}
            >
              <Text style={[styles.streakDayText, { color: theme.textSecondary }, isActive && styles.streakDayTextActive]}>{day}</Text>
              {isActive && (
                <Ionicons
                  name="checkmark"
                  size={10}
                  color="#F97316"
                  style={{ position: 'absolute', bottom: 2 }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
});

// SECTION 9: DAILY MOTIVATION
export const DailyMotivationCard = memo(function DailyMotivationCard({ quote, tip, word }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Daily Motivation</Text>
      
      {/* Word of the Day */}
      {word && (
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Ionicons name="bulb-outline" size={18} color="#7C3AED" />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: 16 }]}>Word of the Day: {word.word}</Text>
          </View>
          <Text style={{ fontSize: 13, color: theme.textSecondary, fontStyle: 'italic', marginLeft: 24 }}>
            "{word.meaning}"
          </Text>
          {word.exampleSentence && (
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4, marginLeft: 24 }}>
              Example: {word.exampleSentence}
            </Text>
          )}
          {(word.synonym || word.antonym) && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, marginLeft: 24 }}>
              {word.synonym && <Text style={{ fontSize: 10, color: COLORS.success, fontWeight: '700' }}>Syn: {word.synonym}</Text>}
              {word.antonym && <Text style={{ fontSize: 10, color: COLORS.error, fontWeight: '700' }}>Ant: {word.antonym}</Text>}
            </View>
          )}
        </View>
      )}

      {/* Quote */}
      {quote && (
        <View style={[styles.motivationSection, theme.isDark && { backgroundColor: '#334155' }]}>
          <Text style={[styles.motivationTitle, theme.isDark && { color: '#A5B4FC' }]}>Quote of the Day</Text>
          <Text style={[styles.motivationText, theme.isDark && { color: '#E2E8F0' }]}>"{quote.text}"</Text>
          <Text style={[styles.quoteAuthor, { color: theme.textSecondary, marginTop: 4 }]}>— {quote.author || 'SpeakMateAI'}</Text>
        </View>
      )}

      {/* Tip of the Day */}
      {tip && (
        <View style={[styles.motivationSection, { backgroundColor: theme.isDark ? '#064E3B' : '#F0FDF4', marginTop: 8 }]}>
          <Text style={[styles.motivationTitle, { color: theme.isDark ? '#34D399' : '#16A34A' }]}>Tip of the Day</Text>
          <Text style={[styles.motivationText, { color: theme.isDark ? '#D1FAE5' : '#14532D' }]}>{tip}</Text>
        </View>
      )}
    </View>
  );
});

// SECTION 10: UPCOMING RECOMMENDATIONS
export const UpcomingRecommendations = memo(function UpcomingRecommendations({ recommendations, onPress }) {
  const theme = useTheme();
  if (!recommendations || !recommendations.length) return null;

  const getRecIcon = (type) => {
    switch (type) {
      case 'lesson': return 'book-outline';
      case 'speaking': return 'mic-outline';
      case 'vocabulary': return 'library-outline';
      case 'grammar': return 'text-outline';
      case 'chat': return 'sparkles-outline';
      default: return 'arrow-forward-circle-outline';
    }
  };

  const getRecColor = (type) => {
    switch (type) {
      case 'lesson': return COLORS.primary;
      case 'speaking': return '#0284C7';
      case 'vocabulary': return '#7C3AED';
      case 'grammar': return '#DB2777';
      case 'chat': return '#F59E0B';
      default: return COLORS.primary;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Recommendations</Text>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: 17, marginBottom: 12 }]}>Personalized for You</Text>
      
      {recommendations.map((item, idx) => {
        const color = getRecColor(item.type);
        const icon = getRecIcon(item.type);
        return (
          <TouchableOpacity
            key={idx}
            style={[styles.recommendCard, theme.isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
            activeOpacity={0.8}
            onPress={() => onPress(item)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={[styles.quickActionIcon, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : `${color}15`, marginBottom: 0 }]}>
                <Ionicons name={icon} size={16} color={color} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary, flex: 1 }} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <View style={[styles.recommendBtn, { backgroundColor: color }]}>
              <Text style={styles.recommendBtnText}>{item.actionLabel || 'Go'}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

// SECTION 11: ACHIEVEMENTS
export const AchievementsCard = memo(function AchievementsCard({ achievements, onViewAll }) {
  const theme = useTheme();
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View>
          <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Achievements</Text>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: 17 }]}>Latest Badges</Text>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 12 }}>View All</Text>
        </TouchableOpacity>
      </View>

      {!achievements || !achievements.length ? (
        <Text style={{ fontSize: 13, color: theme.textSecondary, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 }}>
          No badges unlocked yet. Start practice to unlock!
        </Text>
      ) : (
        achievements.map((item) => (
          <View key={item.id} style={[styles.badgeCard, theme.isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <LinearGradient colors={['#FCD34D', '#F59E0B']} style={[styles.quickActionIcon, { borderRadius: 10, width: 36, height: 36, marginBottom: 0 }]}>
              <Ionicons name="ribbon" size={20} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.badgeTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                {!!item.tier && (
                  <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#4F46E5' }}>Tier {item.tier}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.badgeDesc, { color: theme.textSecondary }]} numberOfLines={1}>{item.description}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.badgeXp}>+{item.xpReward || 50} XP</Text>
              <Text style={styles.badgeDate}>{formatDate(item.unlockedAt || item.createdAt)}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
});

// SECTION 12: NOTIFICATIONS
export const NotificationsCard = memo(function NotificationsCard({ notifications, onPress }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View>
          <Text style={[styles.sectionEyebrow, { color: theme.textSecondary }]}>Notifications</Text>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: 17 }]}>Latest Reminders</Text>
        </View>
        <TouchableOpacity onPress={onPress}>
          <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 12 }}>View All</Text>
        </TouchableOpacity>
      </View>

      {!notifications || !notifications.length ? (
        <Text style={{ fontSize: 13, color: theme.textSecondary, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 }}>
          No new reminders. You are all caught up!
        </Text>
      ) : (
        notifications.map((item) => (
          <View key={item.id} style={[styles.notifCard, theme.isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Ionicons name="notifications" size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.notifTitle, { color: theme.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.notifDesc, { color: theme.textSecondary }]}>{item.message}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: CARD_RADIUS,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  sectionEyebrow: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  sectionTitle: {
    color: COLORS.black,
    fontSize: 19,
    fontWeight: '900',
  },
  progressTrack: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    overflow: 'hidden',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  brandPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroActionWrapper: {
    width: '48%',
    minWidth: 145,
  },
  heroActionCard: {
    borderRadius: 20,
    padding: 14,
    minHeight: 145,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroActionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroActionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroActionBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroActionTitle: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    lineHeight: 19,
  },
  heroActionDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 6,
  },
  heroActionArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 8,
    marginTop: 4,
  },
  heroActionStartText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#1E1B4B',
  },
  headerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconButtonLight: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  notificationDotText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 18,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 13,
    fontWeight: '700',
  },
  heroName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 11,
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroChipText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  rankBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginTop: 16,
  },
  rankText: {
    color: '#FEF3C7',
    fontWeight: '900',
    fontSize: 12,
  },
  percentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  completedPill: {
    backgroundColor: '#FEF3C7',
  },
  percentText: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  completedText: {
    color: '#92400E',
  },
  goalGrid: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 16,
  },
  goalMetric: {
    flex: 1,
    minHeight: 82,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  goalMetricValue: {
    color: COLORS.black,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 6,
  },
  goalMetricLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  goalFooterText: {
    flex: 1,
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  celebrationBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  celebrationText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '900',
  },
  continueLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  continueInfo: {
    flex: 1,
    minWidth: 0,
  },
  lessonImageFallback: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  lessonTitle: {
    color: COLORS.black,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  smallPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    maxWidth: 120,
  },
  smallPillText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
  },
  progressHint: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 7,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 15,
  },
  horizontalList: {
    paddingRight: 20,
    gap: 12,
  },
  upcomingCard: {
    width: HORIZONTAL_CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: CARD_RADIUS,
    padding: 15,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3,
  },
  upcomingTitle: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
    marginTop: 12,
    minHeight: 42,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  lessonMeta: {
    color: '#64748B',
    fontWeight: '800',
    fontSize: 12,
  },
  xpReward: {
    color: COLORS.success,
    fontWeight: '900',
    fontSize: 12,
  },
  startButton: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },
  startButtonText: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
  chart: {
    height: 162,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarTrack: {
    height: 116,
    width: '72%',
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  chartDay: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 8,
  },
  chartValue: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
  },
  timelineIconWrap: {
    width: 40,
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingTop: 7,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  timelineTitle: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '900',
  },
  timelineTime: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  timelineXp: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '900',
  },
  quoteCard: {
    borderRadius: CARD_RADIUS,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  quoteText: {
    color: '#312E81',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '800',
    fontStyle: 'italic',
    marginTop: 10,
  },
  quoteAuthor: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: (width - 50) / 2,
    minHeight: 118,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    color: COLORS.black,
    fontSize: 21,
    fontWeight: '900',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 3,
  },
  emptyInline: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyInlineText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  emptyDashboard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: CARD_RADIUS,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyIllustration: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyMessage: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  skeletonHero: {
    height: 186,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    marginBottom: 18,
  },
  skeletonCard: {
    height: 142,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#E2E8F0',
    marginBottom: 18,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  skeletonSmall: {
    flex: 1,
    height: 118,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  // New Styles
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  quickActionBtn: {
    width: '48.2%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: COLORS.white,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  qaAccentBar: {
    height: 4,
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  qaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  qaTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    flexShrink: 0,
  },
  quickActionText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  qaSubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  streakMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  streakColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.black,
  },
  streakSubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  streakDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  streakDayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  streakDayActive: {
    backgroundColor: '#FFedd5',
    borderColor: '#F97316',
  },
  streakDayText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
  },
  streakDayTextActive: {
    color: '#F97316',
  },
  motivationSection: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
  },
  motivationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  motivationText: {
    fontSize: 13,
    color: '#312E81',
    lineHeight: 18,
    fontWeight: '600',
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.black,
  },
  badgeDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  badgeXp: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
  },
  badgeDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.black,
  },
  notifDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
    lineHeight: 16,
  },
  recommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  recommendBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  recommendBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
