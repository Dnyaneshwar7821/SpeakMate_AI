import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: DEVICE_WINDOW_WIDTH } = Dimensions.get('window');

const HARU_MODEL_URL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';
const CHITOSE_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-chitose@1.0.5/assets/chitose.model.json';
const SHIZUKU_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json';
const KOHARU_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json';
const HARUTO_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json';
const MAO_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-unitychan@1.0.5/assets/unitychan.model.json';
const WANKO_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-wanko@1.0.5/assets/wanko.model.json';
const ROBOPAWS_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json';

const normalizeModelName = (modelName) => (modelName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const isRoboPawsModel = (modelName) => {
  const norm = normalizeModelName(modelName);
  return norm === 'robopaws' || norm === 'robocat' || norm === 'hijiki' || norm === 'robot' || norm === 'kid' || norm === 'kids' || norm.includes('motu') || norm.includes('sparky');
};

const getModelUrl = (modelName) => {
  const norm = normalizeModelName(modelName);
  if (norm === 'chitose' || norm === 'male') return CHITOSE_MODEL_URL;
  if (norm.includes('shizuku')) return SHIZUKU_MODEL_URL;
  if (norm.includes('koharu')) return KOHARU_MODEL_URL;
  if (norm.includes('haruto')) return HARUTO_MODEL_URL;
  if (norm.includes('mao') || norm.includes('unity')) return MAO_MODEL_URL;
  if (norm.includes('wanko') || norm.includes('dog') || norm.includes('puppy')) return WANKO_MODEL_URL;
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
  <!-- PixiJS v6.5.8 (Target Pixi Runtime for pixi-live2d-display) -->
  <script src="https://cdn.jsdelivr.net/npm/pixi.js@6.5.8/dist/browser/pixi.min.js"></script>
  <!-- Cubism 2 Core SDK (Chitose) -->
  <script src="https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"></script>
  <!-- Cubism 4 Core SDK (Haru) - Official Live2D SDK (same as Web App) -->
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

    let currentModelName = '${initialName}';

    function patchPixiTextureSafety() {
      try {
        if (window.PIXI && window.PIXI.Texture && !window.PIXI.Texture.__safePatched) {
          window.PIXI.Texture.__safePatched = true;
          const origDesc = Object.getOwnPropertyDescriptor(window.PIXI.Texture.prototype, 'valid');
          if (!origDesc || origDesc.configurable) {
            Object.defineProperty(window.PIXI.Texture.prototype, 'valid', {
              get() {
                return Boolean(this.baseTexture && !this.baseTexture.destroyed && (this.baseTexture.valid !== false));
              },
              configurable: true,
            });
          }
        }
      } catch(e) {}
    }
    patchPixiTextureSafety();

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
      if (window.PIXILive2DDisplay && window.PIXILive2DDisplay.Live2DModel) {
        return window.PIXILive2DDisplay.Live2DModel;
      }
      if (window.Live2DModel) {
        return window.Live2DModel;
      }
      return null;
    }

    function loadScript(src) {
      return new Promise((resolve) => {
        try {
          const existing = document.querySelector('script[src="' + src + '"]');
          if (existing) {
            if (existing.getAttribute('data-loaded') === 'true') return resolve(true);
            existing.addEventListener('load', () => resolve(true));
            existing.addEventListener('error', () => resolve(false));
            return;
          }
          const s = document.createElement('script');
          s.src = src;
          s.crossOrigin = 'anonymous';
          s.async = false;
          s.onload = () => { s.setAttribute('data-loaded', 'true'); resolve(true); };
          s.onerror = () => resolve(false);
          document.head.appendChild(s);
        } catch(e) {
          resolve(false);
        }
      });
    }

    async function ensureSDKLoaded() {
      let cls = getLive2DModelClass();
      if (cls && typeof cls.from === 'function') return cls;

      if (!window.PIXI) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pixi.js/6.5.8/browser/pixi.min.js');
        if (!window.PIXI) {
          await loadScript('https://cdn.jsdelivr.net/npm/pixi.js@6.5.8/dist/browser/pixi.min.js');
        }
      }

      if (!window.Live2D) {
        await loadScript('https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js');
      }

      if (!window.Live2DCubismCore) {
        await loadScript('https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js');
      }

      cls = getLive2DModelClass();
      if (cls && typeof cls.from === 'function') return cls;

      await loadScript('https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js');
      cls = getLive2DModelClass();
      if (cls && typeof cls.from === 'function') return cls;

      await loadScript('https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js');
      return getLive2DModelClass();
    }

    async function waitForLive2DSDK(timeout = 8000) {
      let cls = getLive2DModelClass();
      if (cls && typeof cls.from === 'function') return cls;

      try {
        cls = await ensureSDKLoaded();
        if (cls && typeof cls.from === 'function') return cls;
      } catch(e) {}

      const start = performance.now();
      while (performance.now() - start < timeout) {
        cls = getLive2DModelClass();
        if (cls && typeof cls.from === 'function') {
          return cls;
        }
        await new Promise((r) => setTimeout(r, 80));
      }
      return getLive2DModelClass();
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
      return norm === 'robopaws' || norm === 'robocat' || norm === 'hijiki' || norm === 'robot' || norm === 'kid' || norm === 'kids' || norm.includes('motu') || norm.includes('sparky');
    }

    function getModelUrl(modelName) {
      const norm = normalizeModelName(modelName);
      if (norm === 'chitose' || norm === 'male') return '${CHITOSE_MODEL_URL}';
      if (norm.includes('shizuku')) return '${SHIZUKU_MODEL_URL}';
      if (norm.includes('koharu')) return '${KOHARU_MODEL_URL}';
      if (norm.includes('haruto')) return '${HARUTO_MODEL_URL}';
      if (norm.includes('mao') || norm.includes('unity')) return '${MAO_MODEL_URL}';
      if (norm.includes('wanko') || norm.includes('dog') || norm.includes('puppy')) return '${WANKO_MODEL_URL}';
      if (isRoboPawsName(norm)) return '${ROBOPAWS_MODEL_URL}';
      return '${HARU_MODEL_URL}';
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
    function createVolumetricTextures() {
      const textures = {};
      try {
        const cHead = document.createElement('canvas');
        cHead.width = 320; cHead.height = 320;
        const ctxH = cHead.getContext('2d');
        const gradHead = ctxH.createRadialGradient(115, 100, 20, 160, 160, 150);
        gradHead.addColorStop(0, '#38BDF8');
        gradHead.addColorStop(0.25, '#0284C7');
        gradHead.addColorStop(0.70, '#0369A1');
        gradHead.addColorStop(1.0, '#075985');
        ctxH.fillStyle = gradHead;
        ctxH.beginPath(); ctxH.arc(160, 160, 150, 0, Math.PI * 2); ctxH.fill();
        ctxH.lineWidth = 6.5; ctxH.strokeStyle = '#0F172A'; ctxH.stroke();
        textures.head = PIXI.Texture.from(cHead);
      } catch (_) {}

      try {
        const cFace = document.createElement('canvas');
        cFace.width = 280; cFace.height = 220;
        const ctxF = cFace.getContext('2d');
        const gradFace = ctxF.createRadialGradient(140, 95, 20, 140, 110, 130);
        gradFace.addColorStop(0, '#FFFFFF');
        gradFace.addColorStop(0.65, '#FFFFFF');
        gradFace.addColorStop(0.92, '#F1F5F9');
        gradFace.addColorStop(1.0, '#E2E8F0');
        ctxF.fillStyle = gradFace;
        ctxF.beginPath(); ctxF.ellipse(140, 110, 130, 95, 0, 0, Math.PI * 2); ctxF.fill();
        ctxF.lineWidth = 4.5; ctxF.strokeStyle = '#0F172A'; ctxF.stroke();
        textures.face = PIXI.Texture.from(cFace);
      } catch (_) {}

      try {
        const cBlush = document.createElement('canvas');
        cBlush.width = 80; cBlush.height = 50;
        const ctxB = cBlush.getContext('2d');
        const gradBlush = ctxB.createRadialGradient(40, 25, 0, 40, 25, 38);
        gradBlush.addColorStop(0, 'rgba(244, 63, 94, 0.42)');
        gradBlush.addColorStop(0.55, 'rgba(244, 63, 94, 0.18)');
        gradBlush.addColorStop(1.0, 'rgba(244, 63, 94, 0.0)');
        ctxB.fillStyle = gradBlush;
        ctxB.beginPath(); ctxB.ellipse(40, 25, 38, 22, 0, 0, Math.PI * 2); ctxB.fill();
        textures.blush = PIXI.Texture.from(cBlush);
      } catch (_) {}

      try {
        const cNose = document.createElement('canvas');
        cNose.width = 70; cNose.height = 70;
        const ctxN = cNose.getContext('2d');
        const gradNose = ctxN.createRadialGradient(25, 23, 4, 35, 35, 30);
        gradNose.addColorStop(0, '#FFA4A4');
        gradNose.addColorStop(0.22, '#EF4444');
        gradNose.addColorStop(0.75, '#DC2626');
        gradNose.addColorStop(1.0, '#991B1B');
        ctxN.fillStyle = gradNose;
        ctxN.beginPath(); ctxN.arc(35, 35, 28, 0, Math.PI * 2); ctxN.fill();
        ctxN.lineWidth = 4.0; ctxN.strokeStyle = '#0F172A'; ctxN.stroke();
        ctxN.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctxN.beginPath(); ctxN.ellipse(27, 24, 8, 5, -Math.PI / 5, 0, Math.PI * 2); ctxN.fill();
        textures.nose = PIXI.Texture.from(cNose);
      } catch (_) {}

      try {
        const cBell = document.createElement('canvas');
        cBell.width = 80; cBell.height = 80;
        const ctxBell = cBell.getContext('2d');
        const gradBell = ctxBell.createRadialGradient(30, 28, 5, 40, 40, 35);
        gradBell.addColorStop(0, '#FEF08A');
        gradBell.addColorStop(0.28, '#FBBF24');
        gradBell.addColorStop(0.70, '#D97706');
        gradBell.addColorStop(1.0, '#92400E');
        ctxBell.fillStyle = gradBell;
        ctxBell.beginPath(); ctxBell.arc(40, 40, 32, 0, Math.PI * 2); ctxBell.fill();
        ctxBell.lineWidth = 4.5; ctxBell.strokeStyle = '#0F172A'; ctxBell.stroke();
        ctxBell.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctxBell.beginPath(); ctxBell.ellipse(32, 28, 9, 5, -Math.PI / 4, 0, Math.PI * 2); ctxBell.fill();
        ctxBell.lineWidth = 3.5; ctxBell.strokeStyle = '#0F172A';
        ctxBell.beginPath(); ctxBell.moveTo(14, 37); ctxBell.lineTo(66, 37); ctxBell.stroke();
        ctxBell.fillStyle = '#1E293B';
        ctxBell.beginPath(); ctxBell.arc(40, 48, 6.5, 0, Math.PI * 2); ctxBell.fill();
        ctxBell.beginPath(); ctxBell.moveTo(40, 54.5); ctxBell.lineTo(40, 68); ctxBell.stroke();
        textures.bell = PIXI.Texture.from(cBell);
      } catch (_) {}

      try {
        const cCol = document.createElement('canvas');
        cCol.width = 220; cCol.height = 60;
        const ctxC = cCol.getContext('2d');
        const gradCol = ctxC.createLinearGradient(0, 10, 0, 50);
        gradCol.addColorStop(0, '#F87171');
        gradCol.addColorStop(0.40, '#EF4444');
        gradCol.addColorStop(1.0, '#B91C1C');
        ctxC.fillStyle = gradCol;
        ctxC.beginPath(); ctxC.roundRect(10, 10, 200, 38, 16); ctxC.fill();
        ctxC.lineWidth = 5.0; ctxC.strokeStyle = '#0F172A'; ctxC.stroke();
        textures.collar = PIXI.Texture.from(cCol);
      } catch (_) {}

      try {
        const cBody = document.createElement('canvas');
        cBody.width = 240; cBody.height = 240;
        const ctxBody = cBody.getContext('2d');
        const gradBody = ctxBody.createRadialGradient(90, 80, 20, 120, 120, 110);
        gradBody.addColorStop(0, '#38BDF8');
        gradBody.addColorStop(0.30, '#0284C7');
        gradBody.addColorStop(0.75, '#0369A1');
        gradBody.addColorStop(1.0, '#075985');
        ctxBody.fillStyle = gradBody;
        ctxBody.beginPath(); ctxBody.roundRect(20, 20, 200, 195, 65); ctxBody.fill();
        ctxBody.lineWidth = 6.0; ctxBody.strokeStyle = '#0F172A'; ctxBody.stroke();
        const gradBelly = ctxBody.createRadialGradient(120, 105, 10, 120, 115, 75);
        gradBelly.addColorStop(0, '#FFFFFF');
        gradBelly.addColorStop(0.80, '#F8FAFC');
        gradBelly.addColorStop(1.0, '#E2E8F0');
        ctxBody.fillStyle = gradBelly;
        ctxBody.beginPath(); ctxBody.arc(120, 115, 72, 0, Math.PI * 2); ctxBody.fill();
        ctxBody.lineWidth = 4.5; ctxBody.strokeStyle = '#0F172A'; ctxBody.stroke();
        ctxBody.fillStyle = '#FFFFFF';
        ctxBody.beginPath(); ctxBody.arc(120, 115, 52, 0, Math.PI); ctxBody.lineTo(172, 115); ctxBody.fill();
        ctxBody.lineWidth = 4.5; ctxBody.strokeStyle = '#0F172A'; ctxBody.stroke();
        ctxBody.beginPath(); ctxBody.moveTo(68, 115); ctxBody.lineTo(172, 115); ctxBody.stroke();
        textures.body = PIXI.Texture.from(cBody);
      } catch (_) {}

      try {
        const cHand = document.createElement('canvas');
        cHand.width = 80; cHand.height = 80;
        const ctxHnd = cHand.getContext('2d');
        const gradHnd = ctxHnd.createRadialGradient(32, 28, 5, 40, 40, 35);
        gradHnd.addColorStop(0, '#FFFFFF');
        gradHnd.addColorStop(0.70, '#F1F5F9');
        gradHnd.addColorStop(1.0, '#CBD5E1');
        ctxHnd.fillStyle = gradHnd;
        ctxHnd.beginPath(); ctxHnd.arc(40, 40, 32, 0, Math.PI * 2); ctxHnd.fill();
        ctxHnd.lineWidth = 4.5; ctxHnd.strokeStyle = '#0F172A'; ctxHnd.stroke();
        textures.hand = PIXI.Texture.from(cHand);
      } catch (_) {}

      return textures;
    }

    let _mobCachedTextures = null;

    class DoraemonPuppet extends PIXI.Container {
      constructor() {
        super();
        this.isDoraemonPuppet = true;

        if (!_mobCachedTextures) {
          _mobCachedTextures = createVolumetricTextures();
        }
        this.tex = _mobCachedTextures;

        this.rootContainer = new PIXI.Container();
        this.addChild(this.rootContainer);

        // 1. Torso Layer
        this.bodyContainer = new PIXI.Container();
        this.bodyContainer.position.set(0, 46);
        this.rootContainer.addChild(this.bodyContainer);

        if (this.tex.body) {
          this.bodySprite = new PIXI.Sprite(this.tex.body);
          this.bodySprite.anchor.set(0.5, 0.5);
          this.bodySprite.scale.set(0.66, 0.66);
          this.bodyContainer.addChild(this.bodySprite);
        }

        // 2. Arms & Robotic White Paws
        this.handsContainer = new PIXI.Container();
        this.handsContainer.position.set(0, 46);
        this.rootContainer.addChild(this.handsContainer);

        this.leftArmGfx = new PIXI.Graphics();
        this.rightArmGfx = new PIXI.Graphics();
        this.handsContainer.addChild(this.leftArmGfx);
        this.handsContainer.addChild(this.rightArmGfx);

        if (this.tex.hand) {
          this.leftPawSprite = new PIXI.Sprite(this.tex.hand);
          this.leftPawSprite.anchor.set(0.5, 0.5);
          this.leftPawSprite.scale.set(0.56, 0.56);
          this.handsContainer.addChild(this.leftPawSprite);

          this.rightPawSprite = new PIXI.Sprite(this.tex.hand);
          this.rightPawSprite.anchor.set(0.5, 0.5);
          this.rightPawSprite.scale.set(0.56, 0.56);
          this.handsContainer.addChild(this.rightPawSprite);
        }

        // 3. Head & Neck Pivot Group
        this.headMaster = new PIXI.Container();
        this.headMaster.position.set(0, -30);
        this.rootContainer.addChild(this.headMaster);

        this.headShellContainer = new PIXI.Container();
        this.headMaster.addChild(this.headShellContainer);

        if (this.tex.head) {
          this.headSprite = new PIXI.Sprite(this.tex.head);
          this.headSprite.anchor.set(0.5, 0.5);
          this.headSprite.scale.set(0.66, 0.66);
          this.headShellContainer.addChild(this.headSprite);
        }

        this.facePlateContainer = new PIXI.Container();
        this.facePlateContainer.position.set(0, 8);
        this.headMaster.addChild(this.facePlateContainer);

        if (this.tex.face) {
          this.faceSprite = new PIXI.Sprite(this.tex.face);
          this.faceSprite.anchor.set(0.5, 0.5);
          this.faceSprite.scale.set(0.63, 0.60);
          this.facePlateContainer.addChild(this.faceSprite);
        }

        if (this.tex.blush) {
          this.leftBlush = new PIXI.Sprite(this.tex.blush);
          this.leftBlush.anchor.set(0.5, 0.5);
          this.leftBlush.position.set(-42, 16);
          this.leftBlush.scale.set(0.68, 0.58);
          this.facePlateContainer.addChild(this.leftBlush);

          this.rightBlush = new PIXI.Sprite(this.tex.blush);
          this.rightBlush.anchor.set(0.5, 0.5);
          this.rightBlush.position.set(42, 16);
          this.rightBlush.scale.set(0.68, 0.58);
          this.facePlateContainer.addChild(this.rightBlush);
        }

        this.eyesContainer = new PIXI.Container();
        this.eyesContainer.position.set(0, -22);
        this.facePlateContainer.addChild(this.eyesContainer);

        this.leftEyeGfx = new PIXI.Graphics();
        this.rightEyeGfx = new PIXI.Graphics();
        this.eyesContainer.addChild(this.leftEyeGfx);
        this.eyesContainer.addChild(this.rightEyeGfx);

        this.whiskersGfx = new PIXI.Graphics();
        this.facePlateContainer.addChild(this.whiskersGfx);

        this.mouthGfx = new PIXI.Graphics();
        this.facePlateContainer.addChild(this.mouthGfx);

        this.noseContainer = new PIXI.Container();
        this.noseContainer.position.set(0, -3);
        this.facePlateContainer.addChild(this.noseContainer);

        if (this.tex.nose) {
          this.noseSprite = new PIXI.Sprite(this.tex.nose);
          this.noseSprite.anchor.set(0.5, 0.5);
          this.noseSprite.scale.set(0.50, 0.50);
          this.noseContainer.addChild(this.noseSprite);
        }

        this.collarContainer = new PIXI.Container();
        this.collarContainer.position.set(0, 56);
        this.headMaster.addChild(this.collarContainer);

        if (this.tex.collar) {
          this.collarSprite = new PIXI.Sprite(this.tex.collar);
          this.collarSprite.anchor.set(0.5, 0.5);
          this.collarSprite.scale.set(0.56, 0.48);
          this.collarContainer.addChild(this.collarSprite);
        }

        this.bellContainer = new PIXI.Container();
        this.bellContainer.position.set(0, 13);
        this.collarContainer.addChild(this.bellContainer);

        if (this.tex.bell) {
          this.bellSprite = new PIXI.Sprite(this.tex.bell);
          this.bellSprite.anchor.set(0.5, 0.5);
          this.bellSprite.scale.set(0.48, 0.48);
          this.bellContainer.addChild(this.bellSprite);
        }

        this.lookX = 0;
        this.lookY = 0;
        this.targetLookX = 0;
        this.targetLookY = 0;

        this.nextSaccadeTime = performance.now() + 2000;
        this.blinkTimer = performance.now() + 2800;
        this.isBlinking = false;
        this.blinkProgress = 0;

        this.mouthY = 0;
        this.mouthForm = 0;
        this.isSpeaking = false;
        this.isHappy = false;
      }

      update(now, lookX, lookY, mouthY, mouthForm, isSpeaking, isHappy, state) {
        this.lookX = lookX || 0;
        this.lookY = lookY || 0;
        this.mouthY = mouthY || 0;
        this.mouthForm = mouthForm || 0;
        this.isSpeaking = isSpeaking;
        this.isHappy = isHappy;

        const t = now * 0.001;

        // Grounded breathing & speech nod (Zero tilt!)
        const breathingY = Math.sin(t * 1.8) * 1.2;
        this.rootContainer.y = breathingY;

        const speechNodY = isSpeaking ? (Math.sin(t * 8.0) * 1.8 * Math.max(0.3, this.mouthY)) : 0;
        this.headMaster.y = -30 + speechNodY;
        this.headMaster.rotation = 0;

        const faceParallaxX = this.lookX * 5.0;
        const faceParallaxY = this.lookY * 3.0;
        this.facePlateContainer.position.set(faceParallaxX, 8 + faceParallaxY);
        this.noseContainer.position.set(this.lookX * 3.0, -3 + (this.lookY * 2.0));

        this.render2DEyes();
        this.render2DWhiskers();
        this.render2DMouth();
        this.render2DHands(t);

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

      render2DEyes() {
        const le = this.leftEyeGfx;
        const re = this.rightEyeGfx;
        le.clear();
        re.clear();

        const eyeSpacing = 13.5;
        const leftX = -eyeSpacing;
        const rightX = eyeSpacing;
        const eyeY = 0;

        const eyeW = 13.5;
        const eyeH = 19;

        const pupilX = this.lookX * 3.8;
        const pupilY = this.lookY * 2.8;

        if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
          le.lineStyle(3.5, 0x0F172A);
          le.arc(leftX, eyeY + 3, 9.5, Math.PI * 1.1, Math.PI * 1.9);
        } else {
          le.beginFill(0xFFFFFF);
          le.lineStyle(2.8, 0x0F172A);
          le.drawEllipse(leftX, eyeY, eyeW, eyeH);
          le.endFill();

          le.beginFill(0xE2E8F0, 0.75);
          le.lineStyle(0);
          le.drawEllipse(leftX, eyeY - 8, eyeW * 0.9, 6);
          le.endFill();

          const lpx = leftX + 2.5 + pupilX;
          const lpy = eyeY + 1.5 + pupilY;
          le.beginFill(0x0F172A);
          le.drawCircle(lpx, lpy, 5.8);
          le.endFill();

          le.beginFill(0xFFFFFF, 0.98);
          le.drawCircle(lpx - 1.8, lpy - 1.8, 2.2);
          le.drawCircle(lpx + 1.8, lpy + 1.8, 1.1);
          le.endFill();
        }

        if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
          re.lineStyle(3.5, 0x0F172A);
          re.arc(rightX, eyeY + 3, 9.5, Math.PI * 1.1, Math.PI * 1.9);
        } else {
          re.beginFill(0xFFFFFF);
          re.lineStyle(2.8, 0x0F172A);
          re.drawEllipse(rightX, eyeY, eyeW, eyeH);
          re.endFill();

          re.beginFill(0xE2E8F0, 0.75);
          re.lineStyle(0);
          re.drawEllipse(rightX, eyeY - 8, eyeW * 0.9, 6);
          re.endFill();

          const rpx = rightX - 2.5 + pupilX;
          const rpy = eyeY + 1.5 + pupilY;
          re.beginFill(0x0F172A);
          re.drawCircle(rpx, rpy, 5.8);
          re.endFill();

          re.beginFill(0xFFFFFF, 0.98);
          re.drawCircle(rpx - 1.8, rpy - 1.8, 2.2);
          re.drawCircle(rpx + 1.8, rpy + 1.8, 1.1);
          re.endFill();
        }
      }

      render2DWhiskers() {
        const wg = this.whiskersGfx;
        wg.clear();

        wg.lineStyle(2.4, 0x0F172A);
        wg.moveTo(0, 7);
        wg.lineTo(0, 27);

        wg.lineStyle(2.2, 0x0F172A);

        wg.moveTo(-16, 6); wg.lineTo(-54, 1);
        wg.moveTo(-18, 14); wg.lineTo(-60, 14);
        wg.moveTo(-16, 22); wg.lineTo(-54, 27);

        wg.moveTo(16, 6); wg.lineTo(54, 1);
        wg.moveTo(18, 14); wg.lineTo(60, 14);
        wg.moveTo(16, 22); wg.lineTo(54, 27);
      }

      render2DMouth() {
        const mg = this.mouthGfx;
        mg.clear();

        const mY = Math.max(0, Math.min(1.0, this.mouthY));
        const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
        const centerX = 0;
        const centerY = 27;

        if (mY < 0.08) {
          mg.lineStyle(2.8, 0x0F172A);
          const spread = 26 + (this.isHappy ? 4 : 0);
          const drop = 12 + (this.isHappy ? 3 : 0);
          mg.moveTo(centerX - spread, centerY);
          mg.quadraticCurveTo(centerX, centerY + drop, centerX + spread, centerY);
        } else {
          const openH = 6 + (mY * 32);
          const openW = Math.max(12, 21 + (mForm * 8) + (mY * 5));

          mg.beginFill(0x881337);
          mg.lineStyle(2.8, 0x0F172A);
          mg.moveTo(centerX - openW, centerY);
          mg.quadraticCurveTo(centerX, centerY - (openH * 0.15), centerX + openW, centerY);
          mg.quadraticCurveTo(centerX, centerY + openH, centerX - openW, centerY);
          mg.endFill();

          mg.beginFill(0x4C0519, 0.65);
          mg.lineStyle(0);
          mg.moveTo(centerX - openW * 0.9, centerY);
          mg.quadraticCurveTo(centerX, centerY - (openH * 0.12), centerX + openW * 0.9, centerY);
          mg.quadraticCurveTo(centerX, centerY + 4.5, centerX - openW * 0.9, centerY);
          mg.endFill();

          if (mY > 0.20) {
            mg.beginFill(0xFFFFFF);
            mg.lineStyle(0);
            mg.moveTo(centerX - openW * 0.72, centerY);
            mg.quadraticCurveTo(centerX, centerY - (openH * 0.1), centerX + openW * 0.72, centerY);
            mg.lineTo(centerX + openW * 0.66, centerY + 4.2);
            mg.quadraticCurveTo(centerX, centerY + 6.0, centerX - openW * 0.66, centerY + 4.2);
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

            mg.beginFill(0xFDA4AF, 0.85);
            mg.drawEllipse(centerX, tongueBaseY - (openH * 0.22), tongueW * 0.45, 2.5);
            mg.endFill();
          }
        }
      }

      render2DHands(t) {
        const la = this.leftArmGfx;
        const ra = this.rightArmGfx;
        la.clear();
        ra.clear();

        const lOffset = Math.sin(t * 2.0) * 2.5;
        const rOffset = Math.cos(t * 2.0) * 2.5;

        la.beginFill(0x0284C7);
        la.lineStyle(3, 0x0F172A);
        la.moveTo(-36, -2);
        la.lineTo(-58, 18 + lOffset);
        la.lineTo(-48, 26 + lOffset);
        la.lineTo(-30, 8);
        la.closePath();
        la.endFill();

        if (this.leftPawSprite) {
          this.leftPawSprite.position.set(-58, 20 + lOffset);
        }

        ra.beginFill(0x0284C7);
        ra.lineStyle(3, 0x0F172A);
        ra.moveTo(36, -2);
        ra.lineTo(58, 18 + rOffset);
        ra.lineTo(48, 26 + rOffset);
        ra.lineTo(30, 8);
        ra.closePath();
        ra.endFill();

        if (this.rightPawSprite) {
          this.rightPawSprite.position.set(58, 20 + rOffset);
        }
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
        const baseScale = Math.min((w * 0.85) / 220, (h * 0.80) / 260);
        model.scale.set(baseScale, baseScale);
        model.x = w / 2;
        model.y = h * 0.50;
        return;
      }

      const lower = (currentModelName || '').toLowerCase();
      const isMale = lower.includes('chitose') || lower.includes('male');
      const nativeH = (model.internalModel && model.internalModel.height) ? model.internalModel.height : (model.height || 1000);
      const nativeW = (model.internalModel && model.internalModel.width) ? model.internalModel.width : (model.width || 800);

      // Top-centered anchor & framing matching Web App
      if (model.anchor && typeof model.anchor.set === 'function') {
        model.anchor.set(0.5, 0.0);
      } else if (model.pivot && typeof model.pivot.set === 'function') {
        model.pivot.set(nativeW / 2, 0);
      }

      // Live2D Models (Haru and Chitose)
      const zoom = isMale ? 1.25 : 1.20;
      const baseScale = (h * zoom) / nativeH;
      model.scale.set(baseScale, baseScale);

      model.x = w / 2;
      model.y = Math.max(4, h * 0.04);
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
          if (app && app.stage) {
            app.stage.removeChild(model);
          }
          model.destroy({ children: true, texture: false, baseTexture: false });
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

        let Live2DModelClass = null;
        try {
          Live2DModelClass = await waitForLive2DSDK();
        } catch(e) {}

        if (Live2DModelClass && typeof Live2DModelClass.from === 'function') {
          if (typeof Live2DModelClass.registerTicker === 'function' && window.PIXI && window.PIXI.Ticker) {
            try {
              Live2DModelClass.registerTicker(window.PIXI.Ticker);
            } catch(e) {}
          patchPixiTextureSafety();
          model = await Live2DModelClass.from(url, { autoInteract: false });

          // Hook motionManager update to guarantee lipSync overrides motion curves
          if (model && model.internalModel && model.internalModel.motionManager) {
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

          if (model && 'eventMode' in model) {
            model.eventMode = 'none';
          }
          if (model) {
            model.interactive = false;
            app.stage.addChild(model);
            framePortrait(viewW, viewH);
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
            return;
          }
        }

        // Fallback to high-definition WebGL puppet if Live2D is unavailable
        model = new DoraemonPuppet();
        app.stage.addChild(model);
        framePortrait(viewW, viewH);
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
      } catch(err) {
        try {
          model = new DoraemonPuppet();
          app.stage.addChild(model);
          framePortrait(viewW, viewH);
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
        } catch(puppetErr) {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: err.message }));
        }
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
        source={{ html: htmlSource }}
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
