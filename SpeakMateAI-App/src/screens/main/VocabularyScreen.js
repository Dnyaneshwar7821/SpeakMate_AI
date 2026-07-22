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
      const items = await vocabularyService.all();
      setState({ loading: false, error: '', items });
    } catch (error) {
      setState({ loading: false, error: error.userMessage || 'Unable to load vocabulary.', items: [] });
    }
  };

  const loadSettingsAndVoices = async () => {
    try {
      const [s, voices, onboardingVoice] = await Promise.all([
        settingsService.get(),
        VoiceService.getAvailableEnglishVoices(),
        AsyncStorage.getItem('speakmate_onboarding_voice'),
      ]);
      setSettings({ ...s, onboardingVoice });
      setAvailableVoices(voices);
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
    if (!word.trim()) return;
    setSaving(true);
    try {
      await vocabularyService.add(word.trim());
      setWord('');
      Alert.alert('Success', `"${word.trim()}" added with AI definition.`);
      await load();
    } catch (error) {
      Alert.alert('Vocabulary failed', error.userMessage || 'Unable to add word.');
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
    const baseXP = finalScore * 10;
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
    <Screen title="Vocabulary" subtitle="Professional AI Vocabulary Coach & Quiz.">
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
