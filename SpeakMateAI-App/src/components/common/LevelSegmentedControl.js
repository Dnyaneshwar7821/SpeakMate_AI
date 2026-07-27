import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GRADE_LEVELS = [
  '1st Std',
  '2nd Std',
  '3rd Std',
  '4th Std',
  '5th Std',
  '6th Std',
  '7th Std',
  '8th Std',
  '9th Std',
  '10th Std',
];

export default function LevelSegmentedControl({ selectedLevel = '1st Std', onChangeLevel }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="school-outline" size={13} color="#818CF8" />
        <Text style={styles.label}>School Grade Level:</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {GRADE_LEVELS.map((lvl) => {
          const isSelected = (selectedLevel || '1st Std') === lvl;
          return (
            <TouchableOpacity
              key={lvl}
              style={[styles.pill, isSelected && styles.activePill]}
              activeOpacity={0.75}
              onPress={() => onChangeLevel && onChangeLevel(lvl)}
            >
              <Text style={[styles.pillText, isSelected && styles.activePillText]}>
                {lvl}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  label: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
  },
  activePill: {
    backgroundColor: '#4F46E5',
    borderColor: '#818CF8',
    elevation: 3,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
