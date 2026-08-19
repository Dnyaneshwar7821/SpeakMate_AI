import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  Alert,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { AppButton, AppInput, Card, Screen, StateView } from '../../components/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { vocabularyService, settingsService, progressService } from '../../services/appServices';
import { VoiceService } from '../../services/VoiceService';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 60;

const STANDARD_VOCABULARY = {
  '1st Std': [
    { id: 'v1_1', word: 'Apple', phonetic: '/ˈæp.əl/', partOfSpeech: 'noun', meaning: 'A sweet round fruit that grows on trees.', example: 'An apple a day keeps the doctor away.', favorite: true },
    { id: 'v1_2', word: 'Friend', phonetic: '/frend/', partOfSpeech: 'noun', meaning: 'A person you like and spend time with.', example: 'Sita is my best school friend.', favorite: false },
    { id: 'v1_3', word: 'Happy', phonetic: '/ˈhæp.i/', partOfSpeech: 'adjective', meaning: 'Feeling or showing pleasure and joy.', example: 'I feel very happy on my birthday.', favorite: false },
    { id: 'v1_4', word: 'Smile', phonetic: '/smaɪl/', partOfSpeech: 'verb', meaning: 'Form a happy facial expression with mouth.', example: 'Always smile when greeting your teacher.', favorite: false },
  ],
  '2nd Std': [
    { id: 'v2_1', word: 'Routine', phonetic: '/ruːˈtiːn/', partOfSpeech: 'noun', meaning: 'A regular sequence of daily actions.', example: 'Brushing teeth is part of my morning routine.', favorite: true },
    { id: 'v2_2', word: 'Pencil', phonetic: '/ˈpen.səl/', partOfSpeech: 'noun', meaning: 'An instrument used for writing or drawing.', example: 'I sharpened my yellow pencil for class.', favorite: false },
    { id: 'v2_3', word: 'Weather', phonetic: '/ˈweð.ər/', partOfSpeech: 'noun', meaning: 'The state of the atmosphere (sunny, rainy, etc.).', example: 'The weather today is sunny and bright.', favorite: false },
    { id: 'v2_4', word: 'Playground', phonetic: '/ˈpleɪ.ɡraʊnd/', partOfSpeech: 'noun', meaning: 'An outdoor area for children to play games.', example: 'We play on the swings in the playground.', favorite: false },
  ],
  '3rd Std': [
    { id: 'v3_1', word: 'Helper', phonetic: '/ˈhel.pər/', partOfSpeech: 'noun', meaning: 'A person who helps or assists others.', example: 'Firefighters are brave community helpers.', favorite: true },
    { id: 'v3_2', word: 'Action', phonetic: '/ˈæk.ʃən/', partOfSpeech: 'noun', meaning: 'The process of doing something or performing a verb.', example: 'Running and jumping are action words.', favorite: false },
    { id: 'v3_3', word: 'Polite', phonetic: '/pəˈlaɪt/', partOfSpeech: 'adjective', meaning: 'Having good manners and showing respect.', example: 'Saying "thank you" is very polite.', favorite: false },
    { id: 'v3_4', word: 'Schedule', phonetic: '/ˈskedʒ.uːl/', partOfSpeech: 'noun', meaning: 'A plan that lists times for activities.', example: 'Check our school timetable schedule.', favorite: false },
  ],
  '4th Std': [
    { id: 'v4_1', word: 'Expedition', phonetic: '/ˌek.spəˈdɪʃ.ən/', partOfSpeech: 'noun', meaning: 'A journey undertaken for a specific purpose.', example: 'Astronauts launched a space expedition to Mars.', favorite: true },
    { id: 'v4_2', word: 'Direction', phonetic: '/daɪˈrek.ʃən/', partOfSpeech: 'noun', meaning: 'The course along which someone or something moves.', example: 'Turn left to find the school library direction.', favorite: false },
    { id: 'v4_3', word: 'Canteen', phonetic: '/kænˈtiːn/', partOfSpeech: 'noun', meaning: 'A restaurant in a school or workplace.', example: 'We bought fresh fruit juice at the school canteen.', favorite: false },
    { id: 'v4_4', word: 'Habit', phonetic: '/ˈhæb.ɪt/', partOfSpeech: 'noun', meaning: 'A settled or regular tendency or practice.', example: 'Drinking water daily is a healthy habit.', favorite: false },
  ],
  '5th Std': [
    { id: 'v5_1', word: 'Environment', phonetic: '/ɪnˈvaɪ.rən.mənt/', partOfSpeech: 'noun', meaning: 'The surroundings or conditions in which we live.', example: 'Planting trees protects our natural environment.', favorite: true },
    { id: 'v5_2', word: 'Experiment', phonetic: '/ɪkˈsper.ə.mənt/', partOfSpeech: 'noun', meaning: 'A scientific procedure undertaken to make a discovery.', example: 'We conducted a science experiment on plant growth.', favorite: false },
    { id: 'v5_3', word: 'Recycle', phonetic: '/ˌriːˈsaɪ.kəl/', partOfSpeech: 'verb', meaning: 'Convert waste materials into reusable objects.', example: 'We recycle paper and plastic bottles at school.', favorite: false },
    { id: 'v5_4', word: 'Moral', phonetic: '/ˈmɔːr.əl/', partOfSpeech: 'noun', meaning: 'A lesson concerning right and wrong from a story.', example: 'Honesty is the moral of the fable story.', favorite: false },
  ],
  '6th Std': [
    { id: 'v6_1', word: 'Robotics', phonetic: '/roʊˈbɑː.t̬ɪks/', partOfSpeech: 'noun', meaning: 'The branch of technology dealing with robots.', example: 'She joined the school robotics club to build code.', favorite: true },
    { id: 'v6_2', word: 'Debate', phonetic: '/dɪˈbeɪt/', partOfSpeech: 'noun', meaning: 'A formal discussion on a particular topic in public.', example: 'Our team won the inter-school debate competition.', favorite: false },
    { id: 'v6_3', word: 'Commentary', phonetic: '/ˈkɑː.mən.ter.i/', partOfSpeech: 'noun', meaning: 'A descriptive spoken account of an event as it happens.', example: 'He gave live commentary during the sports race.', favorite: false },
    { id: 'v6_4', word: 'Assistance', phonetic: '/əˈsɪs.təns/', partOfSpeech: 'noun', meaning: 'Help or support given to someone.', example: 'The shop assistant offered polite assistance.', favorite: false },
  ],
  '7th Std': [
    { id: 'v7_1', word: 'Conservation', phonetic: '/ˌkɑːn.sɚˈveɪ.ʃən/', partOfSpeech: 'noun', meaning: 'Prevention of wasteful use of a resource.', example: 'Water conservation is vital for future generations.', favorite: true },
    { id: 'v7_2', word: 'Cinematography', phonetic: '/ˌsɪn.ə.məˈtɑː.ɡrə.fi/', partOfSpeech: 'noun', meaning: 'The art or science of motion-picture photography.', example: 'The movie won awards for stunning cinematography.', favorite: false },
    { id: 'v7_3', word: 'Delegate', phonetic: '/ˈdel.ə.ɡeɪt/', partOfSpeech: 'verb', meaning: 'Entrust a task or responsibility to another person.', example: 'The leader delegates responsibilities to team members.', favorite: false },
    { id: 'v7_4', word: 'Politeness', phonetic: '/pəˈlaɪt.nəs/', partOfSpeech: 'noun', meaning: 'Behavior that is respectful and considerate.', example: 'Politeness creates a harmonious classroom atmosphere.', favorite: false },
  ],
  '8th Std': [
    { id: 'v8_1', word: 'Leadership', phonetic: '/ˈliː.dɚ.ʃɪp/', partOfSpeech: 'noun', meaning: 'The action of leading a group or organization.', example: 'Student council develops strong leadership qualities.', favorite: true },
    { id: 'v8_2', word: 'Rebuttal', phonetic: '/rɪˈbʌt̬.əl/', partOfSpeech: 'noun', meaning: 'A refutation or contradiction in a formal debate.', example: 'She delivered a powerful rebuttal during the debate.', favorite: false },
    { id: 'v8_3', word: 'Innovation', phonetic: '/ˌɪn.əˈveɪ.ʃən/', partOfSpeech: 'noun', meaning: 'A new method, idea, or product.', example: 'Artificial intelligence is a major technological innovation.', favorite: false },
    { id: 'v8_4', word: 'Aspiration', phonetic: '/ˌæs.pəˈreɪ.ʃən/', partOfSpeech: 'noun', meaning: 'A hope or ambition of achieving something.', example: 'Her career aspiration is to become a surgeon.', favorite: false },
  ],
  '9th Std': [
    { id: 'v9_1', word: 'Diplomatic', phonetic: '/ˌdɪp.ləˈmæt̬.ɪk/', partOfSpeech: 'adjective', meaning: 'Handling sensitive situations tactfully and politely.', example: 'He used diplomatic language to resolve peer conflict.', favorite: true },
    { id: 'v9_2', word: 'Keynote', phonetic: '/ˈkiː.noʊt/', partOfSpeech: 'noun', meaning: 'A main speech outlining the central theme of a summit.', example: 'She delivered the opening keynote on climate change.', favorite: false },
    { id: 'v9_3', word: 'Rhetoric', phonetic: '/ˈret.ər.ɪk/', partOfSpeech: 'noun', meaning: 'The art of effective or persuasive speaking and writing.', example: 'Mastering rhetoric enhances spoken essay presentations.', favorite: false },
    { id: 'v9_4', word: 'Breakthrough', phonetic: '/ˈbreɪk.θruː/', partOfSpeech: 'noun', meaning: 'A sudden, dramatic, and important discovery or development.', example: 'Scientists announced a breakthrough in solar energy.', favorite: false },
  ],
  '10th Std': [
    { id: 'v10_1', word: 'Oratory', phonetic: '/ˈɔːr.ə.tɔːr.i/', partOfSpeech: 'noun', meaning: 'Formal public speaking characterized by high eloquence.', example: 'CEFR C1 mastery requires spontaneous oratory skill.', favorite: true },
    { id: 'v10_2', word: 'Simulation', phonetic: '/ˌsɪm.jəˈleɪ.ʃən/', partOfSpeech: 'noun', meaning: 'Imitation of a situation or process in realistic conditions.', example: 'We completed a 10th Board oral exam simulation.', favorite: false },
    { id: 'v10_3', word: 'Modulation', phonetic: '/ˌmɑː.dʒəˈleɪ.ʃən/', partOfSpeech: 'noun', meaning: 'Varying the pitch or tone of voice for expressive effect.', example: 'Vocal modulation makes speeches captivating.', favorite: false },
    { id: 'v10_4', word: 'Proficiency', phonetic: '/prəˈfɪʃ.ən.si/', partOfSpeech: 'noun', meaning: 'A high degree of skill and competence.', example: 'Fluency and accuracy demonstrate English proficiency.', favorite: false },
  ],
};

export default function VocabularyScreen() {
  const { isDark, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'flashcards', 'quiz'
  const [word, setWord] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'favorites'
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState({ loading: true, error: '', items: [] });
  
  // Settings, Voices & Progress state
  const [settings, setSettings] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [userProgress, setUserProgress] = useState(null);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const quizScoreRef = useRef(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const items = await vocabularyService.all().catch(() => []);
      const gradeCurated = STANDARD_VOCABULARY[userGrade] || STANDARD_VOCABULARY['1st Std'];
      setState({ loading: false, error: '', items: items && items.length > 0 ? items : gradeCurated });
    } catch (error) {
      const gradeCurated = STANDARD_VOCABULARY[userGrade] || STANDARD_VOCABULARY['1st Std'];
      setState({ loading: false, error: '', items: gradeCurated });
    }
  };

  const [userGrade, setUserGrade] = useState('1st Std');
  const [accountType, setAccountType] = useState('INDIVIDUAL_USER');

  const loadSettingsAndVoices = async () => {
    try {
      const [s, voices, onboardingVoice, savedGrade, savedAccType, savedVoice] = await Promise.all([
        settingsService.get().catch(() => null),
        VoiceService.getAvailableEnglishVoices(),
        AsyncStorage.getItem('speakmate_onboarding_voice'),
        AsyncStorage.getItem('speakmate_school_grade'),
        AsyncStorage.getItem('speakmate_account_type'),
        AsyncStorage.getItem('speakmate_selected_voice'),
      ]);
      const effAccType = savedAccType || 'INDIVIDUAL_USER';
      setAccountType(effAccType);
      const effectiveVoice = savedVoice || s?.aiVoice || 'Default';
      setSettings({ ...s, aiVoice: effectiveVoice, onboardingVoice });
      setAvailableVoices(voices);
      if (savedGrade) {
        setUserGrade(savedGrade);
      } else {
        setUserGrade(effAccType === 'STUDENT' ? '1st Std' : 'Intermediate');
      }
    } catch (e) {
      console.warn("Failed to load settings in vocabulary screen:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
      loadSettingsAndVoices();
    }, [])
  );

  const addWord = async () => {
    const cleanWord = word.trim();
    if (!cleanWord) return;
    setSaving(true);
    try {
      await vocabularyService.add(cleanWord);
      setWord('');
      Alert.alert('Success', `"${cleanWord}" added with AI definition.`);
      await load();
    } catch (error) {
      console.warn('Backend add vocabulary note, adding to local deck:', error);
      const localItem = {
        id: 'local_' + Date.now(),
        word: cleanWord,
        meaning: `Definition and usage for ${cleanWord}`,
        example: `Practice using "${cleanWord}" in daily English conversations.`,
        phonetic: `/${cleanWord.toLowerCase()}/`,
        partOfSpeech: 'word',
        favorite: false,
      };
      setState((curr) => ({
        ...curr,
        items: [localItem, ...curr.items],
      }));
      setWord('');
      Alert.alert('Success', `"${cleanWord}" added to your vocabulary deck.`);
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (item) => {
    try {
      const updated = await vocabularyService.toggleFavorite(item.id);
      setState((curr) => ({
        ...curr,
        items: curr.items.map((i) => (i.id === item.id ? { ...i, favorite: updated.favorite } : i)),
      }));
    } catch (error) {
      Alert.alert('Error', 'Unable to toggle favorite.');
    }
  };

  const removeWord = async (id) => {
    Alert.alert('Delete Word', 'Are you sure you want to delete this word from your vocabulary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await vocabularyService.remove(id);
            setState((curr) => ({
              ...curr,
              items: curr.items.filter((i) => i.id !== id),
            }));
          } catch (error) {
            Alert.alert('Error', 'Unable to delete word.');
          }
        },
      },
    ]);
  };

  const speak = (txt) => {
    if (settings?.isMuted) return;
    VoiceService.speak(txt, {
      voiceType: settings?.aiVoice || 'Default',
      availableVoices,
    });
  };

  useEffect(() => {
    if (activeTab === 'flashcards' && settings?.autoPlayAudio && filteredItems && filteredItems[currentCardIndex]) {
      const t = setTimeout(() => {
        speak(filteredItems[currentCardIndex].word);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [currentCardIndex, activeTab, settings?.autoPlayAudio]);

  // Flashcard flipping animation
  const flipCard = () => {
    const nextFlipped = !flipped;
    Animated.spring(flipAnimation, {
      toValue: nextFlipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(nextFlipped);

    if (nextFlipped && filteredItems && filteredItems[currentCardIndex]) {
      const currentItem = filteredItems[currentCardIndex];
      if (currentItem.meaning) {
        speak(currentItem.meaning);
      }
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const nextCard = () => {
    if (flipped) flipCard();
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % filteredItems.length);
    }, 200);
  };

  const prevCard = () => {
    if (flipped) flipCard();
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    }, 200);
  };

  // Quiz Engine
  const startQuiz = async () => {
    setQuizLoading(true);
    setQuizError('');
    setQuizFinished(false);
    setQuizScore(0);
    quizScoreRef.current = 0;
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setEarnedXP(0);
    try {
      const [questions, prog] = await Promise.all([
        vocabularyService.quiz(),
        progressService.get().catch(() => null),
      ]);
      setQuizQuestions(questions || []);
      setUserProgress(prog);
      setActiveTab('quiz');
    } catch (err) {
      setQuizError(err.userMessage || 'Failed to start quiz.');
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuizAnswer = (answer) => {
    if (selectedAnswer !== null) return; // already answered
    setSelectedAnswer(answer);
    const correct = answer === quizQuestions[currentQuizIndex].correctAnswer;
    if (correct) {
      quizScoreRef.current += 1;
      setQuizScore(quizScoreRef.current);
    }

    if (settings?.soundEffects) {
      Speech.speak(correct ? "Correct!" : "Oops!", {
        language: 'en-US',
        pitch: correct ? 1.3 : 0.8,
        rate: 1.15,
      });
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    const finalScore = quizScoreRef.current;
    const totalQuestions = quizQuestions.length;
    const baseXP = finalScore * 25; // 25 XP per correct answer
    const perfectBonus = (finalScore === totalQuestions && totalQuestions > 0) ? 25 : 0;
    const totalAwarded = baseXP + perfectBonus;
    setEarnedXP(totalAwarded);

    if (userProgress) {
      try {
        const newXp = (userProgress.xp || 0) + totalAwarded;
        const newVocabCount = (userProgress.totalVocabularyWords || 0) + finalScore;
        await progressService.update({
          ...userProgress,
          xp: newXp,
          totalVocabularyWords: newVocabCount,
        });
      } catch (e) {
        console.warn("Failed to update quiz progress XP:", e);
      }
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setSelectedAnswer(null);
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  // Filter and search logic
  const filteredItems = state.items.filter((item) => {
    const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.meaning && item.meaning.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || (filterType === 'favorites' && item.favorite);
    return matchesSearch && matchesFilter;
  });

  return (
    <Screen
      title="Vocabulary Builder"
      subtitle={
        accountType === 'STUDENT'
          ? `Save words & take AI quizzes (Calibrated for ${userGrade})`
          : 'Save words & take interactive AI flashcard quizzes'
      }
    >
      {/* Dynamic Tab Bar */}
      <View style={[styles.tabContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'list' && styles.tabButtonActive]}
          onPress={() => setActiveTab('list')}
        >
          <Ionicons name="list" size={18} color={activeTab === 'list' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'list' && styles.tabButtonTextActive]}>My List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'flashcards' && styles.tabButtonActive]}
          onPress={() => {
            if (!filteredItems.length) {
              Alert.alert('No Words', 'Save vocabulary words first to practice flashcards.');
              return;
            }
            setCurrentCardIndex(0);
            setFlipped(false);
            flipAnimation.setValue(0);
            setActiveTab('flashcards');
          }}
        >
          <Ionicons name="albums" size={18} color={activeTab === 'flashcards' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'flashcards' && styles.tabButtonTextActive]}>Flashcards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'quiz' && styles.tabButtonActive]}
          onPress={startQuiz}
        >
          <Ionicons name="trophy" size={18} color={activeTab === 'quiz' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'quiz' && styles.tabButtonTextActive]}>Quiz</Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: LIST OF WORDS */}
      {activeTab === 'list' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Add Word Box */}
          <Card style={[styles.addCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>Add to My Vocabulary</Text>
            <View style={styles.addInputRow}>
              <TextInput
                style={[styles.addInput, { backgroundColor: isDark ? '#334155' : '#F8FAFC', color: theme.textPrimary }]}
                placeholder="e.g. Eloquent"
                value={word}
                onChangeText={setWord}
                placeholderTextColor={theme.textSecondary}
              />
              <TouchableOpacity style={styles.addButton} onPress={addWord} disabled={saving}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Search and Filters */}
          <View style={styles.searchFilterContainer}>
            <View style={[styles.searchBar, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              <Ionicons name="search" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search vocabulary..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            <View style={styles.filterPillRow}>
              <TouchableOpacity
                style={[styles.filterPill, isDark && { backgroundColor: '#1E293B' }, filterType === 'all' && styles.filterPillActive]}
                onPress={() => setFilterType('all')}
              >
                <Text style={[styles.filterPillText, { color: isDark ? '#94A3B8' : '#64748B' }, filterType === 'all' && styles.filterPillTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterPill, isDark && { backgroundColor: '#1E293B' }, filterType === 'favorites' && styles.filterPillActive]}
                onPress={() => setFilterType('favorites')}
              >
                <Text style={[styles.filterPillText, { color: isDark ? '#94A3B8' : '#64748B' }, filterType === 'favorites' && styles.filterPillTextActive]}>Favorites</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main List */}
          <StateView
            loading={state.loading}
            error={state.error}
            empty={!filteredItems.length ? 'No matching vocabulary words yet.' : null}
            onRetry={load}
          >
            {filteredItems.map((item) => (
              <Card key={item.id} style={[styles.wordCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={styles.wordHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={[styles.wordText, { color: theme.textPrimary }]}>{item.word}</Text>
                    <TouchableOpacity onPress={() => speak(item.word)}>
                      <Ionicons name="volume-medium" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => toggleFavorite(item)}>
                      <Ionicons
                        name={item.favorite ? 'star' : 'star-outline'}
                        size={22}
                        color={item.favorite ? '#F59E0B' : theme.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeWord(item.id)}>
                      <Ionicons name="trash-outline" size={21} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {!!item.meaning && <Text style={[styles.meaningText, { color: theme.textSecondary }]}>{item.meaning}</Text>}
                {!!item.exampleSentence && (
                  <View style={[styles.exampleContainer, isDark && { backgroundColor: '#334155' }]}>
                    <Text style={[styles.exampleText, { color: theme.textPrimary }]}>"{item.exampleSentence}"</Text>
                  </View>
                )}

                {(!!item.synonym || !!item.antonym) && (
                  <View style={styles.tagsContainer}>
                    {!!item.synonym && (
                      <View style={[styles.tagPill, { backgroundColor: isDark ? 'rgba(22,163,74,0.2)' : '#F0FDF4' }]}>
                        <Text style={[styles.tagText, { color: '#16A34A' }]}>Syn: {item.synonym}</Text>
                      </View>
                    )}
                    {!!item.antonym && (
                      <View style={[styles.tagPill, { backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : '#FEF2F2' }]}>
                        <Text style={[styles.tagText, { color: '#EF4444' }]}>Ant: {item.antonym}</Text>
                      </View>
                    )}
                  </View>
                )}
              </Card>
            ))}
          </StateView>
        </ScrollView>
      )}

      {/* TAB 2: FLASHCARDS */}
      {activeTab === 'flashcards' && filteredItems.length > 0 && (
        <View style={styles.flashcardsContainer}>
          <Text style={[styles.flashcardsHeader, { color: theme.textSecondary }]}>
            Card {currentCardIndex + 1} of {filteredItems.length}
          </Text>

          {/* Interactive Flipped Card */}
          <TouchableOpacity activeOpacity={0.95} onPress={flipCard}>
            <View style={styles.cardContainer}>
              {/* Front Side */}
              <Animated.View style={[styles.flashcard, styles.frontCard, { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity }]}>
                <Text style={styles.flashcardWord}>{filteredItems[currentCardIndex].word}</Text>
                <TouchableOpacity style={styles.speakPill} onPress={() => speak(filteredItems[currentCardIndex].word)}>
                  <Ionicons name="volume-medium-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.speakPillText}>Speak</Text>
                </TouchableOpacity>
                <Text style={styles.flipPrompt}>Tap to see meaning</Text>
              </Animated.View>

              {/* Back Side */}
              <Animated.View style={[styles.flashcard, styles.backCard, { backgroundColor: theme.cardBg }, { transform: [{ rotateY: backInterpolate }], opacity: backOpacity }]}>
                <ScrollView 
                  style={{ width: '100%', flex: 1, marginBottom: 25 }}
                  contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={[styles.backWord, { color: theme.textPrimary }]}>{filteredItems[currentCardIndex].word}</Text>
                  <Text style={[styles.backMeaning, { color: theme.textSecondary }]}>{filteredItems[currentCardIndex].meaning}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.speakPill, { backgroundColor: COLORS.secondary, marginVertical: 10 }]} 
                    onPress={() => speak(filteredItems[currentCardIndex].meaning)}
                  >
                    <Ionicons name="volume-medium-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.speakPillText}>Speak Meaning</Text>
                  </TouchableOpacity>
                  
                  {!!filteredItems[currentCardIndex].exampleSentence && (
                    <Text style={[styles.backExample, { color: theme.textSecondary }]}>
                      Example: "{filteredItems[currentCardIndex].exampleSentence}"
                    </Text>
                  )}

                  {!!filteredItems[currentCardIndex].synonym && (
                    <Text style={[styles.backSynonym, { color: theme.textSecondary }]}>
                      Synonym: {filteredItems[currentCardIndex].synonym}
                    </Text>
                  )}
                </ScrollView>
                <Text style={[styles.flipPrompt, { color: theme.textSecondary }]}>Tap to flip back</Text>
              </Animated.View>
            </View>
          </TouchableOpacity>

          {/* Navigation controls */}
          <View style={styles.flashControls}>
            <TouchableOpacity style={[styles.controlBtn, isDark && { backgroundColor: '#334155' }]} onPress={prevCard}>
              <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteControl} onPress={() => toggleFavorite(filteredItems[currentCardIndex])}>
              <Ionicons
                name={filteredItems[currentCardIndex].favorite ? 'star' : 'star-outline'}
                size={28}
                color={filteredItems[currentCardIndex].favorite ? '#F59E0B' : theme.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlBtn, isDark && { backgroundColor: '#334155' }]} onPress={nextCard}>
              <Ionicons name="arrow-forward" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TAB 3: PRACTICE QUIZ */}
      {activeTab === 'quiz' && (
        <View style={styles.quizWrapper}>
          <StateView loading={quizLoading} error={quizError} onRetry={startQuiz}>
            {!quizFinished && quizQuestions.length > 0 && (
              <Card style={[styles.quizCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                {/* Header & Progress Bar */}
                <View style={styles.quizHeaderRow}>
                  <Text style={[styles.quizProgressText, { color: theme.textSecondary }]}>
                    Question {currentQuizIndex + 1} of {quizQuestions.length}
                  </Text>
                  <View style={styles.quizXpLivePill}>
                    <Ionicons name="flash" size={14} color="#F59E0B" />
                    <Text style={styles.quizXpLiveText}>+{quizScore * 10} XP</Text>
                  </View>
                </View>

                <View style={[styles.quizBarBackground, isDark && { backgroundColor: '#334155' }]}>
                  <View style={[styles.quizBarActive, { width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }]} />
                </View>

                {/* Prompt with Audio Pronunciation */}
                <Text style={[styles.quizPrompt, { color: theme.textSecondary }]}>What is the definition of:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 }}>
                  <Text style={[styles.quizWord, { color: theme.textPrimary }]}>{quizQuestions[currentQuizIndex].word}</Text>
                  <TouchableOpacity 
                    style={[styles.quizAudioIconBtn, isDark && { backgroundColor: '#334155' }]} 
                    onPress={() => speak(quizQuestions[currentQuizIndex].word)}
                  >
                    <Ionicons name="volume-medium" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                {/* Options List */}
                <View style={styles.optionsContainer}>
                  {quizQuestions[currentQuizIndex].options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === quizQuestions[currentQuizIndex].correctAnswer;
                    
                    let buttonStyle = [styles.optionBtn, { backgroundColor: isDark ? '#334155' : '#F8FAFC', borderColor: theme.cardBorder }];
                    let textStyle = [styles.optionBtnText, { color: theme.textPrimary }];

                    if (selectedAnswer !== null) {
                      if (isCorrect) {
                        buttonStyle = [styles.optionBtn, styles.optionCorrect];
                        textStyle = [styles.optionBtnText, styles.optionCorrectText];
                      } else if (isSelected) {
                        buttonStyle = [styles.optionBtn, styles.optionIncorrect];
                        textStyle = [styles.optionBtnText, styles.optionIncorrectText];
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={buttonStyle}
                        onPress={() => submitQuizAnswer(option)}
                        disabled={selectedAnswer !== null}
                        activeOpacity={0.8}
                      >
                        <Text style={[textStyle, { flex: 1 }]}>{option}</Text>
                        {selectedAnswer !== null && isCorrect && (
                          <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                        )}
                        {selectedAnswer !== null && isSelected && !isCorrect && (
                          <Ionicons name="close-circle" size={20} color="#B91C1C" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Feedback Box after selection */}
                {selectedAnswer !== null && (
                  <View style={[
                    styles.quizFeedbackBox, 
                    { backgroundColor: selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer ? (isDark ? 'rgba(34,197,94,0.15)' : '#F0FDF4') : (isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2') }
                  ]}>
                    <Text style={[
                      styles.quizFeedbackTitle, 
                      { color: selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer ? '#16A34A' : '#EF4444' }
                    ]}>
                      {selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer ? '🎉 Correct Answer! (+10 XP)' : '❌ Incorrect Choice'}
                    </Text>
                    <Text style={[styles.quizFeedbackDesc, { color: theme.textSecondary }]}>
                      Definition: "{quizQuestions[currentQuizIndex].correctAnswer}"
                    </Text>
                  </View>
                )}

                {/* Next button */}
                {selectedAnswer !== null && (
                  <TouchableOpacity style={styles.quizNextBtn} onPress={nextQuizQuestion}>
                    <Text style={styles.quizNextText}>
                      {currentQuizIndex === quizQuestions.length - 1 ? 'Finish & Claim XP' : 'Next Question'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </Card>
            )}

            {/* Quiz Completion & XP Rewards Screen */}
            {quizFinished && (
              <Card style={[styles.quizCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, alignItems: 'center', paddingVertical: 32 }]}>
                <LinearGradient colors={['#FCD34D', '#F59E0B']} style={styles.quizFinishBadgeCircle}>
                  <Ionicons name={quizScore === quizQuestions.length ? "trophy" : "ribbon"} size={48} color="#FFFFFF" />
                </LinearGradient>
                
                <Text style={[styles.finishTitle, { color: theme.textPrimary }]}>Quiz Completed!</Text>
                
                {/* Accuracy Pill */}
                <View style={[
                  styles.finishAccuracyPill, 
                  { backgroundColor: quizScore === quizQuestions.length ? '#DCFCE7' : '#FEF3C7' }
                ]}>
                  <Ionicons name="sparkles" size={14} color={quizScore === quizQuestions.length ? '#15803D' : '#D97706'} />
                  <Text style={[
                    styles.finishAccuracyText, 
                    { color: quizScore === quizQuestions.length ? '#15803D' : '#D97706' }
                  ]}>
                    {Math.round((quizScore / (quizQuestions.length || 1)) * 100)}% Accuracy ({quizScore}/{quizQuestions.length} Correct)
                  </Text>
                </View>

                {/* XP Breakdown Container */}
                <View style={[styles.xpBreakdownCard, { backgroundColor: isDark ? '#334155' : '#F8FAFC', borderColor: theme.cardBorder }]}>
                  <Text style={[styles.xpBreakdownHeader, { color: theme.textPrimary }]}>XP Rewards Breakdown</Text>
                  
                  <View style={styles.xpBreakdownRow}>
                    <Text style={[styles.xpBreakdownLabel, { color: theme.textSecondary }]}>⚡ Base Quiz Score</Text>
                    <Text style={[styles.xpBreakdownVal, { color: COLORS.primary }]}>+{quizScore * 10} XP</Text>
                  </View>

                  {quizScore === quizQuestions.length && quizQuestions.length > 0 && (
                    <View style={styles.xpBreakdownRow}>
                      <Text style={[styles.xpBreakdownLabel, { color: theme.textSecondary }]}>🔥 Perfect Score Bonus</Text>
                      <Text style={[styles.xpBreakdownVal, { color: '#F59E0B' }]}>+25 XP</Text>
                    </View>
                  )}

                  <View style={[styles.xpTotalRow, { borderTopColor: theme.cardBorder }]}>
                    <Text style={[styles.xpTotalLabel, { color: theme.textPrimary }]}>Total XP Added</Text>
                    <Text style={styles.xpTotalVal}>+{earnedXP} XP</Text>
                  </View>
                </View>

                <View style={{ width: '100%', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity style={styles.finishBtn} onPress={startQuiz}>
                    <Ionicons name="reload" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.finishBtnText}>Retake Quiz</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.finishBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} 
                    onPress={() => setActiveTab('list')}
                  >
                    <Text style={[styles.finishBtnText, { color: isDark ? '#F8FAFC' : '#475569' }]}>Back to Vocabulary List</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
          </StateView>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  addCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchFilterContainer: {
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  filterPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: COLORS.primary,
  },
  wordCard: {
    padding: 16,
    marginBottom: 12,
    borderColor: '#EEF2F6',
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
  },
  meaningText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '600',
  },
  exampleContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  exampleText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  flashcardsContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  flashcardsHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashcard: {
    width: CARD_WIDTH,
    height: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  frontCard: {
    backgroundColor: COLORS.primary,
  },
  backCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  flashcardWord: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  speakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  speakPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  flipPrompt: {
    position: 'absolute',
    bottom: 24,
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  backWord: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 12,
  },
  backMeaning: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  backExample: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  backSynonym: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
    textAlign: 'center',
  },
  flashControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 30,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteControl: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizWrapper: {
    flex: 1,
  },
  quizCard: {
    padding: 20,
    minHeight: 460,
  },
  quizHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quizProgressText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  quizXpLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quizXpLiveText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706',
  },
  quizBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  quizBarActive: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  quizPrompt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  quizWord: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.black,
  },
  quizAudioIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    gap: 10,
    marginTop: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 20,
  },
  optionCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  optionCorrectText: {
    color: '#15803D',
  },
  optionIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionIncorrectText: {
    color: '#B91C1C',
  },
  quizFeedbackBox: {
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
  },
  quizFeedbackTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  quizFeedbackDesc: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  quizNextBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  quizNextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  quizFinishBadgeCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  finishTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.black,
  },
  finishAccuracyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  finishAccuracyText: {
    fontSize: 13,
    fontWeight: '800',
  },
  xpBreakdownCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  xpBreakdownHeader: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  xpBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpBreakdownLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  xpBreakdownVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  xpTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
  },
  xpTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  xpTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#16A34A',
  },
  finishBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
