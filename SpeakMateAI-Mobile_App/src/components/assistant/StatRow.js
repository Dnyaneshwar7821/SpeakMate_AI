import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const isPositiveDelta = (delta) => {
  const cleaned = String(delta ?? '').replace(/,/g, '').trim();
  if (!cleaned) return null;
  const negative = /^-/.test(cleaned) || cleaned.startsWith('-');
  const positive = /^\+/.test(cleaned) || /^-?\d+(\.\d+)?%?$/.test(cleaned);
  if (positive && !negative) return true;
  if (negative) return false;
  return null;
};

export function StatRow({ stats = [] }) {
  const { isDark } = useTheme();

  if (!Array.isArray(stats) || stats.length === 0) return null;

  const cardBg = isDark ? '#1E293B' : '#F8FAFC';
  const cardBorder = isDark ? '#334155' : '#E2E8F0';
  const labelColor = isDark ? '#94A3B8' : '#64748B';
  const valueColor = isDark ? '#FFFFFF' : '#0F172A';

  return (
    <View style={styles.grid}>
      {stats.map((stat, index) => {
        const delta = isPositiveDelta(stat.delta);
        const deltaColor = delta === true ? '#10B981' : delta === false ? '#EF4444' : '#64748B';
        const deltaIcon = delta === true ? 'trending-up' : delta === false ? 'trending-down' : null;

        return (
          <View
            key={`${stat.label}-${index}`}
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
              {String(stat.label || '').toUpperCase()}
            </Text>

            <View style={styles.valRow}>
              <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
                {stat.value}
              </Text>

              {deltaIcon && stat.delta ? (
                <View style={styles.deltaBadge}>
                  <Ionicons name={deltaIcon} size={12} color={deltaColor} style={{ marginRight: 2 }} />
                  <Text style={[styles.deltaText, { color: deltaColor }]}>
                    {String(stat.delta).replace(/^[+-]/, '')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deltaText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default StatRow;
