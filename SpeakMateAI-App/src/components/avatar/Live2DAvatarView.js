import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: DEVICE_WINDOW_WIDTH } = Dimensions.get('window');

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

const getLive2DHtml = (initialModel = 'haru', deviceWidth = 360, stageHeight = 200) => {
  const initialName = normalizeModelName(initialModel || 'haru');
  const initialUrl = getModelUrl(initialName);
  const fixedWidth = Math.round(deviceWidth || 360);
  const fixedHeight = Math.round(stageHeight || 200);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: transparent;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #canvas-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    canvas {
      display: block !important;
      margin: 0 auto !important;
      width: 100% !important;
      height: 100% !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
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

        // 1. Torso & Gadget Pouch (Depth Z: 0.2)
        this.bodyContainer = new PIXI.Container();
        this.rootContainer.addChild(this.bodyContainer);
        this.bodyGfx = new PIXI.Graphics();
        this.bodyContainer.addChild(this.bodyGfx);

        // 2. Robotic Hands (Depth Z: 0.4)
        this.handsContainer = new PIXI.Container();
        this.rootContainer.addChild(this.handsContainer);
        this.leftHandGfx = new PIXI.Graphics();
        this.rightHandGfx = new PIXI.Graphics();
        this.handsContainer.addChild(this.leftHandGfx);
        this.handsContainer.addChild(this.rightHandGfx);

        // 3. Red Collar & 3D Pendulum Bell (Depth Z: 0.6)
        this.collarContainer = new PIXI.Container();
        this.rootContainer.addChild(this.collarContainer);
        this.collarGfx = new PIXI.Graphics();
        this.bellContainer = new PIXI.Container();
        this.bellGfx = new PIXI.Graphics();
        this.collarContainer.addChild(this.collarGfx);
        this.collarContainer.addChild(this.bellContainer);
        this.bellContainer.addChild(this.bellGfx);

        // 4. Head Master Pivot (Neck Joint at Y: 35)
        this.headMaster = new PIXI.Container();
        this.headMaster.position.set(0, 35);
        this.rootContainer.addChild(this.headMaster);

        // 5. Spherical Outer Blue Head Shell (Depth Z: 0.8)
        this.headBaseGfx = new PIXI.Graphics();
        this.headBaseGfx.position.set(0, -65);
        this.headMaster.addChild(this.headBaseGfx);

        // 6. 2.5D White Face Plate (Parallax Depth Z: 1.0)
        this.facePlateContainer = new PIXI.Container();
        this.facePlateContainer.position.set(0, -65);
        this.headMaster.addChild(this.facePlateContainer);
        this.faceGfx = new PIXI.Graphics();
        this.facePlateContainer.addChild(this.faceGfx);

        // 7. 2.5D Dynamic EYES Container (Parallax Depth Z: 1.25)
        this.eyesContainer = new PIXI.Container();
        this.facePlateContainer.addChild(this.eyesContainer);
        this.leftEyeGfx = new PIXI.Graphics();
        this.rightEyeGfx = new PIXI.Graphics();
        this.eyesContainer.addChild(this.leftEyeGfx);
        this.eyesContainer.addChild(this.rightEyeGfx);

        // 8. 2.5D Whiskers & Dynamic Seam (Parallax Depth Z: 1.15)
        this.whiskersGfx = new PIXI.Graphics();
        this.facePlateContainer.addChild(this.whiskersGfx);

        // 9. 2.5D Phonetic MOUTH (Parallax Depth Z: 1.20)
        this.mouthGfx = new PIXI.Graphics();
        this.facePlateContainer.addChild(this.mouthGfx);

        // 10. 3D Spherical Red NOSE (Parallax Depth Z: 1.45 - Frontmost)
        this.noseGfx = new PIXI.Graphics();
        this.facePlateContainer.addChild(this.noseGfx);

        // ── 2.5D Physics, Pose & Tracking State ──
        this.angleX = 0;
        this.angleY = 0;
        this.angleZ = 0;
        this.bodyAngleX = 0;

        this.lookX = 0;
        this.lookY = 0;
        this.targetLookX = 0;
        this.targetLookY = 0;

        this.blinkTimer = performance.now() + 2800;
        this.isBlinking = false;
        this.blinkProgress = 0;

        this.mouthY = 0;
        this.mouthForm = 0;
        this.isSpeaking = false;
        this.isHappy = false;

        this.bellAngle = 0;

        this.initStaticGeometry();
      }

      initStaticGeometry() {
        const hg = this.headBaseGfx;
        hg.clear();
        hg.beginFill(0x0284C7);
        hg.lineStyle(3.5, 0x0F172A);
        hg.drawCircle(0, 0, 78);
        hg.endFill();

        const bg = this.bodyGfx;
        bg.clear();
        bg.beginFill(0x0284C7);
        bg.lineStyle(3.5, 0x0F172A);
        bg.drawRoundedRect(-54, 8, 108, 92, 32);
        bg.endFill();

        bg.beginFill(0xFFFFFF);
        bg.lineStyle(2.5, 0x0F172A);
        bg.drawCircle(0, 48, 36);
        bg.endFill();

        bg.beginFill(0xFFFFFF);
        bg.lineStyle(2.5, 0x0F172A);
        bg.arc(0, 48, 25, 0, Math.PI);
        bg.lineTo(25, 48);
        bg.endFill();
        bg.lineStyle(2.5, 0x0F172A);
        bg.moveTo(-25, 48);
        bg.lineTo(25, 48);
      }

      update(now, lookX, lookY, mouthY, mouthForm, isSpeaking, isHappy, state) {
        this.lookX = lookX || 0;
        this.lookY = lookY || 0;
        this.mouthY = mouthY || 0;
        this.mouthForm = mouthForm || 0;
        this.isSpeaking = isSpeaking;
        this.isHappy = isHappy;

        const t = now * 0.001;

        // 1. Natural 2.5D Head Yaw/Pitch/Roll Tracking
        const targetAngleX = this.lookX * 0.45;
        const targetAngleY = this.lookY * 0.35 + (isSpeaking ? Math.sin(t * 7.0) * 0.06 * Math.max(0.2, this.mouthY) : 0);
        const targetAngleZ = (isSpeaking ? Math.cos(t * 3.5) * 0.04 : 0);

        const ease = 0.12;
        this.angleX += (targetAngleX - this.angleX) * ease;
        this.angleY += (targetAngleY - this.angleY) * ease;
        this.angleZ += (targetAngleZ - this.angleZ) * ease;
        this.bodyAngleX += (-this.angleX * 0.35 - this.bodyAngleX) * 0.08;

        const hoverY = Math.sin(t * 2.2) * 4;
        this.rootContainer.y = hoverY;

        this.headMaster.rotation = this.angleZ;
        this.headMaster.x = this.angleX * 8;
        this.headMaster.y = 35 + (this.angleY * 6);

        this.bodyContainer.rotation = this.bodyAngleX * 0.5;
        this.bodyContainer.x = -this.angleX * 3;

        // 2. 2.5D Spherical Depth Parallax
        const faceParallaxX = this.angleX * 18;
        const faceParallaxY = this.angleY * 12;
        this.facePlateContainer.position.set(faceParallaxX, -65 + faceParallaxY);
        this.facePlateContainer.scale.x = Math.max(0.82, Math.cos(this.angleX * 1.1));

        this.render2DFacePlate();
        this.render2DEyes();
        this.render2DWhiskersAndNose();
        this.render2DMouth();
        this.render2DCollarAndBell(t);
        this.render2DHands(t);

        // Blinking
        if (now > this.blinkTimer) {
          this.isBlinking = true;
          this.blinkProgress = 0;
          this.blinkTimer = now + 2800 + Math.random() * 3500;
        }
        if (this.isBlinking) {
          this.blinkProgress += 0.22;
          if (this.blinkProgress >= 1.0) {
            this.isBlinking = false;
            this.blinkProgress = 0;
          }
        }
      }

      render2DFacePlate() {
        const fg = this.faceGfx;
        fg.clear();
        fg.beginFill(0xFFFFFF);
        fg.lineStyle(2.2, 0x0F172A);
        fg.drawEllipse(0, 18, 64, 46);
        fg.endFill();

        fg.beginFill(0xF472B6, 0.22);
        fg.drawEllipse(-36, 16, 10, 6);
        fg.drawEllipse(36, 16, 10, 6);
        fg.endFill();
      }

      render2DEyes() {
        const le = this.leftEyeGfx;
        const re = this.rightEyeGfx;
        le.clear();
        re.clear();

        const yaw = this.angleX;
        const pitch = this.angleY;

        const eyeSpacing = 14;
        const leftEyeBaseX = -eyeSpacing + (yaw * 3);
        const rightEyeBaseX = eyeSpacing + (yaw * 3);
        const eyeBaseY = -18 + (pitch * 4);

        const leftScaleX = Math.max(0.72, 1.0 + (yaw * 0.35));
        const rightScaleX = Math.max(0.72, 1.0 - (yaw * 0.35));

        const eyeW = 14.5;
        const eyeH = 20;

        const pupilXOffset = this.lookX * 4.5;
        const pupilYOffset = this.lookY * 3.5;

        // LEFT EYE
        if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
          le.lineStyle(3.5, 0x0F172A);
          le.arc(leftEyeBaseX, eyeBaseY + 4, 10 * leftScaleX, Math.PI * 1.1, Math.PI * 1.9);
        } else {
          le.beginFill(0xFFFFFF);
          le.lineStyle(2.8, 0x0F172A);
          le.drawEllipse(leftEyeBaseX, eyeBaseY, eyeW * leftScaleX, eyeH);
          le.endFill();

          const lpx = leftEyeBaseX + 3 + pupilXOffset;
          const lpy = eyeBaseY + 2 + pupilYOffset;
          le.beginFill(0x0F172A);
          le.drawCircle(lpx, lpy, 6.0);
          le.endFill();

          le.beginFill(0xFFFFFF, 0.95);
          le.drawCircle(lpx - 2, lpy - 2, 2.4);
          le.drawCircle(lpx + 2, lpy + 2, 1.2);
          le.endFill();
        }

        // RIGHT EYE
        if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
          re.lineStyle(3.5, 0x0F172A);
          re.arc(rightEyeBaseX, eyeBaseY + 4, 10 * rightScaleX, Math.PI * 1.1, Math.PI * 1.9);
        } else {
          re.beginFill(0xFFFFFF);
          re.lineStyle(2.8, 0x0F172A);
          re.drawEllipse(rightEyeBaseX, eyeBaseY, eyeW * rightScaleX, eyeH);
          re.endFill();

          const rpx = rightEyeBaseX - 3 + pupilXOffset;
          const rpy = eyeBaseY + 2 + pupilYOffset;
          re.beginFill(0x0F172A);
          re.drawCircle(rpx, rpy, 6.0);
          re.endFill();

          re.beginFill(0xFFFFFF, 0.95);
          re.drawCircle(rpx - 2, rpy - 2, 2.4);
          re.drawCircle(rpx + 2, rpy + 2, 1.2);
          re.endFill();
        }
      }

      render2DWhiskersAndNose() {
        const wg = this.whiskersGfx;
        const ng = this.noseGfx;
        wg.clear();
        ng.clear();

        const yaw = this.angleX;
        const pitch = this.angleY;

        const noseX = yaw * 8;
        const noseY = 0 + (pitch * 6);

        ng.beginFill(0x0F172A, 0.18);
        ng.drawEllipse(noseX + 1.5, noseY + 4, 10, 4);
        ng.endFill();

        ng.beginFill(0xEF4444);
        ng.lineStyle(2.5, 0x0F172A);
        ng.drawCircle(noseX, noseY, 11);
        ng.endFill();

        ng.beginFill(0xFFFFFF, 0.92);
        ng.drawCircle(noseX - 3, noseY - 3.5, 3.2);
        ng.endFill();

        wg.lineStyle(2.5, 0x0F172A);
        wg.moveTo(noseX, noseY + 11);
        wg.lineTo(noseX * 0.7, 34);

        const lSpread = 1.0 - (yaw * 0.4);
        const rSpread = 1.0 + (yaw * 0.4);

        wg.lineStyle(2.2, 0x0F172A);
        wg.moveTo(-16 + (yaw * 4), 10); wg.lineTo(-16 - (42 * lSpread), 4 - (pitch * 5));
        wg.moveTo(-18 + (yaw * 4), 18); wg.lineTo(-18 - (48 * lSpread), 18);
        wg.moveTo(-16 + (yaw * 4), 26); wg.lineTo(-16 - (42 * lSpread), 32 + (pitch * 5));

        wg.moveTo(16 + (yaw * 4), 10); wg.lineTo(16 + (42 * rSpread), 4 - (pitch * 5));
        wg.moveTo(18 + (yaw * 4), 18); wg.lineTo(18 + (48 * rSpread), 18);
        wg.moveTo(16 + (yaw * 4), 26); wg.lineTo(16 + (42 * rSpread), 32 + (pitch * 5));
      }

      render2DMouth() {
        const mg = this.mouthGfx;
        mg.clear();

        const mY = Math.max(0, Math.min(1.0, this.mouthY));
        const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
        const yaw = this.angleX;

        const centerX = yaw * 5;
        const centerY = 34;

        if (mY < 0.08) {
          mg.lineStyle(2.8, 0x0F172A);
          const spread = 27 + (this.isHappy ? 5 : 0);
          const drop = 13 + (this.isHappy ? 4 : 0);
          mg.moveTo(centerX - spread, centerY);
          mg.quadraticCurveTo(centerX, centerY + drop, centerX + spread, centerY);
        } else {
          const openH = 6 + (mY * 34);
          const openW = Math.max(12, 22 + (mForm * 8) + (mY * 6));

          mg.beginFill(0x881337);
          mg.lineStyle(2.8, 0x0F172A);
          mg.moveTo(centerX - openW, centerY);
          mg.quadraticCurveTo(centerX, centerY - (openH * 0.15), centerX + openW, centerY);
          mg.quadraticCurveTo(centerX, centerY + openH, centerX - openW, centerY);
          mg.endFill();

          if (mY > 0.20) {
            mg.beginFill(0xFFFFFF);
            mg.lineStyle(0);
            mg.moveTo(centerX - openW * 0.72, centerY);
            mg.quadraticCurveTo(centerX, centerY - (openH * 0.1), centerX + openW * 0.72, centerY);
            mg.lineTo(centerX + openW * 0.66, centerY + 4.5);
            mg.quadraticCurveTo(centerX, centerY + 6.5, centerX - openW * 0.66, centerY + 4.5);
            mg.closePath();
            mg.endFill();
          }

          if (mY > 0.16) {
            mg.beginFill(0xFB7185);
            mg.lineStyle(0);
            const tongueW = openW * 0.65;
            const tongueBaseY = centerY + openH - 2;
            mg.moveTo(centerX - tongueW, tongueBaseY);
            mg.quadraticCurveTo(centerX, tongueBaseY - (openH * 0.45), centerX + tongueW, tongueBaseY);
            mg.quadraticCurveTo(centerX, tongueBaseY + 2, centerX - tongueW, tongueBaseY);
            mg.endFill();
          }
        }
      }

      render2DCollarAndBell(t) {
        const cg = this.collarGfx;
        const bg = this.bellGfx;
        cg.clear();
        bg.clear();

        const yaw = this.angleX;

        cg.beginFill(0xEF4444);
        cg.lineStyle(3, 0x0F172A);
        cg.drawRoundedRect(-46 + (yaw * 3), 0, 92, 15, 6);
        cg.endFill();

        const bellTargetAngle = -yaw * 0.5 + Math.sin(t * 3) * 0.05;
        this.bellAngle += (bellTargetAngle - this.bellAngle) * 0.15;

        this.bellContainer.position.set(yaw * 4, 15);
        this.bellContainer.rotation = this.bellAngle;

        bg.beginFill(0xFBBF24);
        bg.lineStyle(2.5, 0x0F172A);
        bg.drawCircle(0, 0, 13);
        bg.endFill();

        bg.beginFill(0xFFFFFF, 0.85);
        bg.drawCircle(-3, -3.5, 3.0);
        bg.endFill();

        bg.lineStyle(2, 0x0F172A);
        bg.moveTo(-11, -2);
        bg.lineTo(11, -2);
        bg.beginFill(0x334155);
        bg.drawCircle(0, 3, 3.2);
        bg.endFill();
        bg.moveTo(0, 6.2);
        bg.lineTo(0, 12.5);
      }

      render2DHands(t) {
        const lh = this.leftHandGfx;
        const rh = this.rightHandGfx;
        lh.clear();
        rh.clear();

        const lOffset = Math.sin(t * 2.5) * 3.5;
        const rOffset = Math.cos(t * 2.5) * 3.5;
        const yaw = this.angleX;

        lh.beginFill(0x0284C7);
        lh.lineStyle(3, 0x0F172A);
        lh.moveTo(-42, 24);
        lh.lineTo(-64 - (yaw * 4), 48 + lOffset);
        lh.lineTo(-54 - (yaw * 4), 56 + lOffset);
        lh.lineTo(-36, 34);
        lh.closePath();
        lh.endFill();

        lh.beginFill(0xFFFFFF);
        lh.lineStyle(3, 0x0F172A);
        lh.drawCircle(-64 - (yaw * 4), 48 + lOffset, 15);
        lh.endFill();

        rh.beginFill(0x0284C7);
        rh.lineStyle(3, 0x0F172A);
        rh.moveTo(42, 24);
        rh.lineTo(64 - (yaw * 4), 48 + rOffset);
        rh.lineTo(54 - (yaw * 4), 56 + rOffset);
        rh.lineTo(36, 34);
        rh.closePath();
        rh.endFill();

        rh.beginFill(0xFFFFFF);
        rh.lineStyle(3, 0x0F172A);
        rh.drawCircle(64 - (yaw * 4), 48 + rOffset, 15);
        rh.endFill();
      }
    }

    const STAGE_W = ${fixedWidth};
    const STAGE_H = ${fixedHeight};

    function getViewDimensions() {
      const container = document.getElementById('canvas-container');
      const w = container ? (container.clientWidth || container.offsetWidth) : 0;
      const h = container ? (container.clientHeight || container.offsetHeight) : 0;
      const viewW = (w >= 100 && w <= 700) ? w : ((window.innerWidth >= 100 && window.innerWidth <= 700) ? window.innerWidth : STAGE_W);
      const viewH = (h >= 80 && h <= 500) ? h : ((window.innerHeight >= 80 && window.innerHeight <= 500) ? window.innerHeight : STAGE_H);
      return { viewW, viewH };
    }

    function framePortrait(viewW, viewH) {
      if (!model) return;
      const dims = getViewDimensions();
      const w = viewW || (app ? app.screen.width : dims.viewW);
      const h = viewH || (app ? app.screen.height : dims.viewH);

      if (model.isDoraemonPuppet) {
        const baseScale = (h * 0.82) / 200;
        model.scale.set(baseScale, baseScale);
        model.x = w / 2;
        model.y = h * 0.50;
        return;
      }

      const lower = (currentModelName || '').toLowerCase();
      const isMale = lower.includes('chitose') || lower.includes('male');
      const nativeH = (model.internalModel && model.internalModel.height) ? model.internalModel.height : (model.height || 1000);

      // Top-centered anchor & framing matching Web App
      if (model.anchor) {
        model.anchor.set(0.5, 0.0);
      }

      // Live2D Models (Haru and Chitose)
      const zoom = isMale ? 1.28 : 1.22;
      const baseScale = (h * zoom) / nativeH;
      model.scale.set(baseScale, baseScale);

      model.x = w / 2;
      model.y = Math.max(6, h * 0.05);
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
      if (window.ResizeObserver) {
        try {
          const ro = new ResizeObserver(() => onResize());
          ro.observe(document.body);
        } catch(e) {}
      }
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

  const htmlSource = useMemo(
    () => getLive2DHtml(normalizedModel, DEVICE_WINDOW_WIDTH, 200),
    [normalizedModel]
  );

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
