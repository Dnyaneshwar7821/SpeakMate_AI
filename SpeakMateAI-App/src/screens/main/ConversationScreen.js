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
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { speechService, speakingService, settingsService, profileService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';
import { VoiceService } from '../../services/VoiceService';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [chatLevel, setChatLevel] = useState('Beginner');
  const [avatarExpression, setAvatarExpression] = useState(undefined);
  const [hints, setHints] = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);

  const flatListRef = useRef(null);
  const timerInterval = useRef(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const wasSpeakingOnPause = useRef(false);
  const pausedAiText = useRef('');
  const isPausedRef = useRef(false);

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
        if (profile && profile.englishLevel) {
          setChatLevel(profile.englishLevel);
        }
        // Always reset voice speed to 1.0x (Normal Default) when entering a session
        setSpeechSpeed(1.0);
        await AsyncStorage.setItem('speakmate_voice_speed', '1.0');

        currentVoice = rawVoice;
      } catch (e) {
        console.warn("Failed to load user voice preference:", e);
      }

      // 3. Load initial greeting and play TTS
      try {
        const detail = await speakingService.detail(sessionId);
        if (detail.messages && detail.messages.length > 0) {
          setMessages(detail.messages);
          const lastMsg = detail.messages[detail.messages.length - 1];
          if (lastMsg.sender === 'ai' && !isMuted) {
            speakTextWithVoice(lastMsg.message, currentVoice, enVoices);
          }
        }
      } catch (e) {
        console.warn('Failed to load initial message', e);
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
    const SPEEDS = [0.5, 0.75, 1.0, 1.5, 2.0];
    const idx = SPEEDS.indexOf(speechSpeed);
    const nextSpeed = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeechSpeed(nextSpeed);
    await AsyncStorage.setItem('speakmate_voice_speed', String(nextSpeed));

    if (isPausedRef.current) return;

    const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
    if (lastAi) {
      speakTextWithVoice(getSpeakableText(lastAi), preferredVoice, availableVoices, nextSpeed);
    }
  };

  const handleToggleMute = () => {
    if (!isMuted) {
      VoiceService.stop();
    } else if (!isPausedRef.current) {
      // Replay last AI message only if session is not paused
      const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
      if (lastAi) speakText(getSpeakableText(lastAi));
    }
    setIsMuted(!isMuted);
  };

  const handleAdjustSpeed = () => {
    const nextSpeed = speechSpeed >= 1.2 ? 0.7 : speechSpeed + 0.15;
    setSpeechSpeed(nextSpeed);
    if (isPausedRef.current) return;
    // Replay last AI message with new speed
    const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
    if (lastAi) speakText(getSpeakableText(lastAi));
  };

  // ── Pause / Resume Handler ─────────────────────────────────────────
  const handleTogglePause = async () => {
    const nextPaused = !isPausedRef.current;
    updateIsPaused(nextPaused);

    if (nextPaused) {
      // ── PAUSE SESSION ──────────────────────────────────────────────
      // 1. Capture whether AI tutor was speaking when pause was clicked
      wasSpeakingOnPause.current = isSpeaking;
      const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
      if (lastAi) {
        pausedAiText.current = getSpeakableText(lastAi);
      }

      // 2. Immediately stop session timer
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      // 3. Immediately stop AI TTS speech
      try {
        VoiceService.stop();
        Speech.stop();
      } catch (e) {
        console.warn("Failed to stop voice service on pause:", e);
      }
      setIsSpeaking(false);

      // 4. Immediately stop mic recording if actively listening
      if (audioRecorder.isRecording) {
        try {
          await audioRecorder.stop();
        } catch (e) {
          console.warn("Failed to stop audio recording on pause:", e);
        }
      }

      // 5. Update status text to 'Session Paused'
      setStatusText('Session Paused');
    } else {
      // ── RESUME SESSION ─────────────────────────────────────────────
      setStatusText('Waiting for Response');

      // If AI tutor was speaking or interrupted when paused, resume AI speech from where it was paused!
      const textToResume = pausedAiText.current;
      const shouldResumeSpeaking = (wasSpeakingOnPause.current || textToResume) && !isMuted;

      if (shouldResumeSpeaking && textToResume) {
        wasSpeakingOnPause.current = false;
        setTimeout(() => {
          speakTextWithVoice(textToResume, preferredVoice, availableVoices);
        }, 100);
      }
    }
  };

  const handleFetchHints = async () => {
    if (loadingHints || isPaused) {
      if (isPaused) Alert.alert('Session Paused ⏸️', 'Please tap Resume to request suggestions.');
      return;
    }
    setLoadingHints(true);
    try {
      const data = await speakingService.getHints(sessionId);
      setHints(data || []);
    } catch (e) {
      console.warn("Failed to fetch hints:", e);
      Alert.alert('Hint Failed', 'Could not load suggestions.');
    } finally {
      setLoadingHints(false);
    }
  };

  // ── Recording Handling (Mic STT) ───────────────────────────────────
  const handleToggleRecording = async () => {
    if (isPaused) {
      Alert.alert('Session Paused ⏸️', 'Please tap Resume to start recording or speaking practice.');
      return;
    }

    if (audioRecorder.isRecording) {
      setStatusText('Thinking');
      setLoading(true);
      try {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        if (!uri) throw new Error('Recording uri missing');

        // Send to Whisper speech-to-text
        const stt = await speechService.speechToText({
          uri: uri,
          name: 'recording.m4a',
          type: Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mpeg',
        });

        if (!stt.transcript || !stt.transcript.trim()) {
          Alert.alert('Silence Detected 🤫', 'Could not hear any speech. Tap mic and try speaking again.');
          setStatusText('Waiting for Response');
          return;
        }

        // Send transcript to tutoring assistant
        await sendUserText(stt.transcript);
      } catch (error) {
        Alert.alert('Transcription Failed', 'Make sure you have active network connection and try again.');
        setStatusText('Waiting for Response');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        Speech.stop();
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Microphone Access Denied', 'Microphone permissions are required for speaking practice.');
          return;
        }
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setStatusText('Listening');
      } catch (e) {
        Alert.alert('Recording failed', 'Could not initialize or start recording.');
      }
    }
  };

  const sendUserText = async (text) => {
    try {
      setHints([]); // clear suggestions
      setStatusText('Thinking');
      const feedback = await speakingService.sendMessage({
        sessionId: sessionId,
        message: text,
        level: chatLevel,
      });

      // Update screen conversation
      const userMessage = { id: Date.now(), sender: 'user', message: text };
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: feedback.aiReply,
        grammarCorrection: feedback.grammarCorrection,
        betterSentence: feedback.betterSentence,
        vocabularySuggestions: feedback.vocabularySuggestions,
        explanation: feedback.explanation,
        followUpQuestion: feedback.followUpQuestion,
      };
      setMessages((prev) => [...prev, userMessage, aiMessage]);
      setCorrections(feedback);

      const isCorrect = feedback.grammarCorrection && (
        feedback.grammarCorrection.includes('✅') || 
        feedback.grammarCorrection.toLowerCase().includes('correct')
      );
      if (isCorrect) {
        setAvatarExpression('happy');
        setTimeout(() => setAvatarExpression(undefined), 3500);
      }

      // Speak AI response
      speakText(getSpeakableText(aiMessage));
    } catch {
      Alert.alert('Error', 'Tutor failed to process message.');
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
              Alert.alert('Error', 'Failed to generate session summary.');
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
    : audioRecorder.isRecording
    ? '✨ Tutor listening...'
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
  const hasAnyFeedback = corrections && (showGrammar || showBetter || showVocab || showFollowup);

  const avatarState = isPaused
    ? 'paused'
    : isSpeaking
    ? 'speaking'
    : loading
    ? 'thinking'
    : audioRecorder.isRecording
    ? 'listening'
    : 'idle';

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

      {/* Premium Sliding Segmented Control */}
      <LevelSegmentedControl
        selectedLevel={chatLevel}
        onChangeLevel={setChatLevel}
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
                <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>{item.message}</Text>
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

            {/* ── Tutor Feedback & Corrections — scrolls with chat ── */}
            {hasAnyFeedback && (
              <View style={styles.correctionBox}>
                <View style={styles.correctionHeader}>
                  <Ionicons name="school-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.correctionTitle}>Tutor Feedback & Corrections</Text>
                </View>
                {showGrammar && (
                  <View style={styles.correctionSection}>
                    <Text style={styles.correctionLabel}>Grammar Correction</Text>
                    {corrections.grammarCorrection.includes('✅') || corrections.grammarCorrection.toLowerCase().includes('correct') ? (
                      <Text style={[styles.correctionContent, { color: '#10B981', fontWeight: '700' }]}>
                        {corrections.grammarCorrection}
                      </Text>
                    ) : (
                      <Text style={styles.correctionContent}>👉 {corrections.grammarCorrection}</Text>
                    )}
                  </View>
                )}
                {showBetter && (
                  <View style={styles.correctionSection}>
                    <Text style={styles.correctionLabel}>Better Sentence</Text>
                    <Text style={styles.correctionContent}>💡 "{corrections.betterSentence}"</Text>
                  </View>
                )}
                {showVocab && (
                  <View style={styles.correctionSection}>
                    <Text style={styles.correctionLabel}>Vocabulary Upgrade</Text>
                    <Text style={styles.correctionContent}>✨ {corrections.vocabularySuggestions}</Text>
                  </View>
                )}
                {corrections && hasFeedbackText(corrections.explanation) && (
                  <Text style={styles.correctionExplanation}>{corrections.explanation}</Text>
                )}
                {showFollowup && (
                  <View style={[styles.correctionSection, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 6, marginTop: 4 }]}>
                    <Text style={styles.correctionLabel}>Follow-up Question</Text>
                    <Text style={[styles.correctionContent, { color: '#34D399' }]}>❓ "{corrections.followUpQuestion}"</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      />



      {/* ── Bottom Controls ── */}
      <View style={styles.controlsBar}>
        {/* Get Hint Row */}
        <View style={styles.hintTriggerRow}>
          {loadingHints ? (
            <ActivityIndicator size="small" color="#A5B4FC" style={{ marginVertical: 4 }} />
          ) : (
            <TouchableOpacity style={styles.hintTriggerBtn} onPress={handleFetchHints}>
              <Ionicons name="bulb-outline" size={14} color="#A5B4FC" style={{ marginRight: 4 }} />
              <Text style={styles.hintTriggerText}>Need help? Ask AI Tutor for a suggestion</Text>
            </TouchableOpacity>
          )}
        </View>

        {hints.length > 0 && (
          <View style={styles.hintsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hintsScroll}>
              {hints.map((hint, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.hintChip}
                  onPress={() => {
                    setHints([]); // hide chips immediately
                    sendUserText(hint); // send to AI for a real response
                  }}
                >
                  <Text style={styles.hintChipText}>{hint}</Text>
                </TouchableOpacity>
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
                <SoundWave isRecording={audioRecorder.isRecording} />
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
    backgroundColor: 'rgba(30, 27, 75, 0.85)',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  correctionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  correctionTitle: { fontSize: 13, fontWeight: '800', color: '#FFF', flex: 1 },
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
  hintTriggerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  hintTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hintTriggerText: {
    fontSize: 11,
    color: '#A5B4FC',
    fontWeight: '700',
  },
  hintsContainer: {
    backgroundColor: '#090E1A',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  hintsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  hintChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  hintChipText: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
  },

  // Bottom controls
  controlsBar: { backgroundColor: '#090E1A', paddingHorizontal: 16, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 28 : 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)' },
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
