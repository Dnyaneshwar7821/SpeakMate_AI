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
    glow:      'rgba(139, 92, 246, 0.45)',
    ring:      '#8B5CF6',
    innerRing: '#A78BFA',
    portalBg:  ['#181145', '#0A0E28'],
    dot:       '#A855F7',
    label:     'Ready',
    speed:     2800,
    pulseSpeed: 1600,
  },
  paused: {
    glow:      'rgba(245, 158, 11, 0.45)',
    ring:      '#F59E0B',
    innerRing: '#FCD34D',
    portalBg:  ['#3D260F', '#181108'],
    dot:       '#FBBF24',
    label:     'Paused',
    speed:     3200,
    pulseSpeed: 2000,
  },
  listening: {
    glow:      'rgba(6, 182, 212, 0.65)',
    ring:      '#06B6D4',
    innerRing: '#67E8F9',
    portalBg:  ['#0E3347', '#081726'],
    dot:       '#22D3EE',
    label:     'Listening...',
    speed:     1200,
    pulseSpeed: 800,
  },
  thinking: {
    glow:      'rgba(168, 85, 247, 0.6)',
    ring:      '#9333EA',
    innerRing: '#C084FC',
    portalBg:  ['#251347', '#0E0926'],
    dot:       '#C084FC',
    label:     'Thinking...',
    speed:     1600,
    pulseSpeed: 1100,
  },
  speaking: {
    glow:      'rgba(192, 132, 252, 0.75)',
    ring:      '#A855F7',
    innerRing: '#F472B6',
    portalBg:  ['#2D1554', '#110A2E'],
    dot:       '#F472B6',
    label:     'Speaking',
    speed:     550,
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

// ── Main AIAvatar Component (3D Pop-Out Holographic Portal) ───────────────────
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

  // ── Animated Values ─────────────────────────────────────────────────────────
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(0)).current;
  const ringAnims    = useRef(
    Array.from({ length: RING_COUNT }, () => new Animated.Value(0))
  ).current;

  // 1. Entrance Spring
  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      tension: 55,
      friction: 8.5,
      useNativeDriver: true,
    }).start();
  }, []);

  // 2. Idle Natural Breathing Motion (Subtle 3D floating)
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

  // 3. State Pulse
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

  // 4. Harmonic Ripple Rings (Speaking & Listening)
  useEffect(() => {
    const isRippling = isSpeaking || resolvedState === 'listening';
    if (!isRippling) {
      ringAnims.forEach((a) => a.setValue(0));
      return;
    }

    const interval = isSpeaking ? 400 : 700;
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
  const entranceScale   = entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const entranceOpacity = entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // Floating: ±2.5px
  const floatY = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [-2.5, 2.5] });
  
  // Presence Scale
  const stateScale = resolvedState === 'listening' ? 1.025 : resolvedState === 'speaking' ? 1.02 : 1.0;
  const breatheScale = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.012] });

  // Glow Opacity & Scale
  const glowScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.08] });
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isSpeaking ? [0.7, 0.95] : resolvedState === 'listening' ? [0.6, 0.9] : [0.35, 0.65],
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
      {/* ── STAGE WRAPPER ── */}
      <View style={styles.stageWrapper}>
        
        {/* ── Layer 1: Ambient Background Glow ── */}
        <Animated.View
          style={[
            styles.ambientGlow,
            {
              backgroundColor: config.glow,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }, { scaleX: 0.84 }, { translateY: floatY }],
            },
          ]}
        />

        {/* ── Layer 2: Harmonic Multi-Rings (Behind Portal) ── */}
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
                  transform: [{ scale: ringScale }, { scaleX: 0.84 }, { translateY: floatY }],
                },
              ]}
            />
          );
        })}

        {/* ── Layer 3: Neon Oval Portal Backdrop (Behind Haru) ── */}
        <Animated.View
          style={[
            styles.portalBackdrop,
            {
              borderColor: config.ring,
              shadowColor: config.innerRing,
              transform: [{ translateY: floatY }],
            },
          ]}
        >
          <LinearGradient
            colors={config.portalBg}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.portalGradient}
          />
          {/* Inner Shimmer Rim */}
          <View style={[styles.portalInnerRim, { borderColor: `${config.innerRing}60` }]} />
        </Animated.View>

        {/* ── Layer 4: Pop-Out Avatar (Emerging Outward & Floating over Top Rim) ── */}
        <Animated.View
          style={[
            styles.popOutAvatarContainer,
            {
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
              resizeMode="contain"
            />
          )}

          {/* Smooth Bottom Vignette to Anchor Torso into Portal */}
          <LinearGradient
            pointerEvents="none"
            colors={['transparent', 'rgba(11, 15, 36, 0.45)', 'rgba(11, 15, 36, 0.95)']}
            locations={[0, 0.55, 1.0]}
            style={styles.bottomVignette}
          />
        </Animated.View>
      </View>

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

// ── 3D Pop-Out Dimensions ─────────────────────────────────────────────────────
const PORTAL_W = 146; // Oval Portal Width
const PORTAL_H = 176; // Oval Portal Height
const AVATAR_W = 176; // Pop-out Avatar Width (wider than portal)
const AVATAR_H = 205; // Pop-out Avatar Height (taller than portal, breaks out of top rim)

const styles = StyleSheet.create({
  container: {
    width:          '100%',
    height:         '100%',
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },

  stageWrapper: {
    width:          AVATAR_W,
    height:         PORTAL_H + 16,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },

  // 1. Ambient Background Glow
  ambientGlow: {
    position:      'absolute',
    width:         PORTAL_W + 36,
    height:        PORTAL_H + 36,
    borderRadius:  (PORTAL_H + 36) / 2,
    shadowOpacity: 1,
    shadowRadius:  32,
    elevation:     10,
  },

  // 2. Harmonic Ripple Rings (Behind Portal)
  rippleRing: {
    position:     'absolute',
    width:        PORTAL_W + 28,
    height:       PORTAL_H + 28,
    borderRadius: (PORTAL_H + 28) / 2,
    borderWidth:  1.5,
  },

  // 3. Neon Oval Portal Backdrop (Behind Haru)
  portalBackdrop: {
    position:        'absolute',
    width:           PORTAL_W,
    height:          PORTAL_H,
    borderRadius:    PORTAL_W / 2,
    borderWidth:     2.5,
    overflow:        'hidden',
    shadowOpacity:   0.85,
    shadowRadius:    20,
    elevation:       8,
    top:             14,
  },
  portalGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  portalInnerRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: PORTAL_W / 2,
    borderWidth:  1.5,
    margin:       2,
  },

  // 4. Pop-Out Avatar (Foreground - breaks out over top rim)
  popOutAvatarContainer: {
    position:        'absolute',
    width:           AVATAR_W,
    height:          AVATAR_H,
    top:             -8, // Head and hair pop out 22px ABOVE the portal rim!
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'visible',
    zIndex:          10,
  },
  avatarCanvas: {
    width:    AVATAR_W,
    height:   AVATAR_H,
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
    backgroundColor:   'rgba(15, 23, 42, 0.85)',
    borderWidth:       1.5,
    shadowOpacity:     0.4,
    shadowRadius:      10,
    shadowOffset:      { width: 0, height: 2 },
    elevation:         6,
    zIndex:            20,
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
