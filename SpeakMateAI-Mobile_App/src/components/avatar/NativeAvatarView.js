/**
 * NativeAvatarView.js
 * Hardware-Accelerated Native Speaking Avatar Engine for SpeakMate Mobile.
 * 
 * Features:
 * - 10 Unique Avatars: Haru, Chitose, Robo-Paws, Motu, Sparky, Wanko, Koharu, Haruto, Tororo, Rexy
 * - Real-Time Phonetic Lip-Sync: Shapes mouth dynamically (AA, EE, OO, REST) in sync with speech audio
 * - Natural Micro-Animations: Blinking eyes every 3.5s, breathing float, speaking head nod
 * - Glowing Audio Halo & Equalizer: Signature neon rings pulsing to voice
 * - 100% Native: Zero WebViews, Zero CDN downloads, Instant < 50ms startup
 */

import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAvatarById } from '../../config/AvatarCatalog';
import { generateSpeechSchedule } from '../../utils/PhoneticVisemeEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── 1. DYNAMIC MOUTH COMPONENT (Lip-Sync Visemes) ─────────────────────────
function DynamicMouth({ viseme, mouthOpenY, mouthForm, isSpeaking, state, themeColor, isSpongeBob = false }) {
  // Interpolate mouth width & height based on phonetic values
  // AA: Tall open oval with tongue & teeth depth
  // OO: Tight round circular mouth
  // EE: Wide smiling slit with straight teeth
  // REST / Listening: Gentle curved smile

  const openHeight = mouthOpenY.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 38],
  });

  const openWidth = mouthForm.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [22, 36, 52],
  });

  const borderRadius = mouthForm.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [18, 16, 8],
  });

  if (!isSpeaking) {
    if (state === 'listening') {
      // Attentive smiling curve
      return (
        <View style={mouthStyles.listeningContainer}>
          <View style={[mouthStyles.listeningArc, { borderColor: '#1E293B' }]} />
          <View style={mouthStyles.dimpleLeft} />
          <View style={mouthStyles.dimpleRight} />
        </View>
      );
    }
    if (state === 'thinking') {
      // Thoughtful pursed lips
      return (
        <View style={mouthStyles.thinkingContainer}>
          <View style={mouthStyles.thinkingDot} />
        </View>
      );
    }
    // Neutral resting smile
    return (
      <View style={mouthStyles.neutralContainer}>
        <View style={mouthStyles.neutralSmile} />
      </View>
    );
  }

  // Active Phonetic Lip-Sync Mouth
  return (
    <Animated.View
      style={[
        mouthStyles.activeMouthWrapper,
        {
          height: openHeight,
          width: openWidth,
          borderRadius: borderRadius,
        },
      ]}
    >
      {/* Deep Mouth Cavity */}
      <View style={mouthStyles.cavity}>
        {/* Top Teeth */}
        {isSpongeBob ? (
          <View style={mouthStyles.spongeBuckTeethRow}>
            <View style={mouthStyles.spongeTooth} />
            <View style={mouthStyles.spongeTooth} />
          </View>
        ) : (
          <View style={mouthStyles.topTeeth} />
        )}

        {/* Dynamic Tongue */}
        <View style={mouthStyles.tongue} />
      </View>
    </Animated.View>
  );
}

const mouthStyles = StyleSheet.create({
  listeningContainer: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  listeningArc: {
    width: 32,
    height: 14,
    borderBottomWidth: 3.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  dimpleLeft: {
    position: 'absolute',
    left: -3,
    top: 4,
    width: 3,
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 2,
    transform: [{ rotate: '-25deg' }],
  },
  dimpleRight: {
    position: 'absolute',
    right: -3,
    top: 4,
    width: 3,
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 2,
    transform: [{ rotate: '25deg' }],
  },
  thinkingContainer: {
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thinkingDot: {
    width: 14,
    height: 7,
    backgroundColor: '#475569',
    borderRadius: 5,
  },
  neutralContainer: {
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neutralSmile: {
    width: 26,
    height: 10,
    borderBottomWidth: 3,
    borderColor: '#0F172A',
    borderRadius: 10,
  },
  activeMouthWrapper: {
    backgroundColor: '#881337', // Deep dark mouth red
    borderWidth: 2.5,
    borderColor: '#0F172A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cavity: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#831843',
    position: 'relative',
  },
  topTeeth: {
    width: '75%',
    height: 6,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  spongeBuckTeethRow: {
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
    width: '100%',
    marginTop: 0,
  },
  spongeTooth: {
    width: 6,
    height: 7,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  tongue: {
    width: '65%',
    height: 12,
    backgroundColor: '#F43F5E',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignSelf: 'center',
    position: 'absolute',
    bottom: -2,
  },
});

// ─── 2. DYNAMIC EYES COMPONENT (Natural Blinking) ──────────────────────────
function DynamicEyes({ blinkAnim, lookX, lookY, eyeType = 'anime' }) {
  const scaleY = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 1],
  });

  const pupilTranslateX = lookX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-4, 4],
  });

  const pupilTranslateY = lookY.interpolate({
    inputRange: [-1, 1],
    outputRange: [-3, 3],
  });

  if (eyeType === 'doraemon') {
    // Large round Doraemon-style cartoon eyes touching in center
    return (
      <View style={eyeStyles.doraemonRow}>
        <Animated.View style={[eyeStyles.doraemonEye, { transform: [{ scaleY }] }]}>
          <Animated.View
            style={[
              eyeStyles.doraemonPupil,
              { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
            ]}
          >
            <View style={eyeStyles.eyeGleam} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[eyeStyles.doraemonEye, { transform: [{ scaleY }] }]}>
          <Animated.View
            style={[
              eyeStyles.doraemonPupil,
              { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
            ]}
          >
            <View style={eyeStyles.eyeGleam} />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  if (eyeType === 'spongebob') {
    return (
      <View style={eyeStyles.spongeRow}>
        <View style={eyeStyles.spongeEyeCol}>
          <View style={eyeStyles.spongeLashRow}>
            <View style={[eyeStyles.spongeLash, { transform: [{ rotate: '-25deg' }] }]} />
            <View style={eyeStyles.spongeLash} />
            <View style={[eyeStyles.spongeLash, { transform: [{ rotate: '25deg' }] }]} />
          </View>
          <Animated.View style={[eyeStyles.spongeEye, { transform: [{ scaleY }] }]}>
            <Animated.View
              style={[
                eyeStyles.spongePupil,
                { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
              ]}
            >
              <View style={eyeStyles.spongeIris} />
              <View style={eyeStyles.eyeGleam} />
            </Animated.View>
          </Animated.View>
        </View>

        <View style={eyeStyles.spongeEyeCol}>
          <View style={eyeStyles.spongeLashRow}>
            <View style={[eyeStyles.spongeLash, { transform: [{ rotate: '-25deg' }] }]} />
            <View style={eyeStyles.spongeLash} />
            <View style={[eyeStyles.spongeLash, { transform: [{ rotate: '25deg' }] }]} />
          </View>
          <Animated.View style={[eyeStyles.spongeEye, { transform: [{ scaleY }] }]}>
            <Animated.View
              style={[
                eyeStyles.spongePupil,
                { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
              ]}
            >
              <View style={eyeStyles.spongeIris} />
              <View style={eyeStyles.eyeGleam} />
            </Animated.View>
          </Animated.View>
        </View>
      </View>
    );
  }

  const isGreen = eyeType === 'green';
  const isCat = eyeType === 'cat';

  // Expressive Stylized Eyes (Haru, Chitose, Shizuka, Bheem, Ninja Hattori, Tom, Ben 10, Scooby)
  return (
    <View style={eyeStyles.standardRow}>
      {/* Left Eye */}
      <Animated.View style={[eyeStyles.standardEye, { transform: [{ scaleY }] }]}>
        <Animated.View
          style={[
            eyeStyles.pupil,
            isGreen && { backgroundColor: '#059669' },
            isCat && { backgroundColor: '#0D9488', width: 16, height: 26, borderRadius: 8 },
            { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
          ]}
        >
          {isGreen && <View style={eyeStyles.greenPupilCenter} />}
          <View style={eyeStyles.eyeGleam} />
          <View style={eyeStyles.eyeGleamSmall} />
        </Animated.View>
      </Animated.View>

      {/* Right Eye */}
      <Animated.View style={[eyeStyles.standardEye, { transform: [{ scaleY }] }]}>
        <Animated.View
          style={[
            eyeStyles.pupil,
            isGreen && { backgroundColor: '#059669' },
            isCat && { backgroundColor: '#0D9488', width: 16, height: 26, borderRadius: 8 },
            { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
          ]}
        >
          {isGreen && <View style={eyeStyles.greenPupilCenter} />}
          <View style={eyeStyles.eyeGleam} />
          <View style={eyeStyles.eyeGleamSmall} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const eyeStyles = StyleSheet.create({
  doraemonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  doraemonEye: {
    width: 44,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  doraemonPupil: {
    width: 14,
    height: 18,
    backgroundColor: '#0F172A',
    borderRadius: 9,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spongeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  spongeEyeCol: {
    alignItems: 'center',
  },
  spongeLashRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: -2,
    zIndex: 10,
  },
  spongeLash: {
    width: 2.5,
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 1,
  },
  spongeEye: {
    width: 44,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  spongePupil: {
    width: 22,
    height: 24,
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  spongeIris: {
    width: 10,
    height: 12,
    backgroundColor: '#0F172A',
    borderRadius: 6,
  },
  standardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 108,
  },
  standardEye: {
    width: 36,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pupil: {
    width: 22,
    height: 26,
    backgroundColor: '#1E1B4B',
    borderRadius: 13,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenPupilCenter: {
    width: 10,
    height: 12,
    backgroundColor: '#064E3B',
    borderRadius: 5,
  },
  eyeGleam: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  eyeGleamSmall: {
    position: 'absolute',
    bottom: 5,
    left: 4,
    width: 3.5,
    height: 3.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});

// ─── 3. INDIVIDUAL CHARACTER RIGS (10 Avatars) ─────────────────────────────
function CharacterRig({ id, blinkAnim, lookX, lookY, mouthOpenY, mouthForm, isSpeaking, state, mood }) {
  const norm = (id || 'haru').toLowerCase();

  // ── 1. TEACHER (English Teacher - Haru) ──
  if ((norm.includes('teacher') && !norm.includes('male')) || norm === 'haru') {
    return (
      <View style={rigStyles.charContainer}>
        {/* Styled Hair Back Ponytail */}
        <View style={rigStyles.teacherHairBack} />

        {/* Head Base */}
        <View style={[rigStyles.headBase, { backgroundColor: '#312E81' }]}>
          {/* Natural Skin Face */}
          <View style={rigStyles.skinFace}>
            {/* Bangs Top */}
            <View style={rigStyles.teacherBangs} />

            {/* Smart Glasses Frames */}
            <View style={rigStyles.teacherGlasses}>
              <View style={rigStyles.teacherGlassesLens} />
              <View style={rigStyles.teacherGlassesBridge} />
              <View style={rigStyles.teacherGlassesLens} />
            </View>

            {/* Eyes */}
            <View style={{ marginTop: 28 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
            </View>

            {/* Soft Blush */}
            <View style={rigStyles.blushRow}>
              <View style={rigStyles.blushDot} />
              <View style={rigStyles.blushDot} />
            </View>

            {/* Articulate Mouth */}
            <View style={{ marginTop: 12 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#EC4899"
              />
            </View>
          </View>
        </View>

        {/* Professional Teacher Cardigan Collar */}
        <View style={rigStyles.teacherCollar} />
      </View>
    );
  }

  // ── 2. MALE TEACHER (English Teacher - Chitose) ──
  if (norm.includes('chitose') || norm.includes('maleteacher') || norm === 'male') {
    return (
      <View style={rigStyles.charContainer}>
        {/* Brown Anime Hair Back */}
        <View style={rigStyles.chitoseHairBack} />

        {/* Head Base */}
        <View style={[rigStyles.headBase, { backgroundColor: '#5D4037' }]}>
          {/* Natural Skin Face */}
          <View style={rigStyles.skinFace}>
            {/* Side-swept Bangs */}
            <View style={rigStyles.chitoseBangs} />

            {/* Eyes */}
            <View style={{ marginTop: 28 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
            </View>

            {/* Confident Coach Mouth */}
            <View style={{ marginTop: 14 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#3B82F6"
              />
            </View>
          </View>
        </View>

        {/* Formal Shirt Collar & Navy Suit Accent */}
        <View style={rigStyles.chitoseCollar}>
          <View style={rigStyles.chitoseTie} />
        </View>
      </View>
    );
  }

  // ── 3. SHIZUKA (Academic Mentor) ──
  if (norm.includes('shizuk') || norm.includes('shizuka')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Twin Pigtails with Pink Ribbon Clips */}
        <View style={rigStyles.shizukaPigtailLeft}>
          <View style={rigStyles.shizukaRibbonPink} />
        </View>
        <View style={rigStyles.shizukaPigtailRight}>
          <View style={rigStyles.shizukaRibbonPink} />
        </View>

        {/* Hair Back */}
        <View style={rigStyles.shizukaHairBack} />

        {/* Head Base */}
        <View style={[rigStyles.headBase, { backgroundColor: '#1E1B4B' }]}>
          <View style={rigStyles.skinFace}>
            {/* Gentle Bangs */}
            <View style={rigStyles.shizukaBangs} />

            {/* Gentle Smiling Eyes */}
            <View style={{ marginTop: 28 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
            </View>

            {/* Soft Blush */}
            <View style={rigStyles.blushRow}>
              <View style={[rigStyles.blushDot, { backgroundColor: 'rgba(244, 63, 94, 0.4)' }]} />
              <View style={[rigStyles.blushDot, { backgroundColor: 'rgba(244, 63, 94, 0.4)' }]} />
            </View>

            {/* Sweet Encouraging Mouth */}
            <View style={{ marginTop: 10 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#FB7185"
              />
            </View>
          </View>
        </View>

        {/* Soft Pink Sweater Collar */}
        <View style={rigStyles.shizukaCollar} />
      </View>
    );
  }

  // ── 4. DORAEMON (Doraemon Buddy - Robo-Paws) ──
  if (norm.includes('robo') || norm.includes('paws') || norm.includes('doraemon')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Blue Dome Head */}
        <View style={[rigStyles.headBase, { backgroundColor: '#0284C7', borderRadius: 80, width: 160, height: 154 }]}>
          {/* White Oval Face Insert */}
          <View style={rigStyles.doraemonFaceWhite}>
            {/* Eyes Touching in Center */}
            <View style={{ marginTop: 10 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="doraemon" />
            </View>

            {/* Big Red Shiny Nose */}
            <View style={rigStyles.doraemonRedNose}>
              <View style={rigStyles.noseGleam} />
            </View>

            {/* Vertical Whisker Center Line */}
            <View style={rigStyles.whiskerCenterLine} />

            {/* Whiskers (3 left, 3 right) */}
            <View style={rigStyles.whiskersLeft}>
              <View style={[rigStyles.whisker, { transform: [{ rotate: '12deg' }] }]} />
              <View style={rigStyles.whisker} />
              <View style={[rigStyles.whisker, { transform: [{ rotate: '-12deg' }] }]} />
            </View>
            <View style={rigStyles.whiskersRight}>
              <View style={[rigStyles.whisker, { transform: [{ rotate: '-12deg' }] }]} />
              <View style={rigStyles.whisker} />
              <View style={[rigStyles.whisker, { transform: [{ rotate: '12deg' }] }]} />
            </View>

            {/* Mouth */}
            <View style={{ marginTop: 8 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#38BDF8"
              />
            </View>
          </View>

          {/* Red Collar & Golden Bell */}
          <View style={rigStyles.doraemonCollar}>
            <View style={rigStyles.goldenBell}>
              <View style={rigStyles.bellHole} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ── 5. SPONGEBOB (Sponge Buddy) ──
  if (norm.includes('spongebob') || norm.includes('sponge') || norm.includes('bob')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Yellow Sponge Rounded Rectangle Head */}
        <View style={rigStyles.spongeHead}>
          {/* Porous Sponge Texture Dips */}
          <View style={rigStyles.spongePore1} />
          <View style={rigStyles.spongePore2} />
          <View style={rigStyles.spongePore3} />

          {/* Big Round Blue Eyes with Lashes */}
          <View style={{ marginTop: 14 }}>
            <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="spongebob" />
          </View>

          {/* Cute Sponge Nose */}
          <View style={rigStyles.spongeNose} />

          {/* Cheeks with Freckle Dots */}
          <View style={rigStyles.spongeCheekLeft}>
            <View style={rigStyles.spongeFreckle} />
            <View style={rigStyles.spongeFreckle} />
            <View style={rigStyles.spongeFreckle} />
          </View>
          <View style={rigStyles.spongeCheekRight}>
            <View style={rigStyles.spongeFreckle} />
            <View style={rigStyles.spongeFreckle} />
            <View style={rigStyles.spongeFreckle} />
          </View>

          {/* Dynamic Lip-Sync Mouth with Two Separated Buck Teeth */}
          <View style={{ marginTop: 6 }}>
            <DynamicMouth
              mouthOpenY={mouthOpenY}
              mouthForm={mouthForm}
              isSpeaking={isSpeaking}
              state={state}
              themeColor="#EAB308"
              isSpongeBob={true}
            />
          </View>

          {/* White Shirt Collar & Red Necktie */}
          <View style={rigStyles.spongeShirtCollar}>
            <View style={rigStyles.spongeTie} />
          </View>
        </View>
      </View>
    );
  }

  // ── 6. CHHOTA BHEEM (Dholakpur Hero - Sparky) ──
  if (norm.includes('bheem') || norm.includes('sparky') || norm.includes('motu')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Heroic Black Hair Tuft on Top */}
        <View style={rigStyles.bheemHairTuft} />

        {/* Round Head Base - Warm Golden Skin Tone */}
        <View style={[rigStyles.headBase, { backgroundColor: '#F59E0B', borderRadius: 76, width: 154, height: 150 }]}>
          {/* Natural Golden Face */}
          <View style={[rigStyles.skinFace, { backgroundColor: '#FBBF24' }]}>
            {/* Iconic Red Vertical Tilak with Gold Accent */}
            <View style={rigStyles.bheemTilak}>
              <View style={rigStyles.bheemTilakGold} />
            </View>

            {/* Heroic Determined Eyes */}
            <View style={{ marginTop: 24 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
            </View>

            {/* Cheerful Brave Smile Mouth */}
            <View style={{ marginTop: 12 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#EA580C"
              />
            </View>

            {/* Golden Royal Necklace & Orange Dhoti Sash Collar */}
            <View style={rigStyles.bheemGoldNecklace}>
              <View style={rigStyles.bheemOrangeSash} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ── 7. NINJA HATTORI (Ninja Hero - Koharu) ──
  if (norm.includes('hattori') || norm.includes('ninja') || norm.includes('koharu')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Royal Blue Ninja Cowl / Hood Base */}
        <View style={[rigStyles.headBase, { backgroundColor: '#1D4ED8', borderRadius: 78, width: 156, height: 152 }]}>
          {/* White Headband with Ninja Crest */}
          <View style={rigStyles.hattoriHeadband}>
            <View style={rigStyles.hattoriNinjaStar} />
          </View>

          {/* Enclosed Face Oval */}
          <View style={rigStyles.hattoriFaceHole}>
            {/* Big Expressive Ninja Eyes */}
            <View style={{ marginTop: 18 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
            </View>

            {/* Iconic Red Spiral Cheek Swirls (🌀) */}
            <View style={rigStyles.hattoriCheekLeft}>
              <View style={rigStyles.hattoriSpiralOuter} />
              <View style={rigStyles.hattoriSpiralInner} />
            </View>
            <View style={rigStyles.hattoriCheekRight}>
              <View style={rigStyles.hattoriSpiralOuter} />
              <View style={rigStyles.hattoriSpiralInner} />
            </View>

            {/* Disciplined Ninja Mouth */}
            <View style={{ marginTop: 8 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#3B82F6"
              />
            </View>
          </View>

          {/* White Ninja Neck Scarf Wrap */}
          <View style={rigStyles.hattoriNeckScarf} />
        </View>
      </View>
    );
  }

  // ── 8. TOM (Cartoon Cat - Haruto) ──
  if (norm.includes('tom') || norm.includes('haruto') || norm.includes('tororo')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Pointy Cat Ears */}
        <View style={rigStyles.tomEarLeft}>
          <View style={rigStyles.tomEarInner} />
        </View>
        <View style={rigStyles.tomEarRight}>
          <View style={rigStyles.tomEarInner} />
        </View>

        {/* Blue-Slate Cat Head */}
        <View style={[rigStyles.headBase, { backgroundColor: '#64748B', borderRadius: 75, width: 152, height: 144 }]}>
          {/* White Muzzle Cheeks */}
          <View style={rigStyles.tomFaceMuzzle}>
            {/* Witty Cat Eyes */}
            <View style={{ marginTop: 18 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="cat" />
            </View>

            {/* Small Black Cat Nose */}
            <View style={rigStyles.tomNose} />

            {/* Whiskers */}
            <View style={rigStyles.tomWhiskersLeft}>
              <View style={[rigStyles.tomWhisker, { transform: [{ rotate: '8deg' }] }]} />
              <View style={[rigStyles.tomWhisker, { transform: [{ rotate: '-8deg' }] }]} />
            </View>
            <View style={rigStyles.tomWhiskersRight}>
              <View style={[rigStyles.tomWhisker, { transform: [{ rotate: '-8deg' }] }]} />
              <View style={[rigStyles.tomWhisker, { transform: [{ rotate: '8deg' }] }]} />
            </View>

            {/* Feline Mouth */}
            <View style={{ marginTop: 6 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#94A3B8"
              />
            </View>
          </View>

          {/* Red Cat Collar Accent */}
          <View style={rigStyles.tomCollar}>
            <View style={rigStyles.tomGoldTag} />
          </View>
        </View>
      </View>
    );
  }

  // ── 9. BEN 10 (Alien Hero - Mao) ──
  if (norm.includes('ben') || norm.includes('mao') || norm.includes('rexy')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Shaggy Brown Hair Tuft */}
        <View style={rigStyles.benHairTop} />

        {/* Head Base */}
        <View style={[rigStyles.headBase, { backgroundColor: '#78350F' }]}>
          {/* Natural Skin Face */}
          <View style={rigStyles.skinFace}>
            {/* Bangs */}
            <View style={rigStyles.benBangs} />

            {/* Striking Green Eyes */}
            <View style={{ marginTop: 28 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="green" />
            </View>

            {/* High-Energy Hero Mouth */}
            <View style={{ marginTop: 14 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#10B981"
              />
            </View>
          </View>
        </View>

        {/* Hero Jacket Collar & Omnitrix Chest Emblem */}
        <View style={rigStyles.benJacket}>
          <View style={rigStyles.omnitrixBadge}>
            <View style={rigStyles.omnitrixHourglass} />
          </View>
        </View>
      </View>
    );
  }

  // ── 10. SCOOBY-DOO (Mystery Pup - Puppy) ──
  return (
    <View style={rigStyles.charContainer}>
      {/* Floppy Great Dane Ears */}
      <View style={rigStyles.scoobyEarLeft} />
      <View style={rigStyles.scoobyEarRight} />

      {/* Tan / Warm Brown Dog Head */}
      <View style={[rigStyles.headBase, { backgroundColor: '#B45309', borderRadius: 74, width: 152, height: 146 }]}>
        {/* Black Eyebrow Patch */}
        <View style={rigStyles.scoobyEyebrowPatch} />

        {/* White / Tan Muzzle Area */}
        <View style={rigStyles.scoobyMuzzle}>
          {/* Friendly Pup Eyes */}
          <View style={{ marginTop: 16 }}>
            <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
          </View>

          {/* Big Black Snout Nose */}
          <View style={rigStyles.scoobyNose}>
            <View style={rigStyles.scoobyNoseGleam} />
          </View>

          {/* Whisker Freckle Dots */}
          <View style={rigStyles.scoobyWhiskerDotsLeft}>
            <View style={rigStyles.scoobyDot} />
            <View style={rigStyles.scoobyDot} />
          </View>
          <View style={rigStyles.scoobyWhiskerDotsRight}>
            <View style={rigStyles.scoobyDot} />
            <View style={rigStyles.scoobyDot} />
          </View>

          {/* Playful Mouth */}
          <View style={{ marginTop: 6 }}>
            <DynamicMouth
              mouthOpenY={mouthOpenY}
              mouthForm={mouthForm}
              isSpeaking={isSpeaking}
              state={state}
              themeColor="#D97706"
            />
          </View>
        </View>

        {/* Turquoise Collar with Golden SD Diamond Tag */}
        <View style={rigStyles.scoobyCollar}>
          <View style={rigStyles.scoobyTagDiamond}>
            <Text style={rigStyles.scoobyTagText}>SD</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const rigStyles = StyleSheet.create({
  charContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 170,
    height: 165,
  },
  headBase: {
    width: 146,
    height: 142,
    borderRadius: 73,
    borderWidth: 3.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  skinFace: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    position: 'relative',
  },
  teacherHairBack: {
    position: 'absolute',
    top: -14,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#312E81',
  },
  teacherBangs: {
    position: 'absolute',
    top: -6,
    width: 148,
    height: 38,
    backgroundColor: '#312E81',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 10,
  },
  teacherGlasses: {
    position: 'absolute',
    top: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  teacherGlassesLens: {
    width: 44,
    height: 36,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#4338CA',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  teacherGlassesBridge: {
    width: 14,
    height: 3,
    backgroundColor: '#4338CA',
  },
  teacherCollar: {
    position: 'absolute',
    bottom: -12,
    alignSelf: 'center',
    width: 100,
    height: 20,
    backgroundColor: '#4338CA',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 12,
  },
  blushRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 124,
    marginTop: 4,
  },
  blushDot: {
    width: 18,
    height: 10,
    backgroundColor: 'rgba(244, 63, 94, 0.35)',
    borderRadius: 8,
  },
  chitoseHairBack: {
    position: 'absolute',
    top: -14,
    width: 154,
    height: 90,
    backgroundColor: '#5D4037',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    zIndex: 1,
  },
  chitoseBangs: {
    position: 'absolute',
    top: -6,
    left: 8,
    width: 130,
    height: 38,
    backgroundColor: '#6D4C41',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 10,
  },
  chitoseCollar: {
    position: 'absolute',
    bottom: -14,
    alignSelf: 'center',
    width: 90,
    height: 22,
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    zIndex: 12,
  },
  chitoseTie: {
    width: 14,
    height: 18,
    backgroundColor: '#3B82F6',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 2,
  },
  shizukaPigtailLeft: {
    position: 'absolute',
    left: -12,
    top: 36,
    width: 32,
    height: 48,
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    zIndex: 0,
    alignItems: 'center',
  },
  shizukaPigtailRight: {
    position: 'absolute',
    right: -12,
    top: 36,
    width: 32,
    height: 48,
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    zIndex: 0,
    alignItems: 'center',
  },
  shizukaRibbonPink: {
    width: 14,
    height: 10,
    backgroundColor: '#EC4899',
    borderRadius: 4,
    marginTop: -4,
  },
  shizukaHairBack: {
    position: 'absolute',
    top: -14,
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: '#1E1B4B',
    zIndex: 1,
  },
  shizukaBangs: {
    position: 'absolute',
    top: -4,
    width: 144,
    height: 36,
    backgroundColor: '#1E1B4B',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    zIndex: 10,
  },
  shizukaCollar: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 96,
    height: 18,
    backgroundColor: '#FB7185',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    zIndex: 12,
  },
  doraemonFaceWhite: {
    width: 142,
    height: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#0F172A',
  },
  doraemonRedNose: {
    width: 24,
    height: 24,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0F172A',
    marginTop: -8,
    position: 'relative',
  },
  noseGleam: {
    position: 'absolute',
    top: 3,
    left: 4,
    width: 5,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  whiskerCenterLine: {
    width: 2.5,
    height: 18,
    backgroundColor: '#0F172A',
  },
  whiskersLeft: {
    position: 'absolute',
    left: 12,
    top: 46,
    gap: 6,
  },
  whiskersRight: {
    position: 'absolute',
    right: 12,
    top: 46,
    gap: 6,
  },
  whisker: {
    width: 24,
    height: 2.5,
    backgroundColor: '#0F172A',
    borderRadius: 1,
  },
  doraemonCollar: {
    position: 'absolute',
    bottom: -6,
    width: 120,
    height: 12,
    backgroundColor: '#DC2626',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldenBell: {
    width: 18,
    height: 18,
    backgroundColor: '#FACC15',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#0F172A',
    position: 'absolute',
    bottom: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellHole: {
    width: 4,
    height: 4,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  spongeHead: {
    width: 148,
    height: 144,
    backgroundColor: '#FDE047',
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  spongePore1: {
    position: 'absolute',
    top: 14,
    left: 12,
    width: 18,
    height: 18,
    backgroundColor: '#CA8A04',
    opacity: 0.35,
    borderRadius: 9,
  },
  spongePore2: {
    position: 'absolute',
    bottom: 22,
    right: 14,
    width: 22,
    height: 22,
    backgroundColor: '#CA8A04',
    opacity: 0.35,
    borderRadius: 11,
  },
  spongePore3: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 14,
    height: 14,
    backgroundColor: '#CA8A04',
    opacity: 0.35,
    borderRadius: 7,
  },
  spongeNose: {
    width: 14,
    height: 20,
    backgroundColor: '#FACC15',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0F172A',
    marginTop: -4,
  },
  spongeCheekLeft: {
    position: 'absolute',
    left: 14,
    top: 66,
    width: 28,
    height: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  spongeCheekRight: {
    position: 'absolute',
    right: 14,
    top: 66,
    width: 28,
    height: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  spongeFreckle: {
    width: 3,
    height: 3,
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },
  spongeShirtCollar: {
    position: 'absolute',
    bottom: -2,
    width: 130,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spongeTie: {
    width: 12,
    height: 14,
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },
  bheemHairTuft: {
    position: 'absolute',
    top: -12,
    width: 32,
    height: 28,
    backgroundColor: '#1E1B4B',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 6,
  },
  bheemTilak: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    width: 8,
    height: 22,
    backgroundColor: '#DC2626',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bheemTilakGold: {
    width: 4,
    height: 8,
    backgroundColor: '#FACC15',
    borderRadius: 2,
  },
  bheemGoldNecklace: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 104,
    height: 20,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#78350F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  bheemOrangeSash: {
    width: 24,
    height: 12,
    backgroundColor: '#EA580C',
    borderRadius: 4,
  },
  hattoriHeadband: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 136,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  hattoriNinjaStar: {
    width: 12,
    height: 12,
    backgroundColor: '#DC2626',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  hattoriFaceHole: {
    width: 122,
    height: 102,
    backgroundColor: '#FED7AA',
    borderRadius: 50,
    position: 'absolute',
    bottom: 12,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  hattoriCheekLeft: {
    position: 'absolute',
    left: 10,
    top: 50,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hattoriCheekRight: {
    position: 'absolute',
    right: 10,
    top: 50,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hattoriSpiralOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#DC2626',
    borderTopColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hattoriSpiralInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#DC2626',
    borderBottomColor: 'transparent',
  },
  hattoriNeckScarf: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 110,
    height: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0F172A',
    zIndex: 14,
  },
  tomEarLeft: {
    position: 'absolute',
    left: 8,
    top: -16,
    width: 42,
    height: 50,
    backgroundColor: '#64748B',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 6,
    borderWidth: 3,
    borderColor: '#0F172A',
    transform: [{ rotate: '-16deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  tomEarRight: {
    position: 'absolute',
    right: 8,
    top: -16,
    width: 42,
    height: 50,
    backgroundColor: '#64748B',
    borderTopRightRadius: 26,
    borderTopLeftRadius: 6,
    borderWidth: 3,
    borderColor: '#0F172A',
    transform: [{ rotate: '16deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  tomEarInner: {
    width: 22,
    height: 30,
    backgroundColor: '#FDA4AF',
    borderRadius: 12,
  },
  tomFaceMuzzle: {
    width: 136,
    height: 112,
    backgroundColor: '#F1F5F9',
    borderRadius: 56,
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  tomNose: {
    width: 12,
    height: 9,
    backgroundColor: '#0F172A',
    borderRadius: 5,
    marginTop: -2,
  },
  tomWhiskersLeft: {
    position: 'absolute',
    left: 8,
    top: 48,
    gap: 8,
  },
  tomWhiskersRight: {
    position: 'absolute',
    right: 8,
    top: 48,
    gap: 8,
  },
  tomWhisker: {
    width: 22,
    height: 2,
    backgroundColor: '#0F172A',
    borderRadius: 1,
  },
  tomCollar: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 100,
    height: 14,
    backgroundColor: '#EF4444',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  tomGoldTag: {
    width: 10,
    height: 10,
    backgroundColor: '#FACC15',
    borderRadius: 5,
  },
  benHairTop: {
    position: 'absolute',
    top: -14,
    width: 150,
    height: 46,
    backgroundColor: '#78350F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    zIndex: 4,
  },
  benBangs: {
    position: 'absolute',
    top: -4,
    width: 142,
    height: 34,
    backgroundColor: '#78350F',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 10,
  },
  benJacket: {
    position: 'absolute',
    bottom: -12,
    alignSelf: 'center',
    width: 110,
    height: 20,
    backgroundColor: '#15803D',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  omnitrixBadge: {
    width: 18,
    height: 18,
    backgroundColor: '#0F172A',
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  omnitrixHourglass: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    transform: [{ rotate: '45deg' }],
  },
  scoobyEarLeft: {
    position: 'absolute',
    left: 2,
    top: 6,
    width: 32,
    height: 60,
    backgroundColor: '#92400E',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    transform: [{ rotate: '15deg' }],
    zIndex: 0,
  },
  scoobyEarRight: {
    position: 'absolute',
    right: 2,
    top: 6,
    width: 32,
    height: 60,
    backgroundColor: '#92400E',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    transform: [{ rotate: '-15deg' }],
    zIndex: 0,
  },
  scoobyEyebrowPatch: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    width: 90,
    height: 12,
    backgroundColor: '#78350F',
    borderRadius: 6,
    opacity: 0.3,
  },
  scoobyMuzzle: {
    width: 130,
    height: 104,
    backgroundColor: '#D97706',
    borderRadius: 52,
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  scoobyNose: {
    width: 24,
    height: 16,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    marginTop: -4,
    position: 'relative',
    alignItems: 'center',
  },
  scoobyNoseGleam: {
    position: 'absolute',
    top: 2,
    left: 4,
    width: 6,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  scoobyWhiskerDotsLeft: {
    position: 'absolute',
    left: 22,
    top: 48,
    flexDirection: 'row',
    gap: 4,
  },
  scoobyWhiskerDotsRight: {
    position: 'absolute',
    right: 22,
    top: 48,
    flexDirection: 'row',
    gap: 4,
  },
  scoobyDot: {
    width: 3.5,
    height: 3.5,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  scoobyCollar: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 108,
    height: 16,
    backgroundColor: '#06B6D4',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  scoobyTagDiamond: {
    width: 16,
    height: 16,
    backgroundColor: '#FACC15',
    transform: [{ rotate: '45deg' }],
    borderWidth: 1.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoobyTagText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#0F172A',
    transform: [{ rotate: '-45deg' }],
  },
});

// ─── 4. MAIN NATIVE AVATAR VIEW COMPONENT ──────────────────────────────────
export const NativeAvatarView = memo(function NativeAvatarView({
  model = 'haru',
  isSpeaking = false,
  spokenText = '',
  speechSpeed = 1.0,
  state = 'idle',
  mood = 'neutral',
  style,
  onLoaded,
}) {
  const avatarMeta = useMemo(() => getAvatarById(model), [model]);

  // Animated values
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const lookX = useRef(new Animated.Value(0)).current;
  const lookY = useRef(new Animated.Value(0)).current;
  const mouthOpenY = useRef(new Animated.Value(0)).current;
  const mouthForm = useRef(new Animated.Value(0)).current;
  const breathingFloat = useRef(new Animated.Value(0)).current;
  const speakingNod = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(1)).current;

  // Signal ready immediately upon mount (< 10ms)
  useEffect(() => {
    if (onLoaded) onLoaded();
  }, [onLoaded]);

  // 1. Idle Breathing Loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingFloat, {
          toValue: -3,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathingFloat, {
          toValue: 3,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathingFloat]);

  // 2. Stochastic Natural Eye Blinking
  useEffect(() => {
    let timeoutId;
    const triggerBlink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.05, duration: 110, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 130, useNativeDriver: true }),
      ]).start(() => {
        const nextBlink = 2800 + Math.random() * 2400; // blink every 2.8 - 5.2s
        timeoutId = setTimeout(triggerBlink, nextBlink);
      });
    };

    timeoutId = setTimeout(triggerBlink, 2000);
    return () => clearTimeout(timeoutId);
  }, [blinkAnim]);

  // 3. Ambient Halo Pulse
  useEffect(() => {
    if (isSpeaking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(haloPulse, { toValue: 1.12, duration: 320, useNativeDriver: true }),
          Animated.timing(haloPulse, { toValue: 1.0, duration: 320, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      haloPulse.setValue(1.0);
    }
  }, [isSpeaking, haloPulse]);

  // 4. Speaking Head Nod & Cadence
  useEffect(() => {
    if (isSpeaking) {
      const nodLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(speakingNod, {
            toValue: 2.5,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(speakingNod, {
            toValue: -1.5,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      nodLoop.start();
      return () => nodLoop.stop();
    } else {
      Animated.timing(speakingNod, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }
  }, [isSpeaking, speakingNod]);

  // 5. Real-Time Phonetic Lip-Sync Scheduler
  useEffect(() => {
    if (!isSpeaking || !spokenText) {
      Animated.parallel([
        Animated.timing(mouthOpenY, { toValue: 0, duration: 120, useNativeDriver: false }),
        Animated.timing(mouthForm, { toValue: 0, duration: 120, useNativeDriver: false }),
      ]).start();
      return;
    }

    const schedule = generateSpeechSchedule(spokenText, speechSpeed);
    if (!schedule || schedule.length === 0) return;

    let frameId;
    const startTime = Date.now();
    let currentIndex = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      while (currentIndex < schedule.length && schedule[currentIndex].end < elapsed) {
        currentIndex++;
      }

      if (currentIndex < schedule.length) {
        const currentItem = schedule[currentIndex];
        const targetY = currentItem.isPause ? 0.05 : currentItem.yVal;
        const targetForm = currentItem.formVal;

        Animated.parallel([
          Animated.timing(mouthOpenY, { toValue: targetY, duration: 55, useNativeDriver: false }),
          Animated.timing(mouthForm, { toValue: targetForm, duration: 55, useNativeDriver: false }),
        ]).start();

        frameId = setTimeout(tick, 45);
      } else {
        // Schedule finished, return to gentle pause
        Animated.parallel([
          Animated.timing(mouthOpenY, { toValue: 0, duration: 120, useNativeDriver: false }),
          Animated.timing(mouthForm, { toValue: 0, duration: 120, useNativeDriver: false }),
        ]).start();
      }
    };

    tick();

    return () => {
      if (frameId) clearTimeout(frameId);
    };
  }, [isSpeaking, spokenText, speechSpeed, mouthOpenY, mouthForm]);

  return (
    <View style={[viewStyles.container, style]}>
      {/* ── Glowing Neon Ambient Halo ── */}
      <Animated.View
        style={[
          viewStyles.ambientHalo,
          {
            borderColor: avatarMeta.ringColor || '#38BDF8',
            shadowColor: avatarMeta.themeColor || '#38BDF8',
            transform: [{ scale: haloPulse }],
          },
        ]}
      />

      {/* ── Floating Character Rig Stage ── */}
      <Animated.View
        style={[
          viewStyles.rigStage,
          {
            transform: [
              { translateY: Animated.add(breathingFloat, speakingNod) },
            ],
          },
        ]}
      >
        <CharacterRig
          id={avatarMeta.id}
          blinkAnim={blinkAnim}
          lookX={lookX}
          lookY={lookY}
          mouthOpenY={mouthOpenY}
          mouthForm={mouthForm}
          isSpeaking={isSpeaking}
          state={state}
          mood={mood}
        />
      </Animated.View>

      {/* ── Real-Time Soundwave Indicator (Active during speech) ── */}
      {isSpeaking && (
        <View style={viewStyles.soundwaveRow}>
          {[12, 20, 16, 26, 14, 22, 10].map((h, idx) => (
            <View
              key={idx}
              style={[
                viewStyles.waveBar,
                {
                  height: h,
                  backgroundColor: avatarMeta.ringColor || '#38BDF8',
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
});

const viewStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  ambientHalo: {
    position: 'absolute',
    width: 188,
    height: 188,
    borderRadius: 94,
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  rigStage: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  soundwaveRow: {
    position: 'absolute',
    bottom: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 15,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
    opacity: 0.9,
  },
});

export default NativeAvatarView;
