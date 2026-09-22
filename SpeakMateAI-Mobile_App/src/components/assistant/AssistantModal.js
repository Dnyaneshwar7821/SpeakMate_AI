import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { speechService } from '../../services/appServices';
import { BlurredBackdrop } from './BlurredBackdrop';
import {
  DEFAULT_ROLE,
  QUICK_SUGGESTIONS_BY_ROLE,
  ROLE_LABEL,
  WELCOME_TEXT_BY_ROLE,
} from './constants';
import MessageBubble from './MessageBubble';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function AssistantModal({
  isOpen,
  onClose,
  messages = [],
  loading = false,
  error = null,
  role = DEFAULT_ROLE,
  onSendMessage,
  onResetChat,
  onClearError,
}) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const [draft, setDraft] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef(null);
  const isRecordingRef = useRef(false);
  const speechDetectedRef = useRef(false);
  const silenceTimerRef = useRef(0);
  const initialSilenceTimerRef = useRef(0);
  const stoppingRef = useRef(false);
  const recordingSessionIdRef = useRef(0);
  const startingRef = useRef(false);

  const SILENCE_THRESHOLD_MS = 3200; // 3.2s post-speech silence auto-stop
  const INITIAL_SILENCE_THRESHOLD_MS = 8000; // 8s initial silence before user speaks
  const MAX_RECORDING_DURATION_MS = 300000; // 5 minutes generous hard limit
  const METERING_SPEECH_THRESHOLD = -48; // dB volume threshold for speech detection

  const welcomeText = WELCOME_TEXT_BY_ROLE[role] || WELCOME_TEXT_BY_ROLE[DEFAULT_ROLE];
  const quickSuggestions = QUICK_SUGGESTIONS_BY_ROLE[role] || [];
  const roleTitle = ROLE_LABEL[role] || role;

  const isEmpty = messages.length === 0;

  // Auto-scroll to bottom on new messages or loading
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [isOpen, messages, loading]);

  // Clean up any ongoing recording when modal closes
  useEffect(() => {
    if (!isOpen && (recordingRef.current || isRecordingRef.current)) {
      (async () => {
        stoppingRef.current = true;
        isRecordingRef.current = false;
        setIsRecording(false);
        try {
          if (recordingRef.current) {
            recordingRef.current.setOnRecordingStatusUpdate(null);
            await recordingRef.current.stopAndUnloadAsync();
          }
        } catch (_) {}
        recordingRef.current = null;
        stoppingRef.current = false;
      })();
    }
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const text = String(textToSend || draft).trim();
    if (!text || loading) return;

    setDraft('');
    if (onSendMessage) {
      await onSendMessage(text);
    }
  };

  const stopRecordingAndSend = async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    isRecordingRef.current = false;
    setIsRecording(false);

    try {
      const rec = recordingRef.current;
      if (!rec) {
        stoppingRef.current = false;
        return;
      }

      try {
        rec.setOnRecordingStatusUpdate(null);
      } catch (_) {}

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (!uri) throw new Error('No audio recorded');

      const res = await speechService.speechToText({
        uri,
        name: 'assistant_voice.m4a',
        type: Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mp4',
      });

      if (res && res.transcript && res.transcript.trim()) {
        const transcribed = res.transcript.trim();
        setDraft(transcribed);
        handleSend(transcribed);
      } else {
        Alert.alert('Silence Detected', 'Could not hear any speech. Please try speaking again.');
      }
    } catch (err) {
      console.warn('[AssistantModal] Speech to text error:', err);
      Alert.alert('Voice Input Failed', 'Could not process audio. Please check your network connection.');
    } finally {
      stoppingRef.current = false;
    }
  };

  const handleToggleRecording = async () => {
    if (loading) return;

    if (isRecording || isRecordingRef.current) {
      await stopRecordingAndSend();
    } else {
      if (startingRef.current || isRecordingRef.current) return;
      startingRef.current = true;

      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Microphone Permission', 'Please allow microphone access to speak to the assistant.');
          startingRef.current = false;
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        if (recordingRef.current) {
          try {
            recordingRef.current.setOnRecordingStatusUpdate(null);
            await recordingRef.current.stopAndUnloadAsync();
          } catch (_) {}
          recordingRef.current = null;
        }

        const newRec = new Audio.Recording();
        await newRec.prepareToRecordAsync({
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

        const currentSessionId = ++recordingSessionIdRef.current;
        speechDetectedRef.current = false;
        silenceTimerRef.current = 0;
        initialSilenceTimerRef.current = 0;
        stoppingRef.current = false;

        newRec.setProgressUpdateInterval(250);
        newRec.setOnRecordingStatusUpdate((status) => {
          if (!status.isRecording || stoppingRef.current || recordingSessionIdRef.current !== currentSessionId) return;

          // 5-minute hard limit
          if (status.durationMillis && status.durationMillis >= MAX_RECORDING_DURATION_MS) {
            stopRecordingAndSend();
            return;
          }

          const metering = status.metering ?? -100;
          if (metering > METERING_SPEECH_THRESHOLD) {
            speechDetectedRef.current = true;
            silenceTimerRef.current = 0;
          } else if (speechDetectedRef.current) {
            silenceTimerRef.current += 250;
            if (silenceTimerRef.current >= SILENCE_THRESHOLD_MS) { // 3.2s silence -> AUTO STOP & SEND
              stopRecordingAndSend();
            }
          } else {
            initialSilenceTimerRef.current += 250;
            if (initialSilenceTimerRef.current >= INITIAL_SILENCE_THRESHOLD_MS) { // 8s initial silence -> AUTO STOP
              stopRecordingAndSend();
            }
          }
        });

        await newRec.startAsync();
        recordingRef.current = newRec;
        isRecordingRef.current = true;
        setIsRecording(true);
      } catch (err) {
        console.warn('[AssistantModal] Start recording error:', err);
        Alert.alert('Microphone Error', 'Could not start microphone recording.');
        isRecordingRef.current = false;
        setIsRecording(false);
      } finally {
        startingRef.current = false;
      }
    }
  };

  const panelBg = isDark ? '#0F172A' : '#FFFFFF';
  const panelBorder = isDark ? '#1E293B' : '#E2E8F0';
  const headerBg = isDark ? '#1E293B' : '#F8FAFC';
  const headerBorder = isDark ? '#334155' : '#E2E8F0';
  const inputBg = isDark ? '#1E293B' : '#F1F5F9';
  const inputBorder = isDark ? '#334155' : '#CBD5E1';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        {/* Fullscreen Blurred Backdrop */}
        <BlurredBackdrop />

        {/* Backdrop dismiss touch area */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.backdropDismissArea}
        />

        {/* Elevated Assistant Sheet Container */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.sheetContainer,
            {
              backgroundColor: panelBg,
              borderColor: panelBorder,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          {/* Top Accent Gradient Bar */}
          <LinearGradient
            colors={['#5243F5', '#7B61FF', '#00D2FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topAccentBar}
          />

          {/* Sheet Handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handlePill, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]} />
          </View>

          {/* Assistant Header */}
          <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
            {/* AI Avatar with Pulsing Green Dot */}
            <View style={styles.avatarBox}>
              <LinearGradient
                colors={['#5243F5', '#8F4FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </LinearGradient>
              <View style={[styles.liveBadge, { borderColor: headerBg }]}>
                <View style={styles.liveDot} />
              </View>
            </View>

            {/* Title & Role Info */}
            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <Text style={[styles.headerTitle, { color: textColor }]}>SpeakMate Assistant</Text>
                <View style={[styles.aiPill, { backgroundColor: isDark ? '#312E81' : '#EEF2FF', borderColor: isDark ? '#4338CA' : '#C7D2FE' }]}>
                  <Text style={[styles.aiPillText, { color: isDark ? '#A5B4FC' : '#4F46E5' }]}>AI</Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <Text style={[styles.roleText, { color: subtextColor }]}>{roleTitle}</Text>
                <Text style={[styles.dotDivider, { color: subtextColor }]}>•</Text>
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>

            {/* Header Action Buttons */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onResetChat}
                style={[styles.actionBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                accessibilityLabel="Reset conversation"
              >
                <Ionicons name="trash-outline" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={[styles.actionBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                accessibilityLabel="Close assistant"
              >
                <Ionicons name="close" size={20} color={isDark ? '#F1F5F9' : '#1E293B'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={onClearError}>
                <Ionicons name="close" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Conversation Stream Scroll Area */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isEmpty ? (
              <View style={styles.emptyContainer}>
                {/* Welcome Message Card */}
                <MessageBubble
                  message={{
                    id: 'welcome',
                    sender: 'assistant',
                    content: welcomeText,
                  }}
                  role={role}
                  onClose={onClose}
                />

                {/* Suggested Questions */}
                {quickSuggestions.length > 0 ? (
                  <View style={styles.suggestionsWrapper}>
                    <View style={styles.suggestionsHeader}>
                      <Ionicons name="sparkles" size={12} color="#F59E0B" style={{ marginRight: 5 }} />
                      <Text style={[styles.suggestionsTitle, { color: subtextColor }]}>
                        SUGGESTED QUESTIONS
                      </Text>
                    </View>

                    <View style={styles.suggestionsList}>
                      {quickSuggestions.map((question, index) => (
                        <TouchableOpacity
                          key={`${question}-${index}`}
                          activeOpacity={0.7}
                          onPress={() => handleSend(question)}
                          disabled={loading}
                          style={[
                            styles.suggestionButton,
                            {
                              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                              borderColor: isDark ? '#334155' : '#E2E8F0',
                            },
                          ]}
                        >
                          <Text style={[styles.suggestionText, { color: textColor }]} numberOfLines={2}>
                            {question}
                          </Text>
                          <Ionicons name="arrow-forward" size={14} color="#6366F1" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    role={role}
                    onClose={onClose}
                  />
                ))}

                {/* Thinking / Typing Indicator */}
                {loading ? (
                  <View style={styles.thinkingContainer}>
                    <View style={[styles.thinkingCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                      <ActivityIndicator size="small" color="#6366F1" style={{ marginRight: 8 }} />
                      <Text style={[styles.thinkingText, { color: subtextColor }]}>SpeakMate AI is thinking...</Text>
                    </View>
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>

          {/* Bottom Chat Input Dock */}
          <View style={[styles.inputDock, { backgroundColor: headerBg, borderTopColor: headerBorder }]}>
            <View style={[styles.inputBar, { backgroundColor: inputBg, borderColor: inputBorder }]}>
              <TextInput
                ref={inputRef}
                value={draft}
                onChangeText={setDraft}
                placeholder={
                  isRecording
                    ? 'Listening... Auto-sends when you finish speaking'
                    : loading
                    ? 'Thinking...'
                    : 'Ask SpeakMate Assistant...'
                }
                placeholderTextColor={subtextColor}
                style={[styles.textInput, { color: textColor }]}
                editable={!loading}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
              />

              {/* Speech-to-text Microphone Button */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleToggleRecording}
                disabled={loading}
                style={[
                  styles.micBtn,
                  isRecording && styles.micBtnActive,
                ]}
                accessibilityLabel={isRecording ? 'Stop voice recording' : 'Voice input'}
              >
                <Ionicons
                  name={isRecording ? 'mic' : 'mic-outline'}
                  size={18}
                  color={isRecording ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>

              {/* Send Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSend()}
                disabled={loading || !draft.trim()}
                style={[
                  styles.sendBtn,
                  (!draft.trim() || loading) && styles.sendBtnDisabled,
                ]}
                accessibilityLabel="Send question"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
                )}
              </TouchableOpacity>
            </View>

            {/* Micro AI Disclaimer */}
            <Text style={[styles.disclaimerText, { color: subtextColor }]}>
              Powered by SpeakMate AI • Grounded Academic Assistant
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    height: Math.min(SCREEN_HEIGHT * 0.85, 680),
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  topAccentBar: {
    height: 4,
    width: '100%',
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  handlePill: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  avatarBox: {
    position: 'relative',
    marginRight: 10,
  },
  avatarGradient: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  aiPill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  aiPillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dotDivider: {
    marginHorizontal: 5,
    fontSize: 11,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    flex: 1,
    fontSize: 11.5,
    color: '#EF4444',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  suggestionsWrapper: {
    marginTop: 14,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  suggestionsTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  suggestionsList: {
    gap: 6,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  thinkingContainer: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  thinkingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  thinkingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputDock: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 5,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 12.5,
    paddingVertical: 6,
  },
  micBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  disclaimerText: {
    fontSize: 9.5,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.1,
  },
});

export default AssistantModal;
