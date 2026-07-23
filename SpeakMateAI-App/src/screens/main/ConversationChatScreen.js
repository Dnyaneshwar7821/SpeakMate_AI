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
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import { COLORS } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService, speechService, settingsService, profileService } from '../../services/appServices';
import { VoiceService } from '../../services/VoiceService';
import AIAvatar from '../../components/common/AIAvatar';
import JumpingDotsIndicator from '../../components/common/JumpingDotsIndicator';
import LevelSegmentedControl from '../../components/common/LevelSegmentedControl';

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

  // Long-press Actions Modal
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const flatListRef = useRef(null);
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  // VAD / Silence Auto-Stop refs
  const vadIntervalRef = useRef(null);
  const speechDetectedRef = useRef(false);
  const silenceTimerRef = useRef(0);
  const initialSilenceTimerRef = useRef(0);
  const stoppingRef = useRef(false);

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
        const [settings, onboardingVoice, profile] = await Promise.all([
          settingsService.get(),
          AsyncStorage.getItem('speakmate_onboarding_voice'),
          profileService.get().catch(() => null),
        ]);
        if (settings && settings.aiVoice) {
          setPreferredVoice(settings.aiVoice);
        }
        if (onboardingVoice) {
          setOnboardingVoiceStyle(onboardingVoice);
        }
        if (profile && profile.englishLevel) {
          setChatLevel(profile.englishLevel);
        }
        // Always reset voice speed to 1.0x (Normal Default) when entering a session
        setSpeechSpeed(1.0);
        await AsyncStorage.setItem('speakmate_voice_speed', '1.0');
      } catch (e) {
        console.warn("Failed to load user voice preferences:", e);
      }
    }
    loadVoices();

    // Load initial conversation messages
    chatService.detail(sessionId).then((data) => {
      setMessages(data.messages || []);
    }).catch(() => {
      Alert.alert('Load error', 'Failed to retrieve conversation.');
    });

    return () => {
      VoiceService.stop();
    };
  }, []);

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
      },
      onError: () => {
        setStatusText('Waiting for Response');
        setIsSpeaking(false);
      }
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
      const response = await chatService.send(sessionId, cleanText, !isMuted, chatLevel);
      setMessages((prev) => [...prev, response]);

      const isCorrect = response.grammarCorrection && (
        response.grammarCorrection.includes('✅') || 
        response.grammarCorrection.toLowerCase().includes('correct')
      );
      if (isCorrect) {
        setAvatarExpression('happy');
        setTimeout(() => setAvatarExpression(undefined), 3500);
      }

      // Automatically play TTS
      speakText(getSpeakableText(response));
    } catch {
      Alert.alert('Tutor request failed', 'Groq model is temporarily busy. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setEvaluating(false);
      setStatusText('Waiting for Response');
    }
  };

  const handleFetchHints = async () => {
    if (loadingHints || evaluating) return;
    setLoadingHints(true);
    try {
      const data = await chatService.getHints(sessionId);
      setHints(data || []);
    } catch (e) {
      console.warn("Failed to fetch hints:", e);
      Alert.alert('Hint Failed', 'Could not load suggestions.');
    } finally {
      setLoadingHints(false);
    }
  };

  const stopRecordingAndSend = async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }

    setRecording(false);
    setStatusText('Thinking');
    setLoading(true);
    try {
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }
      const uri = audioRecorder.uri;
      if (!uri) throw new Error('Recording URI not found');

      const res = await speechService.speechToText({
        uri,
        name: 'chat_recording.m4a',
        type: Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mpeg',
      });

      if (res.transcript && res.transcript.trim()) {
        setInputText(res.transcript.trim());
        setStatusText('Waiting for Response');
      } else {
        Alert.alert('Silence Detected', 'Could not hear any speech. Please try speaking again.');
        setStatusText('Waiting for Response');
      }
    } catch (err) {
      Alert.alert('Transcription Failed', 'Make sure you have an active internet connection.');
      setStatusText('Waiting for Response');
    } finally {
      setLoading(false);
      stoppingRef.current = false;
    }
  };

  const startVADLoop = () => {
    speechDetectedRef.current = false;
    silenceTimerRef.current = 0;
    initialSilenceTimerRef.current = 0;
    stoppingRef.current = false;

    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);

    vadIntervalRef.current = setInterval(async () => {
      if (!audioRecorder.isRecording || stoppingRef.current) {
        if (vadIntervalRef.current) {
          clearInterval(vadIntervalRef.current);
          vadIntervalRef.current = null;
        }
        return;
      }

      try {
        const status = await audioRecorder.getStatusAsync?.().catch(() => null);
        const metering = status?.metering ?? audioRecorder.metering ?? -100;

        if (metering > -40) {
          speechDetectedRef.current = true;
          silenceTimerRef.current = 0;
        } else if (speechDetectedRef.current) {
          silenceTimerRef.current += 300;
          if (silenceTimerRef.current >= 1500) { // 1.5s of silence after speech -> AUTO STOP
            stopRecordingAndSend();
          }
        } else {
          initialSilenceTimerRef.current += 300;
          if (initialSilenceTimerRef.current >= 6000) { // 6s initial silence -> AUTO STOP
            stopRecordingAndSend();
          }
        }
      } catch (e) {
        // Fallback polling
      }
    }, 300);
  };

  const handleToggleRecording = async () => {
    if (audioRecorder.isRecording || recording) {
      stopRecordingAndSend();
    } else {
      try {
        VoiceService.stop();
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Access Denied', 'Microphone permissions are required for voice chat.');
          return;
        }
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setRecording(true);
        setStatusText('Listening');
        startVADLoop();
      } catch (e) {
        Alert.alert('Microphone initialization failed.');
      }
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
      speakText(getSpeakableText(selectedMessage));
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
              <Text style={styles.headerSubtitle}>{subtitleText}</Text>
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

      {/* ─── 3D AI Tutor Avatar ─── */}
      <View style={styles.avatarContainer}>
        <AIAvatar
          gender={avatarGender}
          isSpeaking={isSpeaking}
          state={isSpeaking ? 'speaking' : evaluating ? 'thinking' : recording ? 'listening' : 'idle'}
          expression={avatarExpression}
          style={styles.avatar3d}
        />
      </View>

      {/* Premium Sliding Segmented Control */}
      <LevelSegmentedControl
        selectedLevel={chatLevel}
        onChangeLevel={setChatLevel}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => handleOpenMenu(item)}
              style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}
            >
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
            </TouchableOpacity>
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

      {/* ─── AI Hint Suggestions Drawer ─── */}
      {hints.length > 0 && (
        <View style={styles.hintsTray}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hintsScroll}>
            {hints.map((hint, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.hintChip}
                onPress={() => {
                  handleSendMessage(hint);
                }}
              >
                <Text style={styles.hintChipText}>{hint}</Text>
              </TouchableOpacity>
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
              <Ionicons name="bulb-outline" size={16} color={COLORS.primary} />
              <Text style={[styles.controlText, { color: COLORS.primary, fontWeight: '700' }]}>Suggest Response</Text>
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
    height: 220,
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
});
