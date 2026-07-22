/**
 * LessonDetailScreen — Phase 2
 * Full lesson detail view: cover, objectives, skills, sections, progress, start/resume/complete.
 * Includes interactive Study Mode overlay with dynamic quizzes and step progress synchronization.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Modal,
  Platform,
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
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { lessonModuleService, settingsService, aiService, progressService, speechService } from '../../services/appServices';
import { VoiceService } from '../../services/VoiceService';
import { COLORS } from '../../constants/colors';

// ─── Helpers & Quizzes ────────────────────────────────────────────────────────

const DIFF_COLORS = {
  Beginner: { bg: '#DCFCE7', text: '#16A34A' },
  Intermediate: { bg: '#FEF9C3', text: '#CA8A04' },
  Advanced: { bg: '#FEE2E2', text: '#DC2626' },
};

const LESSON_QUIZZES = {
  "Present Tenses Mastery": {
    question: "Select the sentence in the Present Continuous tense:",
    options: ["She plays tennis every Tuesday.", "She is playing tennis right now.", "She played tennis yesterday.", "She will play tennis tomorrow."],
    answerIndex: 1,
    explanation: "Present Continuous is formed with subject + be + verb-ing, used for actions happening now."
  },
  "Past Tenses Deep Dive": {
    question: "Choose the correct sentence comparing simple past and past continuous:",
    options: ["While I was cooking, the phone rang.", "While I cooked, the phone was ringing.", "While I had cooked, the phone rang.", "I was cooking when the phone was ringing."],
    answerIndex: 0,
    explanation: "We use the past continuous for the longer background action, and simple past for the shorter interrupting action."
  },
  "Conditionals: If Sentences": {
    question: "Which of the following is a Second Conditional (hypothetical present/future) sentence?",
    options: ["If it rains, we will stay home.", "If I won the lottery, I would buy a house.", "If you heat ice, it melts.", "If I had studied, I would have passed."],
    answerIndex: 1,
    explanation: "Second conditional uses 'if + simple past, would + base verb' for hypothetical or unlikely situations."
  },
  "Essential 500 Words": {
    question: "Which word is a synonym for 'essential'?",
    options: ["Optional", "Crucial", "Secondary", "Trivial"],
    answerIndex: 1,
    explanation: "'Essential' means absolutely necessary or extremely important; 'crucial' is a direct synonym."
  },
  "Idioms and Phrases": {
    question: "What does the idiom 'bite the bullet' mean?",
    options: ["To eat something hard", "To face a difficult situation with courage", "To get angry quickly", "To make a minor mistake"],
    answerIndex: 1,
    explanation: "'Bite the bullet' means to endure a painful or difficult situation that is unavoidable."
  },
  "Business Vocabulary": {
    question: "What does it mean to 'postpone' a meeting?",
    options: ["To cancel it permanently", "To delay it to a later time", "To hold it earlier than scheduled", "To start it on time"],
    answerIndex: 1,
    explanation: "To postpone is to arrange for something to take place at a time later than that first planned."
  },
  "Speak with Confidence": {
    question: "Which is the most polite way to ask someone to repeat themselves?",
    options: ["What?", "Repeat that.", "Could you say that again, please?", "I didn't hear."],
    answerIndex: 2,
    explanation: "'Could you say that again, please?' is formal, polite, and clear."
  },
  "Storytelling in English": {
    question: "Which word is a transition marker used to indicate a sudden turn of events?",
    options: ["Furthermore", "Suddenly", "In conclusion", "Likewise"],
    answerIndex: 1,
    explanation: "'Suddenly' is used to show that something happens quickly and unexpectedly in a story."
  },
  "English Vowel Sounds": {
    question: "Which pair of words contains a 'minimal pair' for vowel sounds?",
    options: ["Ship and Sheep", "Cat and Dog", "Run and Walk", "Big and Large"],
    answerIndex: 0,
    explanation: "Minimal pairs differ by only one sound. 'Ship' (/ɪ/) and 'Sheep' (/iː/) differ only by the vowel sound."
  },
  "Word Stress Patterns": {
    question: "In the word 'RECORD' (noun, as in 'a music record'), where is the stress?",
    options: ["On the first syllable: RE-cord", "On the second syllable: re-CORD", "Both syllables are stressed equally", "No syllable is stressed"],
    answerIndex: 0,
    explanation: "For most two-syllable nouns, the stress is on the first syllable (RE-cord). For verbs, it's on the second (re-CORD)."
  },
  "Everyday Conversations": {
    question: "What is the natural response to 'How's it going?'",
    options: ["I go to the store.", "Pretty good, thanks! How about you?", "Yes, it is going.", "Fine. How do you do."],
    answerIndex: 1,
    explanation: "'Pretty good, thanks!' is a natural, friendly, and common response to the casual greeting 'How's it going?'."
  },
  "Debate and Persuasion": {
    question: "Which phrase is used to disagree politely in a discussion?",
    options: ["You are completely wrong.", "I see your point, but I have a different view.", "That makes no sense.", "Whatever you say."],
    answerIndex: 1,
    explanation: "'I see your point, but...' acknowledges the other person's input while politely offering a contrasting opinion."
  },
  "Listen and Understand: Accents": {
    question: "In Australian English, what does the slang word 'Arvo' mean?",
    options: ["Morning", "Afternoon", "Evening", "Night"],
    answerIndex: 1,
    explanation: "'Arvo' is a very common Australian slang term for afternoon."
  },
  "Professional Email Writing": {
    question: "Which of the following is the most professional email greeting for a client?",
    options: ["Hey there,", "Dear Mr. Smith,", "What's up,", "Yo Smith,"],
    answerIndex: 1,
    explanation: "'Dear [Title] [Lastname],' is the standard, most respected formal greeting in business email communication."
  },
  "Presentations in English": {
    question: "What is a good phrase to transition to a new slide or topic?",
    options: ["Look at this.", "Now, let's move on to the next point.", "I am done with that.", "Stop talking about this."],
    answerIndex: 1,
    explanation: "'Let's move on to...' is a clear, standard signpost transition phrase in presentations."
  },
  "Common Interview Questions": {
    question: "When asked 'What is your greatest weakness?', how should you respond?",
    options: ["Say you don't have any weaknesses.", "Mention a weakness and explain how you are working to improve it.", "State a major flaw that would prevent you from doing the job.", "Joke about it to avoid answering."],
    answerIndex: 1,
    explanation: "The best strategy is to show self-awareness by naming a real but manageable weakness, followed by a positive step you are taking to fix it."
  },
  "At the Airport": {
    question: "Where do you go to get your boarding pass and drop off large bags?",
    options: ["Security Control", "Check-in Desk", "Duty Free", "Gate 14"],
    answerIndex: 1,
    explanation: "You go to the check-in/bag-drop desk of your airline to get your boarding pass and check in large luggage."
  },
  "Hotel and Accommodation": {
    question: "If you want to request a room with a single large bed for two people, you should ask for a:",
    options: ["Single Room", "Double Room / King Room", "Twin Room", "Suite"],
    answerIndex: 1,
    explanation: "A Twin room has two separate single beds. A Double or King room has a single large bed suitable for two people."
  },
  "Morning Routines": {
    question: "Choose the correct sentence describing a routine:",
    options: ["I am waking up at 7 AM every day.", "I wake up at 7 AM every day.", "I wakes up at 7 AM every day.", "I woke up at 7 AM every day."],
    answerIndex: 1,
    explanation: "For habitual actions or daily routines, we use the simple present tense: 'I wake up...'."
  },
  "Talking About Food": {
    question: "If a dish is described as 'savory', it means it is:",
    options: ["Very sweet", "Salty or spicy, not sweet", "Sour like a lemon", "Bitter and burnt"],
    answerIndex: 1,
    explanation: "'Savory' refers to food that is salty, spicy, or generally non-sweet."
  }
};

const DEFAULT_QUIZ = {
  question: "Which of the following is crucial for English learning success?",
  options: ["Avoiding practice", "Consistent daily speaking", "Only reading books", "Memorizing grammar tables only"],
  answerIndex: 1,
  explanation: "Consistent active practice is the key to speech fluency."
};

function InfoChip({ icon, label, color = COLORS.text }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

function SectionRow({ index, title }) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionNum}>
        <Text style={styles.sectionNumText}>{index + 1}</Text>
      </View>
      <View style={styles.sectionConnector} />
      <Text style={[styles.sectionRowTitle, { color: theme.textPrimary }]}>{title}</Text>
    </View>
  );
}

function SkillTag({ label }) {
  const { isDark } = useTheme();
  return (
    <View style={[styles.skillTag, isDark && { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
      <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
      <Text style={styles.skillTagText}>{label}</Text>
    </View>
  );
}

function ObjectiveRow({ label }) {
  const { theme } = useTheme();
  return (
    <View style={styles.objRow}>
      <Ionicons name="checkmark" size={16} color={COLORS.success} style={{ marginTop: 1 }} />
      <Text style={[styles.objText, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

// ─── Mic Wave Bar ─────────────────────────────────────────────────────────────

function MicWaveBar({ baseHeight, isRecording, delay = 0 }) {
  const anim = useRef(new Animated.Value(baseHeight)).current;

  useEffect(() => {
    let loop;
    if (isRecording) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: baseHeight * (1.4 + Math.random() * 1.2), duration: 220 + delay * 0.5, useNativeDriver: false }),
          Animated.timing(anim, { toValue: baseHeight * 0.5, duration: 220 + delay * 0.5, useNativeDriver: false }),
        ])
      );
      loop.start();
    } else {
      anim.setValue(baseHeight);
    }
    return () => { if (loop) loop.stop(); };
  }, [isRecording]);

  return (
    <Animated.View style={{ width: 5, height: anim, borderRadius: 3, backgroundColor: COLORS.primary, opacity: 0.85 }} />
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LessonDetailScreen({ navigation, route }) {
  const { isDark, theme } = useTheme();
  const { lessonId } = route.params || {};

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // 9-Step Study Flow State (Step 0 to Step 8)
  const [showStudy, setShowStudy] = useState(false);
  const [studyStep, setStudyStep] = useState(0); 

  // Step 4: Check Understanding State
  const [checkSelected, setCheckSelected] = useState(null);
  const [checkSubmitted, setCheckSubmitted] = useState(false);

  // Step 5: Guided Practice State
  const [guidedInput, setGuidedInput] = useState('');
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);

  // Step 6 & 7: Speaking Practice & AI Feedback State
  const [speakingInput, setSpeakingInput] = useState('');
  const [evaluatingSpeaking, setEvaluatingSpeaking] = useState(false);
  const [speakingFeedback, setSpeakingFeedback] = useState(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // AI Tutor Q&A State
  const [tutorInput, setTutorInput] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);

  // Auto AI Teaching State (Step 2)
  const [aiTeachContent, setAiTeachContent] = useState('');
  const [aiTeachLoading, setAiTeachLoading] = useState(false);

  // Auto AI Examples State (Step 3)
  const [aiExamples, setAiExamples] = useState([]);
  const [aiExamplesLoading, setAiExamplesLoading] = useState(false);

  // Auto AI Check Question State (Step 4)
  const [aiCheckQ, setAiCheckQ] = useState(null);   // { question, options:[3], correctIndex, explanation }
  const [aiCheckQLoading, setAiCheckQLoading] = useState(false);

  // Auto AI Guided Practice State (Step 5)
  const [aiGuidedQ, setAiGuidedQ] = useState(null);  // { sentence, blank, correctWord, hint, explanation }
  const [aiGuidedQLoading, setAiGuidedQLoading] = useState(false);

  // Dynamic 3-Level Quiz State
  const [quizLevel, setQuizLevel] = useState('Basic'); // 'Basic', 'Intermediate', 'Advanced'
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const quizScoreRef = useRef(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // AI Tutor Voice State
  const [settings, setSettings] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isSpeakingContent, setIsSpeakingContent] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  // ── Load ────────────────────────────────────────────────────────────
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
      console.warn("Failed to load settings in lesson detail screen:", e);
    }
  };
  useEffect(() => {
    if (!lessonId) return;
    loadLesson();
    loadSettingsAndVoices();
  }, [lessonId]);

  // Reload settings and voices whenever the screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const [s, voices, onboardingVoice] = await Promise.all([
          settingsService.get(),
          VoiceService.getAvailableEnglishVoices(),
          AsyncStorage.getItem('speakmate_onboarding_voice'),
        ]);
        setSettings({ ...s, onboardingVoice });
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      } catch (e) {
        console.warn("Failed to reload user voice preference on focus in lesson detail:", e);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const loadLesson = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await lessonModuleService.detail(lessonId);
      setLesson(data);
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch (e) {
      setError('Failed to load lesson. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clean text before sending to TTS so symbols aren't read aloud
  const sanitizeForSpeech = (raw = '') => {
    return raw
      // Curly / smart quotes → plain
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      // Em-dash, en-dash → pause
      .replace(/[\u2014\u2013]/g, ', ')
      // Ellipsis character → natural pause
      .replace(/\u2026/g, '... ')
      // Bullet & list symbols
      .replace(/[•·▸▶►▪▫◦‣⁃]/g, '. ')
      // Markdown bold/italic asterisks
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      // Markdown headers (## Title)
      .replace(/^#{1,4}\s*/gm, '')
      // Numbered list markers like "1." "2."
      .replace(/^\d+\.\s+/gm, '')
      // All emoji characters
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      // Remove leftover backticks or underscores used for formatting
      .replace(/[`_]/g, '')
      // Collapse multiple spaces/newlines into single space
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/  +/g, ' ')
      .trim();
  };

  const readLessonStep = (text) => {
    if (isSpeakingContent) {
      VoiceService.stop();
      setIsSpeakingContent(false);
      return;
    }
    
    setIsSpeakingContent(true);
    VoiceService.speak(sanitizeForSpeech(text), {
      voiceType: settings?.aiVoice || 'Default',
      availableVoices,
      onDone: () => setIsSpeakingContent(false),
      onError: () => setIsSpeakingContent(false),
    });
  };

  useEffect(() => {
    VoiceService.stop();
    setIsSpeakingContent(false);
  }, [studyStep, showStudy]);

  // ── Auto AI Teaching: fires automatically on Step 2 ─────────────────
  useEffect(() => {
    if (!showStudy || studyStep !== 1 || !lesson) return;
    if (aiTeachContent) return; // already loaded, don't re-fetch

    const autoTeach = async () => {
      setAiTeachLoading(true);
      setAiTeachContent('');
      try {
        const prompt = [
          `You are an expert English teacher. Teach the lesson "${lesson.title}" (Category: ${lesson.category}, Level: ${lesson.level}) to a student.`,
          `Structure your teaching in these clear sections:`,
          `1. WHAT IS THIS TOPIC: Explain what "${lesson.title}" means in simple, friendly words. Don't just recite a definition — explain it like a passionate teacher.`,
          `2. WHY IT MATTERS: Tell the student why mastering this topic will improve their English fluency and confidence in real life.`,
          `3. HOW TO MASTER IT: Give 3-4 clear, actionable steps or tips the student should follow to get really good at this topic.`,
          `4. COMMON MISTAKES: List 2-3 typical mistakes that learners often make with this topic, and how to avoid them.`,
          `Keep the tone warm, encouraging, and conversational. Use simple language. Total length: 200-250 words.`
        ].join('\n');

        const res = await aiService.lessonTutor(prompt);
        if (res?.response) {
          setAiTeachContent(res.response);
          // Auto-read via voice right after loading (sanitized so symbols aren't spoken)
          VoiceService.speak(sanitizeForSpeech(res.response), {
            voiceType: settings?.aiVoice || 'Default',
            availableVoices,
            onDone: () => setIsSpeakingContent(false),
            onError: () => setIsSpeakingContent(false),
          });
          setIsSpeakingContent(true);
        }
      } catch (err) {
        console.warn('Auto AI teach failed:', err);
        setAiTeachContent(
          `Let\'s explore "${lesson.title}" together!\n\n` +
          `This topic is a key part of ${lesson.category} in English. ` +
          `${lesson.description || 'Mastering this will significantly boost your fluency and confidence.'}\n\n` +
          `To master this topic:\n• Practice daily with real sentences\n• Listen to native speakers\n• Speak out loud, even alone\n• Review your mistakes and learn from them\n\n` +
          `Common mistakes to avoid:\n• Translating word-for-word from your native language\n• Skipping speaking practice and only reading\n• Ignoring pronunciation and natural rhythm`
        );
      } finally {
        setAiTeachLoading(false);
      }
    };

    autoTeach();
  }, [showStudy, studyStep, lesson]);

  // ── Auto AI Examples: fires automatically on Step 3 ─────────────────
  useEffect(() => {
    if (!showStudy || studyStep !== 2 || !lesson) return;
    if (aiExamples.length > 0) return; // already loaded

    const autoExamples = async () => {
      setAiExamplesLoading(true);
      setAiExamples([]);
      try {
        const prompt = [
          `You are an expert English teacher. Generate exactly 4 real-world example sentences for the lesson: "${lesson.title}" (${lesson.category} - ${lesson.level} level).`,
          `For EACH example, also write a 1-2 sentence explanation that teaches WHY this sentence is a good example of the lesson concept and what rule it demonstrates.`,
          `Format as a JSON array of objects with keys:`,
          `  "sentence": the example sentence (under 20 words)`,
          `  "context": one-line label e.g. "At work" or "With friends"`,
          `  "explanation": 1-2 sentences explaining what rule this example shows and WHY it works`,
          `Make examples progressively more natural. Only output the JSON array, no other text.`
        ].join('\n');

        const res = await aiService.lessonTutor(prompt);
        if (res?.response) {
          let jsonStr = res.response.trim();
          const start = jsonStr.indexOf('[');
          const end = jsonStr.lastIndexOf(']');
          if (start !== -1 && end > start) jsonStr = jsonStr.substring(start, end + 1);
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAiExamples(parsed);
            return;
          }
        }
        throw new Error('Invalid examples response');
      } catch (err) {
        console.warn('Auto AI examples failed, using fallback:', err);
        setAiExamples([
          { sentence: `She has been studying English for three years now.`, context: 'Everyday life', explanation: `This shows the present perfect continuous tense correctly — "has been" + verb-ing for ongoing actions that started in the past.` },
          { sentence: `Could you please explain that point again?`, context: 'In a meeting', explanation: 'Using "Could you" makes a polite request. Native speakers prefer this over "Can you" in formal settings.' },
          { sentence: `I would have called you if I had known earlier.`, context: 'With a friend', explanation: 'This is a third conditional sentence — used for imaginary past situations and their hypothetical results.' },
          { sentence: `The report needs to be submitted by Friday.`, context: 'At work', explanation: '"Needs to be" is passive voice — used when the action matters more than who does it, common in professional English.' },
        ]);
      } finally {
        setAiExamplesLoading(false);
      }
    };

    autoExamples();
  }, [showStudy, studyStep, lesson]);

  // ── Auto AI Check Question: fires automatically on Step 4 ─────────────
  useEffect(() => {
    if (!showStudy || studyStep !== 3 || !lesson) return;
    if (aiCheckQ) return; // already loaded

    const autoCheckQ = async () => {
      setAiCheckQLoading(true);
      setCheckSelected(null);
      setCheckSubmitted(false);
      try {
        const seed = Math.floor(Math.random() * 1000);
        const prompt = [
          `Generate ONE random comprehension question to test if a student understood the lesson: "${lesson.title}" (${lesson.category} - ${lesson.level}).`,
          `The question must be SPECIFIC to "${lesson.title}" — not generic. Randomize the topic angle each time (seed: ${seed}).`,
          `Provide exactly 3 answer options. Only one is correct.`,
          `Format as JSON with keys:`,
          `  "question": the question string`,
          `  "options": array of exactly 3 strings`,
          `  "correctIndex": 0, 1, or 2 (the index of the correct option)`,
          `  "explanation": 1-2 sentences explaining WHY the correct answer is right`,
          `Only output the JSON object, no other text.`
        ].join('\n');

        const res = await aiService.lessonTutor(prompt);
        if (res?.response) {
          let jsonStr = res.response.trim();
          const start = jsonStr.indexOf('{');
          const end = jsonStr.lastIndexOf('}');
          if (start !== -1 && end > start) jsonStr = jsonStr.substring(start, end + 1);
          const parsed = JSON.parse(jsonStr);
          if (parsed?.question && Array.isArray(parsed.options) && parsed.options.length === 3) {
            setAiCheckQ(parsed);
            return;
          }
        }
        throw new Error('Invalid check question response');
      } catch (err) {
        console.warn('Auto AI check question failed, using fallback:', err);
        setAiCheckQ({
          question: `What is the most important thing to remember when using "${lesson.title}" in a real conversation?`,
          options: [
            'Focus on correct structure, natural rhythm, and clear meaning.',
            'Translate every word directly from your native language.',
            'Memorize rules without ever practicing in sentences.',
          ],
          correctIndex: 0,
          explanation: 'Applying the rule in real sentences with natural rhythm is the key to truly mastering any English concept.',
        });
      } finally {
        setAiCheckQLoading(false);
      }
    };

    autoCheckQ();
  }, [showStudy, studyStep, lesson]);

  // ── Auto AI Guided Practice: fires automatically on Step 5 ───────────
  useEffect(() => {
    if (!showStudy || studyStep !== 4 || !lesson) return;
    if (aiGuidedQ) return; // already loaded

    const autoGuidedQ = async () => {
      setAiGuidedQLoading(true);
      setGuidedInput('');
      setGuidedSubmitted(false);
      try {
        const seed = Math.floor(Math.random() * 1000);
        const prompt = [
          `Create ONE fill-in-the-blank practice sentence for the English lesson: "${lesson.title}" (${lesson.category} - ${lesson.level}).`,
          `The blank should test the student's understanding of "${lesson.title}". Randomize the sentence each time (seed: ${seed}).`,
          `Format as JSON with keys:`,
          `  "sentence": the full sentence with "______" as the blank (e.g. "She ______ to the store yesterday.")`,
          `  "correctWord": the exact word or short phrase that fills the blank`,
          `  "hint": a 1-line hint that guides without giving away the answer`,
          `  "explanation": 1-2 sentences explaining why the correct word is right`,
          `Only output the JSON object, no other text.`
        ].join('\n');

        const res = await aiService.lessonTutor(prompt);
        if (res?.response) {
          let jsonStr = res.response.trim();
          const start = jsonStr.indexOf('{');
          const end = jsonStr.lastIndexOf('}');
          if (start !== -1 && end > start) jsonStr = jsonStr.substring(start, end + 1);
          const parsed = JSON.parse(jsonStr);
          if (parsed?.sentence && parsed?.correctWord) {
            setAiGuidedQ(parsed);
            return;
          }
        }
        throw new Error('Invalid guided question response');
      } catch (err) {
        console.warn('Auto AI guided practice failed, using fallback:', err);
        setAiGuidedQ({
          sentence: `Every day I ______ new English phrases to improve my fluency.`,
          correctWord: 'practice',
          hint: 'Think of a verb meaning to do something repeatedly to get better at it.',
          explanation: '"Practice" is the correct verb here — a habitual action done daily requires the simple present tense.',
        });
      } finally {
        setAiGuidedQLoading(false);
      }
    };

    autoGuidedQ();
  }, [showStudy, studyStep, lesson]);

  // Dynamic Quiz Loader
  const generateFallbackQuestions = (title, levelTier) => {
    const pfx = levelTier === 'Advanced' ? '[Advanced Challenge] ' : (levelTier === 'Intermediate' ? '[Intermediate] ' : '[Basic Concept] ');
    return [
      {
        question: `${pfx}What is the core rule or principle taught in "${title}"?`,
        options: [
          "Focus on clarity, correct structure, and natural context.",
          "Memorize dictionary words without using them in sentences.",
          "Translate literally word-for-word from your native language.",
          "Avoid using any sentence punctuation or natural pauses."
        ],
        correctAnswer: "Focus on clarity, correct structure, and natural context.",
        explanation: "Effective English communication requires sentence clarity, proper structure, and contextual practice."
      },
      {
        question: `${pfx}Which sentence demonstrates correct practical usage for this topic?`,
        options: [
          "I am practicing this concept every day to communicate fluently.",
          "I practicing concept everyday to communicate fluent.",
          "I practice this concept everyday for communicate fluently.",
          "Me practice concept everyday fluently."
        ],
        correctAnswer: "I am practicing this concept every day to communicate fluently.",
        explanation: "This option uses proper verb tenses, correct prepositions ('to communicate'), and clear adverbs."
      },
      {
        question: `${pfx}What common mistake should learners avoid when studying "${title}"?`,
        options: [
          "Overcomplicating sentences and ignoring correct verb forms.",
          "Asking clarifying questions when practicing with others.",
          "Listening to native speech audio examples.",
          "Using polite expressions and conversational fillers."
        ],
        correctAnswer: "Overcomplicating sentences and ignoring correct verb forms.",
        explanation: "Keeping sentences well-structured and using proper verb forms prevents major communication errors."
      },
      {
        question: `${pfx}In a real-world conversation, how should you apply this lesson?`,
        options: [
          "Use structured, confident expressions suited to the context.",
          "Speak as fast as possible without pausing or taking breath.",
          "Avoid eye contact and speak in a completely flat tone.",
          "Never check sentence structure or word meanings."
        ],
        correctAnswer: "Use structured, confident expressions suited to the context.",
        explanation: "Using well-structured and confident phrases creates clear, impressive speech."
      },
      {
        question: `${pfx}Which key takeaway best summarizes "${title}"?`,
        options: [
          "Consistent daily practice and active application build fluency.",
          "Grammar rules are unnecessary for spoken communication.",
          "Vocabulary should only be studied in isolation.",
          "Accent is more important than clear message delivery."
        ],
        correctAnswer: "Consistent daily practice and active application build fluency.",
        explanation: "Regular practice combined with active application is the proven key to mastering English."
      }
    ];
  };

  const fetchDynamicQuiz = async (tier = quizLevel) => {
    if (!lesson) return;
    setQuizLoading(true);
    setQuizError('');
    setQuizFinished(false);
    setQuizScore(0);
    quizScoreRef.current = 0;
    setCurrentQuizIdx(0);
    setQuizSelectedAnswer(null);
    setEarnedXP(0);

    try {
      const prompt = `Lesson Title: "${lesson.title}", Category: "${lesson.category}", Level: "${lesson.level}", Quiz Tier: "${tier}"`;
      const res = await aiService.lessonQuiz(prompt);
      let questions = [];
      if (res?.response) {
        let jsonStr = res.response.trim();
        let start = jsonStr.indexOf("[");
        let end = jsonStr.lastIndexOf("]");
        if (start !== -1 && end !== -1 && end > start) {
          jsonStr = jsonStr.substring(start, end + 1);
        }
        questions = JSON.parse(jsonStr);
      }
      if (Array.isArray(questions) && questions.length === 5) {
        setQuizQuestions(questions);
      } else {
        setQuizQuestions(generateFallbackQuestions(lesson.title, tier));
      }
    } catch (err) {
      console.warn("AI Quiz fetch failed, using fallback questions:", err);
      setQuizQuestions(generateFallbackQuestions(lesson.title, tier));
    } finally {
      setQuizLoading(false);
    }
  };

  const changeQuizLevel = (newTier) => {
    setQuizLevel(newTier);
    fetchDynamicQuiz(newTier);
  };

  const askAiTutor = async (customPrompt) => {
    const query = customPrompt || tutorInput;
    if (!query.trim()) return;
    setTutorLoading(true);
    setTutorResponse('');
    try {
      const promptText = `Lesson Title: "${lesson?.title}" (${lesson?.category} - ${lesson?.level}). Student Question/Topic: "${query.trim()}"`;
      const res = await aiService.lessonTutor(promptText);
      if (res?.response) {
        setTutorResponse(res.response);
        VoiceService.speak(sanitizeForSpeech(res.response), {
          voiceType: settings?.aiVoice || 'Default',
          availableVoices,
        });
      }
      setTutorInput('');
    } catch (err) {
      Alert.alert('AI Tutor Error', 'Unable to get response from AI Tutor.');
    } finally {
      setTutorLoading(false);
    }
  };

  const handleToggleVoiceRecord = async () => {
    if (isVoiceRecording) {
      // Stop recording and transcribe
      setIsVoiceRecording(false);
      setIsTranscribing(true);
      try {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        if (!uri) throw new Error('Recording URI not found');
        const res = await speechService.speechToText({
          uri,
          name: 'lesson_practice.m4a',
          type: Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mpeg',
        });
        if (res.transcript && res.transcript.trim()) {
          setSpeakingInput(res.transcript.trim());
        } else {
          Alert.alert('No Speech Detected', 'Could not hear anything. Please try speaking again.');
        }
      } catch (err) {
        console.warn('Transcription failed:', err);
        Alert.alert('Transcription Failed', 'Make sure you have an active internet connection and try again.');
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Start recording
      try {
        VoiceService.stop();
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Microphone Access Denied', 'Please allow microphone access to use voice input.');
          return;
        }
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setIsVoiceRecording(true);
      } catch (e) {
        console.warn('Mic start failed:', e);
        Alert.alert('Microphone Error', 'Could not start recording. Please check microphone permissions.');
      }
    }
  };

  const evaluateSpeakingAttempt = async () => {
    if (!speakingInput.trim()) return;
    setEvaluatingSpeaking(true);
    setSpeakingFeedback(null);
    try {
      const promptText = `Lesson Title: "${lesson?.title}". Category: "${lesson?.category}". Student Spoken/Written Practice Sentence: "${speakingInput.trim()}"`;
      const res = await aiService.speakingFeedback(promptText);
      if (res?.response) {
        setSpeakingFeedback(res.response);
        VoiceService.speak(sanitizeForSpeech(res.response), {
          voiceType: settings?.aiVoice || 'Default',
          availableVoices,
        });
      }
      setStudyStep(6); // Automatically advance to Step 7 (AI Feedback)!
    } catch (err) {
      Alert.alert('AI Feedback Error', 'Unable to evaluate speaking attempt.');
    } finally {
      setEvaluatingSpeaking(false);
    }
  };

  // ── Study Flow Actions ──────────────────────────────────────────────
  const startOrResumeStudy = useCallback(async () => {
    if (!lesson) return;
    setActionLoading(true);
    try {
      // Non-blocking backend notification
      lessonModuleService.start(lesson.id).catch((err) => {
        console.warn("Backend start service sync warning:", err);
      });
      
      const prog = lesson.progressPercent || 0;
      let initialStep = 0;
      if (prog >= 75) {
        initialStep = 7; // resume to quiz
      } else if (prog >= 35) {
        initialStep = 1; // resume to content
      }

      setStudyStep(initialStep);
      // Reset AI teach + examples so they re-fetch fresh
      setAiTeachContent('');
      setAiExamples([]);
      setAiCheckQ(null);
      setAiGuidedQ(null);
      setTutorResponse('');
      setTutorInput('');
      setCheckSelected(null);
      setCheckSubmitted(false);
      setGuidedInput('');
      setGuidedSubmitted(false);
      setSpeakingInput('');
      setSpeakingFeedback(null);
      setShowStudy(true);

      if (initialStep === 7 || quizQuestions.length === 0) {
        fetchDynamicQuiz(quizLevel);
      }
    } catch (e) {
      console.warn("Could not start study mode via backend, falling back to direct UI open:", e);
      setStudyStep(0);
      setAiTeachContent('');
      setAiExamples([]);
      setShowStudy(true);
    } finally {
      setActionLoading(false);
    }
  }, [lesson, quizLevel, quizQuestions.length]);

  const handleNextStep = async () => {
    if (!lesson) return;
    const nextStep = studyStep + 1;
    setStudyStep(nextStep);

    if (nextStep === 7 && quizQuestions.length === 0) {
      fetchDynamicQuiz(quizLevel);
    }

    let progressPercent = Math.min(100, Math.round(((nextStep + 1) / 9) * 100));

    try {
      await lessonModuleService.updateProgress({
        lessonId: lesson.id,
        progressPercent,
        lastSectionIndex: nextStep,
        timeSpentMinutes: 2
      });
    } catch (err) {
      console.warn('Failed to sync progress to backend:', err);
    }
  };

  const handlePrevStep = () => {
    if (studyStep > 0) {
      setStudyStep(studyStep - 1);
    }
  };

  const submitDynamicQuizAnswer = (opt) => {
    if (quizSelectedAnswer !== null) return;
    setQuizSelectedAnswer(opt);
    const curQ = quizQuestions[currentQuizIdx];
    const isCorrect = opt === curQ?.correctAnswer;
    if (isCorrect) {
      quizScoreRef.current += 1;
      setQuizScore(quizScoreRef.current);
    }
    if (settings?.soundEffects) {
      VoiceService.speak(isCorrect ? "Correct!" : "Oops!", {
        voiceType: settings?.aiVoice || 'Default',
        availableVoices,
      });
    }
  };

  const nextDynamicQuizQuestion = () => {
    if (currentQuizIdx < quizQuestions.length - 1) {
      setQuizSelectedAnswer(null);
      setCurrentQuizIdx((prev) => prev + 1);
    } else {
      finishDynamicQuiz();
    }
  };

  const finishDynamicQuiz = async () => {
    setQuizFinished(true);
    const finalScore = quizScoreRef.current;
    const totalQ = quizQuestions.length || 5;

    let multiplier = 10;
    let perfectBonusAmount = 20;
    if (quizLevel === 'Intermediate') {
      multiplier = 15;
      perfectBonusAmount = 25;
    } else if (quizLevel === 'Advanced') {
      multiplier = 20;
      perfectBonusAmount = 30;
    }

    const baseXP = finalScore * multiplier;
    const perfectBonus = (finalScore === totalQ && totalQ > 0) ? perfectBonusAmount : 0;
    const totalAwarded = baseXP + perfectBonus;
    setEarnedXP(totalAwarded);

    try {
      if (lesson) {
        await lessonModuleService.complete(lesson.id);
      }
      const curProg = await progressService.get().catch(() => null);
      if (curProg) {
        await progressService.update({
          ...curProg,
          xp: (curProg.xp || 0) + totalAwarded,
        });
      }
    } catch (e) {
      console.warn("Failed to update dynamic quiz completion XP:", e);
    }
  };

  const finishLesson = async () => {
    if (!lesson) return;
    setActionLoading(true);
    try {
      await lessonModuleService.complete(lesson.id);
      setShowStudy(false);
      
      await loadLesson();
      
      Alert.alert(
        '🎉 Lesson Completed!',
        `Superb! You unlocked +${earnedXP > 0 ? earnedXP : (lesson.xpReward || 50)} XP and leveled up your English skills.`,
        [{ text: 'Great!' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Unable to record completion. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────
  const diffColors = lesson ? (DIFF_COLORS[lesson.level] || { bg: '#F1F5F9', text: '#64748B' }) : {};
  const prog = lesson?.progressPercent || 0;
  const isCompleted = lesson?.completed;
  const isLocked = lesson?.locked;
  const hasStarted = prog > 0;

  const skillList = lesson?.skills ? lesson.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const objectiveList = lesson?.objectives ? lesson.objectives.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const sections = lesson ? [
    '1. Introduction & Objectives',
    '2. AI Explains the Topic',
    '3. Real-World Examples',
    '4. Check Understanding',
    '5. Guided Practice Drill',
    '6. Speaking & Writing Practice',
    '7. Real-Time AI Feedback',
    '8. Dynamic 3-Level AI Quiz',
    '9. Lesson Summary & Rewards'
  ] : [];

  // Get active quiz definition
  const quiz = lesson ? (LESSON_QUIZZES[lesson.title] || DEFAULT_QUIZ) : DEFAULT_QUIZ;

  // ── Skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#0F172A', '#1E1B4B', '#312E81']} style={styles.cover}>
          <SafeAreaView edges={['top']}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.bodyCard}>
          <View style={[styles.skelLine, { width: '60%', height: 22, marginBottom: 10 }]} />
          <View style={[styles.skelLine, { width: '40%', height: 14, marginBottom: 20 }]} />
          <View style={[styles.skelLine, { width: '100%', height: 60 }]} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <SafeAreaView edges={['top']} style={{ padding: 20 }}>
          <TouchableOpacity style={styles.backBtn2} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={52} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadLesson}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Header height animation ──────────────────────────────────────────
  const coverScale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.15, 1], extrapolate: 'clamp' });
  const coverOpacity = scrollY.interpolate({ inputRange: [0, 150], outputRange: [1, 0.4], extrapolate: 'clamp' });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* ── Cover ── */}
        <Animated.View style={{ transform: [{ scale: coverScale }], opacity: coverOpacity }}>
          <LinearGradient
            colors={isLocked ? ['#475569', '#334155'] : ['#0F172A', '#1E1B4B', '#4F46E5']}
            style={styles.cover}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.coverDeco1} />
            <View style={styles.coverDeco2} />
            <SafeAreaView edges={['top']}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color="#FFF" />
              </TouchableOpacity>
            </SafeAreaView>
            <View style={styles.coverContent}>
              <View style={styles.coverTop}>
                <View style={[styles.catBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                  <Text style={styles.catBadgeText}>{lesson.category}</Text>
                </View>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#FFF" />
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                )}
              </View>
              <Text style={styles.coverTitle}>{lesson.title}</Text>
              <Text style={styles.coverDesc} numberOfLines={3}>{lesson.description}</Text>
              <View style={styles.coverChips}>
                <InfoChip icon="bar-chart-outline" label={lesson.level || 'Beginner'} color="#FFF" />
                <InfoChip icon="time-outline" label={`${lesson.estimatedMinutes || lesson.duration || '—'} min`} color="#FFF" />
                <InfoChip icon="star" label={`${lesson.xpReward || 0} XP`} color="#FCD34D" />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Body ── */}
        <Animated.View style={[styles.bodyCard, { backgroundColor: theme.bg }, { opacity: fadeIn }]}>

          {/* Progress bar (if started) */}
          {prog > 0 && (
            <View style={[styles.progressSection, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: theme.textPrimary }]}>Your Progress</Text>
                <Text style={styles.progressPct}>{prog}%</Text>
              </View>
              <View style={[styles.progressBg, isDark && { backgroundColor: '#334155' }]}>
                <View style={[styles.progressFill, { width: `${prog}%` }]} />
              </View>
            </View>
          )}

          {/* Locked notice */}
          {isLocked && (
            <View style={[styles.lockedBanner, isDark && { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)' }]}>
              <Ionicons name="lock-closed" size={18} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.lockedTitle, isDark && { color: '#FCD34D' }]}>This lesson is locked</Text>
                <Text style={[styles.lockedMsg, isDark && { color: '#FDE68A' }]}>
                  Requires {lesson.requiredXP > 0 ? `${lesson.requiredXP} XP` : `Level ${lesson.requiredLevel}`} to unlock.
                </Text>
              </View>
            </View>
          )}

          {/* Difficulty & meta grid */}
          <View style={styles.metaGrid}>
            <View style={[styles.metaGridCell, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              <Ionicons name="bar-chart-outline" size={20} color={COLORS.primary} />
              <Text style={[styles.metaGridLabel, { color: theme.textSecondary }]}>Difficulty</Text>
              <View style={[styles.diffBadge, { backgroundColor: diffColors.bg }]}>
                <Text style={[styles.diffBadgeText, { color: diffColors.text }]}>{lesson.level}</Text>
              </View>
            </View>
            <View style={[styles.metaGridCell, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={[styles.metaGridLabel, { color: theme.textSecondary }]}>Duration</Text>
              <Text style={[styles.metaGridValue, { color: theme.textPrimary }]}>{lesson.estimatedMinutes || lesson.duration || '—'} min</Text>
            </View>
            <View style={[styles.metaGridCell, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              <Ionicons name="star-outline" size={20} color="#F59E0B" />
              <Text style={[styles.metaGridLabel, { color: theme.textSecondary }]}>XP Reward</Text>
              <Text style={[styles.metaGridValue, { color: '#F59E0B' }]}>{lesson.xpReward || 0} XP</Text>
            </View>
          </View>

          {/* Skills */}
          {skillList.length > 0 && (
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Skills You'll Gain</Text>
              <View style={styles.skillsWrap}>
                {skillList.map((s, i) => <SkillTag key={i} label={s} />)}
              </View>
            </View>
          )}

          {/* Objectives */}
          {objectiveList.length > 0 && (
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>What You'll Learn</Text>
              {objectiveList.map((obj, i) => <ObjectiveRow key={i} label={obj} />)}
            </View>
          )}

          {/* Requirements */}
          {lesson.requirements && lesson.requirements !== 'None' && (
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Prerequisites</Text>
              <View style={styles.prereqRow}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.prereqText, { color: theme.textSecondary }]}>{lesson.requirements}</Text>
              </View>
            </View>
          )}

          {/* Lesson Sections */}
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Lesson Syllabus</Text>
            {sections.map((sec, i) => <SectionRow key={i} index={i} title={sec} />)}
          </View>

        </Animated.View>
      </Animated.ScrollView>

      {/* ── Fixed bottom action bar ── */}
      <View style={[styles.bottomBar, { backgroundColor: theme.cardBg, borderTopColor: theme.cardBorder }]}>
        <SafeAreaView edges={['bottom']}>
          {isCompleted ? (
            <View style={styles.bottomBtns}>
              <TouchableOpacity style={styles.reviewBtn} onPress={startOrResumeStudy} disabled={actionLoading}>
                <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
                <Text style={styles.reviewBtnText}>Review Lesson</Text>
              </TouchableOpacity>
              <View style={styles.completedCheck}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.completedCheckText}>Completed!</Text>
              </View>
            </View>
          ) : isLocked ? (
            <View style={[styles.lockedBtn, isDark && { backgroundColor: '#334155' }]}>
              <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
              <Text style={styles.lockedBtnText}>Locked</Text>
            </View>
          ) : hasStarted ? (
            <View style={styles.bottomBtns}>
              <TouchableOpacity
                style={styles.resumeBtn}
                onPress={startOrResumeStudy}
                disabled={actionLoading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.resumeGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="play" size={18} color="#FFF" />
                  <Text style={styles.resumeBtnText}>{actionLoading ? 'Loading…' : 'Resume Lesson'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.completeBtn} onPress={finishLesson} disabled={actionLoading}>
                <Text style={styles.completeBtnText}>Mark Complete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={startOrResumeStudy}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.startGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="play-circle-outline" size={22} color="#FFF" />
                <Text style={styles.startBtnText}>{actionLoading ? 'Starting…' : 'Start Lesson'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </View>

      {/* ─── STUDY MODE MODAL ─── */}
      <Modal
        visible={showStudy}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowStudy(false)}
      >
        <SafeAreaView style={[styles.studyRoot, { backgroundColor: theme.bg }]}>
          {/* Top Bar / Header */}
          <View style={[styles.studyHeader, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowStudy(false)}>
              <Ionicons name="close" size={26} color={isDark ? '#FFF' : '#475569'} />
            </TouchableOpacity>
            
            {/* Visual Steps Pagination */}
            <View style={styles.studyProgressBarContainer}>
              <View style={[styles.studyProgressBarTrack, isDark && { backgroundColor: '#334155' }]}>
                <View 
                  style={[
                    styles.studyProgressBarFill, 
                    { width: `${((studyStep + 1) / 9) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.stepIndicatorText, { color: theme.textSecondary }]}>Step {studyStep + 1} of 9</Text>
            </View>
          </View>

          {/* Core Content Area */}
          <ScrollView 
            style={[styles.studyScrollView, { backgroundColor: theme.bg }]}
            contentContainerStyle={styles.studyScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: INTRODUCTION */}
            {studyStep === 0 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepEyebrow}>STEP 1 • LESSON OVERVIEW</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Introduction & Objectives</Text>
                  <TouchableOpacity
                    style={[styles.tutorSpeakBtn, isSpeakingContent && styles.tutorSpeakBtnActive]}
                    onPress={() => readLessonStep(`${lesson?.title}. ${lesson?.description}. Objectives: ${objectiveList.join(', ')}`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={isSpeakingContent ? "stop" : "volume-medium"} size={16} color={isSpeakingContent ? "#EF4444" : COLORS.primary} />
                    <Text style={[styles.tutorSpeakBtnText, isSpeakingContent && { color: '#EF4444' }]}>
                      {isSpeakingContent ? "Stop" : "AI Intro"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{lesson?.title}</Text>
                
                <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.overviewDescHeader, { color: theme.textPrimary }]}>Lesson Focus</Text>
                  <Text style={[styles.overviewDesc, { color: theme.textSecondary }]}>{lesson?.description}</Text>
                </View>

                {objectiveList.length > 0 && (
                  <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.overviewDescHeader, { color: theme.textPrimary }]}>Key Learning Objectives</Text>
                    {objectiveList.map((obj, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                        <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{obj}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* STEP 2: AI EXPLAINS THE TOPIC — Auto-teaches, no button press needed */}
            {studyStep === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepEyebrow}>STEP 2 • AI TUTOR IS TEACHING</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Your AI Tutor Explains</Text>
                  {!aiTeachLoading && !!aiTeachContent && (
                    <TouchableOpacity
                      style={[styles.tutorSpeakBtn, isSpeakingContent && styles.tutorSpeakBtnActive]}
                      onPress={() => {
                        if (isSpeakingContent) {
                          VoiceService.stop();
                          setIsSpeakingContent(false);
                        } else {
                          setIsSpeakingContent(true);
                          VoiceService.speak(sanitizeForSpeech(aiTeachContent), {
                            voiceType: settings?.aiVoice || 'Default',
                            availableVoices,
                            onDone: () => setIsSpeakingContent(false),
                            onError: () => setIsSpeakingContent(false),
                          });
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name={isSpeakingContent ? 'stop' : 'volume-medium'} size={16} color={isSpeakingContent ? '#EF4444' : COLORS.primary} />
                      <Text style={[styles.tutorSpeakBtnText, isSpeakingContent && { color: '#EF4444' }]}>
                        {isSpeakingContent ? 'Stop' : 'Re-play'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* AI Teaching Content — Auto-loaded */}
                <View style={[styles.studyCard, { backgroundColor: isDark ? '#0F172A' : '#EEF2FF', borderColor: isDark ? '#4F46E5' : '#C7D2FE', borderWidth: 1.5 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="school" size={16} color="#FFF" />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.primary }}>AI Tutor</Text>
                    {isSpeakingContent && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        {[0, 1, 2].map(i => (
                          <View key={i} style={{ width: 4, height: 4 + i * 3, borderRadius: 2, backgroundColor: COLORS.primary, opacity: 0.7 + i * 0.15 }} />
                        ))}
                        <Text style={{ fontSize: 11, color: COLORS.primary, marginLeft: 4 }}>Speaking…</Text>
                      </View>
                    )}
                  </View>

                  {aiTeachLoading ? (
                    <View style={{ alignItems: 'center', paddingVertical: 24, gap: 10 }}>
                      <Ionicons name="chatbubble-ellipses-outline" size={32} color={COLORS.primary} />
                      <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '700' }}>AI Tutor is preparing your lesson…</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center' }}>Crafting a personalized explanation just for you</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 14, color: theme.textPrimary, lineHeight: 22 }}>{aiTeachContent}</Text>
                  )}
                </View>

                {/* Ask a Follow-up Question */}
                {!aiTeachLoading && !!aiTeachContent && (
                  <View style={[styles.studyCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Ionicons name="chatbubble-ellipses" size={18} color={'#8B5CF6'} />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary }}>Still confused? Ask AI Tutor</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <TextInput
                        style={[styles.tutorInput, { backgroundColor: isDark ? '#334155' : '#FFF', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                        placeholder="e.g. Can you explain with a simpler example?"
                        placeholderTextColor={theme.textSecondary}
                        value={tutorInput}
                        onChangeText={setTutorInput}
                      />
                      <TouchableOpacity
                        style={styles.tutorSendBtn}
                        onPress={() => askAiTutor()}
                        disabled={tutorLoading || !tutorInput.trim()}
                      >
                        <Ionicons name="send" size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    {tutorLoading && (
                      <Text style={{ fontSize: 12, color: COLORS.primary, marginTop: 8, fontStyle: 'italic' }}>AI Tutor is thinking…</Text>
                    )}
                    {!!tutorResponse && (
                      <View style={{ marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: isDark ? '#334155' : '#EEF2FF' }}>
                        <Text style={{ fontSize: 13, color: theme.textPrimary, lineHeight: 19 }}>{tutorResponse}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* STEP 3: SHOWS EXAMPLES — AI-generated with explanations */}
            {studyStep === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepEyebrow}>STEP 3 • REAL-WORLD EXAMPLES</Text>
                <Text style={[styles.stepTitle, { color: theme.textPrimary, marginBottom: 4 }]}>AI-Explained Examples</Text>
                <Text style={[styles.stepSubtitle, { color: theme.textSecondary, marginBottom: 12 }]}>Each example is explained so you understand WHY it works</Text>

                {aiExamplesLoading ? (
                  <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, alignItems: 'center', paddingVertical: 28 }]}>
                    <Ionicons name="bulb-outline" size={32} color={COLORS.primary} />
                    <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '700', marginTop: 10 }}>AI is crafting examples…</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Generating explained real-world sentences for you</Text>
                  </View>
                ) : (
                  aiExamples.map((ex, exIdx) => (
                    <View key={exIdx} style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                      {/* Header row */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{exIdx + 1}</Text>
                          </View>
                          {!!ex.context && (
                            <View style={{ backgroundColor: isDark ? '#334155' : '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                              <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '700' }}>{ex.context}</Text>
                            </View>
                          )}
                        </View>
                        <TouchableOpacity style={styles.quizSpeakBtn} onPress={() => readLessonStep(`${ex.sentence}. ${ex.explanation ? `Here is why this works: ${ex.explanation}` : ''}`)}>
                          <Ionicons name="volume-medium" size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>

                      {/* Example sentence */}
                      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary, lineHeight: 22, fontStyle: 'italic', marginBottom: 10 }}>
                        "{ex.sentence}"
                      </Text>

                      {/* AI Explanation */}
                      {!!ex.explanation && (
                        <View style={{ backgroundColor: isDark ? '#0F172A' : '#F0FDF4', borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: '#16A34A' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <Ionicons name="school-outline" size={14} color="#16A34A" />
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#16A34A', textTransform: 'uppercase', letterSpacing: 0.5 }}>Why this works</Text>
                          </View>
                          <Text style={{ fontSize: 13, color: isDark ? '#86EFAC' : '#15803D', lineHeight: 18 }}>{ex.explanation}</Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* STEP 4: CHECKS UNDERSTANDING — AI random question */}
            {studyStep === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepEyebrow}>STEP 4 • KNOWLEDGE CHECK</Text>
                <Text style={[styles.stepTitle, { color: theme.textPrimary, marginBottom: 4 }]}>Check Your Understanding</Text>
                <Text style={[styles.stepSubtitle, { color: theme.textSecondary, marginBottom: 12 }]}>AI generates a different question every time</Text>

                {aiCheckQLoading ? (
                  <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, alignItems: 'center', paddingVertical: 28 }]}>
                    <Ionicons name="help-circle-outline" size={32} color={COLORS.primary} />
                    <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '700', marginTop: 10 }}>AI is generating your question…</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>A fresh, unique question just for you</Text>
                  </View>
                ) : aiCheckQ ? (
                  <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.quizQuestion, { color: theme.textPrimary }]}>{aiCheckQ.question}</Text>

                    {aiCheckQ.options.map((optText, optIdx) => {
                      const isPicked = checkSelected === optIdx;
                      const isRight = optIdx === aiCheckQ.correctIndex;
                      let btnStyle = [styles.quizOption, { backgroundColor: isDark ? '#334155' : '#F8FAFC', borderColor: theme.cardBorder }];
                      let txtStyle = [styles.quizOptionText, { color: theme.textPrimary }];
                      if (checkSubmitted) {
                        if (isRight) { btnStyle = [styles.quizOption, styles.quizOptionCorrect]; txtStyle = [styles.quizOptionText, styles.quizOptionTextCorrect]; }
                        else if (isPicked) { btnStyle = [styles.quizOption, styles.quizOptionWrong]; txtStyle = [styles.quizOptionText, styles.quizOptionTextWrong]; }
                      }
                      return (
                        <TouchableOpacity
                          key={optIdx}
                          style={btnStyle}
                          onPress={() => { if (!checkSubmitted) { setCheckSelected(optIdx); setCheckSubmitted(true); } }}
                        >
                          <Text style={txtStyle}>{optText}</Text>
                          {checkSubmitted && isRight && <Ionicons name="checkmark-circle" size={18} color="#16A34A" />}
                          {checkSubmitted && isPicked && !isRight && <Ionicons name="close-circle" size={18} color="#DC2626" />}
                        </TouchableOpacity>
                      );
                    })}

                    {checkSubmitted && (
                      <View style={[styles.quizFeedback, { backgroundColor: isDark ? '#0F172A' : '#F0FDF4', borderRadius: 10, borderLeftWidth: 3, borderLeftColor: checkSelected === aiCheckQ.correctIndex ? '#16A34A' : '#EF4444' }]}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: checkSelected === aiCheckQ.correctIndex ? '#16A34A' : '#EF4444', marginBottom: 4 }}>
                          {checkSelected === aiCheckQ.correctIndex ? '🎉 Correct!' : '❌ Not quite — here is why:'}
                        </Text>
                        <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 19 }}>{aiCheckQ.explanation}</Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            )}

            {/* STEP 5: GUIDED PRACTICE — AI random fill-in-the-blank */}
            {studyStep === 4 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepEyebrow}>STEP 5 • GUIDED PRACTICE DRILL</Text>
                <Text style={[styles.stepTitle, { color: theme.textPrimary, marginBottom: 4 }]}>Fill in the Blank</Text>
                <Text style={[styles.stepSubtitle, { color: theme.textSecondary, marginBottom: 12 }]}>AI creates a unique drill — different every time you practice</Text>

                {aiGuidedQLoading ? (
                  <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, alignItems: 'center', paddingVertical: 28 }]}>
                    <Ionicons name="pencil-outline" size={32} color={COLORS.primary} />
                    <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '700', marginTop: 10 }}>AI is creating your drill…</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>A fresh exercise just for this lesson</Text>
                  </View>
                ) : aiGuidedQ ? (
                  <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                    <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 8, fontWeight: '600' }}>Complete the sentence:</Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.primary, lineHeight: 24, marginBottom: 6 }}>
                      {aiGuidedQ.sentence}
                    </Text>
                    {!!aiGuidedQ.hint && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                        <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
                        <Text style={{ fontSize: 12, color: '#F59E0B', fontStyle: 'italic' }}>Hint: {aiGuidedQ.hint}</Text>
                      </View>
                    )}

                    <TextInput
                      style={[styles.tutorInput, { backgroundColor: isDark ? '#334155' : '#FFF', color: theme.textPrimary, borderColor: theme.cardBorder, marginBottom: 12 }]}
                      placeholder="Type the missing word or phrase..."
                      placeholderTextColor={theme.textSecondary}
                      value={guidedInput}
                      onChangeText={setGuidedInput}
                      editable={!guidedSubmitted}
                    />

                    {!guidedSubmitted ? (
                      <TouchableOpacity
                        style={[styles.quizNextBtn, !guidedInput.trim() && { opacity: 0.5 }]}
                        onPress={() => setGuidedSubmitted(true)}
                        disabled={!guidedInput.trim()}
                      >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                        <Text style={styles.quizNextText}>Check My Answer</Text>
                      </TouchableOpacity>
                    ) : (
                      <View>
                        {/* Answer reveal */}
                        <View style={[
                          { borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1 },
                          guidedInput.trim().toLowerCase() === aiGuidedQ.correctWord.toLowerCase()
                            ? { backgroundColor: isDark ? '#052E16' : '#F0FDF4', borderColor: '#16A34A' }
                            : { backgroundColor: isDark ? '#1F0404' : '#FEF2F2', borderColor: '#EF4444' }
                        ]}>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: guidedInput.trim().toLowerCase() === aiGuidedQ.correctWord.toLowerCase() ? '#16A34A' : '#EF4444', marginBottom: 4 }}>
                            {guidedInput.trim().toLowerCase() === aiGuidedQ.correctWord.toLowerCase() ? '🎉 Perfect!' : `❌ The correct word is: "${aiGuidedQ.correctWord}"`}
                          </Text>
                          {!!aiGuidedQ.explanation && (
                            <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 17 }}>{aiGuidedQ.explanation}</Text>
                          )}
                        </View>
                        {/* Try again button */}
                        {guidedInput.trim().toLowerCase() !== aiGuidedQ.correctWord.toLowerCase() && (
                          <TouchableOpacity
                            style={[styles.quizNextBtn, { backgroundColor: '#6B7280' }]}
                            onPress={() => { setGuidedInput(''); setGuidedSubmitted(false); }}
                          >
                            <Ionicons name="refresh" size={16} color="#FFF" />
                            <Text style={styles.quizNextText}>Try Again</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            )}

            {/* STEP 6: SPEAKING PRACTICE */}
            {studyStep === 5 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepEyebrow}>STEP 6 • SPEAKING &amp; WRITING PRACTICE</Text>
                <Text style={[styles.stepTitle, { color: theme.textPrimary, marginBottom: 4 }]}>Express Your Own Sentence</Text>
                <Text style={[styles.stepSubtitle, { color: theme.textSecondary, marginBottom: 12 }]}>Use your mic or type your practice sentence</Text>

                <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 6 }}>
                    Apply what you&apos;ve learned in &quot;{lesson?.title}&quot;:
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18, marginBottom: 14 }}>
                    Speak a sentence using this concept. AI will check your grammar, fluency, and structure!
                  </Text>

                  {/* Mic Button + Wave Animation */}
                  <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    {isVoiceRecording && (
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 36, marginBottom: 12 }}>
                        {[0.6, 1.0, 1.4, 1.0, 0.6, 1.2, 0.8].map((baseH, i) => (
                          <MicWaveBar key={i} baseHeight={baseH * 16} isRecording={isVoiceRecording} delay={i * 80} />
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={handleToggleVoiceRecord}
                      disabled={isTranscribing || evaluatingSpeaking}
                      style={[
                        {
                          width: 72, height: 72, borderRadius: 36,
                          alignItems: 'center', justifyContent: 'center',
                          backgroundColor: isVoiceRecording ? '#EF4444' : COLORS.primary,
                          shadowColor: isVoiceRecording ? '#EF4444' : COLORS.primary,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 6,
                        }
                      ]}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isVoiceRecording ? 'stop' : 'mic'}
                        size={32}
                        color="#FFF"
                      />
                    </TouchableOpacity>

                    <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 8, fontWeight: '600' }}>
                      {isTranscribing
                        ? 'Transcribing your voice…'
                        : isVoiceRecording
                        ? 'Recording… Tap to stop'
                        : 'Tap mic to speak'}
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: theme.cardBorder }} />
                    <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600' }}>OR TYPE BELOW</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: theme.cardBorder }} />
                  </View>

                  <TextInput
                    style={[
                      styles.tutorInput,
                      { height: 80, backgroundColor: isDark ? '#334155' : '#FFF', color: theme.textPrimary, borderColor: theme.cardBorder, textAlignVertical: 'top', paddingVertical: 10, marginBottom: 14 }
                    ]}
                    placeholder="Your transcribed or typed sentence will appear here..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    value={speakingInput}
                    onChangeText={setSpeakingInput}
                  />

                  <TouchableOpacity
                    style={[styles.quizNextBtn, (!speakingInput.trim() || evaluatingSpeaking) && { opacity: 0.5 }]}
                    onPress={evaluateSpeakingAttempt}
                    disabled={evaluatingSpeaking || !speakingInput.trim()}
                  >
                    <Ionicons name="sparkles" size={18} color="#FFF" />
                    <Text style={styles.quizNextText}>
                      {evaluatingSpeaking ? 'Analyzing with AI…' : 'Submit to AI Feedback'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 7: AI FEEDBACK */}
            {studyStep === 6 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepEyebrow}>STEP 7 • REAL-TIME AI EVALUATION</Text>
                <Text style={[styles.stepTitle, { color: theme.textPrimary, marginBottom: 12 }]}>AI Feedback & Analysis</Text>

                <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  {evaluatingSpeaking ? (
                    <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                      <Ionicons name="sparkles" size={36} color={COLORS.primary} style={{ marginBottom: 10 }} />
                      <Text style={{ fontSize: 14, fontWeight: '800', color: theme.textPrimary }}>Evaluating Your Practice Sentence...</Text>
                    </View>
                  ) : speakingFeedback ? (
                    <View>
                      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                        <View style={[styles.finishAccuracyPill, { backgroundColor: '#DCFCE7', marginTop: 0 }]}>
                          <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                          <Text style={[styles.finishAccuracyText, { color: '#15803D' }]}>Grammar Approved</Text>
                        </View>
                        <View style={[styles.finishAccuracyPill, { backgroundColor: '#EEF2FF', marginTop: 0 }]}>
                          <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                          <Text style={[styles.finishAccuracyText, { color: COLORS.primary }]}>Fluency Analyzed</Text>
                        </View>
                      </View>

                      <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary, marginBottom: 6 }}>AI Feedback Details:</Text>
                      <View style={{ padding: 12, borderRadius: 12, backgroundColor: isDark ? '#334155' : '#F8FAFC', borderWidth: 1, borderColor: theme.cardBorder, marginBottom: 14 }}>
                        <Text style={{ fontSize: 13, color: theme.textPrimary, lineHeight: 20 }}>{speakingFeedback}</Text>
                      </View>

                      <TouchableOpacity 
                        style={styles.tutorSpeakBtn} 
                        onPress={() => readLessonStep(speakingFeedback)}
                      >
                        <Ionicons name="volume-medium" size={16} color={COLORS.primary} />
                        <Text style={styles.tutorSpeakBtnText}>Listen to AI Feedback</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: theme.textSecondary }}>No speaking attempt submitted yet. Go back to Step 6 to submit your practice sentence.</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* STEP 8: DYNAMIC 3-LEVEL AI QUIZ */}
            {studyStep === 7 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepEyebrow}>STEP 8 • DYNAMIC AI QUIZ</Text>
                <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Level-Wise Practice Quiz</Text>

                {/* Level Tier Selector */}
                <View style={[styles.quizLevelSelector, isDark && { backgroundColor: '#334155' }]}>
                  {['Basic', 'Intermediate', 'Advanced'].map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      style={[
                        styles.quizLevelTab,
                        quizLevel === tier && styles.quizLevelTabActive,
                        quizLevel === tier && tier === 'Basic' && { backgroundColor: '#16A34A' },
                        quizLevel === tier && tier === 'Intermediate' && { backgroundColor: '#D97706' },
                        quizLevel === tier && tier === 'Advanced' && { backgroundColor: '#DC2626' },
                      ]}
                      onPress={() => changeQuizLevel(tier)}
                    >
                      <Text style={[styles.quizLevelTabText, quizLevel === tier && { color: '#FFF' }]}>
                        {tier === 'Basic' ? '🟢 Basic' : tier === 'Intermediate' ? '🟡 Intermed' : '🔴 Advanced'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Active Quiz Card */}
                {!quizFinished && (
                  <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                    {quizLoading ? (
                      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <Ionicons name="sparkles" size={36} color={COLORS.primary} style={{ marginBottom: 12 }} />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary }}>Generating AI Quiz Questions...</Text>
                        <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>Creating 5 randomized questions for {quizLevel} tier.</Text>
                      </View>
                    ) : quizQuestions.length > 0 ? (
                      <View>
                        {/* Header Row */}
                        <View style={styles.quizHeaderRow}>
                          <Text style={[styles.quizProgressText, { color: theme.textSecondary }]}>
                            Question {currentQuizIdx + 1} of {quizQuestions.length} ({quizLevel})
                          </Text>
                          <View style={styles.quizXpPill}>
                            <Ionicons name="flash" size={14} color="#F59E0B" />
                            <Text style={styles.quizXpPillText}>
                              +{quizScore * (quizLevel === 'Advanced' ? 20 : quizLevel === 'Intermediate' ? 15 : 10)} XP
                            </Text>
                          </View>
                        </View>

                        {/* Question Prompt */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 }}>
                          <Text style={[styles.quizQuestion, { color: theme.textPrimary, flex: 1, marginRight: 8 }]}>
                            {quizQuestions[currentQuizIdx]?.question}
                          </Text>
                          <TouchableOpacity 
                            style={styles.quizSpeakBtn} 
                            onPress={() => readLessonStep(quizQuestions[currentQuizIdx]?.question)}
                          >
                            <Ionicons name="volume-medium" size={18} color={COLORS.primary} />
                          </TouchableOpacity>
                        </View>

                        {/* Options */}
                        <View style={{ gap: 10, marginTop: 8 }}>
                          {quizQuestions[currentQuizIdx]?.options.map((opt, idx) => {
                            const isSelected = quizSelectedAnswer === opt;
                            const isCorrect = opt === quizQuestions[currentQuizIdx]?.correctAnswer;

                            let buttonStyle = [styles.quizOption, { backgroundColor: isDark ? '#334155' : '#F8FAFC', borderColor: theme.cardBorder }];
                            let textStyle = [styles.quizOptionText, { color: theme.textPrimary }];

                            if (quizSelectedAnswer !== null) {
                              if (isCorrect) {
                                buttonStyle = [styles.quizOption, styles.quizOptionCorrect];
                                textStyle = [styles.quizOptionText, styles.quizOptionTextCorrect];
                              } else if (isSelected) {
                                buttonStyle = [styles.quizOption, styles.quizOptionWrong];
                                textStyle = [styles.quizOptionText, styles.quizOptionTextWrong];
                              }
                            }

                            return (
                              <TouchableOpacity
                                key={idx}
                                style={buttonStyle}
                                onPress={() => submitDynamicQuizAnswer(opt)}
                                disabled={quizSelectedAnswer !== null}
                              >
                                <Text style={[textStyle, { flex: 1 }]}>{opt}</Text>
                                {quizSelectedAnswer !== null && isCorrect && (
                                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                                )}
                                {quizSelectedAnswer !== null && isSelected && !isCorrect && (
                                  <Ionicons name="close-circle" size={18} color="#DC2626" />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Feedback Box */}
                        {quizSelectedAnswer !== null && (
                          <View style={[
                            styles.quizFeedback, 
                            { backgroundColor: quizSelectedAnswer === quizQuestions[currentQuizIdx]?.correctAnswer ? (isDark ? 'rgba(34,197,94,0.15)' : '#F0FDF4') : (isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2') }
                          ]}>
                            <Text style={[
                              styles.feedbackTitle, 
                              { color: quizSelectedAnswer === quizQuestions[currentQuizIdx]?.correctAnswer ? '#16A34A' : '#EF4444' }
                            ]}>
                              {quizSelectedAnswer === quizQuestions[currentQuizIdx]?.correctAnswer ? '🎉 Correct Answer!' : '❌ Incorrect Choice'}
                            </Text>
                            <Text style={[styles.feedbackText, { color: theme.textSecondary }]}>
                              {quizQuestions[currentQuizIdx]?.explanation}
                            </Text>
                          </View>
                        )}

                        {/* Next / Finish Button */}
                        {quizSelectedAnswer !== null && (
                          <TouchableOpacity style={styles.quizNextBtn} onPress={nextDynamicQuizQuestion}>
                            <Text style={styles.quizNextText}>
                              {currentQuizIdx === quizQuestions.length - 1 ? 'Finish & Proceed to Summary' : 'Next Question'}
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : null}
                  </View>
                )}

                {/* Quiz Completed Card */}
                {quizFinished && (
                  <View style={[styles.studyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, alignItems: 'center', paddingVertical: 28 }]}>
                    <LinearGradient colors={['#FCD34D', '#F59E0B']} style={styles.quizFinishBadgeCircle}>
                      <Ionicons name={quizScore === quizQuestions.length ? "trophy" : "ribbon"} size={44} color="#FFFFFF" />
                    </LinearGradient>
                    
                    <Text style={[styles.finishTitle, { color: theme.textPrimary }]}>{quizLevel} Quiz Completed!</Text>
                    
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

                    {/* XP Breakdown */}
                    <View style={[styles.xpBreakdownCard, { backgroundColor: isDark ? '#334155' : '#F8FAFC', borderColor: theme.cardBorder }]}>
                      <Text style={[styles.xpBreakdownHeader, { color: theme.textPrimary }]}>XP Rewards Breakdown</Text>
                      
                      <View style={styles.xpBreakdownRow}>
                        <Text style={[styles.xpBreakdownLabel, { color: theme.textSecondary }]}>⚡ {quizLevel} Score Base</Text>
                        <Text style={[styles.xpBreakdownVal, { color: COLORS.primary }]}>
                          +{quizScore * (quizLevel === 'Advanced' ? 20 : quizLevel === 'Intermediate' ? 15 : 10)} XP
                        </Text>
                      </View>

                      {quizScore === quizQuestions.length && quizQuestions.length > 0 && (
                        <View style={styles.xpBreakdownRow}>
                          <Text style={[styles.xpBreakdownLabel, { color: theme.textSecondary }]}>🔥 Perfect Quiz Bonus</Text>
                          <Text style={[styles.xpBreakdownVal, { color: '#F59E0B' }]}>
                            +{quizLevel === 'Advanced' ? 30 : quizLevel === 'Intermediate' ? 25 : 20} XP
                          </Text>
                        </View>
                      )}

                      <View style={[styles.xpTotalRow, { borderTopColor: theme.cardBorder }]}>
                        <Text style={[styles.xpTotalLabel, { color: theme.textPrimary }]}>Total XP Added to Profile</Text>
                        <Text style={styles.xpTotalVal}>+{earnedXP} XP</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.quizNextBtn} onPress={handleNextStep}>
                      <Text style={styles.quizNextText}>Proceed to Lesson Summary</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* STEP 9: LESSON SUMMARY */}
            {studyStep === 8 && (
              <View style={[styles.stepContainer, { alignItems: 'center', paddingTop: 10 }]}>
                <View style={styles.successBadgeWrap}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.successBadgeGrad}
                  >
                    <Ionicons name="trophy" size={54} color="#FFF" />
                  </LinearGradient>
                </View>
                <Text style={[styles.successTitle, { color: theme.textPrimary }]}>Lesson Mastered!</Text>
                <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>Outstanding achievement! You completed all 9 steps of this lesson.</Text>

                <View style={styles.rewardContainer}>
                  <View style={[styles.rewardBox, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                    <Text style={styles.rewardValue}>+{earnedXP > 0 ? earnedXP : (lesson?.xpReward || 50)}</Text>
                    <Text style={[styles.rewardLabel, { color: theme.textSecondary }]}>XP Rewarded</Text>
                  </View>
                  <View style={[styles.rewardBox, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                    <Text style={styles.rewardValue}>{lesson?.estimatedMinutes || 15}m</Text>
                    <Text style={[styles.rewardLabel, { color: theme.textSecondary }]}>Time Spent</Text>
                  </View>
                </View>

                <View style={[styles.studyCard, { width: '100%', alignItems: 'center', backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <Text style={{ fontWeight: '800', color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>LESSON MASTERY</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center' }}>
                    100% of "{lesson?.title}" is completed. Keep up your daily streak!
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Navigation Buttons */}
          <View style={[styles.studyFooter, { backgroundColor: theme.cardBg, borderTopColor: theme.cardBorder }]}>
            {studyStep === 8 ? (
              <TouchableOpacity
                style={styles.finishBtn}
                onPress={finishLesson}
                disabled={actionLoading}
              >
                <Text style={styles.finishBtnText}>{actionLoading ? "Completing..." : "Finish & Save Progress"}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.footerNavRow}>
                {studyStep > 0 ? (
                  <TouchableOpacity style={styles.stepBackBtn} onPress={handlePrevStep}>
                    <Ionicons name="arrow-back" size={20} color="#4F46E5" />
                    <Text style={styles.stepBackBtnText}>Back</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                {studyStep !== 7 && (
                  <TouchableOpacity style={styles.stepNextBtn} onPress={handleNextStep}>
                    <Text style={styles.stepNextBtnText}>Next Step</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Cover
  cover: { minHeight: 280, justifyContent: 'flex-end', overflow: 'hidden' },
  coverDeco1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', top: -80, right: -60 },
  coverDeco2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', top: 30, left: -40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', margin: 16 },
  backBtn2: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  coverContent: { padding: 20, paddingBottom: 24 },
  coverTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  catBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34,197,94,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  completedBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  coverTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 },
  coverDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 21, marginBottom: 14 },
  coverChips: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },

  // Info chips
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  chipText: { fontSize: 12, fontWeight: '600' },

  // Body card
  bodyCard: { backgroundColor: '#F8FAFC', padding: 16, paddingBottom: 120 },

  // Skeleton
  skelLine: { backgroundColor: '#E2E8F0', borderRadius: 8, marginBottom: 8 },

  // Progress
  progressSection: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  progressPct: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  progressBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },

  // Locked banner
  lockedBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FEF3C7', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
  lockedTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  lockedMsg: { fontSize: 12, color: '#B45309', lineHeight: 18 },

  // Meta grid
  metaGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  metaGridCell: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  metaGridLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 4, marginBottom: 4 },
  metaGridValue: { fontSize: 14, fontWeight: '800', color: COLORS.black },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffBadgeText: { fontSize: 11, fontWeight: '700' },

  // Cards
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.black, marginBottom: 12 },

  // Skills
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  skillTagText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  // Objectives
  objRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  objText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 19 },

  // Prereq
  prereqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  prereqText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 19 },

  // Sections
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  sectionNumText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  sectionConnector: { width: 8 },
  sectionRowTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.black },

  // Error
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginTop: 14 },
  errorMsg: { fontSize: 13, color: COLORS.text, marginTop: 6, textAlign: 'center', lineHeight: 19 },
  retryBtn: { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 8 },
  bottomBtns: { flexDirection: 'row', gap: 10, alignItems: 'center' },

  startBtn: { borderRadius: 14, overflow: 'hidden' },
  startGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  startBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },

  resumeBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  resumeGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  resumeBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  completeBtn: { paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary },
  completeBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  reviewBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 14 },
  reviewBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },

  completedCheck: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  completedCheckText: { fontSize: 13, fontWeight: '700', color: COLORS.success },

  lockedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F1F5F9', borderRadius: 14, paddingVertical: 16 },
  lockedBtnText: { color: '#9CA3AF', fontWeight: '700', fontSize: 16 },

  // ─── Study Mode Styles ───
  studyRoot: { flex: 1, backgroundColor: '#F8FAFC' },
  studyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF'
  },
  closeBtn: {
    padding: 4,
    marginRight: 12
  },
  studyProgressBarContainer: {
    flex: 1
  },
  studyProgressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4
  },
  studyProgressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4
  },
  stepIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B'
  },
  studyScrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  studyScrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  stepContainer: {
    flex: 1
  },
  stepEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 2
  },
  stepSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16
  },
  studyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  overviewDescHeader: {
    fontSize: 13,
    fontWeight: '900',
    color: '#475569',
    marginBottom: 6
  },
  overviewDesc: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'flex-start'
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    fontWeight: '600'
  },
  conceptContent: {
    fontSize: 15,
    color: COLORS.black,
    lineHeight: 24,
    fontWeight: '600'
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 14,
    lineHeight: 22
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10
  },
  quizOptionSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF'
  },
  quizOptionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5'
  },
  quizOptionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2'
  },
  quizOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    flex: 1,
    marginRight: 10
  },
  quizOptionTextSelected: {
    color: '#4F46E5'
  },
  quizOptionTextCorrect: {
    color: '#065F46'
  },
  quizOptionTextWrong: {
    color: '#991B1B'
  },
  quizFeedback: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 4
  },
  feedbackText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18
  },
  successBadgeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  successBadgeGrad: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '950',
    color: COLORS.black,
    marginBottom: 6
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 24,
    marginBottom: 24
  },
  rewardContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '100%'
  },
  rewardBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center'
  },
  rewardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981'
  },
  rewardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2
  },
  studyFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFF'
  },
  finishBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900'
  },
  footerNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stepBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  stepBackBtnText: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 14
  },
  stepNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 120
  },
  stepNextBtnDisabled: {
    backgroundColor: '#CBD5E1'
  },
  stepNextBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14
  },
  tutorSpeakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
  },
  tutorSpeakBtnActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  tutorSpeakBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  tutorInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  tutorSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizLevelSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  quizLevelTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  quizLevelTabActive: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quizLevelTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
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
  quizXpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quizXpPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706',
  },
  quizSpeakBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizNextBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    width: '100%',
  },
  quizNextText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  quizFinishBadgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  finishTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.black,
  },
  finishAccuracyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  finishAccuracyText: {
    fontSize: 12,
    fontWeight: '800',
  },
  xpBreakdownCard: {
    width: '100%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  xpBreakdownHeader: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  xpBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  xpBreakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpBreakdownVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  xpTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
  },
  xpTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  xpTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#16A34A',
  },
});
