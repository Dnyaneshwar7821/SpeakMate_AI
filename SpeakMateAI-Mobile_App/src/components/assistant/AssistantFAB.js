import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  PanResponder,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// Professional Dual-Bubble Dialogue icon matching SpeakMate AI Web App
function DualBubbleDialogueIcon({ size = 26, color = '#FFFFFF' }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path
        d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        fill="rgba(255, 255, 255, 0.16)"
      />
      <Path
        d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"
        fill="rgba(255, 255, 255, 0.08)"
      />
    </Svg>
  );
}

const FAB_SIZE = 56;
const MARGIN = 16;
const DRAG_THRESHOLD = 6;

export function AssistantFAB({ onPress, loading = false, hasBottomTabs = true, visible = true }) {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  // Dynamic boundaries based on safe-area and presence of bottom tabs
  const minX = MARGIN;
  const maxX = Math.max(minX, (SCREEN_WIDTH || 360) - FAB_SIZE - MARGIN);
  const minY = Math.max(insets.top, Platform.OS === 'android' ? 36 : 44) + 12;

  // When bottom tabs exist: account for ~64-70px tab bar. When absent (drawer/stack pages): allow lower placement
  const tabOffset = hasBottomTabs ? (Platform.OS === 'android' ? 12 : 0) + 72 : 16;
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0) + tabOffset;
  const maxY = Math.max(minY, (SCREEN_HEIGHT || 640) - bottomOffset - FAB_SIZE);

  // Default starting position: pinned near bottom-right
  const defaultX = maxX;
  const defaultY = maxY;

  const pan = useRef(new Animated.ValueXY({ x: defaultX, y: defaultY })).current;
  const currentPosRef = useRef({ x: defaultX, y: defaultY });
  const hasUserMovedRef = useRef(false);
  const savedPreKeyboardYRef = useRef(null);

  // Mutable refs to prevent stale closures in PanResponder
  const boundsRef = useRef({ minX, maxX, minY, maxY });
  const onPressRef = useRef(onPress);
  const visibleRef = useRef(visible);

  // Keep refs synchronized on every render
  boundsRef.current = { minX, maxX, minY, maxY };
  onPressRef.current = onPress;
  visibleRef.current = visible;

  // Track position in listener
  useEffect(() => {
    const id = pan.addListener((value) => {
      currentPosRef.current = value;
    });
    return () => {
      pan.removeListener(id);
    };
  }, [pan]);

  // Sync position on dimension or tab status change
  useEffect(() => {
    if (SCREEN_WIDTH > 0 && SCREEN_HEIGHT > 0) {
      if (!hasUserMovedRef.current) {
        pan.setValue({ x: defaultX, y: defaultY });
        currentPosRef.current = { x: defaultX, y: defaultY };
      } else {
        // Clamp existing user position within updated screen bounds
        const clampedX = Math.min(Math.max(currentPosRef.current.x, minX), maxX);
        const clampedY = Math.min(Math.max(currentPosRef.current.y, minY), maxY);
        if (clampedX !== currentPosRef.current.x || clampedY !== currentPosRef.current.y) {
          pan.setValue({ x: clampedX, y: clampedY });
          currentPosRef.current = { x: clampedX, y: clampedY };
        }
      }
    }
  }, [SCREEN_WIDTH, SCREEN_HEIGHT, defaultX, defaultY, minX, maxX, minY, maxY, hasBottomTabs, pan]);

  // Keyboard awareness: smoothly move FAB above keyboard if it would be covered
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const keyboardHeight = e?.endCoordinates?.height || 260;
      const screenH = SCREEN_HEIGHT || 640;
      const maxAllowedY = screenH - keyboardHeight - FAB_SIZE - 12;

      if (currentPosRef.current.y > maxAllowedY) {
        savedPreKeyboardYRef.current = currentPosRef.current.y;
        Animated.spring(pan.y, {
          toValue: Math.max(boundsRef.current.minY, maxAllowedY),
          useNativeDriver: false,
          friction: 7,
          tension: 45,
        }).start();
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      if (savedPreKeyboardYRef.current !== null) {
        const restoreY = Math.min(
          Math.max(savedPreKeyboardYRef.current, boundsRef.current.minY),
          boundsRef.current.maxY
        );
        savedPreKeyboardYRef.current = null;
        Animated.spring(pan.y, {
          toValue: restoreY,
          useNativeDriver: false,
          friction: 7,
          tension: 45,
        }).start();
      }
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [SCREEN_HEIGHT, pan]);

  // PanResponder with mutable refs, live clamping, and strict tap threshold
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.hypot(gestureState.dx, gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        // Do NOT set hasUserMovedRef here — preserve default pinning if it's only a tap
        pan.setOffset({
          x: currentPosRef.current.x,
          y: currentPosRef.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        const dist = Math.hypot(gestureState.dx, gestureState.dy);
        if (dist > DRAG_THRESHOLD) {
          hasUserMovedRef.current = true;
        }

        // Live boundary clamping during active drag
        const { minX: bMinX, maxX: bMaxX, minY: bMinY, maxY: bMaxY } = boundsRef.current;
        const proposedX = currentPosRef.current.x + gestureState.dx;
        const proposedY = currentPosRef.current.y + gestureState.dy;

        const clampedX = Math.min(Math.max(proposedX, bMinX), bMaxX);
        const clampedY = Math.min(Math.max(proposedY, bMinY), bMaxY);

        pan.setValue({
          x: clampedX - currentPosRef.current.x,
          y: clampedY - currentPosRef.current.y,
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        const dist = Math.hypot(gestureState.dx, gestureState.dy);

        // Tap detected: if movement is <= 6px, treat as press and keep original position
        if (dist <= DRAG_THRESHOLD) {
          if (visibleRef.current) {
            onPressRef.current?.();
          }
          return;
        }

        // Genuine drag finished: gently snap to the nearest horizontal edge (left or right)
        const { minX: bMinX, maxX: bMaxX, minY: bMinY, maxY: bMaxY } = boundsRef.current;
        const currentX = currentPosRef.current.x;
        const currentY = currentPosRef.current.y;

        const targetX = currentX < (bMinX + bMaxX) / 2 ? bMinX : bMaxX;
        const targetY = Math.min(Math.max(currentY, bMinY), bMaxY);

        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 6,
          tension: 40,
        }).start();
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
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
          display: visible ? 'flex' : 'none',
          opacity: visible ? 1 : 0,
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
      {...panResponder.panHandlers}
    >
      <View
        style={styles.touchable}
        accessibilityRole="button"
        accessibilityLabel="Open SpeakMate AI Assistant"
      >
        {/* Glow halo matching mobile electric indigo palette */}
        <View style={styles.glow} />

        <LinearGradient
          colors={['#4338CA', '#4F46E5', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          {/* Subtle Inner Glass Top Highlight matching mobile app */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.08)', 'transparent']}
            style={styles.glassHighlight}
            pointerEvents="none"
          />

          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <DualBubbleDialogueIcon size={26} color="#FFFFFF" />
          )}
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
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: (FAB_SIZE - 2) * 0.45,
    borderTopLeftRadius: (FAB_SIZE - 2) / 2,
    borderTopRightRadius: (FAB_SIZE - 2) / 2,
  },
  glow: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#4F46E5',
    opacity: 0.30,
    transform: [{ scale: 1.16 }],
  },
  fab: {
    width: FAB_SIZE - 2,
    height: FAB_SIZE - 2,
    borderRadius: (FAB_SIZE - 2) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
});

export default AssistantFAB;
