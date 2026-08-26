import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Live2DAvatarView from '../avatar/Live2DAvatarView';

const FEMALE_AVATAR = require('../../../assets/images/tutor_female_anime.png');
const MALE_AVATAR   = require('../../../assets/images/tutor_male_anime.png');

const BAR_COUNT  = 5;
const RING_COUNT = 3;

export const STATE_CONFIG = {
  idle: {
    glow:     'rgba(139, 92, 246, 0.45)',
    ring:     '#8B5CF6',
    innerRing:'#A78BFA',
    dot:      '#A855F7',
    label:    'Ready',
    speed:    2800,
    pulseSpeed: 1600,
  },
  paused: {
    glow:     'rgba(245, 158, 11, 0.45)',
    ring:     '#F59E0B',
    innerRing:'#FCD34D',
    dot:      '#FBBF24',
    label:    'Paused',
    speed:    3200,
    pulseSpeed: 2000,
  },
  listening: {
    glow:     'rgba(6, 182, 212, 0.65)',
    ring:     '#06B6D4',
    innerRing:'#67E8F9',
    dot:      '#22D3EE',
    label:    'Listening...',
    speed:    1200,
    pulseSpeed: 800,
  },
  thinking: {
    glow:     'rgba(168, 85, 247, 0.6)',
    ring:     '#9333EA',
    innerRing:'#C084FC',
    dot:      '#C084FC',
    label:    'Thinking...',
    speed:    1600,
    pulseSpeed: 1100,
  },
  speaking: {
    glow:     'rgba(192, 132, 252, 0.75)',
    ring:     '#A855F7',
    innerRing:'#E879F9',
    dot:      '#F472B6',
    label:    'Speaking',
    speed:    550,
    pulseSpeed: 450,
  },
};

// ── Animated Waveform Bar for Status Pill ─────────────────────────────────────
function WaveBar({ delay, isSpeaking }) {
  const anim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    if (!isSpeaking) {
      Animated.timing(anim, { toValue: 0.25, duration: 200, useNativeDriver: true }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 240, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.2, duration: 240, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isSpeaking]);

  const scaleY = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  return <Animated.View style={[styles.waveBar, { transform: [{ scaleY }] }]} />;
}

// ── Thinking Animated Dots ────────────────────────────────────────────────────
function ThinkingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnim = (val, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(400),
        ])
      );

    const a1 = createAnim(dot1, 0);
    const a2 = createAnim(dot2, 150);
    const a3 = createAnim(dot3, 300);

    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.thinkingDot, { opacity: dot1, transform: [{ scale: dot1 }] }]} />
      <Animated.View style={[styles.thinkingDot, { opacity: dot2, transform: [{ scale: dot2 }] }]} />
      <Animated.View style={[styles.thinkingDot, { opacity: dot3, transform: [{ scale: dot3 }] }]} />
    </View>
  );
}

// ── Main AIAvatar Component ───────────────────────────────────────────────────
export default function AIAvatar({
  gender     = 'female',
  isSpeaking = false,
  state      = 'idle',
  expression,
  style,
  hideStatusPill = false,
  showOnlyPill = false,
  forceStatic = false,
}) {
  const isFemale      = String(gender).trim().toLowerCase() !== 'male';
  const targetModel   = isFemale ? 'haru' : 'chitose';
  const resolvedState = isSpeaking ? 'speaking' : state;
  const config        = STATE_CONFIG[resolvedState] || STATE_CONFIG.idle;
  const isHappy       = expression === 'happy' || expression === 'encouraging';

  const [useLive2D, setUseLive2D] = useState(!forceStatic);
  const [live2dReady, setLive2dReady] = useState(false);
  const [live2dError, setLive2dError] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('speakmate_avatar_mode').then((val) => {
      if (val === 'static') setUseLive2D(false);
      else if (!forceStatic) setUseLive2D(true);
    }).catch(() => {});
  }, [forceStatic]);

  // ── Entrance & Motion Animated Values ───────────────────────────────────────
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(0)).current;
  const ringAnims    = useRef(
    Array.from({ length: RING_COUNT }, () => new Animated.Value(0))
  ).current;

  // 1. Entrance Sequence
  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  // 2. Idle Natural Breathing Motion (Very subtle, smooth)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 3. State-Adaptive Glow & Scale Pulse
  useEffect(() => {
    const duration = config.pulseSpeed;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [resolvedState]);

  // 4. Harmonic Ripple Rings (Active while speaking or listening)
  useEffect(() => {
    const isRippling = isSpeaking || resolvedState === 'listening';
    if (!isRippling) {
      ringAnims.forEach((a) => a.setValue(0));
      return;
    }

    const interval = isSpeaking ? 420 : 700;
    const loops = ringAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * interval),
          Animated.timing(anim, {
            toValue: 1,
            duration: isSpeaking ? 1300 : 1800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      );
    });

    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isSpeaking, resolvedState]);

  // ── Interpolations ─────────────────────────────────────────────────────────
  const entranceScale = entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const entranceOpacity = entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // Floating: ±2.5px
  const floatY = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [-2.5, 2.5] });
  
  // Presence Scale: Subtle 1.00 -> 1.015 expansion
  const stateScale = resolvedState === 'listening' ? 1.02 : resolvedState === 'speaking' ? 1.015 : 1.0;
  const breatheScale = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.012] });

  // Glow Opacity & Scale
  const glowScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.06] });
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isSpeaking ? [0.65, 0.95] : resolvedState === 'listening' ? [0.55, 0.85] : [0.35, 0.65],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: entranceOpacity,
          transform: [{ scale: entranceScale }],
        },
      ]}
    >
      {/* ── Layer 1: Ambient Background Glow ── */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            backgroundColor: config.glow,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }, { translateY: floatY }],
          },
        ]}
      />

      {/* ── Layer 2: Harmonic Multi-Rings (Speaking & Listening) ── */}
      {ringAnims.map((anim, i) => {
        const ringScale   = anim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.35 + i * 0.16] });
        const ringOpacity = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.55, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.rippleRing,
              {
                borderColor: config.ring,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }, { translateY: floatY }],
              },
            ]}
          />
        );
      })}

      {/* ── Layer 3: Inner Illuminated Activity Ring ── */}
      <Animated.View
        style={[
          styles.activityRing,
          {
            borderColor: config.innerRing,
            shadowColor: config.innerRing,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }, { translateY: floatY }],
          },
        ]}
      />

      {/* ── Layer 4: Main Circular/Squircle Avatar Stage ── */}
      <Animated.View
        style={[
          styles.avatarStage,
          {
            borderColor: config.ring,
            shadowColor: config.ring,
            transform: [
              { translateY: floatY },
              { scale: Animated.multiply(breatheScale, new Animated.Value(stateScale)) },
            ],
          },
        ]}
      >
        {useLive2D && !live2dError ? (
          <Live2DAvatarView
            isSpeaking={isSpeaking}
            state={resolvedState}
            mood={isHappy ? 'happy' : 'neutral'}
            model={targetModel}
            style={styles.avatarCanvas}
            onLoaded={() => setLive2dReady(true)}
            onError={() => setLive2dError(true)}
          />
        ) : null}

        {(!useLive2D || !live2dReady || live2dError) && (
          <Image
            source={isFemale ? FEMALE_AVATAR : MALE_AVATAR}
            style={[styles.avatarCanvas, (useLive2D && live2dReady && !live2dError) && { display: 'none' }]}
            resizeMode="cover"
          />
        )}

        {/* Inner Luminous Shimmer Ring */}
        {isSpeaking && (
          <Animated.View
            style={[
              styles.innerShimmer,
              { borderColor: config.innerRing, opacity: glowOpacity },
            ]}
          />
        )}

        {/* Seamless Bottom Torso Vignette (Natural Bust Cutoff) */}
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(11, 15, 36, 0.4)', 'rgba(11, 15, 36, 0.88)', 'rgba(11, 15, 36, 0.98)']}
          locations={[0, 0.5, 0.82, 1.0]}
          style={styles.bottomVignette}
        />
      </Animated.View>

      {/* ── Layer 5: Glassmorphic State / Speaking Pill ── */}
      {!hideStatusPill && (
        <Animated.View
          style={[
            styles.statusPill,
            {
              borderColor: `${config.innerRing}60`,
              shadowColor: config.innerRing,
              transform: [{ translateY: floatY }],
            },
          ]}
        >
          {resolvedState === 'speaking' ? (
            <>
              <View style={styles.waveRow}>
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <WaveBar key={i} delay={i * 70} isSpeaking={isSpeaking} />
                ))}
              </View>
              <Text style={[styles.statusText, { color: '#F3E8FF' }]}>Speaking</Text>
            </>
          ) : resolvedState === 'thinking' ? (
            <>
              <ThinkingDots />
              <Text style={[styles.statusText, { color: '#E9D5FF' }]}>Thinking</Text>
            </>
          ) : (
            <>
              <View style={[styles.statusDot, { backgroundColor: config.dot, shadowColor: config.dot }]} />
              <Text style={[styles.statusText, { color: '#E9D5FF' }]}>{config.label}</Text>
            </>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ── Geometry Constants ────────────────────────────────────────────────────────
const STAGE_SIZE = 170; // 165–175px responsive primary focal stage

const styles = StyleSheet.create({
  container: {
    width:          '100%',
    height:         '100%',
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },

  // 1. Ambient Background Glow
  ambientGlow: {
    position:      'absolute',
    width:         STAGE_SIZE + 44,
    height:        STAGE_SIZE + 44,
    borderRadius:  (STAGE_SIZE + 44) / 2,
    shadowOpacity: 1,
    shadowRadius:  34,
    elevation:     12,
  },

  // 2. Harmonic Ripple Rings
  rippleRing: {
    position:     'absolute',
    width:        STAGE_SIZE + 28,
    height:       STAGE_SIZE + 28,
    borderRadius: (STAGE_SIZE + 28) / 2,
    borderWidth:  1.5,
  },

  // 3. Inner Activity Ring
  activityRing: {
    position:      'absolute',
    width:         STAGE_SIZE + 14,
    height:        STAGE_SIZE + 14,
    borderRadius:  (STAGE_SIZE + 14) / 2,
    borderWidth:   2,
    shadowOpacity: 0.9,
    shadowRadius:  20,
    elevation:     14,
  },

  // 4. Main Avatar Circular Stage
  avatarStage: {
    width:           STAGE_SIZE,
    height:          STAGE_SIZE,
    borderRadius:    STAGE_SIZE / 2,
    borderWidth:     2.5,
    overflow:        'hidden',
    backgroundColor: '#0B0F24',
    shadowOpacity:   0.85,
    shadowRadius:    18,
    shadowOffset:    { width: 0, height: 0 },
    elevation:       10,
    marginBottom:    4,
  },
  avatarCanvas: {
    width:    STAGE_SIZE,
    height:   STAGE_SIZE,
    position: 'absolute',
    top:      0,
    left:     0,
  },
  innerShimmer: {
    position:     'absolute',
    top:          2,
    left:         2,
    right:        2,
    bottom:       2,
    borderRadius: STAGE_SIZE / 2,
    borderWidth:  1.5,
  },
  bottomVignette: {
    position: 'absolute',
    left:     0,
    right:    0,
    bottom:   0,
    height:   48,
  },

  // 5. Glassmorphic Status Pill
  statusPill: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               8,
    marginTop:         8,
    minWidth:          120,
    paddingHorizontal: 15,
    paddingVertical:   6.5,
    borderRadius:      22,
    backgroundColor:   'rgba(15, 23, 42, 0.82)',
    borderWidth:       1.5,
    shadowOpacity:     0.4,
    shadowRadius:      10,
    shadowOffset:      { width: 0, height: 2 },
    elevation:         6,
  },
  statusDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize:      12,
    fontWeight:    '800',
    letterSpacing: 0.3,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
    height:        16,
  },
  waveBar: {
    width:           3,
    height:          16,
    borderRadius:    2,
    backgroundColor: '#F472B6',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  thinkingDot: {
    width:           5,
    height:          5,
    borderRadius:    2.5,
    backgroundColor: '#C084FC',
  },
});
