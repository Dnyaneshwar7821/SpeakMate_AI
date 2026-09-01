import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const HARU_MODEL_URL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';
const CHITOSE_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-chitose@1.0.5/assets/chitose.model.json';
const ROBOPAWS_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json';

const normalizeModelName = (modelName) => (modelName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const isRoboPawsModel = (modelName) => {
  const norm = normalizeModelName(modelName);
  return norm === 'robopaws' || norm === 'robocat' || norm === 'hijiki' || norm === 'robot' || norm === 'kid' || norm === 'kids';
};

const getModelUrl = (modelName) => {
  const norm = normalizeModelName(modelName);
  if (norm === 'chitose' || norm === 'male') return CHITOSE_MODEL_URL;
  if (isRoboPawsModel(norm)) return ROBOPAWS_MODEL_URL;
  return HARU_MODEL_URL;
};

const getLive2DHtml = (initialModel = 'haru') => {
  const initialName = normalizeModelName(initialModel || 'haru');
  const initialUrl = getModelUrl(initialName);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    canvas {
      display: block;
      margin: 0 auto;
    }
  </style>
  <!-- PixiJS v7 -->
  <script src="https://cdn.jsdelivr.net/npm/pixi.js@7.3.3/dist/pixi.min.js"></script>
  <!-- Cubism 2 Core SDK (Chitose) -->
  <script src="https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"></script>
  <!-- Cubism 4 Core SDK (Haru) -->
  <script src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"></script>
  <!-- Pixi Live2D Display (Universal Cubism 2 + 4 Bundle) -->
  <script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <script>
    // Ensure PIXI is on window
    if (!window.PIXI && typeof PIXI !== 'undefined') {
      window.PIXI = PIXI;
    }

    function getLive2DModelClass() {
      if (window.PIXI && window.PIXI.live2d && window.PIXI.live2d.Live2DModel) {
        return window.PIXI.live2d.Live2DModel;
      }
      if (window.PIXI && window.PIXI.Live2DModel) {
        return window.PIXI.Live2DModel;
      }
      if (window.PIXILive2D && window.PIXILive2D.Live2DModel) {
        return window.PIXILive2D.Live2DModel;
      }
      if (window.Live2DModel) {
        return window.Live2DModel;
      }
      if (window.PIXI && window.PIXI.live2d && typeof window.PIXI.live2d.from === 'function') {
        return window.PIXI.live2d;
      }
      return null;
    }

    async function waitForLive2DSDK(timeout = 10000) {
      const start = performance.now();
      while (performance.now() - start < timeout) {
        const cls = getLive2DModelClass();
        if (cls && typeof cls.from === 'function') {
          return cls;
        }
        await new Promise((r) => setTimeout(r, 50));
      }
      const cls = getLive2DModelClass();
      if (cls && typeof cls.from === 'function') return cls;
      throw new Error("Live2D SDK scripts failed to initialize in WebView.");
    }
    let app, model;
    let currentModelName = '${initialName}';
    let currentState = 'idle';
    let currentMood = 'neutral';
    let isSpeaking = false;
    let spokenText = '';
    let speechSpeed = 1.0;

    // Autonomous Saccadic & Gaze Tracking
    let targetLookX = 0, targetLookY = 0;
    let currentLookX = 0, currentLookY = 0;
    let nextSaccadeTime = 0;
    let saccadeTargetX = 0, saccadeTargetY = 0;

    // Stochastic Eye Blinking
    let isBlinking = false;
    let blinkProgress = 0;
    let nextBlinkTime = 0;

    // Dynamic Phonetic Viseme Lip Sync State
    let currentMouthY = 0;
    let currentMouthForm = 0;
    let mouthPhase = 0;
    let isPointerInteracting = false;

    // ── HIGH-DEFINITION PHONETIC VISEME ENGINE ──────────────────────────
    const VISEME_PARAMS = {
      REST: { yVal: 0.0,   formVal: 0.0 },   // Closed / resting lips
      MBP:  { yVal: 0.0,   formVal: 0.0 },   // Bilabials (M, B, P) - Lips firmly closed
      AA:   { yVal: 0.98,  formVal: 0.30 },  // Open vowels (A, AH, AA, AY, AW) - Deep, clear jaw drop
      EE:   { yVal: 0.58,  formVal: 0.95 },  // Wide smile vowels (E, EE, I, EA) - Horizontal stretch
      IH:   { yVal: 0.52,  formVal: 0.20 },  // Short neutral vowels (IH, EH, UH) - Natural opening
      OO:   { yVal: 0.65,  formVal: -0.85 }, // Pursed lips (O, OO, U, W) - Rounded circle
      OH:   { yVal: 0.88,  formVal: -0.40 }, // Tall oval open (O, OH, AU, AW, OW) - Distinct vertical oval
      FV:   { yVal: 0.36,  formVal: -0.20 }, // Labiodentals (F, V) - Teeth over lower lip
      LNT:  { yVal: 0.42,  formVal: 0.15 },  // Alveolars/Dentals (L, N, T, D, S, Z, R, TH, CH, SH)
    };

    function getWordVisemes(word) {
      if (!word) return [{ ...VISEME_PARAMS.REST, duration: 150 }];
      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
      if (!clean) return [{ ...VISEME_PARAMS.REST, duration: 150 }];

      const seq = [];
      let i = 0;
      while (i < clean.length) {
        const c = clean[i];
        const pair = clean.substr(i, 2);

        if (['oo', 'ou', 'ow'].includes(pair)) {
          seq.push({ ...VISEME_PARAMS.OO, duration: 220 });
          i += 2;
        } else if (['ee', 'ea', 'ie', 'ei'].includes(pair)) {
          seq.push({ ...VISEME_PARAMS.EE, duration: 210 });
          i += 2;
        } else if (['ai', 'ay', 'ae'].includes(pair)) {
          seq.push({ ...VISEME_PARAMS.EE, duration: 200 });
          i += 2;
        } else if (['oa', 'oh', 'aw', 'au'].includes(pair)) {
          seq.push({ ...VISEME_PARAMS.OH, duration: 220 });
          i += 2;
        } else if (['th', 'sh', 'ch', 'ph'].includes(pair)) {
          seq.push({ ...VISEME_PARAMS.LNT, duration: 130 });
          i += 2;
        } else if (['mb', 'mp'].includes(pair)) {
          seq.push({ ...VISEME_PARAMS.MBP, duration: 120 });
          i += 2;
        } else {
          if (['m', 'b', 'p'].includes(c)) seq.push({ ...VISEME_PARAMS.MBP, duration: 110 });
          else if (['f', 'v'].includes(c)) seq.push({ ...VISEME_PARAMS.FV, duration: 120 });
          else if (c === 'a') seq.push({ ...VISEME_PARAMS.AA, duration: 190 });
          else if (['e', 'i'].includes(c)) seq.push({ ...VISEME_PARAMS.EE, duration: 170 });
          else if (c === 'o') seq.push({ ...VISEME_PARAMS.OH, duration: 190 });
          else if (['u', 'w'].includes(c)) seq.push({ ...VISEME_PARAMS.OO, duration: 170 });
          else if (['l', 'n', 't', 'd', 's', 'z', 'r'].includes(c)) seq.push({ ...VISEME_PARAMS.LNT, duration: 120 });
          else seq.push({ ...VISEME_PARAMS.IH, duration: 120 });
          i++;
        }
      }
      return seq.length ? seq : [{ ...VISEME_PARAMS.IH, duration: 150 }];
    }

    let speechSchedule = [];
    let speechScheduleIndex = 0;
    let speechScheduleStartTime = 0;
    let speechDurationMs = 0;
    let lastScheduledText = '';

    function normalizeModelName(modelName) {
      return (modelName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    function isRoboPawsName(modelName) {
      const norm = normalizeModelName(modelName);
      return norm === 'robopaws' || norm === 'robocat' || norm === 'hijiki' || norm === 'robot' || norm === 'kid' || norm === 'kids';
    }

    function scheduleSpokenText(text, speed = 1.0) {
      if (!text || typeof text !== 'string' || !text.trim()) {
        speechSchedule = [];
        lastScheduledText = '';
        return;
      }

      if (text === lastScheduledText && speechSchedule.length > 0) {
        return; // Avoid resetting speech timeline on identical re-renders
      }
      lastScheduledText = text;

      const words = text.trim().split(/\s+/).filter(Boolean);
      const schedule = [];
      let cumulativeTime = 0;
      const timeScale = 1.0 / (Math.max(0.4, speed) || 1.0);

      for (let wIndex = 0; wIndex < words.length; wIndex++) {
        const w = words[wIndex];
        const visemes = getWordVisemes(w);

        // Detect punctuation at the end of word
        const hasMajorPunctuation = /[.!?…]+$/.test(w);
        const hasMinorPunctuation = /[,;:\-—]+$/.test(w);

        for (const v of visemes) {
          const dur = Math.max(60, v.duration * timeScale);
          schedule.push({
            start: cumulativeTime,
            end: cumulativeTime + dur,
            yVal: v.yVal,
            formVal: v.formVal,
            isPause: false,
          });
          cumulativeTime += dur;
        }

        // Punctuation pauses & word boundary spacing
        if (hasMajorPunctuation) {
          // Major pause (sentence end: . ! ?): 650ms full closed-mouth breathing pause
          const majorPauseDur = 650 * timeScale;
          schedule.push({
            start: cumulativeTime,
            end: cumulativeTime + majorPauseDur,
            yVal: 0.0,
            formVal: 0.0,
            isPause: true,
          });
          cumulativeTime += majorPauseDur;
        } else if (hasMinorPunctuation) {
          // Minor pause (clause boundary: , ; : —): 380ms full closed-mouth pause
          const minorPauseDur = 380 * timeScale;
          schedule.push({
            start: cumulativeTime,
            end: cumulativeTime + minorPauseDur,
            yVal: 0.0,
            formVal: 0.0,
            isPause: true,
          });
          cumulativeTime += minorPauseDur;
        } else {
          // Natural micro-gap between normal words: 70ms with relaxed near-closure
          const wordGapDur = 70 * timeScale;
          schedule.push({
            start: cumulativeTime,
            end: cumulativeTime + wordGapDur,
            yVal: 0.05,
            formVal: 0.0,
            isPause: false,
          });
          cumulativeTime += wordGapDur;
        }
      }

      speechSchedule = schedule;
      speechScheduleIndex = 0;
      speechScheduleStartTime = performance.now();
      speechDurationMs = cumulativeTime;
    }

    // ── DORAEMON-STYLE ROBOT CAT PUPPET CLASS (PIXI WebGL) ────────────────
    class DoraemonPuppet extends PIXI.Container {
      constructor() {
        super();
        this.isDoraemonPuppet = true;

        this.rootContainer = new PIXI.Container();
        this.addChild(this.rootContainer);

        // 1. Torso / Body Layer
        this.bodyGfx = new PIXI.Graphics();
        this.rootContainer.addChild(this.bodyGfx);

        // 2. Collar & Bell Layer
        this.collarGfx = new PIXI.Graphics();
        this.rootContainer.addChild(this.collarGfx);

        // 3. Round White Robotic Hands
        this.leftHandGfx = new PIXI.Graphics();
        this.rightHandGfx = new PIXI.Graphics();
        this.rootContainer.addChild(this.leftHandGfx);
        this.rootContainer.addChild(this.rightHandGfx);

        // 4. Head Container (Nods & Tilts)
        this.headContainer = new PIXI.Container();
        this.rootContainer.addChild(this.headContainer);

        // 5. Head Base & White Face Plate
        this.headBaseGfx = new PIXI.Graphics();
        this.headContainer.addChild(this.headBaseGfx);

        // 6. Expressive Cartoon Eyes (Layered behind nose)
        this.eyesGfx = new PIXI.Graphics();
        this.headContainer.addChild(this.eyesGfx);

        // 7. Whiskers & Red Button Nose (Layered in front of eyes)
        this.noseWhiskersGfx = new PIXI.Graphics();
        this.headContainer.addChild(this.noseWhiskersGfx);

        // 8. Dynamic Phonetic Mouth
        this.mouthGfx = new PIXI.Graphics();
        this.headContainer.addChild(this.mouthGfx);

        // Puppet Animation State
        this.blinkTimer = performance.now() + 2500;
        this.isBlinking = false;
        this.blinkProgress = 0;
        this.lookX = 0;
        this.lookY = 0;
        this.mouthY = 0;
        this.mouthForm = 0;
        this.isHappy = false;
        this.isSpeaking = false;

        this.drawStaticFeatures();
      }

      drawStaticFeatures() {
        // --- 1. Torso: Cyan-Blue Torso + White Belly + Gadget Pocket ---
        const bg = this.bodyGfx;
        bg.clear();

        // Metallic Cyan-Blue Body (Round, futuristic)
        bg.beginFill(0x0284C7);
        bg.lineStyle(3.5, 0x0F172A);
        bg.drawRoundedRect(-58, 42, 116, 95, 34);
        bg.endFill();

        // White Circular Belly Disc
        bg.beginFill(0xFFFFFF);
        bg.lineStyle(2.5, 0x0F172A);
        bg.drawCircle(0, 84, 38);
        bg.endFill();

        // 22nd Century Gadget Pouch (Half-circle with horizontal slot)
        bg.beginFill(0xFFFFFF);
        bg.lineStyle(2.5, 0x0F172A);
        bg.arc(0, 84, 27, 0, Math.PI);
        bg.lineTo(27, 84);
        bg.endFill();
        bg.lineStyle(2.5, 0x0F172A);
        bg.moveTo(-27, 84);
        bg.lineTo(27, 84);

        // --- 2. Red Neck Collar & Golden Gadget Bell ---
        const col = this.collarGfx;
        col.clear();

        // Soft chin shadow behind collar
        col.beginFill(0x0F172A, 0.15);
        col.drawEllipse(0, 33, 48, 6);
        col.endFill();

        // Bright Red Collar Band
        col.beginFill(0xEF4444);
        col.lineStyle(3, 0x0F172A);
        col.drawRoundedRect(-48, 35, 96, 16, 7);
        col.endFill();

        // Golden Bell
        col.beginFill(0xFBBF24);
        col.lineStyle(2.5, 0x0F172A);
        col.drawCircle(0, 50, 14);
        col.endFill();

        // Bell golden highlight ring & center hole
        col.lineStyle(2, 0x0F172A);
        col.moveTo(-12, 48);
        col.lineTo(12, 48);
        col.beginFill(0x334155);
        col.drawCircle(0, 54, 3.5);
        col.endFill();
        col.moveTo(0, 57.5);
        col.lineTo(0, 64);

        // --- 3. Head Base: Clean Spherical Cyan-Blue Robotic Head ---
        const hg = this.headBaseGfx;
        hg.clear();

        // Large Spherical Robot Head
        hg.beginFill(0x0284C7);
        hg.lineStyle(3.8, 0x0F172A);
        hg.drawCircle(0, -30, 80);
        hg.endFill();

        // White Face Plate (Natural Round Lower-Cheek Mask)
        hg.beginFill(0xFFFFFF);
        hg.lineStyle(2.2, 0x0F172A);
        hg.drawEllipse(0, -10, 66, 48);
        hg.endFill();

        // --- 4. Red Button Nose & 6 Whiskers (Drawn in front of eyes) ---
        const nwg = this.noseWhiskersGfx;
        nwg.clear();

        // Bright Red Sphere Nose in front of eyes
        nwg.beginFill(0xEF4444);
        nwg.lineStyle(2.5, 0x0F172A);
        nwg.drawCircle(0, -30, 11);
        nwg.endFill();

        // Nose white shine highlight
        nwg.beginFill(0xFFFFFF, 0.9);
        nwg.drawCircle(-3, -33, 3.5);
        nwg.endFill();

        // Center seam line from nose to mouth
        nwg.lineStyle(2.5, 0x0F172A);
        nwg.moveTo(0, -19);
        nwg.lineTo(0, 6);

        // 6 Whiskers (3 on each cheek)
        nwg.lineStyle(2.2, 0x0F172A);
        // Left whiskers
        nwg.moveTo(-16, -20); nwg.lineTo(-58, -26);
        nwg.moveTo(-18, -12); nwg.lineTo(-64, -12);
        nwg.moveTo(-16, -4); nwg.lineTo(-58, 2);
        // Right whiskers
        nwg.moveTo(16, -20); nwg.lineTo(58, -26);
        nwg.moveTo(18, -12); nwg.lineTo(64, -12);
        nwg.moveTo(16, -4); nwg.lineTo(58, 2);

        this.drawHands(0);
      }

      drawHands(t) {
        const lh = this.leftHandGfx;
        const rh = this.rightHandGfx;
        lh.clear();
        rh.clear();

        const lOffset = Math.sin(t) * 4;
        const rOffset = Math.cos(t) * 4;

        // Left Cyan-Blue Robotic Arm
        lh.beginFill(0x0284C7);
        lh.lineStyle(3, 0x0F172A);
        lh.moveTo(-44, 48);
        lh.lineTo(-66, 68 + lOffset);
        lh.lineTo(-56, 76 + lOffset);
        lh.lineTo(-38, 58);
        lh.closePath();
        lh.endFill();

        // Left Round White Robotic Hand (Paw)
        lh.beginFill(0xFFFFFF);
        lh.lineStyle(3, 0x0F172A);
        lh.drawCircle(-66, 68 + lOffset, 16);
        lh.endFill();

        // Right Cyan-Blue Robotic Arm
        rh.beginFill(0x0284C7);
        rh.lineStyle(3, 0x0F172A);
        rh.moveTo(44, 48);
        rh.lineTo(66, 68 + rOffset);
        rh.lineTo(56, 76 + rOffset);
        rh.lineTo(38, 58);
        rh.closePath();
        rh.endFill();

        // Right Round White Robotic Hand (Paw)
        rh.beginFill(0xFFFFFF);
        rh.lineStyle(3, 0x0F172A);
        rh.drawCircle(66, 68 + rOffset, 16);
        rh.endFill();
      }

      update(now, lookX, lookY, mouthY, mouthForm, isSpeaking, isHappy, state) {
        this.lookX = lookX;
        this.lookY = lookY;
        this.mouthY = mouthY;
        this.mouthForm = mouthForm;
        this.isSpeaking = isSpeaking;
        this.isHappy = isHappy;

        const t = now * 0.001;

        // 1. Natural Floating Bob & Ambient Breathing
        const hoverY = Math.sin(t * 2.2) * 5;
        const headTilt = isSpeaking ? (Math.sin(t * 3.5) * 0.04 + lookX * 0.04) : (lookX * 0.04);
        const headNod = isSpeaking ? (Math.cos(t * 2.8) * 3 - (mouthY * 4)) : (Math.sin(t * 1.5) * 2);

        this.rootContainer.y = hoverY;
        this.headContainer.rotation = headTilt;
        this.headContainer.y = headNod;

        this.drawHands(t * 2.5);

        // 2. Eye Blinking Logic
        if (now > this.blinkTimer) {
          this.isBlinking = true;
          this.blinkProgress = 0;
          this.blinkTimer = now + 2600 + Math.random() * 3200;
        }
        if (this.isBlinking) {
          this.blinkProgress += 0.18;
          if (this.blinkProgress >= 1.0) {
            this.isBlinking = false;
            this.blinkProgress = 0;
          }
        }

        // 3. Render Expressive Eyes
        this.renderEyes();

        // 4. Render Dynamic Phonetic Mouth
        this.renderMouth();
      }

      renderEyes() {
        const eg = this.eyesGfx;
        eg.clear();

        const leftEyeX = -15;
        const rightEyeX = 15;
        const eyeY = -48;
        const eyeW = 15;
        const eyeH = 20;

        if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
          // Closed Happy Eye Curves (^ ^)
          eg.lineStyle(3.5, 0x0F172A);
          eg.arc(leftEyeX, eyeY + 4, 11, Math.PI * 1.1, Math.PI * 1.9);
          eg.arc(rightEyeX, eyeY + 4, 11, Math.PI * 1.1, Math.PI * 1.9);
        } else {
          // Left Eye Capsule (White)
          eg.beginFill(0xFFFFFF);
          eg.lineStyle(3, 0x0F172A);
          eg.drawEllipse(leftEyeX, eyeY, eyeW, eyeH);
          eg.endFill();

          // Right Eye Capsule (White)
          eg.beginFill(0xFFFFFF);
          eg.lineStyle(3, 0x0F172A);
          eg.drawEllipse(rightEyeX, eyeY, eyeW, eyeH);
          eg.endFill();

          // Smooth Pupil Gaze Tracking
          const pX = this.lookX * 5.2;
          const pY = this.lookY * 4.0;

          // Left Pupil
          eg.beginFill(0x0F172A);
          eg.drawCircle(leftEyeX + 3 + pX, eyeY + 2 + pY, 6.5);
          eg.endFill();
          // Left Pupil Shine
          eg.beginFill(0xFFFFFF);
          eg.drawCircle(leftEyeX + 1 + pX, eyeY - 1 + pY, 2.5);
          eg.endFill();

          // Right Pupil
          eg.beginFill(0x0F172A);
          eg.drawCircle(rightEyeX - 3 + pX, eyeY + 2 + pY, 6.5);
          eg.endFill();
          // Right Pupil Shine
          eg.beginFill(0xFFFFFF);
          eg.drawCircle(rightEyeX - 5 + pX, eyeY - 1 + pY, 2.5);
          eg.endFill();
        }
      }

      renderMouth() {
        const mg = this.mouthGfx;
        mg.clear();

        const mY = Math.max(0, Math.min(1.0, this.mouthY));
        const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
        const centerY = 5;

        if (mY < 0.10) {
          // Resting / Closed Smile: Classic cute Doraemon wide smile curve
          mg.lineStyle(3, 0x0F172A);
          const smileSpread = 28 + (this.isHappy ? 6 : 0);
          const smileDrop = 14 + (this.isHappy ? 4 : 0);
          mg.moveTo(-smileSpread, centerY);
          mg.quadraticCurveTo(0, centerY + smileDrop, smileSpread, centerY);
        } else {
          // Active Speech Phonetic Mouth Shape
          const openHeight = 8 + (mY * 36);
          const openWidth = Math.max(14, 24 + (mForm * 10) + (mY * 6));

          // Dark Red Mouth Cavity
          mg.beginFill(0x881337);
          mg.lineStyle(3, 0x0F172A);

          // Top Lip Arc
          mg.moveTo(-openWidth, centerY);
          mg.quadraticCurveTo(0, centerY - (openHeight * 0.15), openWidth, centerY);
          // Bottom Lip Arc
          mg.quadraticCurveTo(0, centerY + openHeight, -openWidth, centerY);
          mg.endFill();

          // Upper White Teeth Arc
          if (mY > 0.22) {
            mg.beginFill(0xFFFFFF);
            mg.lineStyle(0);
            mg.moveTo(-openWidth * 0.72, centerY);
            mg.quadraticCurveTo(0, centerY - (openHeight * 0.1), openWidth * 0.72, centerY);
            mg.lineTo(openWidth * 0.68, centerY + 5);
            mg.quadraticCurveTo(0, centerY + 7, -openWidth * 0.68, centerY + 5);
            mg.closePath();
            mg.endFill();
          }

          // Pink Tongue Arc
          if (mY > 0.18) {
            mg.beginFill(0xFB7185);
            mg.lineStyle(0);
            const tongueW = openWidth * 0.65;
            const tongueBaseY = centerY + openHeight - 2;
            mg.moveTo(-tongueW, tongueBaseY);
            mg.quadraticCurveTo(0, tongueBaseY - (openHeight * 0.45), tongueW, tongueBaseY);
            mg.quadraticCurveTo(0, tongueBaseY + 2, -tongueW, tongueBaseY);
            mg.endFill();
          }
        }
      }
    }

    function getViewDimensions() {
      const container = document.getElementById('canvas-container');
      const w = container ? (container.clientWidth || container.offsetWidth) : 0;
      const h = container ? (container.clientHeight || container.offsetHeight) : 0;
      const viewW = w > 50 ? w : (window.innerWidth > 50 ? window.innerWidth : 320);
      const viewH = h > 50 ? h : (window.innerHeight > 50 ? window.innerHeight : 200);
      return { viewW, viewH };
    }

    function framePortrait(viewW, viewH) {
      if (!model) return;
      const dims = getViewDimensions();
      const w = viewW || (app ? app.screen.width : dims.viewW);
      const h = viewH || (app ? app.screen.height : dims.viewH);

      if (model.isDoraemonPuppet) {
        const baseScale = (h * 0.88) / 200;
        model.scale.set(baseScale, baseScale);
        model.x = w / 2;
        model.y = h * 0.52;
        return;
      }

      const lower = (currentModelName || '').toLowerCase();
      const isMale = lower.includes('chitose') || lower.includes('male');
      const nativeH = (model.internalModel && model.internalModel.height) ? model.internalModel.height : (model.height || 1000);

      if (model.anchor) {
        model.anchor.set(0.5, 0.0);
      }

      // Live2D Models (Haru and Chitose)
      const zoom = isMale ? 1.30 : 1.25;
      const baseScale = (h * zoom) / nativeH;
      model.scale.set(baseScale, baseScale);

      model.x = w / 2;
      model.y = Math.max(8, h * 0.06);
    }

    async function init() {
      const container = document.getElementById('canvas-container');
      const { viewW, viewH } = getViewDimensions();

      app = new PIXI.Application({
        width: viewW,
        height: viewH,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      container.appendChild(app.view);

      window.addEventListener('resize', onResize);
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerReset);
      document.addEventListener('pointercancel', onPointerReset);

      try {
        await loadModel('${initialUrl}', '${initialName}');

        // Continuous 60fps Animation Loop
        app.ticker.add((delta) => {
          if (!model) return;

          const now = performance.now();
          const t = now * 0.001;

          // 1. Natural Ambient Gaze Tracking
          if (!isPointerInteracting) {
            if (now > nextSaccadeTime) {
              saccadeTargetX = (Math.random() - 0.5) * 0.35;
              saccadeTargetY = (Math.random() - 0.5) * 0.20;
              nextSaccadeTime = now + 2200 + Math.random() * 3500;
            }
            targetLookX = saccadeTargetX;
            targetLookY = saccadeTargetY;
          }

          currentLookX += (targetLookX - currentLookX) * 0.09;
          currentLookY += (targetLookY - currentLookY) * 0.09;

          const isHappy = currentMood === 'happy' || currentMood === 'encouraging';

          // 2. Phonetic Lip-Sync Calculations
          if (isSpeaking) {
            let targetMouthY = 0;
            let targetMouthForm = isHappy ? 0.85 : 0.2;

            if (speechSchedule && speechSchedule.length > 0) {
              const elapsed = now - speechScheduleStartTime;
              let activeFrame = null;

              for (let f = speechScheduleIndex; f < speechSchedule.length; f++) {
                if (elapsed >= speechSchedule[f].start && elapsed < speechSchedule[f].end) {
                  activeFrame = speechSchedule[f];
                  speechScheduleIndex = f;
                  break;
                }
              }

              if (activeFrame) {
                if (activeFrame.isPause || activeFrame.yVal === 0.0) {
                  targetMouthY = 0.0;
                  targetMouthForm = isHappy ? 0.40 : 0.0;
                } else {
                  const frameElapsed = elapsed - activeFrame.start;
                  const frameDur = activeFrame.end - activeFrame.start;
                  const frameProgress = Math.min(1.0, Math.max(0.0, frameElapsed / frameDur));
                  const env = Math.sin(frameProgress * Math.PI);
                  targetMouthY = activeFrame.yVal * env;
                  targetMouthForm = isHappy ? Math.max(0.5, activeFrame.formVal) : activeFrame.formVal;
                }
              } else if (elapsed > speechDurationMs) {
                const speechCycle = (now * 0.0019 * Math.PI * 2) % (Math.PI * 2);
                const breathCycle = Math.sin(now * 0.0006 * Math.PI * 2);

                if (breathCycle < -0.65) {
                  targetMouthY = 0.0;
                  targetMouthForm = isHappy ? 0.4 : 0.0;
                } else {
                  const rawOpen = Math.pow(Math.max(0, Math.sin(speechCycle)), 1.4);
                  targetMouthY = rawOpen * 0.88;
                  targetMouthForm = isHappy ? 0.85 : 0.20;
                }
              }
            } else {
              const speechCycle = (now * 0.0019 * Math.PI * 2) % (Math.PI * 2);
              const breathCycle = Math.sin(now * 0.0006 * Math.PI * 2);

              if (breathCycle < -0.65) {
                targetMouthY = 0.0;
                targetMouthForm = isHappy ? 0.4 : 0.0;
              } else {
                const rawOpen = Math.pow(Math.max(0, Math.sin(speechCycle)), 1.4);
                targetMouthY = rawOpen * 0.88;
                targetMouthForm = isHappy ? 0.85 : 0.20;
              }
            }

            const lerpY = targetMouthY > currentMouthY ? 0.42 : 0.28;
            currentMouthY += (targetMouthY - currentMouthY) * lerpY;
            currentMouthForm += (targetMouthForm - currentMouthForm) * 0.28;
          } else {
            currentMouthY += (0 - currentMouthY) * 0.22;
            currentMouthForm += ((isHappy ? 0.6 : 0.0) - currentMouthForm) * 0.22;
            speechSchedule = [];
            lastScheduledText = '';
          }

          // 3. Render either Doraemon Puppet or Live2D CoreModel
          if (model.isDoraemonPuppet) {
            model.update(now, currentLookX, currentLookY, currentMouthY, currentMouthForm, isSpeaking, isHappy, currentState);
            return;
          }

          if (!model.internalModel || !model.internalModel.coreModel) return;
          const core = model.internalModel.coreModel;

          const breath = (Math.sin(t * 1.5) + 1) * 0.5;
          setParam(core, 'ParamBreath', 'PARAM_BREATH', breath);

          setParam(core, 'ParamEyeBallX', 'PARAM_EYE_BALL_X', currentLookX * 0.85);
          setParam(core, 'ParamEyeBallY', 'PARAM_EYE_BALL_Y', currentLookY * 0.85);
          setParam(core, 'ParamAngleX', 'PARAM_ANGLE_X', currentLookX * 18);
          setParam(core, 'ParamAngleY', 'PARAM_ANGLE_Y', currentLookY * 14);
          setParam(core, 'ParamBodyAngleX', 'PARAM_BODY_ANGLE_X', currentLookX * 6);

          if (now > nextBlinkTime && !isBlinking) {
            isBlinking = true;
            blinkProgress = 0;
          }

          if (isBlinking) {
            blinkProgress += 0.15 * delta;
            const eyeOpen = Math.max(0, 1 - Math.sin(blinkProgress * Math.PI));
            setParam(core, 'ParamEyeLOpen', 'PARAM_EYE_L_OPEN', eyeOpen);
            setParam(core, 'ParamEyeROpen', 'PARAM_EYE_R_OPEN', eyeOpen);

            if (blinkProgress >= 1.0) {
              isBlinking = false;
              nextBlinkTime = now + 2400 + Math.random() * 3600;
            }
          }

          if (isHappy) {
            setParam(core, 'ParamEyeLSmile', 'PARAM_EYE_L_SMILE', 0.85);
            setParam(core, 'ParamEyeRSmile', 'PARAM_EYE_R_SMILE', 0.85);
            setParam(core, 'ParamBrowLY', 'PARAM_BROW_L_Y', 0.2);
            setParam(core, 'ParamBrowRY', 'PARAM_BROW_R_Y', 0.2);
          } else {
            setParam(core, 'ParamEyeLSmile', 'PARAM_EYE_L_SMILE', 0.0);
            setParam(core, 'ParamEyeRSmile', 'PARAM_EYE_R_SMILE', 0.0);
          }

          if (isSpeaking) {
            const headNod = (currentLookY * 12) + (currentMouthY * -2.4) + Math.sin(now * 0.0022) * 1.5;
            const headTilt = Math.cos(now * 0.0015) * 1.8;
            const bodyBob = Math.sin(now * 0.0012) * 1.6;

            setParam(core, 'ParamAngleY', 'PARAM_ANGLE_Y', headNod);
            setParam(core, 'ParamAngleZ', 'PARAM_ANGLE_Z', headTilt);
            setParam(core, 'ParamBodyAngleX', 'PARAM_BODY_ANGLE_X', bodyBob);
          }

          setParam(core, 'ParamMouthOpenY', 'PARAM_MOUTH_OPEN_Y', Math.max(0, Math.min(1.0, currentMouthY)));
          setParam(core, 'ParamMouthForm', 'PARAM_MOUTH_FORM', Math.max(-1.0, Math.min(1.0, currentMouthForm)));
        });

        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
      } catch (err) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: err.message }));
      }
    }

    function setParam(core, cubism4Id, cubism2Id, val) {
      if (!core) return;
      try {
        if (core.setParameterValueById) {
          core.setParameterValueById(cubism4Id, val);
        }
      } catch(e) {}
      try {
        if (core.setParamFloat) {
          core.setParamFloat(cubism2Id, val, 1.0);
          if (cubism2Id === 'PARAM_MOUTH_OPEN_Y') {
            core.setParamFloat('PARAM_MOUTH_OPEN', val, 1.0);
            core.setParamFloat('PARAM_MOUTH_A', val, 1.0);
            core.setParamFloat('PARAM_MOUTH_O', val, 1.0);
          }
        }
      } catch(e) {}
    }

    function onPointerDown(e) {
      isPointerInteracting = true;
      onPointerMove(e);
    }

    function onPointerMove(e) {
      const rect = app.view.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetLookX = Math.max(-1, Math.min(1, x));
      targetLookY = Math.max(-1, Math.min(1, y));
    }

    function onPointerReset() {
      isPointerInteracting = false;
      targetLookX = 0;
      targetLookY = 0;
    }

    function onResize() {
      if (!app || !model) return;
      const { viewW, viewH } = getViewDimensions();
      app.renderer.resize(viewW, viewH);
      framePortrait(viewW, viewH);
    }

    async function loadModel(url, modelName) {
      if (model) {
        try {
          app.stage.removeChild(model);
          model.destroy({ children: true, texture: true, baseTexture: true });
        } catch(e) {}
        model = null;
      }

      currentModelName = normalizeModelName(modelName || 'haru');

      try {
        const { viewW, viewH } = getViewDimensions();
        if (app && app.renderer) {
          app.renderer.resize(viewW, viewH);
        }

        // If Robo-Paws, instantiate Doraemon WebGL puppet directly!
        if (isRoboPawsName(currentModelName)) {
          model = new DoraemonPuppet();
          app.stage.addChild(model);
          framePortrait(viewW, viewH);
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
          return;
        }

        const Live2DModelClass = await waitForLive2DSDK();
        if (typeof Live2DModelClass.registerTicker === 'function' && window.PIXI && window.PIXI.Ticker) {
          try {
            Live2DModelClass.registerTicker(window.PIXI.Ticker);
          } catch(e) {}
        }
        model = await Live2DModelClass.from(url, { autoInteract: false });

        // Hook motionManager update to guarantee lipSync overrides motion curves
        if (model.internalModel && model.internalModel.motionManager) {
          const origUpdate = model.internalModel.motionManager.update ? model.internalModel.motionManager.update.bind(model.internalModel.motionManager) : null;
          if (origUpdate) {
            model.internalModel.motionManager.update = function(coreModel, now) {
              origUpdate(coreModel, now);
              if (coreModel) {
                setParam(coreModel, 'ParamMouthOpenY', 'PARAM_MOUTH_OPEN_Y', Math.max(0, Math.min(1.0, currentMouthY)));
                setParam(coreModel, 'ParamMouthForm', 'PARAM_MOUTH_FORM', Math.max(-1.0, Math.min(1.0, currentMouthForm)));
              }
            };
          }
        }

        if ('eventMode' in model) {
          model.eventMode = 'none';
        }
        model.interactive = false;

        app.stage.addChild(model);
        framePortrait(viewW, viewH);
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
      } catch(err) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: err.message }));
      }
    }

    // Handle React Native postMessage events
    function handleMessage(event) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'SPEAK') {
          isSpeaking = Boolean(data.isSpeaking);
          if (isSpeaking && data.text) {
            scheduleSpokenText(data.text, data.speed || 1.0);
          }
        } else if (data.type === 'STATE') {
          currentState = data.state || 'idle';
          isSpeaking = Boolean(data.isSpeaking || data.state === 'speaking');
          if (isSpeaking && data.text) {
            scheduleSpokenText(data.text, data.speed || 1.0);
          }
        } else if (data.type === 'TEXT') {
          if (data.text) {
            scheduleSpokenText(data.text, data.speed || 1.0);
          }
        } else if (data.type === 'MOOD') {
          currentMood = data.mood || 'neutral';
        } else if (data.type === 'MODEL') {
          const targetName = normalizeModelName(data.model || 'haru');
          if (targetName !== currentModelName) {
            const url = getModelUrl(targetName);
            loadModel(url, targetName);
          }
        }
      } catch(e) {}
    }

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(init, 20);
    } else {
      window.addEventListener('DOMContentLoaded', init);
      window.addEventListener('load', init);
    }
  </script>
</body>
</html>
`;
};

export const Live2DAvatarView = memo(function Live2DAvatarView({
  isSpeaking = false,
  spokenText = '',
  speechSpeed = 1.0,
  state = 'idle',
  mood = 'neutral',
  model = 'haru',
  style,
  onLoaded,
  onError,
}) {
  const webViewRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const normalizedModel = (model || 'haru').toLowerCase();

  const htmlSource = useMemo(() => getLive2DHtml(normalizedModel), [normalizedModel]);

  // Send state and spoken text updates to Live2D WebView
  useEffect(() => {
    if (webViewRef.current && isReady) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'STATE',
          state: isSpeaking ? 'speaking' : state,
          isSpeaking,
          text: spokenText,
          speed: speechSpeed,
        })
      );
    }
  }, [isSpeaking, spokenText, speechSpeed, state, isReady]);

  // Send mood updates
  useEffect(() => {
    if (webViewRef.current && isReady) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'MOOD',
          mood,
        })
      );
    }
  }, [mood, isReady]);

  // Send model updates
  useEffect(() => {
    if (webViewRef.current && isReady) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'MODEL',
          model: normalizedModel,
        })
      );
    }
  }, [normalizedModel, isReady]);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'READY') {
        setIsReady(true);
        if (onLoaded) onLoaded();
      } else if (data.type === 'ERROR') {
        console.warn('Live2D WebView Error:', data.message);
        if (onError) onError(new Error(data.message));
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlSource, baseUrl: 'https://localhost' }}
        style={styles.webView}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        scalesPageToFit={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        transparent={true}
        backgroundColor="transparent"
        androidLayerType="hardware"
        mixedContentMode="always"
        onMessage={onMessage}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});

export default Live2DAvatarView;
