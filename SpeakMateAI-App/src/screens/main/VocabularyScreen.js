import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  Alert,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Card, Screen } from '../../components/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { vocabularyService, settingsService, progressService } from '../../services/appServices';
import { VoiceService } from '../../services/VoiceService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

// =========================================================================
// ONBOARDING CALIBRATED VOCABULARY CURRICULUMS (STUDENTS & INDIVIDUAL USERS)
// =========================================================================
const CURRICULUM_DATA = {
  // Students by Grade (1st to 10th Std)
  '1st Std': [
    { id: 'v1_1', word: 'Apple', phonetic: '/ˈæp.əl/', partOfSpeech: 'noun', meaning: 'A sweet round fruit that grows on trees.', example: 'An apple a day keeps the doctor away.', synonym: 'Fruit', antonym: 'None', favorite: true },
    { id: 'v1_2', word: 'Friend', phonetic: '/frend/', partOfSpeech: 'noun', meaning: 'A person you like and spend time with.', example: 'Sita is my best school friend.', synonym: 'Companion', antonym: 'Enemy', favorite: false },
    { id: 'v1_3', word: 'Happy', phonetic: '/ˈhæp.i/', partOfSpeech: 'adjective', meaning: 'Feeling or showing pleasure and joy.', example: 'I feel very happy on my birthday.', synonym: 'Joyful', antonym: 'Sad', favorite: false },
    { id: 'v1_4', word: 'Smile', phonetic: '/smaɪl/', partOfSpeech: 'verb', meaning: 'Form a happy facial expression with the mouth.', example: 'Always smile when greeting your teacher.', synonym: 'Beam', antonym: 'Frown', favorite: false },
    { id: 'v1_5', word: 'Sunny', phonetic: '/ˈsʌn.i/', partOfSpeech: 'adjective', meaning: 'Bright with sunlight and pleasant warm weather.', example: 'It is a sunny morning for playing outside.', synonym: 'Bright', antonym: 'Cloudy', favorite: false },
    { id: 'v1_6', word: 'Puppy', phonetic: '/ˈpʌp.i/', partOfSpeech: 'noun', meaning: 'A young baby dog.', example: 'The playful puppy chased the red ball.', synonym: 'Doggy', antonym: 'None', favorite: false },
  ],
  '2nd Std': [
    { id: 'v2_1', word: 'Routine', phonetic: '/ruːˈtiːn/', partOfSpeech: 'noun', meaning: 'A regular sequence of daily actions.', example: 'Brushing teeth is part of my morning routine.', synonym: 'Schedule', antonym: 'Disorder', favorite: true },
    { id: 'v2_2', word: 'Pencil', phonetic: '/ˈpen.səl/', partOfSpeech: 'noun', meaning: 'An instrument used for writing or drawing.', example: 'I sharpened my yellow pencil for class.', synonym: 'Writing tool', antonym: 'Eraser', favorite: false },
    { id: 'v2_3', word: 'Weather', phonetic: '/ˈweð.ər/', partOfSpeech: 'noun', meaning: 'The state of the atmosphere (sunny, rainy, cool).', example: 'The weather today is sunny and bright.', synonym: 'Climate', antonym: 'None', favorite: false },
    { id: 'v2_4', word: 'Playground', phonetic: '/ˈpleɪ.ɡraʊnd/', partOfSpeech: 'noun', meaning: 'An outdoor area for children to play games.', example: 'We play on the swings in the playground.', synonym: 'Park', antonym: 'Classroom', favorite: false },
    { id: 'v2_5', word: 'Gentle', phonetic: '/ˈdʒen.təl/', partOfSpeech: 'adjective', meaning: 'Mild, kind, or tender in behavior.', example: 'Be gentle when holding the baby bird.', synonym: 'Kind', antonym: 'Rough', favorite: false },
  ],
  '3rd Std': [
    { id: 'v3_1', word: 'Helper', phonetic: '/ˈhel.pər/', partOfSpeech: 'noun', meaning: 'A person who helps or assists others.', example: 'Firefighters are brave community helpers.', synonym: 'Assistant', antonym: 'Opponent', favorite: true },
    { id: 'v3_2', word: 'Action', phonetic: '/ˈæk.ʃən/', partOfSpeech: 'noun', meaning: 'The process of doing something or moving.', example: 'Running and jumping are active action words.', synonym: 'Activity', antonym: 'Inaction', favorite: false },
    { id: 'v3_3', word: 'Polite', phonetic: '/pəˈlaɪt/', partOfSpeech: 'adjective', meaning: 'Having good manners and showing respect.', example: 'Saying please and thank you is very polite.', synonym: 'Courteous', antonym: 'Rude', favorite: false },
    { id: 'v3_4', word: 'Schedule', phonetic: '/ˈskedʒ.uːl/', partOfSpeech: 'noun', meaning: 'A plan that lists times for activities.', example: 'Check our school timetable schedule.', synonym: 'Timetable', antonym: 'Chaos', favorite: false },
    { id: 'v3_5', word: 'Curious', phonetic: '/ˈkjʊr.i.əs/', partOfSpeech: 'adjective', meaning: 'Eager to know or learn something new.', example: 'The curious student asked wonderful science questions.', synonym: 'Inquisitive', antonym: 'Indifferent', favorite: false },
  ],
  '4th Std': [
    { id: 'v4_1', word: 'Expedition', phonetic: '/ˌek.spəˈdɪʃ.ən/', partOfSpeech: 'noun', meaning: 'A journey undertaken for a specific purpose.', example: 'Astronauts launched a space expedition to Mars.', synonym: 'Journey', antonym: 'Stay', favorite: true },
    { id: 'v4_2', word: 'Direction', phonetic: '/daɪˈrek.ʃən/', partOfSpeech: 'noun', meaning: 'The course along which someone or something moves.', example: 'Turn left to find the school library direction.', synonym: 'Route', antonym: 'None', favorite: false },
    { id: 'v4_3', word: 'Habit', phonetic: '/ˈhæb.ɪt/', partOfSpeech: 'noun', meaning: 'A settled or regular tendency or practice.', example: 'Drinking clean water daily is a healthy habit.', synonym: 'Practice', antonym: 'None', favorite: false },
    { id: 'v4_4', word: 'Courage', phonetic: '/ˈkɜːr.ɪdʒ/', partOfSpeech: 'noun', meaning: 'Strength in the face of difficulty or danger.', example: 'It takes courage to speak clearly on stage.', synonym: 'Bravery', antonym: 'Cowardice', favorite: false },
  ],
  '5th Std': [
    { id: 'v5_1', word: 'Environment', phonetic: '/ɪnˈvaɪ.rən.mənt/', partOfSpeech: 'noun', meaning: 'The surroundings and nature in which we live.', example: 'Planting trees protects our natural environment.', synonym: 'Surroundings', antonym: 'None', favorite: true },
    { id: 'v5_2', word: 'Experiment', phonetic: '/ɪkˈsper.ə.mənt/', partOfSpeech: 'noun', meaning: 'A scientific test done to discover something.', example: 'We conducted a science experiment on plant growth.', synonym: 'Test', antonym: 'Theory', favorite: false },
    { id: 'v5_3', word: 'Recycle', phonetic: '/ˌriːˈsaɪ.kəl/', partOfSpeech: 'verb', meaning: 'Convert waste materials into reusable items.', example: 'We recycle paper and plastic bottles at school.', synonym: 'Reuse', antonym: 'Waste', favorite: false },
    { id: 'v5_4', word: 'Discovery', phonetic: '/dɪˈskʌv.ər.i/', partOfSpeech: 'noun', meaning: 'The act of finding something for the first time.', example: 'The scientist made an important medical discovery.', synonym: 'Breakthrough', antonym: 'Loss', favorite: false },
  ],
  '6th Std': [
    { id: 'v6_1', word: 'Robotics', phonetic: '/roʊˈbɑː.t̬ɪks/', partOfSpeech: 'noun', meaning: 'The branch of engineering dealing with robots.', example: 'She joined the school robotics club to build code.', synonym: 'Automation', antonym: 'None', favorite: true },
    { id: 'v6_2', word: 'Debate', phonetic: '/dɪˈbeɪt/', partOfSpeech: 'noun', meaning: 'A formal discussion on a particular topic in public.', example: 'Our team won the inter-school debate competition.', synonym: 'Discussion', antonym: 'Agreement', favorite: false },
    { id: 'v6_3', word: 'Assistance', phonetic: '/əˈsɪs.təns/', partOfSpeech: 'noun', meaning: 'Help or support given to someone.', example: 'The teacher offered polite assistance during the test.', synonym: 'Aid', antonym: 'Obstacle', favorite: false },
  ],
  '7th Std': [
    { id: 'v7_1', word: 'Conservation', phonetic: '/ˌkɑːn.sɚˈveɪ.ʃən/', partOfSpeech: 'noun', meaning: 'Prevention of wasteful use of a natural resource.', example: 'Water conservation is vital for future generations.', synonym: 'Preservation', antonym: 'Destruction', favorite: true },
    { id: 'v7_2', word: 'Delegate', phonetic: '/ˈdel.ə.ɡeɪt/', partOfSpeech: 'verb', meaning: 'Entrust a task or duty to another person.', example: 'The leader delegates responsibilities to team members.', synonym: 'Assign', antonym: 'Withhold', favorite: false },
    { id: 'v7_3', word: 'Perspective', phonetic: '/pɚˈspek.tɪv/', partOfSpeech: 'noun', meaning: 'A particular attitude toward or way of regarding things.', example: 'Reading history gives us a broader perspective on life.', synonym: 'Viewpoint', antonym: 'None', favorite: false },
  ],
  '8th Std': [
    { id: 'v8_1', word: 'Leadership', phonetic: '/ˈliː.dɚ.ʃɪp/', partOfSpeech: 'noun', meaning: 'The action of leading a group or organization.', example: 'Student council develops strong leadership qualities.', synonym: 'Guidance', antonym: 'Subordination', favorite: true },
    { id: 'v8_2', word: 'Rebuttal', phonetic: '/rɪˈbʌt̬.əl/', partOfSpeech: 'noun', meaning: 'A refutation or contradiction in a formal debate.', example: 'She delivered a powerful rebuttal during the debate.', synonym: 'Refutation', antonym: 'Confirmation', favorite: false },
    { id: 'v8_3', word: 'Innovation', phonetic: '/ˌɪn.əˈveɪ.ʃən/', partOfSpeech: 'noun', meaning: 'A new method, idea, or technological product.', example: 'Artificial intelligence is a major technological innovation.', synonym: 'Novelty', antonym: 'Stagnation', favorite: false },
  ],
  '9th Std': [
    { id: 'v9_1', word: 'Diplomatic', phonetic: '/ˌdɪp.ləˈmæt̬.ɪk/', partOfSpeech: 'adjective', meaning: 'Handling sensitive situations tactfully and politely.', example: 'He used diplomatic language to resolve peer conflict.', synonym: 'Tactful', antonym: 'Tactless', favorite: true },
    { id: 'v9_2', word: 'Keynote', phonetic: '/ˈkiː.noʊt/', partOfSpeech: 'noun', meaning: 'A main speech outlining the central theme of an event.', example: 'She delivered the opening keynote on climate change.', synonym: 'Main theme', antonym: 'None', favorite: false },
    { id: 'v9_3', word: 'Breakthrough', phonetic: '/ˈbreɪk.θruː/', partOfSpeech: 'noun', meaning: 'A sudden, dramatic, and important discovery.', example: 'Scientists announced a breakthrough in solar energy.', synonym: 'Advance', antonym: 'Setback', favorite: false },
  ],
  '10th Std': [
    { id: 'v10_1', word: 'Oratory', phonetic: '/ˈɔːr.ə.tɔːr.i/', partOfSpeech: 'noun', meaning: 'Formal public speaking characterized by high eloquence.', example: 'CEFR C1 mastery requires spontaneous oratory skill.', synonym: 'Eloquence', antonym: 'Inarticulacy', favorite: true },
    { id: 'v10_2', word: 'Simulation', phonetic: '/ˌsɪm.jəˈleɪ.ʃən/', partOfSpeech: 'noun', meaning: 'Imitation of a situation or process in realistic conditions.', example: 'We completed a 10th Board oral exam simulation.', synonym: 'Model', antonym: 'Reality', favorite: false },
    { id: 'v10_3', word: 'Proficiency', phonetic: '/prəˈfɪʃ.ən.si/', partOfSpeech: 'noun', meaning: 'A high degree of skill and competence.', example: 'Fluency and accuracy demonstrate English proficiency.', synonym: 'Competence', antonym: 'Incompetence', favorite: false },
  ],

  // Individual Users by Age Group
  'Kids': [
    { id: 'vk_1', word: 'Cheerful', phonetic: '/ˈtʃɪr.fəl/', partOfSpeech: 'adjective', meaning: 'Noticeably happy, energetic, and optimistic.', example: 'She greeted her classmates with a cheerful smile.', synonym: 'Joyful', antonym: 'Gloomy', favorite: true },
    { id: 'vk_2', word: 'Adventure', phonetic: '/ədˈven.tʃɚ/', partOfSpeech: 'noun', meaning: 'An unusual and exciting or daring experience.', example: 'We had a fun adventure in the treehouse.', synonym: 'Journey', antonym: 'Routine', favorite: false },
    { id: 'vk_3', word: 'Playful', phonetic: '/ˈpleɪ.fəl/', partOfSpeech: 'adjective', meaning: 'Fond of games and amusement; lighthearted.', example: 'The playful kitten jumped on the soft cushion.', synonym: 'Frisky', antonym: 'Serious', favorite: false },
    { id: 'vk_4', word: 'Brave', phonetic: '/breɪv/', partOfSpeech: 'adjective', meaning: 'Ready to face danger or pain without fear.', example: 'The brave knight protected the gentle animals.', synonym: 'Courageous', antonym: 'Timid', favorite: false },
  ],
  'Teens': [
    { id: 'vt_1', word: 'Relatable', phonetic: '/rɪˈleɪ.t̬ə.bəl/', partOfSpeech: 'adjective', meaning: 'Enabling a person to feel that they can identify with it.', example: 'The song lyrics are very relatable to teenagers.', synonym: 'Understandable', antonym: 'Distant', favorite: true },
    { id: 'vt_2', word: 'Spontaneous', phonetic: '/spɑːnˈteɪ.ni.əs/', partOfSpeech: 'adjective', meaning: 'Performed or occurring as a result of a sudden impulse.', example: 'We took a spontaneous weekend bicycle trip.', synonym: 'Unplanned', antonym: 'Planned', favorite: false },
    { id: 'vt_3', word: 'Collaborate', phonetic: '/kəˈlæb.ə.reɪt/', partOfSpeech: 'verb', meaning: 'Work jointly on an activity or creative project.', example: 'Our team collaborated to build the science project.', synonym: 'Cooperate', antonym: 'Compete', favorite: false },
  ],
  'Young Adult': [
    { id: 'vy_1', word: 'Articulate', phonetic: '/ɑːrˈtɪk.jə.lət/', partOfSpeech: 'adjective', meaning: 'Having the ability to speak fluently and coherently.', example: 'An articulate speaker can convey complex ideas effortlessly.', synonym: 'Eloquent', antonym: 'Inarticulate', favorite: true },
    { id: 'vy_2', word: 'Resilient', phonetic: '/rɪˈzɪl.jənt/', partOfSpeech: 'adjective', meaning: 'Able to withstand or recover quickly from difficulties.', example: 'She showed a resilient mindset throughout university.', synonym: 'Tough', antonym: 'Fragile', favorite: false },
    { id: 'vy_3', word: 'Pragmatic', phonetic: '/præɡˈmæt̬.ɪk/', partOfSpeech: 'adjective', meaning: 'Dealing with things sensibly and realistically.', example: 'They took a pragmatic approach to budget planning.', synonym: 'Practical', antonym: 'Idealistic', favorite: false },
    { id: 'vy_4', word: 'Tenacious', phonetic: '/təˈneɪ.ʃəs/', partOfSpeech: 'adjective', meaning: 'Tending to keep a firm hold of something; persistent.', example: 'Her tenacious effort helped her master English speaking.', synonym: 'Persistent', antonym: 'Hesitant', favorite: false },
  ],
  'Professional': [
    { id: 'vw_1', word: 'Strategic', phonetic: '/strəˈtiː.dʒɪk/', partOfSpeech: 'adjective', meaning: 'Carefully designed or planned to serve a clear advantage.', example: 'We established strategic milestones for quarterly goals.', synonym: 'Calculated', antonym: 'Random', favorite: true },
    { id: 'vw_2', word: 'Leverage', phonetic: '/ˈlev.ɚ.ɪdʒ/', partOfSpeech: 'verb', meaning: 'Use something to maximum advantage.', example: 'We leverage AI technology to accelerate English learning.', synonym: 'Utilize', antonym: 'Ignore', favorite: false },
    { id: 'vw_3', word: 'Synergy', phonetic: '/ˈsɪn.ɚ.dʒi/', partOfSpeech: 'noun', meaning: 'The combined effect of items greater than their sum.', example: 'Team synergy enabled us to deliver the project early.', synonym: 'Harmony', antonym: 'Conflict', favorite: false },
    { id: 'vw_4', word: 'Facilitate', phonetic: '/fəˈsɪl.ə.teɪt/', partOfSpeech: 'verb', meaning: 'Make an action or process smooth and easy.', example: 'The manager facilitated a smooth discussion between teams.', synonym: 'Enable', antonym: 'Hinder', favorite: false },
  ],
  'Senior': [
    { id: 'vs_1', word: 'Serenity', phonetic: '/səˈren.ə.t̬i/', partOfSpeech: 'noun', meaning: 'The state of being calm, peaceful, and untroubled.', example: 'She enjoyed the morning serenity of her garden.', synonym: 'Tranquility', antonym: 'Agitation', favorite: true },
    { id: 'vs_2', word: 'Nostalgia', phonetic: '/nɑːˈstæl.dʒə/', partOfSpeech: 'noun', meaning: 'A sentimental longing or affection for the past.', example: 'Looking at old family photos brought a wave of nostalgia.', synonym: 'Reminiscence', antonym: 'None', favorite: false },
    { id: 'vs_3', word: 'Wisdom', phonetic: '/ˈwɪz.dəm/', partOfSpeech: 'noun', meaning: 'The quality of having experience and sound judgment.', example: 'Her grandmother shared timeless wisdom on life and patience.', synonym: 'Insight', antonym: 'Folly', favorite: false },
  ],
};

export default function VocabularyScreen() {
  const { isDark, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'flashcards', 'quiz'
  const [word, setWord] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'favorites'
  const [saving, setSaving] = useState(false);
  const [userWords, setUserWords] = useState([]);
  const [userProfileTitle, setUserProfileTitle] = useState('My Vocabulary');

  // Settings & Voices
  const [settings, setSettings] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  // Next-Level Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [mistakesList, setMistakesList] = useState([]);
  const [showMistakes, setShowMistakes] = useState(false);

  // Load User Profile & Calibrated Curriculums
  const loadUserData = async () => {
    try {
      const [savedAccType, savedGrade, savedAgeGroup, s, voices, savedVoice, backendWords] = await Promise.all([
        AsyncStorage.getItem('speakmate_account_type'),
        AsyncStorage.getItem('speakmate_school_grade'),
        AsyncStorage.getItem('speakmate_age_group'),
        settingsService.get().catch(() => null),
        VoiceService.getAvailableEnglishVoices(),
        AsyncStorage.getItem('speakmate_selected_voice'),
        vocabularyService.all().catch(() => []),
      ]);

      const effAccType = savedAccType || 'INDIVIDUAL_USER';
      const effectiveVoice = savedVoice || s?.aiVoice || 'Default';
      setSettings({ ...s, aiVoice: effectiveVoice });
      setAvailableVoices(voices);

      let profileKey = '1st Std';
      let title = 'Vocabulary';

      if (effAccType === 'STUDENT') {
        profileKey = savedGrade || '1st Std';
        title = `Student Standard: ${profileKey}`;
      } else {
        const rawAge = savedAgeGroup || 'Young Adult';
        if (rawAge.toLowerCase().includes('kid')) profileKey = 'Kids';
        else if (rawAge.toLowerCase().includes('teen')) profileKey = 'Teens';
        else if (rawAge.toLowerCase().includes('senior')) profileKey = 'Senior';
        else if (rawAge.toLowerCase().includes('pro') || rawAge.toLowerCase().includes('work')) profileKey = 'Professional';
        else profileKey = 'Young Adult';
        title = `Age Group: ${rawAge}`;
      }

      setUserProfileTitle(title);

      // Base Curated List for User's Profile
      const curatedBase = CURRICULUM_DATA[profileKey] || CURRICULUM_DATA['1st Std'];

      // Merge with custom user added words
      const combined = [...(backendWords || [])];
      for (const cw of curatedBase) {
        if (!combined.some((w) => w.word.toLowerCase() === cw.word.toLowerCase())) {
          combined.push(cw);
        }
      }

      setUserWords(combined);
    } catch (e) {
      console.warn('Failed to load profile vocabulary:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  // Filter and search logic
  const filteredItems = userWords.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      (item.word && item.word.toLowerCase().includes(q)) ||
      (item.meaning && item.meaning.toLowerCase().includes(q));

    const matchesFilter = filterType === 'all' || (filterType === 'favorites' && item.favorite);
    return matchesSearch && matchesFilter;
  });

  const currentCard = filteredItems[currentCardIndex] || filteredItems[0];

  // Pronunciation Speech Engine
  const speak = (txt) => {
    if (settings?.isMuted || !txt) return;
    VoiceService.speak(txt, {
      voiceType: settings?.aiVoice || 'Default',
      availableVoices,
    });
  };

  // Play audio on initial card mount in Flashcards tab
  useEffect(() => {
    if (activeTab === 'flashcards' && currentCard && !flipped) {
      const timer = setTimeout(() => {
        speak(currentCard.word);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentCardIndex, activeTab]);

  // Add Custom Word with AI
  const addWord = async () => {
    const cleanWord = word.trim();
    if (!cleanWord) return;
    setSaving(true);
    try {
      const response = await vocabularyService.add(cleanWord);
      setWord('');
      Alert.alert('Word Added ✨', `"${cleanWord}" added with AI pronunciation and meaning! (+10 XP)`);
      setUserWords((prev) => [response, ...prev]);
    } catch (error) {
      const localItem = {
        id: 'loc_' + Date.now(),
        word: cleanWord,
        phonetic: `/${cleanWord.toLowerCase()}/`,
        partOfSpeech: 'word',
        meaning: `Definition and conversational usage for ${cleanWord}`,
        example: `Practice using "${cleanWord}" naturally in daily English speaking.`,
        favorite: false,
      };
      setUserWords((prev) => [localItem, ...prev]);
      setWord('');
      Alert.alert('Saved ✨', `"${cleanWord}" added to your word bank!`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (item) => {
    const newFav = !item.favorite;
    try {
      if (typeof item.id === 'number' || !String(item.id).startsWith('v')) {
        await vocabularyService.toggleFavorite(item.id);
      }
      setUserWords((prev) => prev.map((w) => (w.id === item.id ? { ...w, favorite: newFav } : w)));
    } catch (e) {
      setUserWords((prev) => prev.map((w) => (w.id === item.id ? { ...w, favorite: newFav } : w)));
    }
  };

  // 3D Flip Card Animation with Automatic Meaning Speech
  const flipCard = () => {
    const nextFlipped = !flipped;
    Animated.spring(flipAnimation, {
      toValue: nextFlipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(nextFlipped);

    // AI Speaks the Meaning immediately upon flipping!
    if (nextFlipped && currentCard) {
      speak(currentCard.meaning || currentCard.word);
    } else if (!nextFlipped && currentCard) {
      speak(currentCard.word);
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
      setCurrentCardIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    }, 180);
  };

  const prevCard = () => {
    if (flipped) flipCard();
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    }, 180);
  };

  // =========================================================================
  // NEXT-LEVEL HIGH-ACCURACY MULTI-FORMAT QUIZ ENGINE
  // =========================================================================
  const startQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setStreakCount(0);
    setMaxStreak(0);
    setQuizFinished(false);
    setMistakesList([]);
    setShowMistakes(false);
    setEarnedXP(0);

    // Build comprehensive unique source pool
    const allPools = [
      ...userWords,
      ...CURRICULUM_DATA['1st Std'],
      ...CURRICULUM_DATA['3rd Std'],
      ...CURRICULUM_DATA['5th Std'],
      ...CURRICULUM_DATA['7th Std'],
      ...CURRICULUM_DATA['10th Std'],
      ...CURRICULUM_DATA['Young Adult'],
      ...CURRICULUM_DATA['Professional'],
    ];

    const uniquePool = [];
    const seenWords = new Set();
    for (const w of allPools) {
      if (w.word && !seenWords.has(w.word.toLowerCase().trim())) {
        seenWords.add(w.word.toLowerCase().trim());
        uniquePool.push(w);
      }
    }

    // Pick 5 distinct target words from active list or full pool
    const activePool = userWords.length >= 5 ? userWords : uniquePool;
    const shuffledActive = [...activePool].sort(() => 0.5 - Math.random());
    const selectedTargets = shuffledActive.slice(0, 5);

    const questions = selectedTargets.map((item, idx) => {
      const qType = idx % 4;
      let questionBadge = '';
      let promptTitle = '';
      let promptSubtitle = '';
      let correctAnswer = '';
      let options = [];

      // TYPE 0: Fill-in-the-Blank Sentence
      if (qType === 0 && item.example) {
        questionBadge = '📝 Sentence Context';
        const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
        promptTitle = item.example.replace(regex, '_______');
        promptSubtitle = 'Choose the correct word to complete the sentence:';
        correctAnswer = item.word;

        // Distractor words
        const otherWords = uniquePool
          .filter((w) => w.word.toLowerCase() !== item.word.toLowerCase())
          .map((w) => w.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        options = [item.word, ...otherWords].sort(() => 0.5 - Math.random());
      }
      // TYPE 1: Synonym Challenge
      else if (qType === 1 && item.synonym && item.synonym !== 'None' && item.synonym !== 'Fruit') {
        questionBadge = '🔀 Synonym Finder';
        promptTitle = `Which word is the closest synonym for "${item.word}"?`;
        promptSubtitle = `Select the word with the most similar meaning:`;
        correctAnswer = item.synonym;

        const otherSynonyms = uniquePool
          .filter((w) => w.synonym && w.synonym !== 'None' && w.synonym.toLowerCase() !== item.synonym.toLowerCase())
          .map((w) => w.synonym)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        while (otherSynonyms.length < 3) {
          otherSynonyms.push('Hesitation', 'Confusion', 'Disruption', 'Hesitant')[otherSynonyms.length];
        }

        options = [item.synonym, ...otherSynonyms].sort(() => 0.5 - Math.random());
      }
      // TYPE 2: Audio Comprehension / Pronunciation Challenge
      else if (qType === 2) {
        questionBadge = '🔊 Listening Comprehension';
        promptTitle = `Listen to the pronunciation of "${item.word}"`;
        promptSubtitle = `What is the accurate definition of this word?`;
        correctAnswer = item.meaning;

        const otherMeanings = uniquePool
          .filter((w) => w.meaning && w.meaning !== item.meaning)
          .map((w) => w.meaning)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        options = [item.meaning, ...otherMeanings].sort(() => 0.5 - Math.random());
      }
      // TYPE 3: Definition Match (Standard)
      else {
        questionBadge = '📖 Definition Match';
        promptTitle = `What is the correct definition of "${item.word}"?`;
        promptSubtitle = `Choose the precise meaning:`;
        correctAnswer = item.meaning;

        const otherMeanings = uniquePool
          .filter((w) => w.meaning && w.meaning !== item.meaning)
          .map((w) => w.meaning)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        options = [item.meaning, ...otherMeanings].sort(() => 0.5 - Math.random());
      }

      return {
        id: `quiz_q_${idx}_${Date.now()}`,
        qType,
        questionBadge,
        promptTitle,
        promptSubtitle,
        targetWord: item.word,
        phonetic: item.phonetic,
        partOfSpeech: item.partOfSpeech,
        correctAnswer,
        options,
        example: item.example,
        meaning: item.meaning,
      };
    });

    setQuizQuestions(questions);
    setActiveTab('quiz');
  };

  const submitQuizAnswer = (option) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);
    const currentQ = quizQuestions[currentQuizIndex];
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      if (settings?.soundEffects !== false) {
        Speech.speak('Correct!', { language: 'en-US', pitch: 1.25, rate: 1.1 });
      }
    } else {
      setStreakCount(0);
      setMistakesList((prev) => [...prev, { ...currentQ, userAnswer: option }]);

      if (settings?.soundEffects !== false) {
        Speech.speak('Review answer below.', { language: 'en-US', pitch: 0.95, rate: 1.0 });
      }
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    const totalQ = quizQuestions.length;
    const baseXP = quizScore * 20;
    const streakBonus = maxStreak >= 3 ? 25 : 0;
    const perfectBonus = quizScore === totalQ && totalQ > 0 ? 30 : 0;
    const totalAwarded = baseXP + streakBonus + perfectBonus;
    setEarnedXP(totalAwarded);

    try {
      const prog = await progressService.get().catch(() => null);
      if (prog) {
        await progressService.update({
          ...prog,
          xp: (prog.xp || 0) + totalAwarded,
          totalVocabularyWords: (prog.totalVocabularyWords || 0) + quizScore,
        });
      }
    } catch (e) {
      console.warn('Quiz progress update error:', e);
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

  return (
    <Screen
      title="Vocabulary Master"
      subtitle={userProfileTitle}
    >
      {/* Dynamic Tab Bar */}
      <View style={[styles.tabContainer, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tabButton, activeTab === 'list' && styles.tabButtonActive]}
          onPress={() => setActiveTab('list')}
        >
          <Ionicons name="book-outline" size={17} color={activeTab === 'list' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'list' && styles.tabButtonTextActive]}>
            My List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tabButton, activeTab === 'flashcards' && styles.tabButtonActive]}
          onPress={() => {
            if (!filteredItems.length) {
              Alert.alert('No Words', 'Save vocabulary words to practice 3D flashcards.');
              return;
            }
            setCurrentCardIndex(0);
            setFlipped(false);
            flipAnimation.setValue(0);
            setActiveTab('flashcards');
          }}
        >
          <Ionicons name="albums-outline" size={17} color={activeTab === 'flashcards' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'flashcards' && styles.tabButtonTextActive]}>
            3D Flashcards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tabButton, activeTab === 'quiz' && styles.tabButtonActive]}
          onPress={startQuiz}
        >
          <Ionicons name="trophy-outline" size={17} color={activeTab === 'quiz' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'quiz' && styles.tabButtonTextActive]}>
            AI Quiz
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          TAB 1: MY LIST (WORD BANK WITH SAMPLE EXAMPLES & FAVORITE STARS)
      ========================================================================= */}
      {activeTab === 'list' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Add Word Box */}
          <LinearGradient
            colors={isDark ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
            style={styles.addCardGradient}
          >
            <View style={styles.addHeaderRow}>
              <View style={styles.addTitleWithIcon}>
                <Ionicons name="sparkles" size={18} color="#6366F1" />
                <Text style={[styles.sectionHeaderTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                  AI Word Lookup & Add
                </Text>
              </View>
              <Text style={styles.xpBadge}>+10 XP</Text>
            </View>

            <Text style={[styles.addSubtitle, { color: isDark ? '#C7D2FE' : '#4338CA' }]}>
              Type any English word. SpeakMate AI extracts pronunciation, IPA, part of speech, and examples.
            </Text>

            <View style={styles.addInputRow}>
              <TextInput
                style={[styles.addInput, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0F172A' }]}
                placeholder="e.g. Eloquent, Resilient, Tenacious..."
                value={word}
                onChangeText={setWord}
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addWord}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Ionicons name={saving ? 'hourglass-outline' : 'add'} size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Search and Filters */}
          <View style={styles.searchFilterContainer}>
            <View style={[styles.searchBox, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder="Search words, meanings..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter Pills */}
            <View style={styles.filterPillsRow}>
              {[
                { key: 'all', label: `All Words (${userWords.length})` },
                { key: 'favorites', label: '⭐ Favorites' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.filterPill,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                    filterType === f.key && styles.filterPillActive,
                  ]}
                  onPress={() => setFilterType(f.key)}
                >
                  <Text style={[styles.filterPillText, { color: isDark ? '#94A3B8' : '#64748B' }, filterType === f.key && styles.filterPillTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Word List with Favorite Stars & Audio */}
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={54} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Words Found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Add custom words above using the AI word lookup bar!
              </Text>
            </View>
          ) : (
            filteredItems.map((item, idx) => (
              <Card key={item.id || idx} style={[styles.wordCard, { backgroundColor: theme.cardBg }]}>
                <View style={styles.wordHeaderRow}>
                  <View style={styles.wordTitleCol}>
                    <View style={styles.wordBadgeRow}>
                      <Text style={[styles.wordText, { color: theme.textPrimary }]}>{item.word}</Text>
                      {item.phonetic ? (
                        <Text style={[styles.phoneticText, { color: '#6366F1' }]}>{item.phonetic}</Text>
                      ) : null}
                      {item.partOfSpeech ? (
                        <View style={styles.posBadge}>
                          <Text style={styles.posBadgeText}>{item.partOfSpeech}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      onPress={() => speak(item.word)}
                      style={[styles.actionBtn, { backgroundColor: isDark ? '#334155' : '#EEF2FF' }]}
                    >
                      <Ionicons name="volume-high" size={18} color="#6366F1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(item)}
                      style={[styles.actionBtn, { backgroundColor: isDark ? '#334155' : '#FEF3C7' }]}
                    >
                      <Ionicons
                        name={item.favorite ? 'star' : 'star-outline'}
                        size={18}
                        color={item.favorite ? '#F59E0B' : theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.meaningText, { color: theme.textPrimary }]}>{item.meaning}</Text>

                {item.example ? (
                  <View style={[styles.exampleBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                    <Text style={[styles.exampleLabel, { color: theme.textSecondary }]}>EXAMPLE</Text>
                    <Text style={[styles.exampleText, { color: isDark ? '#E2E8F0' : '#334155' }]}>"{item.example}"</Text>
                  </View>
                ) : null}

                {item.synonym && item.synonym !== 'None' ? (
                  <View style={styles.synonymsRow}>
                    <Text style={[styles.synonymLabel, { color: theme.textSecondary }]}>Synonym: </Text>
                    <Text style={[styles.synonymText, { color: '#10B981' }]}>{item.synonym}</Text>
                  </View>
                ) : null}
              </Card>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* =========================================================================
          TAB 2: 3D FLASHCARDS (WORD -> TAP -> SPEAKS MEANING & FLIPS)
      ========================================================================= */}
      {activeTab === 'flashcards' && currentCard && (
        <ScrollView contentContainerStyle={styles.flashcardContainer} showsVerticalScrollIndicator={false}>
          {/* Card Counter & Favorite Star Header */}
          <View style={styles.flashcardHeader}>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>
                CARD {currentCardIndex + 1} OF {filteredItems.length}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(currentCard)}
              style={[styles.flashcardStarBtn, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
            >
              <Ionicons
                name={currentCard.favorite ? 'star' : 'star-outline'}
                size={22}
                color={currentCard.favorite ? '#F59E0B' : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentCardIndex + 1) / Math.max(1, filteredItems.length)) * 100}%` },
              ]}
            />
          </View>

          {/* 3D Flip Card Container */}
          <TouchableOpacity activeOpacity={0.95} onPress={flipCard} style={styles.cardTouchWrapper}>
            {/* FRONT OF CARD (WORD + IPA) */}
            <Animated.View
              style={[
                styles.flashcard3D,
                { backgroundColor: theme.cardBg, borderColor: isDark ? '#334155' : '#E2E8F0' },
                {
                  transform: [{ rotateY: frontInterpolate }],
                  opacity: frontOpacity,
                },
              ]}
            >
              <LinearGradient colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']} style={styles.cardInnerGradient}>
                <View style={styles.cardTopActions}>
                  <View style={styles.posBadge}>
                    <Text style={styles.posBadgeText}>{currentCard.partOfSpeech || 'Vocabulary Word'}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => speak(currentCard.word)}
                    style={styles.audioPillBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="volume-high" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardCenterContent}>
                  <Text style={[styles.frontWordText, { color: theme.textPrimary }]}>{currentCard.word}</Text>
                  {currentCard.phonetic ? (
                    <Text style={styles.frontPhoneticText}>{currentCard.phonetic}</Text>
                  ) : null}
                </View>

                <View style={styles.cardBottomHint}>
                  <Ionicons name="sync" size={16} color="#6366F1" />
                  <Text style={[styles.tapToFlipText, { color: theme.textSecondary }]}>Tap card to hear meaning & flip</Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* BACK OF CARD (MEANING + EXAMPLES) */}
            <Animated.View
              style={[
                styles.flashcard3D,
                styles.flashcardBack,
                { backgroundColor: theme.cardBg, borderColor: isDark ? '#334155' : '#E2E8F0' },
                {
                  transform: [{ rotateY: backInterpolate }],
                  opacity: backOpacity,
                },
              ]}
            >
              <LinearGradient colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']} style={styles.cardInnerGradient}>
                <View style={styles.cardTopActions}>
                  <Text style={[styles.backWordSmall, { color: '#6366F1' }]}>{currentCard.word}</Text>
                  <TouchableOpacity
                    onPress={() => speak(currentCard.meaning)}
                    style={styles.audioPillBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="volume-high" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.backScrollContent} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.backMeaningText, { color: theme.textPrimary }]}>{currentCard.meaning}</Text>

                  {currentCard.example ? (
                    <View style={[styles.backExampleBox, { backgroundColor: isDark ? '#334155' : '#EDE9FE' }]}>
                      <Text style={[styles.backExampleText, { color: isDark ? '#E2E8F0' : '#4338CA' }]}>
                        "{currentCard.example}"
                      </Text>
                    </View>
                  ) : null}
                </ScrollView>

                <View style={styles.cardBottomHint}>
                  <Ionicons name="sync" size={16} color="#6366F1" />
                  <Text style={[styles.tapToFlipText, { color: theme.textSecondary }]}>Tap card to flip back to word</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          {/* Navigation Controls */}
          <View style={styles.navControlsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={prevCard}
              style={[styles.navBtn, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
            >
              <Ionicons name="chevron-back" size={22} color={theme.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={nextCard}
              style={[styles.navBtn, styles.navBtnPrimary]}
            >
              <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* =========================================================================
          TAB 3: NEXT-LEVEL MULTI-FORMAT HIGH-ACCURACY AI QUIZ
      ========================================================================= */}
      {activeTab === 'quiz' && (
        <ScrollView contentContainerStyle={styles.quizContainer} showsVerticalScrollIndicator={false}>
          {!quizFinished && quizQuestions.length > 0 && (
            <View style={{ width: '100%' }}>
              {/* Question Progress & Live Streak Header */}
              <View style={styles.quizProgressHeader}>
                <Text style={[styles.quizStepText, { color: theme.textSecondary }]}>
                  QUESTION {currentQuizIndex + 1} OF {quizQuestions.length}
                </Text>
                <View style={styles.quizHeaderBadges}>
                  {streakCount >= 2 && (
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakBadgeText}>🔥 {streakCount} Streak!</Text>
                    </View>
                  )}
                  <Text style={[styles.quizLiveScore, { color: '#6366F1' }]}>
                    Score: {quizScore} / {quizQuestions.length}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` },
                  ]}
                />
              </View>

              {/* Multi-Format Question Card */}
              <LinearGradient
                colors={isDark ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
                style={styles.quizQuestionCard}
              >
                <View style={styles.quizQuestionHeaderRow}>
                  <View style={styles.quizFormatBadge}>
                    <Text style={styles.quizFormatBadgeText}>{quizQuestions[currentQuizIndex]?.questionBadge}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => speak(quizQuestions[currentQuizIndex]?.promptTitle)}
                    style={styles.audioPillBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="volume-high" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.quizPromptTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                  {quizQuestions[currentQuizIndex]?.promptTitle}
                </Text>

                {quizQuestions[currentQuizIndex]?.promptSubtitle ? (
                  <Text style={[styles.quizPromptSubtitle, { color: isDark ? '#C7D2FE' : '#4338CA' }]}>
                    {quizQuestions[currentQuizIndex]?.promptSubtitle}
                  </Text>
                ) : null}
              </LinearGradient>

              {/* Options */}
              <View style={styles.quizOptionsList}>
                {quizQuestions[currentQuizIndex]?.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === quizQuestions[currentQuizIndex]?.correctAnswer;
                  let optStyle = [styles.quizOptionBtn, { backgroundColor: theme.cardBg, borderColor: isDark ? '#334155' : '#E2E8F0' }];

                  if (selectedAnswer !== null) {
                    if (isCorrect) {
                      optStyle.push(styles.quizOptionCorrect);
                    } else if (isSelected && !isCorrect) {
                      optStyle.push(styles.quizOptionWrong);
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      style={optStyle}
                      disabled={selectedAnswer !== null}
                      onPress={() => submitQuizAnswer(option)}
                    >
                      <View style={[styles.optLetterBadge, isSelected && isCorrect && { backgroundColor: '#10B981' }, isSelected && !isCorrect && { backgroundColor: '#EF4444' }]}>
                        <Text style={[styles.optLetterText, isSelected && { color: '#FFFFFF' }]}>
                          {String.fromCharCode(65 + idx)}
                        </Text>
                      </View>
                      <Text style={[styles.quizOptionText, { color: theme.textPrimary }]}>{option}</Text>
                      {selectedAnswer !== null && isCorrect && (
                        <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                      )}
                      {selectedAnswer !== null && isSelected && !isCorrect && (
                        <Ionicons name="close-circle" size={22} color="#EF4444" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Instant Explanation Box on Answer */}
              {selectedAnswer !== null && (
                <View style={[styles.explanationCard, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: isDark ? '#334155' : '#BFDBFE' }]}>
                  <View style={styles.explanationHeader}>
                    <Ionicons name="information-circle" size={18} color="#3B82F6" />
                    <Text style={styles.explanationTitle}>Word Context & Definition</Text>
                  </View>
                  <Text style={[styles.explanationMeaning, { color: theme.textPrimary }]}>
                    <Text style={{ fontWeight: '800' }}>{quizQuestions[currentQuizIndex]?.targetWord}:</Text>{' '}
                    {quizQuestions[currentQuizIndex]?.meaning}
                  </Text>
                  {quizQuestions[currentQuizIndex]?.example ? (
                    <Text style={[styles.explanationExample, { color: isDark ? '#94A3B8' : '#475569' }]}>
                      "{quizQuestions[currentQuizIndex]?.example}"
                    </Text>
                  ) : null}
                </View>
              )}

              {/* Next Question / Finish Button */}
              {selectedAnswer !== null && (
                <TouchableOpacity
                  style={styles.quizNextBtn}
                  onPress={nextQuizQuestion}
                  activeOpacity={0.85}
                >
                  <Text style={styles.quizNextBtnText}>
                    {currentQuizIndex < quizQuestions.length - 1 ? 'Next Question →' : 'View Results 🎉'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* QUIZ FINISHED CELEBRATION WITH MISTAKE REVIEW */}
          {quizFinished && (
            <Card style={[styles.celebrationCard, { backgroundColor: theme.cardBg }]}>
              <View style={styles.trophyCircle}>
                <Ionicons name="trophy" size={48} color="#F59E0B" />
              </View>
              <Text style={[styles.celebTitle, { color: theme.textPrimary }]}>Quiz Completed!</Text>
              <Text style={[styles.celebSubtitle, { color: theme.textSecondary }]}>
                You answered <Text style={{ fontWeight: '800', color: '#6366F1' }}>{quizScore}</Text> of {quizQuestions.length} correctly!
              </Text>

              {/* XP Breakdown Box */}
              <View style={styles.rewardXpBox}>
                <Text style={styles.rewardXpText}>+{earnedXP} XP Earned ✨</Text>
              </View>

              {/* Mistakes Review Toggle */}
              {mistakesList.length > 0 ? (
                <TouchableOpacity
                  style={[styles.mistakesToggleBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                  onPress={() => setShowMistakes(!showMistakes)}
                >
                  <Text style={[styles.mistakesToggleText, { color: theme.textPrimary }]}>
                    {showMistakes ? 'Hide Mistakes Review ▲' : `Review ${mistakesList.length} Mistakes ▼`}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.perfectScoreText, { color: '#10B981' }]}>🌟 100% Perfect Accuracy! 🌟</Text>
              )}

              {/* Mistakes Review Content */}
              {showMistakes && mistakesList.length > 0 && (
                <View style={styles.mistakesContainer}>
                  {mistakesList.map((m, i) => (
                    <View key={i} style={[styles.mistakeItem, { backgroundColor: isDark ? '#1E293B' : '#FEF2F2', borderColor: '#FCA5A5' }]}>
                      <Text style={[styles.mistakeWord, { color: theme.textPrimary }]}>{m.targetWord}</Text>
                      <Text style={styles.mistakeWrongText}>Your Answer: {m.userAnswer}</Text>
                      <Text style={styles.mistakeCorrectText}>Correct: {m.correctAnswer}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.retakeBtn} onPress={startQuiz} activeOpacity={0.85}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.retakeBtnText}>Retake Quiz with New Questions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backToListBtn} onPress={() => setActiveTab('list')}>
                <Text style={[styles.backToListBtnText, { color: theme.textSecondary }]}>Back to Word Bank</Text>
              </TouchableOpacity>
            </Card>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

// =========================================================================
// ULTRA-CLEAN STYLESHEET
// =========================================================================
const styles = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 16 },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Add Card Gradient
  addCardGradient: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  addHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  xpBadge: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addSubtitle: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  // Search & Filter
  searchFilterContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  filterPillActive: {
    backgroundColor: '#6366F1',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // Word Cards
  wordCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
  },
  wordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordTitleCol: {
    flex: 1,
  },
  wordBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '800',
  },
  phoneticText: {
    fontSize: 13,
    fontWeight: '600',
  },
  posBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  posBadgeText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meaningText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  exampleBox: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  synonymsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  synonymLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  synonymText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  // Flashcards Tab
  flashcardContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  counterBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  flashcardStarBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  cardTouchWrapper: {
    width: CARD_WIDTH,
    height: 320,
    marginBottom: 24,
  },
  flashcard3D: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  flashcardBack: {
    position: 'absolute',
    top: 0,
  },
  cardInnerGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioPillBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  frontWordText: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  frontPhoneticText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
  },
  cardBottomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tapToFlipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  backWordSmall: {
    fontSize: 17,
    fontWeight: '900',
  },
  backScrollContent: {
    flex: 1,
    marginVertical: 10,
  },
  backMeaningText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  backExampleBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  backExampleText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  navControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  navBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnPrimary: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Quiz Tab
  quizContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  quizProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizStepText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  quizHeaderBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakBadgeText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
  },
  quizLiveScore: {
    fontSize: 13,
    fontWeight: '800',
  },
  quizQuestionCard: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  quizQuestionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizFormatBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quizFormatBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  quizPromptTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  quizPromptSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  quizOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  quizOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  optLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optLetterText: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 13,
  },
  quizOptionText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '600',
  },
  quizOptionCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  quizOptionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  explanationCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  explanationTitle: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
  explanationMeaning: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  explanationExample: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  quizNextBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quizNextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // Celebration Card
  celebrationCard: {
    padding: 26,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
  },
  trophyCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  celebTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  celebSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardXpBox: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 16,
  },
  rewardXpText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  perfectScoreText: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 16,
  },
  mistakesToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  mistakesToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mistakesContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  mistakeItem: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  mistakeWord: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  mistakeWrongText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  mistakeCorrectText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },
  retakeBtn: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  backToListBtn: {
    paddingVertical: 8,
  },
  backToListBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
