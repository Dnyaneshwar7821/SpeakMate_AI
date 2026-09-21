import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { navigateToAssistantRoute } from '../../navigation/navigationRef';

export function DeepLinkChip({ suggestion, role, onClose }) {
  const { isDark } = useTheme();

  const route = suggestion?.route;
  if (!route) return null;

  if (suggestion.targetRole && suggestion.targetRole !== role) {
    return null;
  }

  const handlePress = () => {
    onClose?.();
    setTimeout(() => {
      navigateToAssistantRoute(route);
    }, 150);
  };

  const bg = isDark ? '#1E1B4B' : '#EEF2FF';
  const border = isDark ? '#3730A3' : '#C7D2FE';
  const text = isDark ? '#C7D2FE' : '#4338CA';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.chip,
        { backgroundColor: bg, borderColor: border },
      ]}
    >
      <Text style={[styles.label, { color: text }]}>
        {suggestion.label || 'View'}
      </Text>
      <Ionicons name="arrow-forward" size={12} color={text} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
    marginTop: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default DeepLinkChip;
