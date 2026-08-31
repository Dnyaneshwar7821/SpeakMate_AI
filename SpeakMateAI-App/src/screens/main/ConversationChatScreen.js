import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
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
import { Audio } from 'expo-av';
import { COLORS } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService, speechService, settingsService, profileService } from '../../services/appServices';
import { VoiceService } from '../../services/VoiceService';
import AIAvatar from '../../components/common/AIAvatar';
import JumpingDotsIndicator from '../../components/common/JumpingDotsIndicator';
import LevelSegmentedControl from '../../components/common/LevelSegmentedControl';

// ── Animated Message Bubble Component ────────────────────────────────────────
function AnimatedChatBubble({ children, isUser, onLongPress }) {
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enterAnim, {
      toValue: 1,
      tension: 65,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  const opacity    = enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={onLongPress}
        style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Sound Wave Component ────────────────────────────────────────────────────
function VoiceWaveBars({ isRecording }) {
  const animatedValues = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    let anim;
    if (isRecording) {
      const animations = animatedValues.map((val) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(val, {
              toValue: 1.5 + Math.random() * 2.0,
              duration: 250 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(val, {
              toValue: 0.5 + Math.random() * 0.5,
              duration: 250 + Math.random() * 200,
              useNativeDriver: true,
            }),
          ])
        );
      });
      anim = Animated.parallel(animations);
      anim.start();
    } else {
      animatedValues.forEach(val => val.setValue(1));
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isRecording]);

  return (
    <View style={styles.voiceWaveRow}>
      {animatedValues.map((val, i) => (
        <Animated.View
          key={i}
          style={[
            styles.voiceWaveBar,
            {
              transform: [{ scaleY: val }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const getModeHints = (modeParam, lastAiMsg) => {
  const m = (modeParam || '').toLowerCase();
  const text = ((lastAiMsg?.message || '') + ' ' + (lastAiMsg?.followUpQuestion || '')).toLowerCase();

  if (text.includes('name') || text.includes('who are you') || text.includes('introduce')) {
    return [
      "Hi! Nice to meet you. I'm excited to practice English!",
      "Hello! I'm here to build my speaking confidence and fluency.",
      "Could you tell me a little about yourself as well?"
    ];
  }
  if (text.includes('hobby') || text.includes('free time') || text.includes('weekend') || text.includes('do for fun')) {
    return [
      "In my free time, I really enjoy reading and listening to music.",
      "I love going for walks outdoors and playing video games.",
      "What are popular weekend activities in your country?"
    ];
  }
  if (text.includes('how are you') || text.includes('how was your day') || text.includes('how is it going')) {
    return [
      "I'm doing great, thank you! How has your day been?",
      "Everything is going well! Ready for today's practice.",
      "It's been a busy day, but I'm excited to learn."
    ];
  }
  if (text.includes('why') && (text.includes('learn') || text.includes('english') || text.includes('practice'))) {
    return [
      "I want to communicate fluently for my career and global travel.",
      "To express myself naturally and connect with people worldwide.",
      "What is your best tip for speaking more like a native?"
    ];
  }
  if (m.includes('travel') || text.includes('trip') || text.includes('flight') || text.includes('hotel') || text.includes('visit')) {
    return [
      "Could you recommend the most famous attractions to visit here?",
      "I would like to book a table for two at seven, please.",
      "What is the best way to get to the airport from the city center?"
    ];
  }
  if (m.includes('interview') || text.includes('job') || text.includes('career') || text.includes('experience') || text.includes('strength')) {
    return [
      "My greatest strength is my problem-solving ability and teamwork.",
      "I have experience collaborating in fast-paced team environments.",
      "Could you give me constructive feedback on my interview answer?"
    ];
  }
  if (m.includes('business') || text.includes('meeting') || text.includes('project') || text.includes('email')) {
    return [
      "Let's review the main agenda items and key deliverables for this project.",
      "I agree with that proposal and suggest we set next steps.",
      "Could you provide your insights on how to improve this strategy?"
    ];
  }
  if (m.includes('grammar') || m.includes('coach') || text.includes('tense') || text.includes('rule')) {
    return [
      "Could you explain the difference between past simple and present perfect?",
      "Is there a more natural, native way to phrase that sentence?",
      "Could you give me another example sentence so I can practice?"
    ];
  }
  if (m.includes('vocabulary') || m.includes('vocab') || text.includes('idiom') || text.includes('synonym')) {
    return [
      "What are common native synonyms for 'good' and 'interesting'?",
      "Could you teach me a useful idiom for everyday conversations?",
      "Let's practice using these new vocabulary words in sentences."
    ];
  }
  if (m.includes('ielts') || text.includes('part 1') || text.includes('part 2') || text.includes('band')) {
    return [
      "In my opinion, technology has brought both significant advantages and drawbacks.",
      "From my personal experience, consistent daily effort makes all the difference.",
      "Could you score my response based on IELTS fluency and vocabulary criteria?"
    ];
  }
  if (m.includes('debate') || text.includes('agree') || text.includes('opinion') || text.includes('think about')) {
    return [
      "While I understand that viewpoint, there is another key factor to consider.",
      "The primary evidence strongly supports taking a proactive approach.",
      "How would you address the strongest counter-argument to that point?"
    ];
  }
  if (m.includes('story') || text.includes('tell me a story') || text.includes('narrate') || text.includes('what happened')) {
    return [
      "It all started on a rainy evening when something unexpected happened.",
      "As soon as we arrived, we realized everything had changed completely.",
      "What do you think happens next in this story?"
    ];
  }
  return [
    "That makes a lot of sense! Could you share an example?",
    "I understand completely. What should we focus on next?",
    "Could you give me an example of how a native speaker would say that?"
  ];
};

export default function ConversationChatScreen({ navigation, route }) {
  const { sessionId, mode, title } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [chatLevel, setChatLevel] = useState('Beginner');
  const [avatarExpression, setAvatarExpression] = useState(undefined);
  const [hints, setHints] = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);
  
  // Voice preferences
  const [availableVoices, setAvailableVoices] = useState([]);
  const [preferredVoice, setPreferredVoice] = useState('Friendly');
  const [onboardingVoiceStyle, setOnboardingVoiceStyle] = useState('Friendly');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [statusText, setStatusText] = useState('Waiting for Response');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const [selectedAvatarModel, setSelectedAvatarModel] = useState('robopaws');

  const handleSelectAvatarModel = async (modelName) => {
    setSelectedAvatarModel(modelName);
    await AsyncStorage.setItem('speakmate_avatar_model', modelName).catch(() => {});
  };

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Long-press Actions Modal
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const flatListRef = useRef(null);
  const recordingRef = useRef(null);
  const wasSpeakingOnPause = useRef(false);

  // VAD / Silence Auto-Stop refs
  const speechDetectedRef = useRef(false);
  const silenceTimerRef = useRef(0);
  const initialSilenceTimerRef = useRef(0);
  const stoppingRef = useRef(false);

  // Auto-collapse top avatar on keyboard show to maximize chat view
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ─── Fetch Voice Preference ───
  useEffect(() => {
    async function loadVoices() {
      try {
        const voices = await VoiceService.getAvailableEnglishVoices();
        setAvailableVoices(voices);
      } catch (e) {
        console.warn("Failed to retrieve English voices:", e);
      }

      try {
        const [settings, onboardingVoice, profile, savedVoice, savedGender, savedAvatarModel] = await Promise.all([
          settingsService.get().catch(() => null),
          AsyncStorage.getItem('speakmate_onboarding_voice'),
          profileService.get().catch(() => null),
          AsyncStorage.getItem('speakmate_selected_voice'),
          AsyncStorage.getItem('speakmate_voice_gender'),
          AsyncStorage.getItem('speakmate_avatar_model'),
        ]);
        const effectiveVoice = savedVoice || settings?.aiVoice || (savedGender === 'male' ? 'US Male' : 'Default');
        setPreferredVoice(effectiveVoice);
        if (onboardingVoice) {
          setOnboardingVoiceStyle(onboardingVoice);
        }
        if (savedAvatarModel) {
          setSelectedAvatarModel(savedAvatarModel);
        } else if (savedGender === 'male') {
          setSelectedAvatarModel('chitose');
        } else if (savedGender === 'female') {
          setSelectedAvatarModel('haru');
        } else {
          setSelectedAvatarModel('robopaws');
        }
        const savedGrade = await AsyncStorage.getItem('speakmate_school_grade');
        if (savedGrade) {
          setChatLevel(savedGrade);
        } else if (profile && profile.englishLevel) {
          setChatLevel(profile.englishLevel);
        }
        // Always reset voice speed to 1.0x (Normal Default) when entering a session
        setSpeechSpeed(1.0);
        await AsyncStorage.setItem('speakmate_voice_speed', '1.0');
      } catch (e) {
        console.warn("Failed to load user voice preferences:", e);
      }
    }
    const speakInitialMessage = (text) => {
      setTimeout(async () => {
        try {
          const [savedVoice, voices] = await Promise.all([
            AsyncStorage.getItem('speakmate_selected_voice'),
            VoiceService.getAvailableEnglishVoices().catch(() => []),
          ]);
          VoiceService.speak(text, {
            isMuted: false,
            voiceType: savedVoice || preferredVoice || 'Friendly',
            speechSpeed: 1.0,
            availableVoices: voices && voices.length > 0 ? voices : availableVoices,
            onStart: () => {
              setStatusText('Speaking');
              setIsSpeaking(true);
            },
            onDone: () => {
              setStatusText('Waiting for Response');
              setIsSpeaking(false);
            },
            onError: () => {
              setStatusText('Waiting for Response');
              setIsSpeaking(false);
            },
          });
        } catch (err) {
          console.warn('Auto speak 1st message note:', err);
        }
      }, 550);
    };

    // Load initial conversation messages
    const defaultGreeting = `Hello! I am SpeakMateAI, your English tutor for ${mode || 'General English'}. What would you like to practice today?`;
    if (sessionId && !String(sessionId).startsWith('sim_')) {
      chatService.detail(sessionId).then((data) => {
        if (data && data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          const lastAi = [...data.messages].reverse().find((m) => m.sender === 'ai');
          if (lastAi && lastAi.message) {
            speakInitialMessage(lastAi.message);
          }
        } else {
          setMessages([{
            id: 'intro_1',
            sender: 'ai',
            message: defaultGreeting,
            createdAt: new Date().toISOString(),
          }]);
          speakInitialMessage(defaultGreeting);
        }
      }).catch((e) => {
        console.warn('Could not load chat detail, using initial greeting:', e);
        setMessages([{
          id: 'intro_1',
          sender: 'ai',
          message: defaultGreeting,
          createdAt: new Date().toISOString(),
        }]);
        speakInitialMessage(defaultGreeting);
      });
    } else {
      setMessages([{
        id: 'intro_1',
        sender: 'ai',
        message: defaultGreeting,
        createdAt: new Date().toISOString(),
      }]);
      speakInitialMessage(defaultGreeting);
    }

    return () => {
      VoiceService.stop();
    };
  }, []);

  // Reload settings and voices whenever the screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const [settings, voices, onboardingVoice, savedVoice, savedGender] = await Promise.all([
          settingsService.get().catch(() => null),
          VoiceService.getAvailableEnglishVoices(),
          AsyncStorage.getItem('speakmate_onboarding_voice'),
          AsyncStorage.getItem('speakmate_selected_voice'),
          AsyncStorage.getItem('speakmate_voice_gender'),
        ]);
        const effectiveVoice = savedVoice || settings?.aiVoice || (savedGender === 'male' ? 'US Male' : undefined);
        if (effectiveVoice) {
          setPreferredVoice(effectiveVoice);
        }
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
        if (onboardingVoice) {
          setOnboardingVoiceStyle(onboardingVoice);
        }
      } catch (e) {
        console.warn("Failed to reload user voice preference on focus:", e);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const getSpeakableText = (msg) => {
    if (!msg) return '';
    let text = msg.message || '';
    const isCorrect = msg.grammarCorrection && (msg.grammarCorrection.includes('✅') || msg.grammarCorrection.toLowerCase().includes('correct'));
    if (msg.grammarCorrection && !isCorrect) {
      text += `. A better way to say that is: "${msg.grammarCorrection}".`;
      if (msg.explanation) {
        text += ` ${msg.explanation}`;
      }
    } else if (msg.betterSentence) {
      text += `. You could also express it as: "${msg.betterSentence}".`;
      if (msg.explanation) {
        text += ` ${msg.explanation}`;
      }
    }
    if (msg.followUpQuestion) {
      text += ` ${msg.followUpQuestion}`;
    }
    return text;
  };

  const avatarGender = VoiceService.getAvatarGender(preferredVoice, onboardingVoiceStyle);

  const speakText = (text, speedOverride = null) => {
    const effectiveSpeed = speedOverride !== null && speedOverride !== undefined ? speedOverride : speechSpeed;
    setCurrentSpokenText(text);
    VoiceService.speak(text, {
      isMuted,
      voiceType: preferredVoice,
      speechSpeed: effectiveSpeed,
      availableVoices,
      onStart: () => {
        setStatusText('Speaking');
        setIsSpeaking(true);
      },
      onDone: () => {
        setStatusText('Waiting for Response');
        setIsSpeaking(false);
        setCurrentSpokenText('');
      },
      onError: () => {
        setStatusText('Waiting for Response');
        setIsSpeaking(false);
        setCurrentSpokenText('');
      }
    });
  };

  const speakAiWithCoaching = (aiMsg) => {
    if (!aiMsg || isMuted) return;

    // Stop any in-flight voice immediately
    VoiceService.stop();

    let mainReply = aiMsg.message || '';
    if (aiMsg.followUpQuestion && !mainReply.includes(aiMsg.followUpQuestion)) {
      mainReply += ` ${aiMsg.followUpQuestion}`;
    }

    // Determine if there is a coaching tip to speak
    const isGrammarCorrect = !aiMsg.grammarCorrection ||
      aiMsg.grammarCorrection.includes('✅') ||
      aiMsg.grammarCorrection.toLowerCase().includes('correct') ||
      aiMsg.grammarCorrection.toLowerCase() === 'none';

    const cleanBetter = aiMsg.betterSentence && typeof aiMsg.betterSentence === 'string'
      ? aiMsg.betterSentence.replace(/[\[\]"]/g, '').trim()
      : null;
    const hasBetter = cleanBetter &&
      cleanBetter.toLowerCase() !== 'null' &&
      cleanBetter.toLowerCase() !== 'none' &&
      !cleanBetter.includes('✅');

    let coachingPhrase = null;
    if (!isGrammarCorrect && aiMsg.grammarCorrection) {
      const cleanCorrection = aiMsg.grammarCorrection.replace(/^👉\s*/, '').replace(/[\[\]"]/g, '').trim();
      coachingPhrase = `A better way to say that is: "${cleanCorrection}"`;
      if (aiMsg.explanation && aiMsg.explanation.toLowerCase() !== 'none' && !aiMsg.explanation.toLowerCase().includes('null')) {
        coachingPhrase += `. ${aiMsg.explanation}`;
      }
    } else if (hasBetter) {
      coachingPhrase = `A better way to say that is: "${cleanBetter}"`;
      if (aiMsg.explanation && aiMsg.explanation.toLowerCase() !== 'none' && !aiMsg.explanation.toLowerCase().includes('null')) {
        coachingPhrase += `. ${aiMsg.explanation}`;
      }
    }

    // Stage 1: Speak ONLY the conversational tutor reply
    setCurrentSpokenText(mainReply);
    VoiceService.speak(mainReply, {
      isMuted,
      voiceType: preferredVoice,
      speechSpeed,
      availableVoices,
      onStart: () => {
        setStatusText('Speaking');
        setIsSpeaking(true);
      },
      onDone: () => {
        // Stage 2: EXACT 0.45s (450ms) natural gap before speaking coaching tip
        if (coachingPhrase && !isMuted) {
          setStatusText('Coaching Tip');
          setTimeout(() => {
            if (!isMuted) {
              setCurrentSpokenText(coachingPhrase);
              VoiceService.speak(coachingPhrase, {
                isMuted,
                voiceType: preferredVoice,
                speechSpeed,
                availableVoices,
                onStart: () => {
                  setStatusText('Coaching Tip');
                  setIsSpeaking(true);
                },
                onDone: () => {
                  setStatusText('Waiting for Response');
                  setIsSpeaking(false);
                  setCurrentSpokenText('');
                },
                onError: () => {
                  setStatusText('Waiting for Response');
                  setIsSpeaking(false);
                  setCurrentSpokenText('');
                },
              });
            }
          }, 450); // 0.45 second conversational gap
        } else {
          setStatusText('Waiting for Response');
          setIsSpeaking(false);
          setCurrentSpokenText('');
        }
      },
      onError: () => {
        setStatusText('Waiting for Response');
        setIsSpeaking(false);
        setCurrentSpokenText('');
      },
    });
  };

  const handleSendMessage = async (textToSend = inputText) => {
    const cleanText = textToSend.trim();
    if (!cleanText) return;

    setInputText('');
    setHints([]);
    setEvaluating(true);
    setStatusText('Thinking');

    // Optimistically push user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      message: cleanText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      let response;
      if (sessionId && !String(sessionId).startsWith('sim_')) {
        response = await chatService.send(sessionId, cleanText, !isMuted, chatLevel);
      } else {
        const aiRes = await aiService.chat(cleanText);
        response = {
          id: Date.now() + 1,
          sender: 'ai',
          message: aiRes?.response || 'That is a great point! Can you tell me more about that?',
          grammarCorrection: '✅ Your sentence is correct.',
          betterSentence: null,
          vocabularySuggestions: null,
          explanation: null,
          followUpQuestion: 'What else would you like to explore?',
          createdAt: new Date().toISOString(),
        };
      }
      setMessages((prev) => [...prev, response]);

      const isCorrect = response.grammarCorrection && (
        response.grammarCorrection.includes('✅') || 
        response.grammarCorrection.toLowerCase().includes('correct')
      );
      if (isCorrect) {
        setAvatarExpression('happy');
        setTimeout(() => setAvatarExpression(undefined), 3500);
      }

      // Automatically play TTS with 0.45s coaching pause
      speakAiWithCoaching(response);
    } catch {
      try {
        const aiRes = await aiService.chat(cleanText);
        const fallbackMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          message: aiRes?.response || 'That is a great thought! Can you share more about that?',
          grammarCorrection: '✅ Your sentence is correct.',
          betterSentence: null,
          vocabularySuggestions: null,
          explanation: null,
          followUpQuestion: null,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        speakAiWithCoaching(fallbackMsg);
      } catch (err2) {
        Alert.alert('Tutor request failed', 'Could not get response. Please try again.');
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      }
    } finally {
      setEvaluating(false);
      setStatusText('Waiting for Response');
    }
  };

  const startRecording = async () => {
    try {
      VoiceService.stop();
      setIsSpeaking(false);

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Microphone Access Denied', 'Please allow microphone access to use voice chat.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (_) {}
        recordingRef.current = null;
      }

      const recordingInstance = new Audio.Recording();
      await recordingInstance.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      speechDetectedRef.current = false;
      silenceTimerRef.current = 0;
      initialSilenceTimerRef.current = 0;
      stoppingRef.current = false;

      recordingInstance.setProgressUpdateInterval(250);
      recordingInstance.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording || stoppingRef.current) return;

        const metering = status.metering ?? -100;
        if (metering > -42) {
          speechDetectedRef.current = true;
          silenceTimerRef.current = 0;
        } else if (speechDetectedRef.current) {
          silenceTimerRef.current += 250;
          if (silenceTimerRef.current >= 1500) { // 1.5s silence auto stop
            stopRecordingAndSend();
          }
        } else {
          initialSilenceTimerRef.current += 250;
          if (initialSilenceTimerRef.current >= 6000) {
            stopRecordingAndSend();
          }
        }
      });

      await recordingInstance.startAsync();
      recordingRef.current = recordingInstance;
      setRecording(true);
      setStatusText('Listening');
    } catch (err) {
      console.warn('Voice chat recording start failed:', err);
      Alert.alert('Microphone error', 'Could not initialize recording. Please try again.');
      setRecording(false);
      setStatusText('Waiting for Response');
    }
  };

  const stopRecordingAndSend = async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;

    setRecording(false);
    setStatusText('Thinking');
    setLoading(true);

    try {
      const rec = recordingRef.current;
      if (!rec) {
        setLoading(false);
        setStatusText('Waiting for Response');
        stoppingRef.current = false;
        return;
      }

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (!uri) throw new Error('Recording URI not found');

      const res = await speechService.speechToText({
        uri,
        name: 'chat_recording.m4a',
        type: Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mp4',
      });

      if (res && res.transcript && res.transcript.trim()) {
        setInputText(res.transcript.trim());
        handleSendMessage(res.transcript.trim());
      } else {
        Alert.alert('Silence Detected', 'Could not hear any speech. Please try speaking again.');
        setStatusText('Waiting for Response');
      }
    } catch (err) {
      console.warn('Voice chat transcription failed:', err);
      Alert.alert('Transcription Failed', 'Make sure you have an active internet connection.');
      setStatusText('Waiting for Response');
    } finally {
      setLoading(false);
      stoppingRef.current = false;
    }
  };

  const handleToggleRecording = () => {
    if (recording) {
      stopRecordingAndSend();
    } else {
      startRecording();
    }
  };

  // ─── Actions Menus ───
  const handleOpenMenu = (message) => {
    setSelectedMessage(message);
    setMenuVisible(true);
  };

  const handleCopyMessage = async () => {
    if (selectedMessage) {
      setMenuVisible(false);
      try {
        await Share.share({ message: selectedMessage.message });
      } catch (e) {
        Alert.alert('Message', selectedMessage.message);
      }
    }
  };

  const handleReplayVoice = () => {
    if (selectedMessage) {
      speakAiWithCoaching(selectedMessage);
      setMenuVisible(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (selectedMessage) {
      try {
        const bookmarked = await chatService.toggleBookmark(selectedMessage.id);
        Alert.alert(
          bookmarked ? 'Bookmarked! ⭐' : 'Bookmark Removed',
          bookmarked ? 'Saved grammar/vocabulary tips to your profile.' : 'Removed tip.'
        );
        // Update local message list bookmark state
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id ? { ...m, bookmarked } : m
          )
        );
      } catch {
        Alert.alert('Error', 'Failed to toggle bookmark.');
      } finally {
        setMenuVisible(false);
      }
    }
  };

  const handleAdjustSpeed = async () => {
    const SPEEDS = [0.5, 0.75, 1.0, 1.5, 2.0];
    const currentIndex = SPEEDS.indexOf(speechSpeed);
    const nextSpeed = SPEEDS[(currentIndex + 1) % SPEEDS.length];
    setSpeechSpeed(nextSpeed);
    await AsyncStorage.setItem('speakmate_voice_speed', String(nextSpeed));
    
    // Play last AI message with new speed
    const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
    if (lastAi) speakText(getSpeakableText(lastAi), nextSpeed);
  };



  const handleFetchHints = async () => {
    if (loadingHints || evaluating) return;
    if (hints.length > 0) {
      setHints([]);
      return;
    }
    setLoadingHints(true);
    try {
      if (sessionId && !String(sessionId).startsWith('sim_')) {
        const data = await chatService.getHints(sessionId);
        if (data && data.length > 0) {
          setHints(data);
          return;
        }
      }
      const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
      setHints(getModeHints(mode, lastAi));
    } catch (e) {
      const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
      setHints(getModeHints(mode, lastAi));
    } finally {
      setLoadingHints(false);
    }
  };

  const subtitleText = isSpeaking
    ? '✨ Tutor speaking...'
    : evaluating
    ? '✨ Tutor thinking...'
    : recording
    ? '✨ Tutor listening...'
    : '✨ Tap mic to speak';

  return (
    <LinearGradient colors={['#0B0F19', '#111827', '#1E1B4B']} style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <TouchableOpacity
                  onPress={() => {
                    const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
                    const nextIdx = (LEVELS.indexOf(chatLevel) + 1) % LEVELS.length;
                    setChatLevel(LEVELS[nextIdx]);
                  }}
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.25)',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#A5B4FC', fontWeight: '800' }}>⚡ {chatLevel}</Text>
                </TouchableOpacity>
                <Text style={styles.headerSubtitle}>{subtitleText}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.muteBtn}
              onPress={() => {
                if (!isMuted) VoiceService.stop();
                setIsMuted(!isMuted);
              }}
            >
              <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* ─── 3D AI Tutor Avatar (collapses when keyboard is active) ─── */}
      {!isKeyboardVisible && (
        <View style={styles.avatarContainer}>
          {/* Quick Avatar Buddy Selector */}
          <View style={styles.avatarSwitchRow}>
            <TouchableOpacity
              onPress={() => handleSelectAvatarModel('robopaws')}
              style={[
                styles.avatarPillBtn,
                selectedAvatarModel === 'robopaws' && styles.avatarPillBtnActive,
              ]}
            >
              <Text style={styles.avatarPillEmoji}>🤖</Text>
              <Text style={[styles.avatarPillText, selectedAvatarModel === 'robopaws' && styles.avatarPillTextActive]}>
                Robo-Paws
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectAvatarModel('haru')}
              style={[
                styles.avatarPillBtn,
                selectedAvatarModel === 'haru' && styles.avatarPillBtnActive,
              ]}
            >
              <Text style={styles.avatarPillEmoji}>👩</Text>
              <Text style={[styles.avatarPillText, selectedAvatarModel === 'haru' && styles.avatarPillTextActive]}>
                Haru
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectAvatarModel('chitose')}
              style={[
                styles.avatarPillBtn,
                selectedAvatarModel === 'chitose' && styles.avatarPillBtnActive,
              ]}
            >
              <Text style={styles.avatarPillEmoji}>👨</Text>
              <Text style={[styles.avatarPillText, selectedAvatarModel === 'chitose' && styles.avatarPillTextActive]}>
                Chitose
              </Text>
            </TouchableOpacity>
          </View>

          <AIAvatar
            model={selectedAvatarModel}
            gender={selectedAvatarModel === 'chitose' ? 'male' : selectedAvatarModel === 'robopaws' ? 'robopaws' : 'female'}
            isSpeaking={isSpeaking}
            spokenText={currentSpokenText}
            speechSpeed={speechSpeed}
            state={isSpeaking ? 'speaking' : evaluating ? 'thinking' : recording ? 'listening' : 'idle'}
            expression={avatarExpression}
            style={styles.avatar3d}
          />
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ─── Messages List ─── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          style={{ flex: 1 }}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.chatScroll}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';

          // Helper to check if feedback exists and is not "None"
          const hasFeedbackText = (text) => {
            if (!text) return false;
            const clean = text.trim().toLowerCase();
            return clean !== 'none' && clean !== 'null' && clean !== '' && !clean.includes('[better_sentence] none') && !clean.includes('[vocabulary] none');
          };

          const showGrammar = hasFeedbackText(item.grammarCorrection);
          const showBetter = hasFeedbackText(item.betterSentence);
          const showVocab = hasFeedbackText(item.vocabularySuggestions);
          const showFollowup = hasFeedbackText(item.followUpQuestion);

          const hasAnyFeedback = !isUser && (showGrammar || showBetter || showVocab || showFollowup);

          return (
            <AnimatedChatBubble isUser={isUser} onLongPress={() => handleOpenMenu(item)}>
              {/* Avatars */}
              {!isUser && (
                <View style={[styles.avatar, styles.aiAvatar]}>
                  <Ionicons name="sparkles" size={14} color="#FFF" />
                </View>
              )}

              <View style={{ flex: 1, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
                    {item.message}
                  </Text>
                  {item.bookmarked && (
                    <Ionicons name="star" size={12} color="#F59E0B" style={styles.starIcon} />
                  )}
                </View>

                {/* Tutor Feedback Card */}
                {hasAnyFeedback && (
                  <View style={styles.evalCard}>
                    <View style={styles.evalHeader}>
                      <Ionicons name="school" size={14} color={COLORS.primary} />
                      <Text style={styles.evalTitle}>Tutor Corrections & Feedback</Text>
                    </View>
                    
                    {showGrammar && (
                      <View style={styles.evalSection}>
                        <Text style={styles.evalLabel}>Grammar Correction</Text>
                        {item.grammarCorrection.includes('✅') || item.grammarCorrection.toLowerCase().includes('correct') ? (
                          <Text style={[styles.evalContent, { color: '#10B981', fontWeight: '700' }]}>
                            {item.grammarCorrection}
                          </Text>
                        ) : (
                          <Text style={styles.evalContent}>👉 {item.grammarCorrection}</Text>
                        )}
                      </View>
                    )}

                    {showBetter && (
                      <View style={styles.evalSection}>
                        <Text style={styles.evalLabel}>Better Sentence</Text>
                        <Text style={styles.evalContent}>💡 "{item.betterSentence}"</Text>
                      </View>
                    )}

                    {showVocab && (
                      <View style={styles.evalSection}>
                        <Text style={styles.evalLabel}>Vocabulary Upgrade</Text>
                        <Text style={styles.evalContent}>✨ {item.vocabularySuggestions}</Text>
                      </View>
                    )}

                    {hasFeedbackText(item.explanation) && (
                      <Text style={styles.evalExplanation}>{item.explanation}</Text>
                    )}

                    {showFollowup && (
                      <TouchableOpacity
                        style={styles.followUpBadge}
                        onPress={async () => {
                          try {
                            await Share.share({ message: item.followUpQuestion });
                          } catch (e) {
                            Alert.alert('Follow-up Question', item.followUpQuestion);
                          }
                        }}
                      >
                        <Text style={styles.followUpText}>❓ Follow-up: "{item.followUpQuestion}"</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {isUser && (
                <View style={[styles.avatar, styles.userAvatar]}>
                  <Ionicons name="person" size={14} color="#FFF" />
                </View>
              )}
            </AnimatedChatBubble>
          );
        }}
        ListFooterComponent={
          evaluating ? (
            <View style={styles.loadingBubbleWrapper}>
              <View style={styles.loadingBubble}>
                <JumpingDotsIndicator color={COLORS.primary} size={6} space={3} />
                <Text style={[styles.loadingText, { marginLeft: 8 }]}>Thinking...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* ─── AI Hint Suggestions Drawer (Manual Toggle matching Speaking Practice) ─── */}
      {hints.length > 0 && (
        <View style={styles.hintsTray}>
          <View style={styles.hintsHeader}>
            <View style={styles.hintsHeaderTitleRow}>
              <Ionicons name="chatbox-ellipses-outline" size={13} color="#A5B4FC" />
              <Text style={styles.hintsHeaderTitle}>Suggested Responses (Tap to send or listen):</Text>
            </View>
            <TouchableOpacity
              onPress={() => setHints([])}
              style={styles.hintCloseBtn}
            >
              <Ionicons name="close" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hintsScroll}>
            {hints.map((hint, idx) => (
              <View key={idx} style={styles.hintChipWrapper}>
                <TouchableOpacity
                  style={styles.hintChip}
                  onPress={() => {
                    setHints([]);
                    handleSendMessage(hint);
                  }}
                  disabled={evaluating || loading}
                >
                  <Text style={styles.hintChipText}>{hint}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.hintAudioBtn}
                  onPress={() => speakText(hint)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="volume-medium-outline" size={15} color="#818CF8" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.hintEditBtn}
                  onPress={() => {
                    setInputText(hint);
                    setHints([]);
                  }}
                >
                  <Ionicons name="pencil" size={12} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ─── Bottom Input Bar ─── */}
      <View style={styles.inputContainer}>
        {/* Controls row */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={handleAdjustSpeed}>
            <Ionicons name="speedometer-outline" size={16} color="#64748B" />
            <Text style={styles.controlText}>{speechSpeed}x</Text>
          </TouchableOpacity>

          {loadingHints ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginHorizontal: 12 }} />
          ) : (
            <TouchableOpacity style={styles.controlBtn} onPress={handleFetchHints}>
              <Ionicons name={hints.length > 0 ? "eye-off-outline" : "bulb-outline"} size={16} color={COLORS.primary} />
              <Text style={[styles.controlText, { color: COLORS.primary, fontWeight: '700' }]}>
                {hints.length > 0 ? 'Hide Hints' : 'Suggest Response'}
              </Text>
            </TouchableOpacity>
          )}

          {recording && (
            <View style={styles.voiceWaveBox}>
              <VoiceWaveBars isRecording={recording} />
            </View>
          )}
        </View>

        {/* Typing Input */}
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.actionBtn, recording && styles.recordingActiveBtn]}
            onPress={handleToggleRecording}
            disabled={loading || evaluating}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons
                name={recording ? 'stop' : 'mic'}
                size={22}
                color={recording ? '#FFF' : '#475569'}
              />
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={recording ? "Listening to speak..." : "Type response to tutor..."}
            placeholderTextColor="#94A3B8"
            editable={!recording && !evaluating}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || evaluating}
          >
            <Ionicons name="send" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>

      {/* ─── Long-press Menu Modal ─── */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Message Options</Text>

            <TouchableOpacity style={styles.modalOption} onPress={handleCopyMessage}>
              <Ionicons name="copy-outline" size={18} color="#475569" style={{ marginRight: 12 }} />
              <Text style={styles.modalOptionText}>Copy Text</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handleReplayVoice}>
              <Ionicons name="volume-high-outline" size={18} color="#475569" style={{ marginRight: 12 }} />
              <Text style={styles.modalOptionText}>Speak/Replay Voice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handleToggleBookmark}>
              <Ionicons
                name={selectedMessage?.bookmarked ? 'star' : 'star-outline'}
                size={18}
                color={selectedMessage?.bookmarked ? '#F59E0B' : '#475569'}
                style={{ marginRight: 12 }}
              />
              <Text style={styles.modalOptionText}>
                {selectedMessage?.bookmarked ? 'Remove Bookmark' : 'Bookmark Tip'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },

  avatarContainer: {
    height: 228,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 4,
    marginBottom: 2,
  },
  avatarSwitchRow: {
    position: 'absolute',
    top: 2,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatarPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  avatarPillBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.40)',
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  avatarPillEmoji: {
    fontSize: 11,
  },
  avatarPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  avatarPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  avatar3d: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { paddingBottom: 16, backgroundColor: 'transparent' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 11, color: '#A5B4FC', marginTop: 2, fontWeight: '700' },
  muteBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Chat scroll
  chatScroll: { padding: 16, gap: 14, paddingBottom: 32 },

  // Bubble Wrapper
  bubbleWrapper: { flexDirection: 'row', gap: 10, maxWidth: '85%' },
  userWrapper: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  aiWrapper: { alignSelf: 'flex-start', justifyContent: 'flex-start' },

  // Avatars
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  aiAvatar: { backgroundColor: '#6366F1' },
  userAvatar: { backgroundColor: '#4F46E5' },

  // Bubbles
  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 },
  userBubble: { backgroundColor: '#4F46E5', borderTopRightRadius: 4 },
  aiBubble: { backgroundColor: 'rgba(22, 28, 45, 0.75)', borderTopLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFF', fontWeight: '500' },
  aiText: { color: '#E5E7EB', fontWeight: '500' },
  starIcon: { alignSelf: 'flex-end', marginTop: 4 },

  // Interactive evaluation tutor card
  evalCard: { backgroundColor: 'rgba(17, 24, 39, 0.8)', width: '100%', borderRadius: 16, padding: 12, marginTop: 6, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  evalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  evalTitle: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  evalSection: { marginBottom: 6 },
  evalLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  evalContent: { fontSize: 12, color: '#E5E7EB', marginTop: 2, fontWeight: '600' },
  evalExplanation: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', paddingTop: 6 },
  followUpBadge: { marginTop: 8, backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  followUpText: { fontSize: 11, color: '#34D399', fontWeight: '600' },

  // Loading bubble
  loadingBubbleWrapper: { alignSelf: 'flex-start', marginLeft: 42, marginBottom: 12 },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(17, 24, 39, 0.7)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  loadingText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },

  // Input Container
  inputContainer: { backgroundColor: '#090E1A', paddingHorizontal: 16, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 34 : 16, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  controlBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  controlText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
  voiceWaveBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Input row
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.08)', alignItems: 'center', justifyContent: 'center' },
  recordingActiveBtn: { backgroundColor: '#EF4444' },
  textInput: { flex: 1, minHeight: 40, maxHeight: 80, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, color: '#FFF' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#CBD5E1' },

  // Wave styles
  voiceWaveRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  voiceWaveBar: { width: 4, height: 16, borderRadius: 2, backgroundColor: '#EF4444' },
  waveBarWrapper: { width: 4, height: 24 },
  waveBarPill: { width: 4, height: 16, borderRadius: 2, backgroundColor: '#EF4444' },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  modalTitle: { fontSize: 14, fontWeight: '800', color: '#FFF', marginBottom: 16 },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  modalOptionText: { fontSize: 13, color: '#E5E7EB', fontWeight: '700' },
  modalCancel: { marginTop: 16, height: 46, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.08)', alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 13, fontWeight: '700', color: '#E5E7EB' },

  // Hints Tray
  hintsTray: {
    backgroundColor: '#090E1A',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  hintsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  hintsHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintsHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A5B4FC',
  },
  hintCloseBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  hintChipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
  },
  hintChip: {
    paddingVertical: 4,
    marginRight: 6,
  },
  hintChipText: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  hintAudioBtn: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 4,
  },
  hintEditBtn: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
