import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * Parses inline formatting like **bold** and `code` into nested Text elements.
 */
function renderInlineFormatting(text, baseStyle, isDark) {
  if (!text) return null;

  // Split by bold (**...**) and inline code (`...`)
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return (
        <Text
          key={index}
          style={[
            baseStyle,
            {
              fontWeight: '700',
              color: isDark ? '#F1F5F9' : '#0F172A',
            },
          ]}
        >
          {boldContent}
        </Text>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      return (
        <Text
          key={index}
          style={[
            baseStyle,
            styles.inlineCode,
            {
              backgroundColor: isDark ? '#1E293B' : '#EEF2FF',
              color: isDark ? '#A5B4FC' : '#4F46E5',
              borderColor: isDark ? '#334155' : '#C7D2FE',
            },
          ]}
        >
          {' '}{codeContent}{' '}
        </Text>
      );
    }

    return (
      <Text key={index} style={baseStyle}>
        {part}
      </Text>
    );
  });
}

/**
 * Lightweight, robust native Markdown renderer for React Native.
 * Parses headers, bullet lists, numbered lists, dividers, and formatted paragraphs.
 */
export function MarkdownText({ content = '', style = {} }) {
  const { isDark } = useTheme();

  if (!content) return null;

  const lines = String(content).split(/\r?\n/);
  const elements = [];

  const textColor = isDark ? '#E2E8F0' : '#1E293B';
  const headingColor = isDark ? '#FFFFFF' : '#0F172A';
  const bulletColor = '#6366F1';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line / paragraph break
    if (!trimmed) {
      elements.push(<View key={`spacer-${i}`} style={styles.paragraphSpacer} />);
      continue;
    }

    // Divider ---
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(
        <View
          key={`hr-${i}`}
          style={[
            styles.divider,
            { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
          ]}
        />
      );
      continue;
    }

    // Headings: ###, ##, #
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      elements.push(
        <Text
          key={`h3-${i}`}
          style={[
            styles.h3,
            { color: headingColor },
            style,
          ]}
        >
          {renderInlineFormatting(text, [styles.h3, { color: headingColor }], isDark)}
        </Text>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      elements.push(
        <Text
          key={`h2-${i}`}
          style={[
            styles.h2,
            { color: headingColor },
            style,
          ]}
        >
          {renderInlineFormatting(text, [styles.h2, { color: headingColor }], isDark)}
        </Text>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      const text = trimmed.slice(2);
      elements.push(
        <Text
          key={`h1-${i}`}
          style={[
            styles.h1,
            { color: headingColor },
            style,
          ]}
        >
          {renderInlineFormatting(text, [styles.h1, { color: headingColor }], isDark)}
        </Text>
      );
      continue;
    }

    // Bullet points: - item, * item, • item
    if (/^[-*•]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*•]\s+/, '');
      elements.push(
        <View key={`bullet-${i}`} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: bulletColor }]} />
          <Text style={[styles.bulletText, { color: textColor }]}>
            {renderInlineFormatting(itemText, [styles.bodyText, { color: textColor }], isDark)}
          </Text>
        </View>
      );
      continue;
    }

    // Numbered lists: 1. item
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const itemText = numberedMatch[2];
      elements.push(
        <View key={`num-${i}`} style={styles.numberedRow}>
          <Text style={[styles.numberPrefix, { color: bulletColor }]}>{num}.</Text>
          <Text style={[styles.bulletText, { color: textColor }]}>
            {renderInlineFormatting(itemText, [styles.bodyText, { color: textColor }], isDark)}
          </Text>
        </View>
      );
      continue;
    }

    // Default Body Paragraph
    elements.push(
      <Text
        key={`p-${i}`}
        style={[styles.bodyText, { color: textColor }, style]}
      >
        {renderInlineFormatting(trimmed, [styles.bodyText, { color: textColor }], isDark)}
      </Text>
    );
  }

  return <View style={styles.container}>{elements}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paragraphSpacer: {
    height: 6,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    borderRadius: 1,
  },
  h1: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  h2: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 3,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    marginVertical: 1.5,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 8,
  },
  numberedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 2,
  },
  numberPrefix: {
    fontSize: 12.5,
    fontWeight: '700',
    marginRight: 6,
    marginTop: 0.5,
    minWidth: 16,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  inlineCode: {
    fontSize: 11.5,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderRadius: 4,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
});

export default MarkdownText;
