import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const PALETTE = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#F97316', // Orange
];

/**
 * Robust, lightweight, responsive chart renderer for SpeakMate Mobile Assistant.
 * Supports bar, horizontal-bar, doughnut, pie, and line charts returned by backend.
 * Fails safely if chart data is missing or malformed.
 */
export function MiniChart({ chart }) {
  const { isDark } = useTheme();

  const chartModel = useMemo(() => {
    try {
      if (!chart || typeof chart !== 'object') return null;

      const labels = Array.isArray(chart.labels) ? chart.labels : [];
      const datasets = Array.isArray(chart.datasets) ? chart.datasets : [];
      if (labels.length === 0 || datasets.length === 0) return null;

      const primaryDataset = datasets[0] || {};
      const rawData = Array.isArray(primaryDataset.data) ? primaryDataset.data : [];

      const items = labels.map((label, index) => {
        const val = Number(rawData[index]) || 0;
        return {
          label: String(label || `Item ${index + 1}`).trim(),
          value: val,
          color: PALETTE[index % PALETTE.length],
        };
      });

      const total = items.reduce((sum, item) => sum + item.value, 0);
      const maxValue = Math.max(1, ...items.map((i) => i.value));
      const type = String(chart.type || 'horizontal-bar').toLowerCase().trim();
      const title = String(chart.title || 'Analytics Breakdown').trim();

      return {
        title,
        type,
        items,
        total,
        maxValue,
      };
    } catch (err) {
      console.warn('[MiniChart] Failed to parse chart data:', err);
      return null;
    }
  }, [chart]);

  if (!chartModel) return null;

  const { title, type, items, total, maxValue } = chartModel;

  const cardBg = isDark ? '#1E293B' : '#F8FAFC';
  const cardBorder = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const trackBg = isDark ? '#334155' : '#E2E8F0';

  const isCircular = type === 'doughnut' || type === 'pie' || type === 'donut';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={isCircular ? 'pie-chart-outline' : 'bar-chart-outline'}
            size={15}
            color="#6366F1"
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Text style={[styles.totalBadge, { color: subtextColor }]}>
          Total: {Math.round(total)}
        </Text>
      </View>

      {/* Circular (Doughnut / Pie) Chart */}
      {isCircular && total > 0 ? (
        <View style={styles.circularContainer}>
          <View style={styles.donutSvgWrapper}>
            <DonutSvg items={items} total={total} isDark={isDark} />
            <View style={styles.donutCenter}>
              <Text style={[styles.donutCenterValue, { color: textColor }]}>
                {Math.round(total)}
              </Text>
              <Text style={[styles.donutCenterLabel, { color: subtextColor }]}>
                Total
              </Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.circularLegend}>
            {items.map((item, index) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <View key={`legend-${index}`} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendLabel, { color: textColor }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={[styles.legendValue, { color: subtextColor }]}>
                    {item.value} ({pct}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        /* Horizontal Bar Chart (Default) */
        <View style={styles.barList}>
          {items.map((item, index) => {
            const pctOfMax = Math.min(100, Math.max(3, Math.round((item.value / maxValue) * 100)));
            const pctOfTotal = total > 0 ? Math.round((item.value / total) * 100) : 0;

            return (
              <View key={`bar-${index}`} style={styles.barItem}>
                <View style={styles.barLabelRow}>
                  <View style={styles.barLabelLeft}>
                    <View style={[styles.smallDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.barLabelText, { color: textColor }]} numberOfLines={1}>
                      {item.label}
                    </Text>
                  </View>
                  <Text style={[styles.barValueText, { color: subtextColor }]}>
                    {item.value} {total > 0 && item.value > 0 ? `(${pctOfTotal}%)` : ''}
                  </Text>
                </View>

                {/* Bar Track */}
                <View style={[styles.barTrack, { backgroundColor: trackBg }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${pctOfMax}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

/**
 * SVG-based smooth doughnut ring renderer.
 */
function DonutSvg({ items, total, isDark }) {
  const size = 110;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background track circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={isDark ? '#334155' : '#E2E8F0'}
        strokeWidth={strokeWidth}
        fill="transparent"
      />

      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        {items.map((item, idx) => {
          if (item.value <= 0) return null;
          const ratio = item.value / total;
          const strokeDash = ratio * circumference;
          const strokeOffset = currentOffset;
          currentOffset += strokeDash;

          return (
            <Circle
              key={`segment-${idx}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
              strokeDashoffset={-strokeOffset}
              strokeLinecap="round"
              fill="transparent"
            />
          );
        })}
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  totalBadge: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  barList: {
    gap: 8,
  },
  barItem: {
    marginBottom: 2,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  barLabelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  barValueText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  barTrack: {
    height: 7,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  circularContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  donutSvgWrapper: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  donutCenterLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  circularLegend: {
    flex: 1,
    marginLeft: 14,
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  legendValue: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default MiniChart;
