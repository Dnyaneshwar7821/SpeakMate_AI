import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const HARU_MODEL_URL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';
const CHITOSE_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-chitose@1.0.5/assets/chitose.model.json';
const ROBOPAWS_MODEL_URL = 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json';

const getModelUrl = (modelName) => {
  const norm = (modelName || '').toLowerCase();
  if (norm === 'chitose' || norm === 'male') return CHITOSE_MODEL_URL;
  if (norm === 'robopaws' || norm === 'robocat' || norm === 'hijiki' || norm === 'robot' || norm === 'kid') return ROBOPAWS_MODEL_URL;
  return HARU_MODEL_URL;
};

const getLive2DHtml = (initialModel = 'haru') => {
  const initialName = (initialModel || 'haru').toLowerCase();
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
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
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

    // Dynamic Upper-Bust Framing Configuration
    function getModelFraming(name) {
      if (name === 'chitose') {
        return {
          zoom: 2.50,
          anchor: { x: 0.50, y: 0.22 },
          yOffset: 10,
        };
      }
      if (name === 'robopaws' || name === 'robocat' || name === 'hijiki' || name === 'robot' || name === 'kid') {
        return {
          zoom: 2.35,
          anchor: { x: 0.50, y: 0.28 },
          yOffset: 20,
        };
      }
      return {
        zoom: 2.70,
        anchor: { x: 0.50, y: 0.16 },
        yOffset: 16,
      };
    }

    function framePortrait(viewW, viewH) {
      if (!model) return;
      const framing = getModelFraming(currentModelName);
      const nativeH = (model.internalModel && model.internalModel.height) ? model.internalModel.height : (model.height || 1000);

      if (model.anchor) {
        model.anchor.set(framing.anchor.x, framing.anchor.y);
      }

      const baseScale = (viewH * framing.zoom) / nativeH;
      model.scale.set(baseScale, baseScale);

      model.x = viewW / 2;
      model.y = (viewH * 0.5) + framing.yOffset;
    }

    async function init() {
      const container = document.getElementById('canvas-container');
      const viewW = container.clientWidth || window.innerWidth || 360;
      const viewH = container.clientHeight || window.innerHeight || 200;

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
          if (!model || !model.internalModel) return;
          const core = model.internalModel.coreModel;
          if (!core) return;

          const now = performance.now();
          const t = now * 0.001;

          // 1. Natural Ambient Breathing
          const breath = (Math.sin(t * 1.5) + 1) * 0.5;
          setParam(core, 'ParamBreath', 'PARAM_BREATH', breath);

          // 2. Autonomous Saccadic Eye Movements
          if (!isPointerInteracting) {
            if (now > nextSaccadeTime) {
              saccadeTargetX = (Math.random() - 0.5) * 0.35;
              saccadeTargetY = (Math.random() - 0.5) * 0.20;
              nextSaccadeTime = now + 2200 + Math.random() * 3500;
            }
            targetLookX = saccadeTargetX;
            targetLookY = saccadeTargetY;
          }

          // Smooth Gaze & Head Lerping
          currentLookX += (targetLookX - currentLookX) * 0.09;
          currentLookY += (targetLookY - currentLookY) * 0.09;

          setParam(core, 'ParamEyeBallX', 'PARAM_EYE_BALL_X', currentLookX * 0.85);
          setParam(core, 'ParamEyeBallY', 'PARAM_EYE_BALL_Y', currentLookY * 0.85);
          setParam(core, 'ParamAngleX', 'PARAM_ANGLE_X', currentLookX * 18);
          setParam(core, 'ParamAngleY', 'PARAM_ANGLE_Y', currentLookY * 14);
          setParam(core, 'ParamBodyAngleX', 'PARAM_BODY_ANGLE_X', currentLookX * 6);

          // 3. Stochastic Blinking Cycle
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

          // 4. Mood & Expression Dynamics
          const isHappy = currentMood === 'happy' || currentMood === 'encouraging';
          if (isHappy) {
            setParam(core, 'ParamEyeLSmile', 'PARAM_EYE_L_SMILE', 0.85);
            setParam(core, 'ParamEyeRSmile', 'PARAM_EYE_R_SMILE', 0.85);
            setParam(core, 'ParamBrowLY', 'PARAM_BROW_L_Y', 0.2);
            setParam(core, 'ParamBrowRY', 'PARAM_BROW_R_Y', 0.2);
          } else {
            setParam(core, 'ParamEyeLSmile', 'PARAM_EYE_L_SMILE', 0.0);
            setParam(core, 'ParamEyeRSmile', 'PARAM_EYE_R_SMILE', 0.0);
          }

          // 5. State-Driven Posture
          if (currentState === 'thinking') {
            setParam(core, 'ParamAngleZ', 'PARAM_ANGLE_Z', -6.5);
            setParam(core, 'ParamAngleY', 'PARAM_ANGLE_Y', 3.5 + Math.sin(t * 1.2) * 0.8);
            setParam(core, 'ParamEyeBallY', 'PARAM_EYE_BALL_Y', 0.45);
            setParam(core, 'ParamEyeBallX', 'PARAM_EYE_BALL_X', -0.25);
            setParam(core, 'ParamBrowLY', 'PARAM_BROW_L_Y', -0.35);
            setParam(core, 'ParamBrowRY', 'PARAM_BROW_R_Y', -0.35);
          } else if (currentState === 'listening') {
            const nod = Math.sin(t * 2.0) * 1.5;
            setParam(core, 'ParamAngleZ', 'PARAM_ANGLE_Z', 4.5);
            setParam(core, 'ParamAngleX', 'PARAM_ANGLE_X', 3.0);
            setParam(core, 'ParamAngleY', 'PARAM_ANGLE_Y', -2.0 + nod);
            setParam(core, 'ParamBrowLY', 'PARAM_BROW_L_Y', 0.35);
            setParam(core, 'ParamBrowRY', 'PARAM_BROW_R_Y', 0.35);
            setParam(core, 'ParamEyeLOpen', 'PARAM_EYE_L_OPEN', 1.05);
            setParam(core, 'ParamEyeROpen', 'PARAM_EYE_R_OPEN', 1.05);
          } else if (currentState === 'idle') {
            setParam(core, 'ParamAngleZ', 'PARAM_ANGLE_Z', Math.sin(t * 0.9) * 1.2);
          }

          // 6. Phonetic Lip-Sync & Speaking Head Gestures (Human Speech Sync)
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
                  // Clean complete pause: lips firmly closed during punctuation or bilabial stop
                  targetMouthY = 0.0;
                  targetMouthForm = isHappy ? 0.40 : 0.0;
                } else {
                  const frameElapsed = elapsed - activeFrame.start;
                  const frameDur = activeFrame.end - activeFrame.start;
                  const frameProgress = Math.min(1.0, Math.max(0.0, frameElapsed / frameDur));

                  // Smooth parabolic arch (smooth opening and closing within syllable)
                  const env = Math.sin(frameProgress * Math.PI);
                  targetMouthY = activeFrame.yVal * env;
                  targetMouthForm = isHappy ? Math.max(0.5, activeFrame.formVal) : activeFrame.formVal;
                }
              } else if (elapsed > speechDurationMs) {
                // Natural 1.9 Hz conversational rhythm with micro-breaths if audio continues past schedule
                const speechCycle = (now * 0.0019 * Math.PI * 2) % (Math.PI * 2);
                const breathCycle = Math.sin(now * 0.0006 * Math.PI * 2);

                if (breathCycle < -0.65) {
                  // Natural 0.3s breathing pause between phrase clusters
                  targetMouthY = 0.0;
                  targetMouthForm = isHappy ? 0.4 : 0.0;
                } else {
                  const rawOpen = Math.pow(Math.max(0, Math.sin(speechCycle)), 1.4);
                  targetMouthY = rawOpen * 0.88;
                  targetMouthForm = isHappy ? 0.85 : 0.20;
                }
              }
            } else {
              // Natural conversational 1.9 Hz cadence (smooth, visible, human-paced)
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

            // Snappy opening attack (0.42) and smooth organic closing decay (0.28)
            const lerpY = targetMouthY > currentMouthY ? 0.42 : 0.28;
            currentMouthY += (targetMouthY - currentMouthY) * lerpY;
            currentMouthForm += (targetMouthForm - currentMouthForm) * 0.28;

            // Rhythmic speech head motion (subtle conversational nods on stressed syllables)
            const headNod = (currentLookY * 12) + (targetMouthY * -2.4) + Math.sin(now * 0.0022) * 1.5;
            const headTilt = Math.cos(now * 0.0015) * 1.8;
            const bodyBob = Math.sin(now * 0.0012) * 1.6;

            setParam(core, 'ParamAngleY', 'PARAM_ANGLE_Y', headNod);
            setParam(core, 'ParamAngleZ', 'PARAM_ANGLE_Z', headTilt);
            setParam(core, 'ParamBodyAngleX', 'PARAM_BODY_ANGLE_X', bodyBob);
          } else {
            // Smooth return to resting lips
            currentMouthY += (0 - currentMouthY) * 0.22;
            currentMouthForm += ((isHappy ? 0.6 : 0.0) - currentMouthForm) * 0.22;
            speechSchedule = [];
            lastScheduledText = '';
          }

          // Apply Mouth Open & Form forcefully on every frame to CoreModel
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
      const container = document.getElementById('canvas-container');
      const viewW = container.clientWidth || window.innerWidth || 360;
      const viewH = container.clientHeight || window.innerHeight || 200;
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

      currentModelName = (modelName || 'haru').toLowerCase();

      try {
        const Live2DModelClass = await waitForLive2DSDK();
        if (typeof Live2DModelClass.registerTicker === 'function' && window.PIXI && window.PIXI.Ticker) {
          try {
            Live2DModelClass.registerTicker(window.PIXI.Ticker);
          } catch(e) {}
        }
        model = await Live2DModelClass.from(url, { autoInteract: false });
        
        const container = document.getElementById('canvas-container');
        const viewW = container.clientWidth || window.innerWidth || 360;
        const viewH = container.clientHeight || window.innerHeight || 200;

        framePortrait(viewW, viewH);

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
          const targetName = (data.model || 'haru').toLowerCase();
          if (targetName !== currentModelName) {
            const url = getModelUrl(targetName);
            loadModel(url, targetName);
          }
        }
      } catch(e) {}
    }

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);

    window.onload = init;
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

  const initialModelName = useRef(normalizedModel).current;
  const htmlSource = useMemo(() => getLive2DHtml(initialModelName), [initialModelName]);

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
