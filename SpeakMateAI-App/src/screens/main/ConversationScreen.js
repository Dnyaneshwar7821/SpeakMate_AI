/**
 * ConversationScreen — Phase 2
 * Voice conversation practice UI with AI tutor roleplay.
 * Handles microphone recording (expo-audio), transcript submission,
 * Groq AI evaluations, and automatic text-to-speech feedback (expo-speech).
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { speechService, speakingService, settingsService, profileService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';
import { VoiceService } from '../../services/VoiceService';
import AIAvatar from '../../components/common/AIAvatar';
import JumpingDotsIndicator from '../../components/common/JumpingDotsIndicator';
import LevelSegmentedControl from '../../components/common/LevelSegmentedControl';

// ─── Sound Waves Component ──────────────────────────────────────────────────

function SoundWave({ isRecording }) {
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

  if (isRecording) {
    return (
      <View style={styles.voiceWaveContainer}>
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

  return (
    <View style={[styles.avatarCircle, { backgroundColor: '#E2E8F0' }]}>
      <Ionicons name="mic-outline" size={32} color="#64748B" />
    </View>
  );
}

// ─── Screen Component ────────────────────────────────────────────────────────

export default function ConversationScreen({ navigation, route }) {
  const { sessionId, scenario, xpReward } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [corrections, setCorrections] = useState(null); // Latest message correction feedback
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0); // Always default to 1.0x normal speed
  const [statusText, setStatusText] = useState('Waiting for Response');
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [chatLevel, setChatLevel] = useState('1st Std');
  const [avatarExpression, setAvatarExpression] = useState(undefined);
  const [hints, setHints] = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);

  const flatListRef = useRef(null);
  const timerInterval = useRef(null);
  const recordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const wasSpeakingOnPause = useRef(false);
  const pausedAiText = useRef('');
  const isPausedRef = useRef(false);

  // VAD / Silence Auto-Stop refs
  const speechDetectedRef = useRef(false);
  const silenceTimerRef = useRef(0);
  const initialSilenceTimerRef = useRef(0);
  const stoppingRef = useRef(false);

  const updateIsPaused = (val) => {
    isPausedRef.current = val;
    setIsPaused(val);
  };

  const [availableVoices, setAvailableVoices] = useState([]);
  const [preferredVoice, setPreferredVoice] = useState('Friendly');
  const [onboardingVoiceStyle, setOnboardingVoiceStyle] = useState('Friendly');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const avatarGender = VoiceService.getAvatarGender(preferredVoice, onboardingVoiceStyle);

  // ── Conversation Setup ──────────────────────────────────────────────
  useEffect(() => {
    // Start session timer
    timerInterval.current = setInterval(() => {
      if (!isPaused) {
        setTimer((t) => t + 1);
      }
    }, 1000);

    async function initAndGreeting() {
      // 1. Fetch available voices
      let enVoices = [];
      try {
        enVoices = await VoiceService.getAvailableEnglishVoices();
        setAvailableVoices(enVoices);
      } catch (e) {
        console.warn("Failed to get available voices in session:", e);
      }

      // 2. Fetch user preferences & onboarding defaults & profile level
      let currentVoice = 'Friendly';
      try {
        const [settings, onboardingVoice, profile] = await Promise.all([
          settingsService.get(),
          AsyncStorage.getItem('speakmate_onboarding_voice'),
          profileService.get().catch(() => null),
        ]);
        let rawVoice = 'Default';
        if (settings && settings.aiVoice) {
          rawVoice = settings.aiVoice;
        }
        setPreferredVoice(rawVoice);
        if (onboardingVoice) {
          setOnboardingVoiceStyle(onboardingVoice);
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

        currentVoice = rawVoice;
      } catch (e) {
        console.warn("Failed to load user voice preference:", e);
      }

      // 3. Immediately speak the opening scenario greeting
      let initialGreetingText = route.params?.initialGreeting;
      if (!initialGreetingText) {
        const cleanScn = (scenario || '').replace(/\b(conversation|practice|session)\b/gi, '').trim();
        const scnLabel = cleanScn ? `${cleanScn} ` : '';
        initialGreetingText = `Hello! Welcome to our ${scnLabel}conversation practice. How can I help you today?`;
      }
      
      // 4. Sync background session if live backend session is available
      try {
        if (sessionId && !String(sessionId).startsWith('sim_')) {
          const detail = await speakingService.detail(sessionId);
          if (detail && detail.messages && detail.messages.length > 0) {
            const cleanMsgs = detail.messages.map((m) => {
              if (m.sender === 'ai' && (m.message.includes('Analyze User Input:') || m.message.includes('Context:') || m.message.includes('Requirements:'))) {
                const idx = m.message.lastIndexOf('\n\n');
                return {
                  ...m,
                  message: (idx !== -1 && idx < m.message.length - 1) ? m.message.substring(idx).trim() : initialGreetingText
                };
              }
              return m;
            });
            setMessages(cleanMsgs);
          }
        }
      } catch (e) {
        console.warn('Initial session sync note:', e);
      }

      const initialMessageObj = {
        id: 'intro_0',
        sender: 'ai',
        message: initialGreetingText,
        createdAt: new Date().toISOString(),
      };
      if (messages.length === 0) setMessages([initialMessageObj]);
      if (!isMuted) {
        speakTextWithVoice(initialGreetingText, currentVoice, enVoices);
      }
    }

    initAndGreeting();

    return () => {
      VoiceService.stop();
    };
  }, []); // Run only once on mount

  // Reload settings and voices whenever the screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const [settings, voices, onboardingVoice] = await Promise.all([
          settingsService.get(),
          VoiceService.getAvailableEnglishVoices(),
          AsyncStorage.getItem('speakmate_onboarding_voice'),
        ]);
        if (settings && settings.aiVoice) {
          setPreferredVoice(settings.aiVoice);
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

  // Separate effect: manage timer based on isPaused
  useEffect(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    if (!isPaused) {
      timerInterval.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [isPaused]);

  const getSpeakableText = (msg) => {
    if (!msg) return '';
    let text = msg.message || msg.aiReply || '';
    if (text.includes('Analyze User Input:') || text.includes('Context:')) {
      const idx = text.lastIndexOf('\n\n');
      if (idx !== -1 && idx < text.length - 1) {
        text = text.substring(idx).trim();
      }
    }
    if (msg.followUpQuestion && !text.includes(msg.followUpQuestion)) {
      text += ` ${msg.followUpQuestion}`;
    }
    return text;
  };

  const formatVocabulary = (text) => {
    if (!text) return '';
    let clean = String(text);
    clean = clean.replace(/[\[\]{}"']/g, '');
    clean = clean.replace(/^(vocabulary|words|suggestions)\s*:\s*/i, '');
    return clean.replace(/\s+/g, ' ').trim();
  };

  const speakAiWithCoaching = (aiMsg) => {
    if (!aiMsg || isPausedRef.current || isMuted) return;

    let mainReply = aiMsg.message || aiMsg.aiReply || '';
    if (aiMsg.followUpQuestion && !mainReply.includes(aiMsg.followUpQuestion)) {
      mainReply += ` ${aiMsg.followUpQuestion}`;
    }

    const cleanBetter = aiMsg.betterSentence && typeof aiMsg.betterSentence === 'string'
      ? aiMsg.betterSentence.replace(/[\[\]"]/g, '').trim()
      : null;

    const hasBetter = cleanBetter &&
      cleanBetter.toLowerCase() !== 'null' &&
      cleanBetter.toLowerCase() !== 'none' &&
      !cleanBetter.includes('✅');

    pausedAiText.current = mainReply;

    // Stage 1: Speak in-character conversational response
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
        // Stage 2: 1.0s natural conversational gap before speaking coaching tip
        if (hasBetter && !isPausedRef.current && !isMuted) {
          setStatusText('Coaching Tip');
          setTimeout(() => {
            if (!isPausedRef.current && !isMuted) {
              const coachingPhrase = `A better way to say that is: ${cleanBetter}`;
              pausedAiText.current = coachingPhrase;
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
                  wasSpeakingOnPause.current = false;
                },
                onError: () => {
                  setStatusText('Waiting for Response');
                  setIsSpeaking(false);
                  wasSpeakingOnPause.current = false;
                }
              });
            }
          }, 1000); // 1.0 second natural conversational gap
        } else {
          setStatusText('Waiting for Response');
          setIsSpeaking(false);
          wasSpeakingOnPause.current = false;
        }
      },
      onError: () => {
        setStatusText('Waiting for Response');
        setIsSpeaking(false);
        wasSpeakingOnPause.current = false;
      }
    });
  };

  const speakTextWithVoice = (text, voiceOverride = preferredVoice, voicesList = availableVoices, speedOverride = null) => {
    if (isPausedRef.current) return;
    const rawVoice = voiceOverride || preferredVoice;
    const effectiveSpeed = speedOverride !== null && speedOverride !== undefined ? speedOverride : speechSpeed;
    pausedAiText.current = text;
    VoiceService.speak(text, {
      isMuted,
      voiceType: rawVoice,
      speechSpeed: effectiveSpeed,
      availableVoices: voicesList,
      onStart: () => {
        setStatusText('Speaking');
        setIsSpeaking(true);
      },
      onDone: () => {
        setStatusText('Waiting for Response');
        setIsSpeaking(false);
        wasSpeakingOnPause.current = false;
      },
      onError: () => {
        setStatusText('Waiting for Response');
        setIsSpeaking(false);
        wasSpeakingOnPause.current = false;
      }
    });
  };

  const speakText = (text) => {
    speakTextWithVoice(text, preferredVoice);
  };

  const toggleSpeechSpeed = async () => {
    const speeds = [0.5, 0.75, 1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(speechSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setSpeechSpeed(nextSpeed);
    await AsyncStorage.setItem('speakmate_voice_speed', String(nextSpeed));

    if (isSpeaking && pausedAiText.current) {
      VoiceService.stop();
      speakTextWithVoice(pausedAiText.current, preferredVoice, availableVoices, nextSpeed);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      VoiceService.stop();
      setIsSpeaking(false);
      setStatusText('Waiting for Response');
    }
  };

  // ── Pause / Resume Handler ─────────────────────────────────────────
  const handleTogglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;

    if (nextPaused) {
      // 1. Immediately stop recording if active
      if (isRecording) {
        try {
          recordingRef.current?.stopAndUnloadAsync();
        } catch (_) {}
        recordingRef.current = null;
        setIsRecording(false);
      }
      // 2. Immediately stop AI voice playback
      if (isSpeaking) {
        wasSpeakingOnPause.current = true;
        VoiceService.stop();
        setIsSpeaking(false);
      } else {
        wasSpeakingOnPause.current = false;
      }
      setStatusText('Session Paused');
    } else {
      // 3. Resume session
      setStatusText('Waiting for Response');
      if (wasSpeakingOnPause.current && pausedAiText.current && !isMuted) {
        wasSpeakingOnPause.current = false;
        setTimeout(() => {
          speakTextWithVoice(pausedAiText.current, preferredVoice, availableVoices, speechSpeed);
        }, 150);
      }
    }
  };

  const cleanHintText = (raw) => {
    if (!raw) return null;
    let str = String(raw).trim();
    // Strip prefixes like "Suggestion 1:", "Option 1 -", "1. ", "Hint 1:"
    str = str.replace(/^(suggestion|option|hint|response|choice)\s*\d*\s*[:\-.]?\s*/i, '');
    str = str.replace(/^\d+[\.\)]\s*/, '');
    str = str.replace(/^["'`]|["'`]$/g, '').trim();
    if (!str) return null;
    const lower = str.toLowerCase();
    if (
      lower === 'suggestion one' ||
      lower === 'suggestion two' ||
      lower === 'suggestion three' ||
      lower.startsWith('suggestion ') ||
      lower.startsWith('option ') ||
      lower === 'simple option' ||
      lower === 'natural idiom option' ||
      lower === 'follow-up question option' ||
      lower === 'first realistic sentence student can speak' ||
      lower === 'second realistic sentence student can speak' ||
      lower === 'third realistic sentence student can speak' ||
      lower === 'none' ||
      lower === 'null'
    ) {
      return null;
    }
    return str;
  };

  const getScenarioHints = (scenarioTitle = '') => {
    const t = (scenarioTitle || '').toLowerCase();
    if (t.includes('daily conversation') || t.includes('small talk') || t.includes('routine') || t.includes('relaxed daily')) {
      return [
        "I've had a busy but really good day!",
        "How has your day been going so far?",
        "I'm planning to relax with some music later."
      ];
    } else if (t.includes('restaurant') || t.includes('food') || t.includes('burger') || t.includes('dining')) {
      return [
        "Could I please see the dinner menu?",
        "What do you recommend as today's special?",
        "Could we get a table for two, please?"
      ];
    } else if (t.includes('coffee') || t.includes('cafe')) {
      return [
        "I'd like a cappuccino with oat milk, please.",
        "Do you have any fresh pastries today?",
        "Can I get this to go, please?"
      ];
    } else if (t.includes('hotel') || t.includes('check-in')) {
      return [
        "Hi, I have a reservation under my name.",
        "What time is breakfast served tomorrow?",
        "Could you tell me the Wi-Fi password, please?"
      ];
    } else if (t.includes('airport') || t.includes('customs') || t.includes('travel') || t.includes('flight')) {
      return [
        "Here are my passport and boarding pass.",
        "I am traveling for a short vacation.",
        "Which gate does my connecting flight depart from?"
      ];
    } else if (t.includes('interview') || t.includes('job') || t.includes('career')) {
      return [
        "I have strong hands-on experience in problem solving.",
        "My greatest strength is communicating under pressure.",
        "I am excited about this role and your team culture."
      ];
    } else if (t.includes('shopping') || t.includes('store') || t.includes('clothes')) {
      return [
        "Excuse me, do you have this in a medium size?",
        "Where are the fitting rooms located?",
        "Is this item currently on discount?"
      ];
    } else if (t.includes('doctor') || t.includes('pharmacy') || t.includes('health') || t.includes('hospital')) {
      return [
        "I've had a mild headache since yesterday.",
        "How often should I take this medication?",
        "Thank you for the helpful advice, doctor."
      ];
    } else if (t.includes('zoo') || t.includes('animal')) {
      return [
        "Where can we find the elephant enclosure?",
        "What time is the animal feeding show?",
        "My favorite animals are the giant pandas!"
      ];
    } else if (t.includes('school') || t.includes('class') || t.includes('grade') || t.includes('std')) {
      return [
        "Good morning! I finished my homework assignment.",
        "Could you please explain that question again?",
        "My favorite subjects are science and English."
      ];
    } else if (t.includes('meeting') || t.includes('business') || t.includes('presentation')) {
      return [
        "Let's review the main milestones on the agenda.",
        "I agree with that strategy and propose next steps.",
        "Does anyone have questions on this slide?"
      ];
    } else if (t.includes('hobbies') || t.includes('gaming') || t.includes('music')) {
      return [
        "I love playing strategy games and listening to music.",
        "Have you played any good video games recently?",
        "I enjoy spending my free time outdoors."
      ];
    }
    return [
      "Could you tell me a bit more about that?",
      "That sounds interesting! What should we do next?",
      "Could you give me an example of that?"
    ];
  };

  const handleFetchHints = async () => {
    if (loadingHints || isPaused) {
      if (isPaused) Alert.alert('Session Paused ⏸️', 'Please tap Resume to view suggestions.');
      return;
    }

    // Toggle off if already showing
    if (hints.length > 0) {
      setHints([]);
      return;
    }

    setLoadingHints(true);
    try {
      if (sessionId && !String(sessionId).startsWith('sim_')) {
        const data = await speakingService.getHints(sessionId);
        if (data && data.length > 0) {
          const cleanList = data.map(cleanHintText).filter(Boolean);
          if (cleanList.length >= 2) {
            setHints(cleanList);
            return;
          }
        }
      }
      setHints(getScenarioHints(scenario));
    } catch (e) {
      console.warn("Failed to fetch hints, using fallback hints:", e);
      setHints(getScenarioHints(scenario));
    } finally {
      setLoadingHints(false);
    }
  };

  // ── Recording Handling (expo-av with 1.5s Silence Auto-Stop VAD) ──────
  const startRecording = async () => {
    try {
      // Stop any AI speech immediately
      VoiceService.stop();
      setIsSpeaking(false);

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Microphone Access Denied', 'Please grant microphone permissions to speak with your AI tutor.');
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

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
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

      recording.setProgressUpdateInterval(250);
      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording || stoppingRef.current) return;

        const metering = status.metering ?? -100;
        // User speaking detected if metering > -42 dB
        if (metering > -42) {
          speechDetectedRef.current = true;
          silenceTimerRef.current = 0;
        } else if (speechDetectedRef.current) {
          // User spoke and is now silent
          silenceTimerRef.current += 250;
          if (silenceTimerRef.current >= 1500) { // 1.5s silence after speaking -> Auto stop and send
            stopRecordingAndSend();
          }
        } else {
          // Initial silence before speaking
          initialSilenceTimerRef.current += 250;
          if (initialSilenceTimerRef.current >= 6000) { // 6s initial silence
            stopRecordingAndSend();
          }
        }
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setStatusText('Listening');
    } catch (error) {
      console.warn('Failed to start recording:', error);
      Alert.alert('Recording failed', 'Could not initialize microphone. Please check permissions.');
      setIsRecording(false);
      setStatusText('Waiting for Response');
    }
  };

  const stopRecordingAndSend = async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;

    setIsRecording(false);
    setLoading(true);
    setStatusText('Thinking');

    try {
      const recording = recordingRef.current;
      if (!recording) {
        setLoading(false);
        setStatusText('Waiting for Response');
        stoppingRef.current = false;
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      // Reset audio mode for normal speaker playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (!uri) throw new Error('Recording URI missing');

      // Send audio file to Whisper STT
      const stt = await speechService.speechToText({
        uri: uri,
        name: 'recording.m4a',
        type: Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mp4',
      });

      if (!stt || !stt.transcript || !stt.transcript.trim()) {
        Alert.alert('Silence Detected 🤫', 'Could not hear any speech. Tap mic and try speaking again.');
        setStatusText('Waiting for Response');
        return;
      }

      // Send transcript to AI tutor for response & tips
      await sendUserText(stt.transcript);
    } catch (error) {
      console.warn('Transcription failed:', error);
      Alert.alert('Transcription Failed', 'Make sure you have an active network connection and try again.');
      setStatusText('Waiting for Response');
    } finally {
      setLoading(false);
      stoppingRef.current = false;
    }
  };

  const handleToggleRecording = () => {
    if (isPaused) {
      Alert.alert('Session Paused ⏸️', 'Please tap Resume to start recording or speaking practice.');
      return;
    }

    if (isRecording) {
      stopRecordingAndSend();
    } else {
      startRecording();
    }
  };

  const sendUserText = async (text) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    try {
      setHints([]); // clear suggestions
      setStatusText('Thinking');
      setLoading(true);

      // Optimistically push user message
      const tempUserMsg = { id: Date.now(), sender: 'user', message: cleanText };
      setMessages((prev) => [...prev, tempUserMsg]);

      let feedback;
      if (sessionId && !String(sessionId).startsWith('sim_')) {
        feedback = await speakingService.sendMessage({
          sessionId: sessionId,
          message: cleanText,
          level: chatLevel,
        });
      } else {
        const aiRes = await aiService.speakingFeedback(cleanText);
        feedback = {
          aiReply: aiRes?.response || "That is very interesting! Could you share a bit more about that?",
          grammarCorrection: "✅ Your sentence is correct.",
          betterSentence: null,
          vocabularySuggestions: null,
          explanation: null,
          followUpQuestion: "What should we discuss next?",
          nativeTip: "Keep a natural, relaxed speaking cadence.",
          suggestedResponses: [
            "I would love to tell you more about it.",
            "Can you give me an example?"
          ],
        };
      }

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: feedback.aiReply,
        grammarCorrection: feedback.grammarCorrection,
        betterSentence: feedback.betterSentence,
        vocabularySuggestions: feedback.vocabularySuggestions,
        explanation: feedback.explanation,
        followUpQuestion: feedback.followUpQuestion,
        nativeTip: feedback.nativeTip,
        suggestedResponses: feedback.suggestedResponses,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCorrections(feedback);

      if (feedback.suggestedResponses && feedback.suggestedResponses.length > 0) {
        const cleanList = feedback.suggestedResponses.map(cleanHintText).filter(Boolean);
        if (cleanList.length > 0) {
          setHints(cleanList);
        }
      }

      const isCorrect = feedback.grammarCorrection && (
        feedback.grammarCorrection.includes('✅') || 
        feedback.grammarCorrection.toLowerCase().includes('correct')
      );
      if (isCorrect) {
        setAvatarExpression('happy');
        setTimeout(() => setAvatarExpression(undefined), 3500);
      }

      // Speak AI in-character response, pause 1.2s, then speak coaching phrasing
      speakAiWithCoaching(aiMessage);
    } catch (err) {
      console.warn('Backend speaking message failed, using resilient fallback:', err);
      const fallbackAiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        message: "That's a very good point! Let's continue exploring this topic.",
        grammarCorrection: "✅ Your sentence is correct.",
        betterSentence: null,
        vocabularySuggestions: null,
        explanation: null,
        followUpQuestion: "What do you think is the best next step?",
        nativeTip: "Speak with clear pauses between thoughts.",
        suggestedResponses: [
          "I think we should practice more.",
          "Could you give me another question?"
        ]
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
      setCorrections(fallbackAiMsg);
      setHints(fallbackAiMsg.suggestedResponses);
      speakAiWithCoaching(fallbackAiMsg);
    } finally {
      setLoading(false);
      setStatusText('Waiting for Response');
    }
  };

  // ── End Session ────────────────────────────────────────────────────
  const handleEndConversation = () => {
    Alert.alert(
      'End Conversation? 🏁',
      'Are you ready to submit your session and review your grammar feedback?',
      [
        { text: 'Continue Practice', style: 'cancel' },
        {
          text: 'End & Evaluate',
          style: 'default',
          onPress: async () => {
            setEnding(true);
            try {
              const summary = await speakingService.end(sessionId);
              navigation.replace('SpeakingSummary', { summary });
            } catch (e) {
              const calcXp = (dur) => {
                if (!dur || dur < 60) return 0;
                const mins = Math.floor(dur / 60);
                return Math.min(100, mins * 10);
              };
              const sessionDur = timer || 0;
              const fallbackSummary = {
                score: 85,
                summary: 'Completed speaking practice session.',
                durationSeconds: sessionDur,
                totalMessages: Array.isArray(messages) ? messages.length : 0,
                vocabularyLearned: 'General conversation vocabulary.',
                grammarCorrections: 'Good effort in sentence structure.',
                betterSentences: 'Keep practicing daily to improve fluency!',
                motivationalMessage: 'Great job completing your speaking practice today! 🌟',
                xpEarned: calcXp(sessionDur),
              };
              navigation.replace('SpeakingSummary', { summary: fallbackSummary });
            } finally {
              setEnding(false);
            }
          },
        },
      ]
    );
  };

  // ── Format Timer ───────────────────────────────────────────────────
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const subtitleText = isPaused
    ? '⏸️ Session paused — tap Resume'
    : isSpeaking
    ? '✨ Tutor speaking...'
    : loading
    ? '✨ Tutor thinking...'
    : isRecording
    ? '✨ Tutor listening (speak now)...'
    : '✨ Tap mic to speak';

  // ── Feedback helpers (used in FlatList footer) ────────────────────────
  const hasFeedbackText = (text) => {
    if (!text) return false;
    const clean = text.trim().toLowerCase();
    return clean !== 'none' && clean !== 'null' && clean !== '' && !clean.includes('[better_sentence] none') && !clean.includes('[vocabulary] none');
  };

  const showGrammar   = corrections && hasFeedbackText(corrections.grammarCorrection);
  const showBetter    = corrections && hasFeedbackText(corrections.betterSentence);
  const showVocab     = corrections && hasFeedbackText(corrections.vocabularySuggestions);
  const showFollowup  = corrections && hasFeedbackText(corrections.followUpQuestion);
  const showNativeTip = corrections && hasFeedbackText(corrections.nativeTip);
  const hasAnyFeedback = corrections && (showGrammar || showBetter || showVocab || showFollowup || showNativeTip);

  const avatarState = isPaused
    ? 'paused'
    : isSpeaking
    ? 'speaking'
    : loading
    ? 'thinking'
    : isRecording
    ? 'listening'
    : 'idle';

  const formatDisplayMessage = (text) => {
    if (!text) return '';
    let t = String(text);
    if (t.includes('Analyze User Input:') || t.includes('Context:') || t.includes('Identify Key Constraints:')) {
      const idx = t.lastIndexOf('\n\n');
      if (idx !== -1 && idx < t.length - 1) {
        t = t.substring(idx).trim();
      }
    }
    t = t.replace(/\[[^\]]*\]/g, '');
    t = t.replace(/\bdot\s*dot\s*dot\b/gi, '');
    t = t.replace(/\.{2,}/g, '');
    t = t.replace(/…/g, '');
    t = t.replace(/[*#_~`]/g, '');
    return t.replace(/\s+/g, ' ').trim() || text;
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
    <LinearGradient colors={['#0B0F19', '#111827', '#1E1B4B']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.exitBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>{scenario}</Text>
              <Text style={{ fontSize: 11, color: '#A5B4FC', marginTop: 2, fontWeight: '700' }}>{subtitleText}</Text>
            </View>
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={14} color="#FFF" />
              <Text style={styles.timerVal}>{formatTime(timer)}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ─── 3D AI Tutor Avatar ─── */}
      <View style={styles.avatarContainer}>
        <AIAvatar
          gender={avatarGender}
          isSpeaking={isSpeaking && !isPaused}
          state={avatarState}
          expression={avatarExpression}
          style={styles.avatar3d}
          hideStatusPill={true}
        />
      </View>

      {/* Status Pill directly below AI Avatar */}
      <AIAvatar
        gender={avatarGender}
        isSpeaking={isSpeaking && !isPaused}
        state={avatarState}
        expression={avatarExpression}
        showOnlyPill={true}
        style={{ marginTop: 2, marginBottom: 6 }}
      />

      {/* ── Chat Messages ── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        style={{ flex: 1 }}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          return (
            <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
              {!isUser && (
                <View style={styles.aiAvatarIcon}>
                  <Ionicons name="sparkles" size={12} color="#FFF" />
                </View>
              )}
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
                  {formatDisplayMessage(item.message)}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 40 }} />
        }
        ListFooterComponent={(
          <>
            {loading && (
              <View style={[styles.bubbleWrapper, styles.aiWrapper]}>
                <View style={styles.aiAvatarIcon}>
                  <Ionicons name="sparkles" size={12} color="#FFF" />
                </View>
                <View style={[styles.bubble, styles.aiBubble, { flexDirection: 'row', alignItems: 'center' }]}>
                  <JumpingDotsIndicator color={COLORS.primary} size={6} space={3} />
                  <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600', marginLeft: 8 }}>Thinking...</Text>
                </View>
              </View>
            )}

            {/* ── Real-Time "How to Say It" Coach Card ── */}
            {hasAnyFeedback && (
              <View style={styles.correctionBox}>
                <View style={styles.correctionHeader}>
                  <Ionicons name="sparkles" size={16} color="#818CF8" />
                  <Text style={styles.correctionTitle}>Speaking Coach & Phrasing</Text>
                </View>

                {showBetter && (
                  <View style={styles.betterSectionBox}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.betterSectionLabel}>Native Phrasing ("How to say it")</Text>
                      <TouchableOpacity
                        style={styles.listenPhraseMiniBtn}
                        onPress={() => speakTextWithVoice(corrections.betterSentence)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="volume-high" size={14} color="#6366F1" />
                        <Text style={styles.listenPhraseMiniText}>Listen</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.betterSectionContent}>"{corrections.betterSentence}"</Text>
                  </View>
                )}

                {showGrammar && (
                  <View style={styles.correctionSection}>
                    <Text style={styles.correctionLabel}>Grammar Check</Text>
                    {corrections.grammarCorrection.includes('✅') || corrections.grammarCorrection.toLowerCase().includes('correct') ? (
                      <Text style={[styles.correctionContent, { color: '#10B981', fontWeight: '700' }]}>
                        {corrections.grammarCorrection}
                      </Text>
                    ) : (
                      <Text style={styles.correctionContent}>👉 {corrections.grammarCorrection}</Text>
                    )}
                  </View>
                )}

                {showVocab && (
                  <View style={styles.correctionSection}>
                    <Text style={styles.correctionLabel}>Vocabulary Upgrade</Text>
                    <Text style={styles.correctionContent}>✨ {formatVocabulary(corrections.vocabularySuggestions)}</Text>
                  </View>
                )}

                {showNativeTip && (
                  <View style={styles.correctionSection}>
                    <Text style={styles.correctionLabel}>Fluency & Pronunciation Tip</Text>
                    <Text style={[styles.correctionContent, { color: '#38BDF8' }]}>💡 {corrections.nativeTip}</Text>
                  </View>
                )}

                {corrections && hasFeedbackText(corrections.explanation) && (
                  <Text style={styles.correctionExplanation}>{corrections.explanation}</Text>
                )}
              </View>
            )}
          </>
        )}
      />

      {/* ── Attractive Floating AI Hint Button (Positioned above the bottom black controls area at right) ── */}
      <View style={styles.floatingHintContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.floatingHintBtn}
          onPress={handleFetchHints}
          activeOpacity={0.85}
          disabled={loadingHints}
        >
          <LinearGradient
            colors={hints.length > 0 ? ['#4F46E5', '#3730A3'] : ['#8B5CF6', '#6366F1', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingHintGradient}
          >
            {loadingHints ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <View style={styles.hintIconAura}>
                  <Ionicons name="bulb" size={11} color="#FDE047" />
                </View>
                <Text style={styles.floatingHintText}>
                  {hints.length > 0 ? 'Hide Hints' : 'AI Hint ✨'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Bottom Controls ── */}
      <View style={styles.controlsBar}>
        {/* Interactive Quick-Reply Speech Chips */}
        {hints.length > 0 && (
          <View style={styles.hintsContainer}>
            <View style={styles.hintsHeaderRow}>
              <Ionicons name="chatbox-ellipses-outline" size={13} color="#A5B4FC" />
              <Text style={styles.hintsHeaderText}>Suggested Responses (Tap to speak or listen):</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hintsScroll}>
              {hints.map((hint, i) => (
                <View key={i} style={styles.hintChipWrapper}>
                  <TouchableOpacity
                    style={styles.hintChip}
                    onPress={() => {
                      setHints([]); // hide chips
                      sendUserText(hint); // send to AI
                    }}
                  >
                    <Text style={styles.hintChipText}>{hint}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.hintAudioBtn}
                    onPress={() => speakTextWithVoice(hint)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="volume-medium-outline" size={15} color="#818CF8" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.controlsRow}>
          {/* Speed Toggle */}
          <TouchableOpacity style={styles.auxBtn} onPress={toggleSpeechSpeed}>
            <Ionicons name="speedometer-outline" size={20} color="#9CA3AF" />
            <Text style={styles.auxBtnText}>{speechSpeed.toFixed(2).replace(/\.?0+$/, '')}x</Text>
          </TouchableOpacity>

          {/* Voice Wave & Main Mic Button */}
          <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <TouchableOpacity onPress={handleToggleRecording} activeOpacity={0.8}>
                <SoundWave isRecording={isRecording} />
              </TouchableOpacity>
            )}
          </View>

          {/* Mute AI */}
          <TouchableOpacity style={styles.auxBtn} onPress={handleToggleMute}>
            <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={22} color={isMuted ? '#EF4444' : '#9CA3AF'} />
            <Text style={[styles.auxBtnText, isMuted && { color: '#EF4444' }]}>{isMuted ? 'Muted' : 'Sound On'}</Text>
          </TouchableOpacity>
        </View>

        {/* Action Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.pauseBtn, isPaused && styles.resumeActiveBtn]}
            onPress={handleTogglePause}
          >
            <Ionicons name={isPaused ? 'play-outline' : 'pause-outline'} size={18} color={isPaused ? '#FFF' : '#E5E7EB'} />
            <Text style={[styles.pauseText, isPaused && { color: '#FFF' }]}>{isPaused ? 'Resume' : 'Pause'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endBtn} onPress={handleEndConversation} disabled={ending}>
            {ending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
                <Text style={styles.endBtnText}>End Conversation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0F19' },

  avatarContainer: {
    height: 165,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar3d: {
    width: '100%',
    height: '100%',
  },

  // Header
  header: { paddingBottom: 8, paddingHorizontal: 16, backgroundColor: 'transparent' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exitBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', maxWidth: 160 },
  statusText: { color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '600' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  timerVal: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  // Chat Bubbles
  chatList: { padding: 16, paddingBottom: 24 },
  bubbleWrapper: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  userWrapper: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  aiWrapper: { alignSelf: 'flex-start', justifyContent: 'flex-start', gap: 6 },
  aiAvatarIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  bubble: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
  userBubble: { backgroundColor: '#4F46E5', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: 'rgba(22, 28, 45, 0.75)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFF', fontWeight: '500' },
  aiText: { color: '#E5E7EB', fontWeight: '500' },

  // Tutor Feedback & Corrections — inside FlatList so it scrolls with chat
  correctionBox: {
    backgroundColor: 'rgba(30, 27, 75, 0.9)',
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  correctionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  correctionTitle: { fontSize: 13, fontWeight: '800', color: '#FFF', flex: 1 },
  betterSectionBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  betterSectionLabel: { fontSize: 10, fontWeight: '800', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: 0.5 },
  betterSectionContent: { fontSize: 13, color: '#FFF', marginTop: 4, fontWeight: '700', lineHeight: 18 },
  listenPhraseMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  listenPhraseMiniText: { fontSize: 10, fontWeight: '800', color: '#A5B4FC' },
  correctionSection: { marginTop: 8 },
  correctionLabel: { fontSize: 9, fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: 0.5 },
  correctionContent: { fontSize: 13, color: '#E5E7EB', marginTop: 3, fontWeight: '600', lineHeight: 18 },
  correctionExplanation: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(99, 102, 241, 0.2)', paddingTop: 8 },

  // Sound Wave mic
  voiceWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 64,
    width: 100,
  },
  voiceWaveBar: {
    width: 6,
    height: 24,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
  },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#4F46E5', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },

  // Floating AI Hint Button (Above the black controls bar, aligned at right)
  floatingHintContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 4,
    zIndex: 99,
  },
  floatingHintBtn: {
    borderRadius: 14,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  floatingHintGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4.5,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 4,
  },
  hintIconAura: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: 'rgba(253, 224, 71, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHintText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  hintsContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    marginBottom: 4,
  },
  hintsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  hintsHeaderText: {
    fontSize: 10,
    color: '#A5B4FC',
    fontWeight: '700',
  },
  hintsScroll: {
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
  },

  // Bottom controls
  controlsBar: { backgroundColor: '#090E1A', paddingHorizontal: 16, paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 28 : 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 8 },
  auxBtn: { alignItems: 'center', gap: 4, width: 70 },
  auxBtnText: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },

  // End / Pause actions
  actionsRow: { flexDirection: 'row', gap: 8 },
  pauseBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 12, paddingVertical: 9 },
  resumeActiveBtn: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  pauseText: { fontSize: 12, fontWeight: '700', color: '#E5E7EB' },
  endBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 9 },
  endBtnText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
});
