import React, { useCallback, useState } from 'react';
import {
  Alert,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { AppButton, Card, Screen, StateView } from '../../components/ui';
import { grammarService, settingsService } from '../../services/appServices';
import { VoiceService } from '../../services/VoiceService';
import { OnboardingVoiceService } from '../../services/OnboardingVoiceService';
import { COLORS } from '../../constants/colors';

const GRAMMAR_TOPICS = [
  {
    id: 'tenses',
    title: 'English Tenses',
    description: 'Learn Present, Past, and Future tenses and their aspects.',
    explanations: 'Tenses express the time of an action. Simple Present is for habits, Present Continuous is for actions happening now, Past Simple is for completed past actions, and Future is for upcoming events.',
    examples: [
      { original: 'She go to school yesterday.', corrected: 'She went to school yesterday.', rule: 'Use Past Simple form of "go" (went) for completed past actions.' },
      { original: 'I am playing tennis every Tuesday.', corrected: 'I play tennis every Tuesday.', rule: 'Use Simple Present instead of Present Continuous for recurring habits.' }
    ],
    quiz: [
      { question: 'Identify the correct sentence:', options: ['He has gone to Paris yesterday.', 'He went to Paris yesterday.', 'He goes to Paris yesterday.', 'He was go to Paris yesterday.'], correct: 'He went to Paris yesterday.' },
      { question: 'Complete: "I _______ English for three years now."', options: ['am study', 'studied', 'have been studying', 'studies'], correct: 'have been studying' }
    ]
  },
  {
    id: 'prepositions',
    title: 'Prepositions of Place & Time',
    description: 'Master when to use "in", "on", "at", "by", etc.',
    explanations: 'Use "at" for specific times and points. Use "on" for days/dates and surfaces. Use "in" for months/years, enclosed spaces, and general periods of time.',
    examples: [
      { original: 'Meet me on 9:00 PM.', corrected: 'Meet me at 9:00 PM.', rule: 'Use "at" for specific clock times.' },
      { original: 'I am in the bus.', corrected: 'I am on the bus.', rule: 'Use "on" for public transport vehicles like buses, trains, and planes.' }
    ],
    quiz: [
      { question: 'What is the correct preposition: "He graduated ____ 2021."', options: ['at', 'on', 'in', 'by'], correct: 'in' },
      { question: 'Complete: "The keys are lying _______ the kitchen table."', options: ['in', 'at', 'on', 'underneath of'], correct: 'on' }
    ]
  },
  {
    id: 'passive-voice',
    title: 'Active vs. Passive Voice',
    description: 'Understand focus shifts between subject and action object.',
    explanations: 'Use Active Voice when the subject performs the action. Use Passive Voice (Form: to be + past participle) when the object of the action is the main focus or the actor is unknown.',
    examples: [
      { original: 'The cake baked by my mom.', corrected: 'The cake was baked by my mom.', rule: 'Passive voice needs a form of "to be" (was/is/has been) before the past participle.' }
    ],
    quiz: [
      { question: 'Change to passive: "The chef cooked the food."', options: ['The food is cooked by the chef.', 'The food cooked by the chef.', 'The food was cooked by the chef.', 'The chef was cooked by the food.'], correct: 'The food was cooked by the chef.' }
    ]
  }
];

export default function GrammarScreen() {
  const { isDark, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('checker'); // 'checker', 'topics'
  const [text, setText] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [state, setState] = useState({ loading: true, error: '', history: [] });

  // Voice and User Settings State
  const [userSettings, setUserSettings] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  // Topic Modal State
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const loadSettingsAndVoices = async () => {
    try {
      const [s, voices] = await Promise.all([
        settingsService.get().catch(() => null),
        VoiceService.getAvailableEnglishVoices(),
      ]);
      setUserSettings(s);
      setAvailableVoices(voices);
    } catch (e) {
      console.warn("Failed to load settings in grammar screen:", e);
    }
  };

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const history = await grammarService.history();
      setState({ loading: false, error: '', history });
    } catch (error) {
      setState({ loading: false, error: error.userMessage || 'Unable to load grammar history.', history: [] });
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
      loadSettingsAndVoices();
    }, [])
  );

  const check = async () => {
    if (!text.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const response = await grammarService.check(text.trim());
      setResult(response);
      setText('');
      await load();

      // Read aloud full analysis feedback automatically!
      if (response) {
        speakFullFeedback(response);
      }
    } catch (error) {
      Alert.alert('Grammar check failed', error.userMessage || 'Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const getActiveVoiceType = async () => {
    if (userSettings && userSettings.aiVoice) {
      return userSettings.aiVoice;
    }
    try {
      const s = await settingsService.get();
      if (s) setUserSettings(s);
      if (s && s.aiVoice) return s.aiVoice;
    } catch (e) {}

    try {
      const onboardingConfig = await OnboardingVoiceService.load();
      if (onboardingConfig && onboardingConfig.style) return onboardingConfig.style;
    } catch (e) {}

    return 'Default';
  };

  const speakFullFeedback = async (res) => {
    if (!res) return;

    let currentVoices = availableVoices;
    try {
      if (!currentVoices || currentVoices.length === 0) {
        currentVoices = await VoiceService.getAvailableEnglishVoices();
        setAvailableVoices(currentVoices);
      }
    } catch (e) {}

    if (userSettings?.isMuted) return;

    const voiceType = await getActiveVoiceType();
    const isPerfect = res.grammarScore && res.grammarScore >= 100;
    
    let speechText = '';
    if (isPerfect) {
      speechText = `Your sentence is grammatically correct! ${res.explanation || ''}`;
    } else {
      speechText = `Corrected sentence: ${res.correctedText}. `;
      if (res.explanation) {
        speechText += `Grammar explanation: ${res.explanation}`;
      }
    }

    VoiceService.speak(speechText, {
      voiceType,
      availableVoices: currentVoices,
    });
  };

  const speakText = async (txt) => {
    if (!txt) return;

    let currentVoices = availableVoices;
    try {
      if (!currentVoices || currentVoices.length === 0) {
        currentVoices = await VoiceService.getAvailableEnglishVoices();
        setAvailableVoices(currentVoices);
      }
    } catch (e) {}

    if (userSettings?.isMuted) return;

    const voiceType = await getActiveVoiceType();
    VoiceService.speak(txt, {
      voiceType,
      availableVoices: currentVoices,
    });
  };

  const removeHistoryItem = async (id) => {
    Alert.alert('Delete Entry', 'Remove this check from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await grammarService.remove(id);
            setState((curr) => ({
              ...curr,
              history: curr.history.filter((h) => h.id !== id),
            }));
            if (result?.id === id) {
              setResult(null);
            }
          } catch (error) {
            Alert.alert('Error', 'Unable to remove history item.');
          }
        },
      },
    ]);
  };

  // Mini-Quiz Handlers
  const handleAnswerSelect = (opt) => {
    if (selectedQuizAnswer !== null) return;
    setSelectedQuizAnswer(opt);
    const correct = opt === selectedTopic.quiz[currentQuestionIndex].correct;
    if (correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizAnswer(null);
    if (currentQuestionIndex < selectedTopic.quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const startTopicQuiz = (topic) => {
    setSelectedTopic(topic);
    setQuizMode(true);
    setCurrentQuestionIndex(0);
    setSelectedQuizAnswer(null);
    setQuizScore(0);
    setQuizComplete(false);
  };

  const closeQuizModal = () => {
    setQuizMode(false);
    setSelectedTopic(null);
  };

  return (
    <Screen title="Grammar" subtitle="Learn grammar topics and analyze sentences.">
      {/* Tab bar */}
      <View style={[styles.tabContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'checker' && styles.tabButtonActive]}
          onPress={() => setActiveTab('checker')}
        >
          <Ionicons name="shield-checkmark" size={18} color={activeTab === 'checker' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'checker' && styles.tabButtonTextActive]}>AI Checker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'topics' && styles.tabButtonActive]}
          onPress={() => setActiveTab('topics')}
        >
          <Ionicons name="book" size={18} color={activeTab === 'topics' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'topics' && styles.tabButtonTextActive]}>Grammar Guide</Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: AI GRAMMAR CHECKER */}
      {activeTab === 'checker' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary }]}>Analyze English Sentences</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: isDark ? '#334155' : '#F8FAFC', borderColor: theme.cardBorder, color: theme.textPrimary }]}
              placeholder="Type or paste your English text here..."
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.textSecondary}
            />
            <AppButton title="Analyze & Correct" onPress={check} loading={checking} style={{ marginTop: 12 }} />
          </Card>

          {/* Grammar Result Card */}
          {!!result && (() => {
            const isPerfect = result.grammarScore && result.grammarScore >= 100;
            return (
              <Card style={[styles.resultCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>Analysis Feedback</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TouchableOpacity onPress={() => speakFullFeedback(result)} style={styles.audioPill}>
                      <Ionicons name="volume-medium" size={15} color={COLORS.primary} />
                      <Text style={styles.audioPillText}>Read</Text>
                    </TouchableOpacity>
                    <View style={[styles.scoreBadge, { backgroundColor: result.grammarScore >= 80 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }]}>
                      <Text style={[styles.scoreText, { color: result.grammarScore >= 80 ? '#16A34A' : '#EF4444' }]}>
                        {Math.round(result.grammarScore || 100)}% Accuracy
                      </Text>
                    </View>
                  </View>
                </View>

                {isPerfect ? (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Your Sentence (Perfect Grammar!)</Text>
                    <View style={[styles.feedbackBox, { backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : '#F0FDF4', borderColor: '#86EFAC' }]}>
                      <Text style={[styles.correctedFeedback, { color: isDark ? '#4ADE80' : '#166534' }]}>✅ {result.originalText}</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={{ marginBottom: 12 }}>
                      <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Original Sentence</Text>
                      <View style={[styles.feedbackBox, { backgroundColor: isDark ? '#334155' : '#FEF2F2', borderColor: '#FCA5A5' }]}>
                        <Text style={[styles.originalFeedback, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>❌ {result.originalText}</Text>
                      </View>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={[styles.subLabel, { color: theme.textSecondary }]}>AI Corrected Sentence</Text>
                      <View style={[styles.feedbackBox, { backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : '#F0FDF4', borderColor: '#86EFAC' }]}>
                        <Text style={[styles.correctedFeedback, { color: isDark ? '#4ADE80' : '#166534' }]}>✅ {result.correctedText}</Text>
                      </View>
                    </View>
                  </>
                )}

                {!!result.explanation && (
                  <View>
                    <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Grammar Rule & Explanation</Text>
                    <View style={[styles.explanationContainer, isDark && { backgroundColor: '#334155' }]}>
                      <Ionicons name="bulb-outline" size={18} color="#F59E0B" style={{ marginRight: 6, marginTop: 2 }} />
                      <Text style={[styles.explanationText, { color: theme.textPrimary }]}>{result.explanation}</Text>
                    </View>
                  </View>
                )}
              </Card>
            );
          })()}

          {/* History Timeline */}
          <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary, marginTop: 20, marginBottom: 8 }]}>Recent Analysis History</Text>
          <StateView
            loading={state.loading}
            error={state.error}
            empty={!state.history.length ? 'No previous grammar analysis entries yet.' : null}
            onRetry={load}
          >
            {state.history.map((item) => (
              <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={() => setResult(item)}>
                <Card style={[styles.historyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }, result?.id === item.id && { borderColor: COLORS.primary, borderWidth: 1.5 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.historyCorrected, { color: theme.textPrimary }]} numberOfLines={1}>
                      ✅ {item.correctedText}
                    </Text>
                    <TouchableOpacity onPress={() => removeHistoryItem(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.historyOriginal, { color: theme.textSecondary }]} numberOfLines={1}>
                    Original: {item.originalText}
                  </Text>
                  <View style={styles.historyFooter}>
                    <Text style={[styles.historyScore, { color: COLORS.primary }]}>Score: {item.grammarScore ?? 'N/A'}%</Text>
                    <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </StateView>
        </ScrollView>
      )}

      {/* TAB 2: GRAMMAR TOPICS GUIDE */}
      {activeTab === 'topics' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {GRAMMAR_TOPICS.map((topic) => (
            <Card key={topic.id} style={[styles.topicCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={styles.topicHeader}>
                <Text style={[styles.topicTitle, { color: theme.textPrimary }]}>{topic.title}</Text>
                <Ionicons name="book-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={[styles.topicDesc, { color: theme.textSecondary }]}>{topic.description}</Text>
              
              <View style={styles.topicSection}>
                <Text style={[styles.topicHeading, { color: theme.textPrimary }]}>Core Concept</Text>
                <Text style={[styles.topicBody, { color: theme.textSecondary }]}>{topic.explanations}</Text>
              </View>

              <View style={styles.topicSection}>
                <Text style={[styles.topicHeading, { color: theme.textPrimary }]}>Examples</Text>
                {topic.examples.map((ex, idx) => (
                  <View key={idx} style={[styles.topicExampleBox, isDark && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                    <Text style={styles.exOriginal}>❌ {ex.original}</Text>
                    <Text style={styles.exCorrected}>✅ {ex.corrected}</Text>
                    <Text style={[styles.exRule, { color: theme.textSecondary }]}>{ex.rule}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.practiceBtn} onPress={() => startTopicQuiz(topic)}>
                <Text style={styles.practiceBtnText}>Practice Topic Quiz</Text>
                <Ionicons name="play-circle" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Interactive Quiz Modal */}
      {quizMode && selectedTopic && (
        <Modal animationType="slide" transparent visible={quizMode} onRequestClose={closeQuizModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{selectedTopic.title} Quiz</Text>
                <TouchableOpacity onPress={closeQuizModal}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              {!quizComplete ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={[styles.quizProgress, { color: theme.textSecondary }]}>Question {currentQuestionIndex + 1} of {selectedTopic.quiz.length}</Text>
                  <Text style={[styles.quizQuestionText, { color: theme.textPrimary }]}>{selectedTopic.quiz[currentQuestionIndex].question}</Text>
                  
                  <View style={{ gap: 8, marginTop: 16 }}>
                    {selectedTopic.quiz[currentQuestionIndex].options.map((option, idx) => {
                      const isSelected = selectedQuizAnswer === option;
                      const isCorrect = option === selectedTopic.quiz[currentQuestionIndex].correct;
                      
                      let btnStyle = [styles.quizOption, { backgroundColor: isDark ? '#334155' : '#F8FAFC', borderColor: theme.cardBorder }];
                      let txtStyle = [styles.quizOptionText, { color: theme.textPrimary }];

                      if (selectedQuizAnswer !== null) {
                        if (isCorrect) {
                          btnStyle = [styles.quizOption, styles.quizCorrect];
                          txtStyle = [styles.quizOptionText, styles.quizCorrectText];
                        } else if (isSelected) {
                          btnStyle = [styles.quizOption, styles.quizIncorrect];
                          txtStyle = [styles.quizOptionText, styles.quizIncorrectText];
                        }
                      }

                      return (
                        <TouchableOpacity
                          key={idx}
                          style={btnStyle}
                          onPress={() => handleAnswerSelect(option)}
                          disabled={selectedQuizAnswer !== null}
                        >
                          <Text style={txtStyle}>{option}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {selectedQuizAnswer !== null && (
                    <TouchableOpacity style={styles.modalNextBtn} onPress={handleNextQuizQuestion}>
                      <Text style={styles.modalNextText}>
                        {currentQuestionIndex === selectedTopic.quiz.length - 1 ? 'Finish' : 'Next'}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="medal" size={64} color="#CA8A04" />
                  <Text style={[styles.finishTitle, { color: theme.textPrimary }]}>Quiz Complete!</Text>
                  <Text style={[styles.finishScore, { color: theme.textSecondary }]}>You scored {quizScore} out of {selectedTopic.quiz.length}</Text>
                  <Text style={styles.finishReward}>+15 XP Earned</Text>
                  <TouchableOpacity style={styles.finishCloseBtn} onPress={closeQuizModal}>
                    <Text style={styles.finishCloseText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
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
  inputCard: {
    padding: 16,
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
    textAlignVertical: 'top',
    height: 100,
  },
  resultCard: {
    padding: 16,
    marginBottom: 14,
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.black,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
  },
  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  audioPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  originalFeedback: {
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '600',
  },
  correctedFeedback: {
    fontSize: 15,
    color: '#166534',
    fontWeight: '800',
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  explanationText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '600',
    flex: 1,
  },
  historyCard: {
    padding: 14,
    marginBottom: 10,
    borderColor: '#F1F5F9',
  },
  historyCorrected: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
    flex: 1,
    marginRight: 10,
  },
  historyOriginal: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  historyScore: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  historyDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  topicCard: {
    padding: 16,
    marginBottom: 16,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
  },
  topicDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  topicSection: {
    marginTop: 12,
  },
  topicHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  topicBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '600',
  },
  topicExampleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    gap: 4,
  },
  exOriginal: {
    fontSize: 12,
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  exCorrected: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '800',
  },
  exRule: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  practiceBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  practiceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
  },
  quizProgress: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  quizQuestionText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.black,
    marginTop: 6,
    marginBottom: 16,
  },
  quizOption: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
  },
  quizOptionText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
  },
  quizCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  quizCorrectText: {
    color: '#15803D',
  },
  quizIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  quizIncorrectText: {
    color: '#B91C1C',
  },
  modalNextBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  modalNextText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  finishTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.black,
    marginTop: 12,
  },
  finishScore: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  finishReward: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.success,
    marginTop: 8,
    marginBottom: 20,
  },
  finishCloseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 44,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
