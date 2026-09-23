import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FAB_SIZE = 56;
const MARGIN = 16;

export function AssistantFAB({ onPress, loading = false }) {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  // Boundaries to prevent dragging off-screen or over bottom tabs/system pills
  const minX = MARGIN;
  const maxX = Math.max(minX, (SCREEN_WIDTH || 360) - FAB_SIZE - MARGIN);
  const minY = Math.max(insets.top, Platform.OS === 'android' ? 36 : 44) + 12;
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0) + 76;
  const maxY = Math.max(minY, (SCREEN_HEIGHT || 640) - bottomOffset - FAB_SIZE);

  // Default starting position: pinned near the bottom-right
  const defaultX = maxX;
  const defaultY = maxY;

  const pan = useRef(new Animated.ValueXY({ x: defaultX, y: defaultY })).current;
  const currentPos = useRef({ x: defaultX, y: defaultY });
  const hasUserMoved = useRef(false);

  // Sync to bottom-right whenever screen dimensions or insets become available (prevents top-left (0,0) bug)
  useEffect(() => {
    if (!hasUserMoved.current && SCREEN_WIDTH > 0 && SCREEN_HEIGHT > 0) {
      pan.setValue({ x: defaultX, y: defaultY });
      currentPos.current = { x: defaultX, y: defaultY };
    }
  }, [SCREEN_WIDTH, SCREEN_HEIGHT, defaultX, defaultY, pan]);

  useEffect(() => {
    const id = pan.addListener((value) => {
      currentPos.current = value;
    });
    return () => {
      pan.removeListener(id);
    };
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        hasUserMoved.current = true;
        pan.setOffset({
          x: currentPos.current.x,
          y: currentPos.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        // Tap detection threshold: if movement is < 6px, treat as press
        if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
          onPress?.();
          return;
        }

        // Edge snapping: gently snap to the nearest horizontal edge (left or right)
        const currentX = currentPos.current.x;
        const targetX = currentX < (SCREEN_WIDTH - FAB_SIZE) / 2 ? minX : maxX;
        const targetY = Math.min(Math.max(currentPos.current.y, minY), maxY);

        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 6,
          tension: 40,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          left: pan.x,
          top: pan.y,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View
        style={styles.touchable}
        accessibilityRole="button"
        accessibilityLabel="Open SpeakMate AI Assistant"
      >
        {/* Glow halo */}
        <View style={styles.glow} />

        <LinearGradient
          colors={['#4F46E5', '#6366F1', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          )}

          {/* Online green indicator badge */}
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    zIndex: 998,
    elevation: 12,
  },
  touchable: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#6366F1',
    opacity: 0.35,
    transform: [{ scale: 1.15 }],
  },
  fab: {
    width: FAB_SIZE - 2,
    height: FAB_SIZE - 2,
    borderRadius: (FAB_SIZE - 2) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  onlineBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
  },
});

export default AssistantFAB;
