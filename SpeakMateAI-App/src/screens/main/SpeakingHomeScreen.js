/**
 * SpeakingHomeScreen
 * Speaking Practice dashboard with statistics, Streak, Scenarios categorized,
 * and History. Includes custom prompt simulation and scenario search.
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { speakingService, onboardingService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';

// ─── Age-Wise Scenarios Data (10 scenarios per age group) ───────────────────

const AGE_SCENARIOS = {
  Kids: [
    { id: 'k1', title: 'Show & Tell', category: 'General', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'color-palette-outline', desc: 'Share your favorite toy, book, or pet with your AI friend.' },
    { id: 'k2', title: 'At the Zoo', category: 'Daily Life', difficulty: 'Beginner', duration: 5, xp: 15, icon: 'paw-outline', desc: 'Talk to the zoo guide about your favorite animals.' },
    { id: 'k3', title: 'Ordering Ice Cream', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'ice-cream-outline', desc: 'Choose your favorite flavors and toppings at the ice cream shop.' },
    { id: 'k4', title: 'My Favorite Superhero', category: 'General', difficulty: 'Beginner', duration: 5, xp: 15, icon: 'flash-outline', desc: 'Describe a superhero and their special powers!' },
    { id: 'k5', title: 'School Lunch Time', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'restaurant-outline', desc: 'Chat with classmates about your lunch and playground games.' },
    { id: 'k6', title: 'Space Adventure', category: 'Travel', difficulty: 'Intermediate', duration: 6, xp: 20, icon: 'planet-outline', desc: 'Explore new planets and talk to an alien space buddy.' },
    { id: 'k7', title: 'Playing at the Park', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'football-outline', desc: 'Invite a friend to play on the swings and slides.' },
    { id: 'k8', title: 'Birthday Party Fun', category: 'General', difficulty: 'Beginner', duration: 5, xp: 20, icon: 'gift-outline', desc: 'Wish a happy birthday, open gifts, and talk about party games.' },
    { id: 'k9', title: 'Visiting the Doctor', category: 'General', difficulty: 'Intermediate', duration: 5, xp: 20, icon: 'medkit-outline', desc: 'Explain how you feel to a friendly nurse or doctor.' },
    { id: 'k10', title: 'Bedtime Story Time', category: 'General', difficulty: 'Intermediate', duration: 6, xp: 25, icon: 'moon-outline', desc: 'Co-create a fun bedtime fairytale with your AI coach.' },
  ],
  Teens: [
    { id: 't1', title: 'First Day at High School', category: 'General', difficulty: 'Beginner', duration: 5, xp: 15, icon: 'school-outline', desc: 'Introduce yourself and make new friends at school.' },
    { id: 't2', title: 'Ordering Fast Food', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'fast-food-outline', desc: 'Order burgers, fries, and drinks with your friends.' },
    { id: 't3', title: 'Gaming & Hobbies', category: 'General', difficulty: 'Beginner', duration: 5, xp: 15, icon: 'game-controller-outline', desc: 'Discuss your favorite video games, sports, and music bands.' },
    { id: 't4', title: 'Planning a Weekend Outing', category: 'Daily Life', difficulty: 'Intermediate', duration: 6, xp: 20, icon: 'ticket-outline', desc: 'Group chat to pick a movie or visit an amusement park.' },
    { id: 't5', title: 'Asking for Homework Help', category: 'General', difficulty: 'Intermediate', duration: 5, xp: 20, icon: 'book-outline', desc: 'Chat with a classmate or tutor about a tricky science assignment.' },
    { id: 't6', title: 'Shopping for Clothes', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'shirt-outline', desc: 'Try on cool styles, check shoe sizes, and ask for discounts.' },
    { id: 't7', title: 'Preparing for School Exams', category: 'Career', difficulty: 'Intermediate', duration: 6, xp: 20, icon: 'journal-outline', desc: 'Study session prep and sharing study tips with friends.' },
    { id: 't8', title: 'Joining a High School Club', category: 'General', difficulty: 'Intermediate', duration: 6, xp: 25, icon: 'people-outline', desc: 'Interview for the robotics, drama, or sports club.' },
    { id: 't9', title: 'Talking About Future Dreams', category: 'Career', difficulty: 'Advanced', duration: 7, xp: 30, icon: 'trophy-outline', desc: 'Discuss dream colleges, tech careers, and personal goals.' },
    { id: 't10', title: 'Handling Peer Situations', category: 'General', difficulty: 'Advanced', duration: 7, xp: 30, icon: 'chatbox-ellipses-outline', desc: 'Resolve a misunderstanding with a friend politely.' },
  ],
  'Young Adult': [
    { id: 'y1', title: 'Daily Conversation', category: 'General', difficulty: 'Beginner', duration: 5, xp: 15, icon: 'chatbubbles-outline', desc: 'Chat about campus life, daily habits, and weekend plans.' },
    { id: 'y2', title: 'Campus Coffee Shop', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'cafe-outline', desc: 'Order artisan coffee, study snacks, and chat with baristas.' },
    { id: 'y3', title: 'College Admission Interview', category: 'Career', difficulty: 'Intermediate', duration: 8, xp: 30, icon: 'school-outline', desc: 'Answer admission questions and explain your choice of major.' },
    { id: 'y4', title: 'Hostel & Roommate Chat', category: 'Daily Life', difficulty: 'Intermediate', duration: 5, xp: 20, icon: 'home-outline', desc: 'Discuss sharing house chores, schedules, and groceries.' },
    { id: 'y5', title: 'Backpacking & Travel', category: 'Travel', difficulty: 'Intermediate', duration: 6, xp: 25, icon: 'airplane-outline', desc: 'Ask for local directions, book hostel beds, and meet travelers.' },
    { id: 'y6', title: 'Part-time Job Interview', category: 'Career', difficulty: 'Intermediate', duration: 7, xp: 25, icon: 'briefcase-outline', desc: 'Practice answering basic interview and customer service questions.' },
    { id: 'y7', title: 'Attending a Tech Fest', category: 'Career', difficulty: 'Intermediate', duration: 6, xp: 25, icon: 'hardware-chip-outline', desc: 'Network with peers and pitch ideas at a campus hackathon.' },
    { id: 'y8', title: 'Renting Your First Apartment', category: 'Daily Life', difficulty: 'Advanced', duration: 7, xp: 30, icon: 'key-outline', desc: 'Talk to a landlord about monthly rent, leases, and utilities.' },
    { id: 'y9', title: 'Group Project Discussion', category: 'General', difficulty: 'Advanced', duration: 8, xp: 35, icon: 'desktop-outline', desc: 'Divide presentation roles and set project deadlines.' },
    { id: 'y10', title: 'Public Speaking & Debate', category: 'Work', difficulty: 'Advanced', duration: 8, xp: 35, icon: 'mic-outline', desc: 'Pitch an argument clearly in a campus debate or presentation.' },
  ],
  Professional: [
    { id: '1', title: 'Daily Conversation', category: 'General', difficulty: 'Beginner', duration: 5, xp: 15, icon: 'chatbubbles-outline', desc: 'Chat about your day, hobbies, and general interests.' },
    { id: '2', title: 'Ordering in Restaurant', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'restaurant-outline', desc: 'Order food, ask about the menu, and pay the bill.' },
    { id: '3', title: 'Hotel Check-in', category: 'Travel', difficulty: 'Beginner', duration: 5, xp: 20, icon: 'bed-outline', desc: 'Check in, request room services, and ask for local recommendations.' },
    { id: '4', title: 'Airport Customs', category: 'Travel', difficulty: 'Intermediate', duration: 6, xp: 25, icon: 'airplane-outline', desc: 'Declare items, answer security questions, and handle arrivals.' },
    { id: '5', title: 'Shopping Helpers', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'cart-outline', desc: 'Ask for sizes, negotiate prices, and make payments.' },
    { id: '6', title: 'Office Small Talk', category: 'Work', difficulty: 'Intermediate', duration: 5, xp: 20, icon: 'briefcase-outline', desc: 'Engage with colleagues, discuss weekends, and plan lunches.' },
    { id: '7', title: 'Business Meeting', category: 'Work', difficulty: 'Advanced', duration: 8, xp: 30, icon: 'people-outline', desc: 'Present updates, pitch ideas, and negotiate corporate terms.' },
    { id: '8', title: 'Job Interview Practice', category: 'Career', difficulty: 'Advanced', duration: 10, xp: 40, icon: 'document-text-outline', desc: 'Practice typical HR questions and explain your career goals.' },
    { id: '9', title: 'Salary & Contract Negotiation', category: 'Career', difficulty: 'Advanced', duration: 8, xp: 35, icon: 'cash-outline', desc: 'Negotiate compensation, benefits, and start date.' },
    { id: '10', title: 'Presentation Skills', category: 'Work', difficulty: 'Advanced', duration: 7, xp: 30, icon: 'easel-outline', desc: 'Practice starting, structuring, and concluding a keynote presentation.' },
  ],
  Senior: [
    { id: 's1', title: 'Relaxed Daily Conversation', category: 'General', difficulty: 'Beginner', duration: 5, xp: 15, icon: 'chatbubbles-outline', desc: 'Chat comfortably about morning routines, weather, and life.' },
    { id: 's2', title: 'Tea Time & Gardening', category: 'General', difficulty: 'Beginner', duration: 5, xp: 15, icon: 'leaf-outline', desc: 'Discuss plants, cooking recipes, and home hobbies.' },
    { id: 's3', title: 'Visiting the Pharmacy', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'medical-outline', desc: 'Ask a pharmacist about prescription directions and advice.' },
    { id: 's4', title: 'Neighborhood Cafe', category: 'Daily Life', difficulty: 'Beginner', duration: 4, xp: 15, icon: 'cafe-outline', desc: 'Order breakfast and chat pleasantly with local staff.' },
    { id: 's5', title: 'Sharing Life Stories', category: 'General', difficulty: 'Intermediate', duration: 7, xp: 25, icon: 'book-outline', desc: 'Tell stories about childhood, family, and past trips.' },
    { id: 's6', title: 'Guided Museum Tour', category: 'Travel', difficulty: 'Intermediate', duration: 6, xp: 25, icon: 'compass-outline', desc: 'Ask a tour guide questions about art, history, and culture.' },
    { id: 's7', title: 'Book & Movie Discussion', category: 'General', difficulty: 'Intermediate', duration: 6, xp: 25, icon: 'film-outline', desc: 'Share thoughts on a favorite novel, movie, or biography.' },
    { id: 's8', title: 'Booking Holiday Travel', category: 'Travel', difficulty: 'Intermediate', duration: 6, xp: 25, icon: 'train-outline', desc: 'Reserve train or plane tickets and ask about senior assistance.' },
    { id: 's9', title: 'Calling Customer Support', category: 'Daily Life', difficulty: 'Intermediate', duration: 5, xp: 20, icon: 'call-outline', desc: 'Get assistance with home internet, TV, or phone service.' },
    { id: 's10', title: 'Family & Grandchildren Chat', category: 'General', difficulty: 'Advanced', duration: 6, xp: 25, icon: 'heart-outline', desc: 'Practice modern terms and catch up with family news.' },
  ],
};

const CATEGORIES = ['All', 'General', 'Daily Life', 'Travel', 'Work', 'Career'];

const DIFF_COLORS = {
  Beginner: { bg: '#DCFCE7', text: '#16A34A' },
  Intermediate: { bg: '#FEF9C3', text: '#CA8A04' },
  Advanced: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function SpeakingHomeScreen({ navigation }) {
  const { isDark, theme } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userAgeGroup, setUserAgeGroup] = useState('Professional');

  // Stats calculation
  const totalMinutes = history.reduce((sum, item) => sum + (item.duration || 0), 0) / 60;
  const totalXP = history.reduce((sum, item) => sum + (item.xpEarned || 0), 0);
  const totalSessions = history.length;
  const streak = history.length > 0 ? 3 : 0; // Simulated active streak

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [historyData, onboardingData] = await Promise.all([
        speakingService.history().catch(() => []),
        onboardingService.get().catch(() => null),
      ]);
      setHistory(historyData || []);
      if (onboardingData?.ageGroup) {
        setUserAgeGroup(onboardingData.ageGroup);
      }
    } catch (e) {
      console.warn('Failed to load speaking dashboard data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const startScenario = async (scenario) => {
    triggerStart(scenario.title, scenario);
  };

  const triggerStart = async (scenarioName, scenario) => {
    try {
      setLoading(true);
      const session = await speakingService.start({
        scenario: scenarioName,
        difficulty: scenario.difficulty,
        estimatedDuration: scenario.duration,
        xpReward: scenario.xp,
      });
      navigation.navigate('Conversation', {
        sessionId: session.id,
        scenario: scenarioName,
        xpReward: scenario.xp,
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Could not start speaking session. Please try again.');
    }
  };

  const handleDeleteHistory = async (id) => {
    Alert.alert(
      'Delete Conversation?',
      'Are you sure you want to delete this session from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await speakingService.remove(id);
              loadData(true);
            } catch {
              Alert.alert('Error', 'Could not delete speaking session.');
            }
          },
        },
      ]
    );
  };

  // Filtered scenarios
  const filteredScenarios = SCENARIOS.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchText.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchText.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(true); }} />}
    >
      {/* ── Header ── */}
      <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Speaking Practice</Text>
          <Ionicons name="mic-circle" size={26} color={COLORS.primary} />
        </View>

        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{streak} 🔥</Text>
            <Text style={styles.statLbl}>Streak Days</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{Math.round(totalMinutes)}m</Text>
            <Text style={styles.statLbl}>Total Mins</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{totalXP} ⭐</Text>
            <Text style={styles.statLbl}>XP Earned</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{totalSessions}</Text>
            <Text style={styles.statLbl}>Sessions</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Search Scenario ── */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search conversation scenarios..."
            placeholderTextColor={theme.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Categories Carousel ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.catTab, 
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }, 
              selectedCategory === cat && styles.catTabActive
            ]}
          >
            <Text style={[styles.catText, { color: theme.textSecondary }, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Scenario Cards Grid ── */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.secTitle, { color: theme.textPrimary }]}>Conversation Scenarios</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.grid}>
          {filteredScenarios.map((sc) => (
            <TouchableOpacity 
              key={sc.id} 
              style={[styles.scCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]} 
              onPress={() => startScenario(sc)}
            >
              <View style={styles.scHeader}>
                <View style={[styles.scIconBg, isDark && { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
                  <Ionicons name={sc.icon} size={22} color={COLORS.primary} />
                </View>
              </View>
              <Text style={[styles.scTitle, { color: theme.textPrimary }]} numberOfLines={1}>{sc.title}</Text>
              <Text style={[styles.scDesc, { color: theme.textSecondary }]} numberOfLines={2}>{sc.desc}</Text>
              <View style={[styles.scFooter, { borderTopColor: theme.cardBorder }]}>
                <Text style={[styles.scInfo, { color: theme.textSecondary }]}>{sc.duration} min · +{sc.xp} XP</Text>
                <Ionicons name="chevron-forward-circle" size={20} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Recent Conversations / History ── */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.secTitle, { color: theme.textPrimary }]}>Speaking History</Text>
      </View>
      <View style={styles.historyList}>
        {history.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="document-text-outline" size={36} color={theme.textSecondary} />
            <Text style={[styles.emptyHistoryText, { color: theme.textSecondary }]}>No speaking history yet.</Text>
            <Text style={[styles.emptyHistorySub, { color: theme.textSecondary }]}>Start a scenario above to practice!</Text>
          </View>
        ) : (
          history.map((h) => (
            <View key={h.id} style={[styles.historyItem, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              <TouchableOpacity
                style={styles.historyClick}
                onPress={() => navigation.navigate('SpeakingHistoryDetail', { sessionId: h.id })}
              >
                <View style={styles.historyLeft}>
                  <View style={[styles.historyIconBg, isDark && { backgroundColor: 'rgba(124,58,237,0.2)' }]}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyTopic, { color: theme.textPrimary }]} numberOfLines={1}>{h.scenario}</Text>
                    <Text style={[styles.historyMeta, { color: theme.textSecondary }]}>
                      {new Date(h.createdAt).toLocaleDateString()} · {Math.round(h.duration / 60)}m · {h.score || 0}% score
                    </Text>
                    <Text style={[styles.historyPreview, { color: theme.textSecondary }]} numberOfLines={1}>
                      {h.previewMessage || 'No transcript saved.'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteHistory(h.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header & Stats
  header: { paddingBottom: 24, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 48, marginBottom: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  statsCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  statLbl: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500', marginTop: 2 },

  // Search
  searchSection: { paddingHorizontal: 16, marginTop: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, color: COLORS.black, fontSize: 14 },

  // Categories
  catScroll: { paddingVertical: 12, paddingLeft: 16 },
  catTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', marginRight: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  catTabActive: { backgroundColor: COLORS.primary },
  catText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  catTextActive: { color: '#FFF' },

  // Scenario Cards Grid
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  secTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  scCard: { width: '47%', backgroundColor: '#FFF', borderRadius: 18, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: 4 },
  scHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  scIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  diffBadgeText: { fontSize: 10, fontWeight: '700' },
  scTitle: { fontSize: 13, fontWeight: '800', color: COLORS.black, marginBottom: 2 },
  scDesc: { fontSize: 11, color: COLORS.text, lineHeight: 15, marginBottom: 10, height: 30 },
  scFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  scInfo: { fontSize: 10, fontWeight: '600', color: '#64748B' },

  // History List
  historyList: { paddingHorizontal: 16 },
  emptyHistory: { alignItems: 'center', paddingVertical: 32 },
  emptyHistoryText: { fontSize: 14, fontWeight: '700', color: '#94A3B8', marginTop: 12 },
  emptyHistorySub: { fontSize: 12, color: '#CBD5E1', marginTop: 4 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  historyClick: { flex: 1 },
  historyLeft: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  historyIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  historyTopic: { fontSize: 13, fontWeight: '700', color: COLORS.black },
  historyMeta: { fontSize: 11, color: '#64748B', marginVertical: 2 },
  historyPreview: { fontSize: 11, color: COLORS.text },
  deleteBtn: { padding: 8 },
});
