import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { navigateToAssistantRoute } from '../../navigation/navigationRef';
import MarkdownText from './MarkdownText';
import StatRow from './StatRow';
import DeepLinkChip from './DeepLinkChip';
import MiniChart from './MiniChart';

export function MessageBubble({
  message,
  role,
  onClose,
  isSpeaking = false,
  onToggleSpeech = null,
}) {
  const { isDark } = useTheme();
  const isUser = message.sender === 'user';

  const handleLinkPress = (url) => {
    if (!url) return;
    onClose?.();
    setTimeout(() => {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        Linking.openURL(url).catch(() => {});
      } else {
        navigateToAssistantRoute(url);
      }
    }, 150);
  };

  if (isUser) {
    return (
      <View style={styles.userContainer}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBubble}
        >
          <Text style={styles.userText}>{message.content}</Text>
        </LinearGradient>
      </View>
    );
  }

  const { content, stats = [], suggestions = [], chart = null } = message;

  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDark ? '#334155' : '#E2E8F0';
  const titleColor = isDark ? '#F1F5F9' : '#1E293B';

  return (
    <View style={styles.assistantContainer}>
      <View style={[styles.assistantBubble, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        {/* Header: AI Title & Listen Button */}
        <View style={[styles.headerRow, { borderBottomColor: isDark ? '#334155' : '#F1F5F9' }]}>
          <View style={styles.titleRow}>
            <View style={styles.iconBox}>
              <Ionicons name="sparkles" size={12} color="#6366F1" />
            </View>
            <Text style={[styles.assistantTitle, { color: titleColor }]}>SpeakMate AI</Text>
          </View>

          {content && onToggleSpeech ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onToggleSpeech}
              style={[
                styles.listenPill,
                isSpeaking
                  ? styles.listenPillActive
                  : {
                      backgroundColor: isDark ? '#312E81' : '#EEF2FF',
                      borderColor: isDark ? '#4338CA' : '#C7D2FE',
                    },
              ]}
              accessibilityLabel={isSpeaking ? 'Stop voice reading' : 'Listen to message'}
            >
              <Ionicons
                name={isSpeaking ? 'volume-mute' : 'volume-high'}
                size={12}
                color={isSpeaking ? '#FFFFFF' : '#4F46E5'}
              />
              <Text
                style={[
                  styles.listenText,
                  { color: isSpeaking ? '#FFFFFF' : isDark ? '#C7D2FE' : '#4338CA' },
                ]}
              >
                {isSpeaking ? 'Stop' : 'Listen'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Content Body with Clickable Links */}
        {content ? <MarkdownText content={content} onLinkPress={handleLinkPress} /> : null}

        {/* Structured Chart Visualization */}
        {chart ? <MiniChart chart={chart} /> : null}

        {/* Stat Cards */}
        {Array.isArray(stats) && stats.length > 0 ? (
          <StatRow stats={stats} />
        ) : null}

        {/* Deep Link Chips */}
        {Array.isArray(suggestions) && suggestions.length > 0 ? (
          <View style={styles.chipsContainer}>
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <DeepLinkChip
                key={`${suggestion.route}-${index}`}
                suggestion={suggestion}
                role={role}
                onClose={onClose}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
    paddingLeft: 40,
  },
  userBubble: {
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '88%',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  assistantContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 5,
    paddingRight: 24,
  },
  assistantBubble: {
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 11,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  listenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  listenPillActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  listenText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
});

export default MessageBubble;
