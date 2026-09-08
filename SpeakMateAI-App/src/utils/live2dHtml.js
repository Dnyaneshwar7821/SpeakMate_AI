/**
 * Standalone Live2D HTML Generator for React Native WebView
 * Runs 100% in-app without requiring a local web dev server.
 * Loads Cubism 2 (Chitose) and Cubism 4 (Haru) models via fast cached CDN.
 */

export function getLive2DAvatarHtml(initialModel = 'haru') {
  const modelKey = (initialModel || 'haru').toLowerCase();
  const activeModel = modelKey.includes('chitose') || modelKey === 'male' ? 'chitose' : 'haru';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>SpeakMate AI Live2D Avatar</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent !important;
      overflow: hidden;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }
    #stage-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent !important;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      -webkit-mask-image: linear-gradient(to bottom, black 0%, black 80%, transparent 98%);
      mask-image: linear-gradient(to bottom, black 0%, black 80%, transparent 98%);
    }
    canvas {
      display: block;
      background: transparent !important;
    }
  </style>

  <!-- Live2D Core Runtimes -->
  <script src="https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"></script>
  <script src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.2/pixi.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js"></script>
</head>
<body>
  <div id="stage-container"></div>

  <script>
    (function () {
      if (typeof window !== 'undefined') {
        window.PIXI = PIXI;
        window.Live2DCubismCore = window.Live2DCubismCore || {};
      }

      // PixiJS v7 compatibility
      var isInteractiveFn = function() {
        return Boolean(this.interactive || this.eventMode === 'static' || this.eventMode === 'dynamic');
      };
      if (PIXI && PIXI.DisplayObject) {
        PIXI.DisplayObject.prototype.isInteractive = isInteractiveFn;
      }
      if (PIXI && PIXI.Container) {
        PIXI.Container.prototype.isInteractive = isInteractiveFn;
      }

      var CDN_BASE = 'https://cdn.jsdelivr.net/gh/Dnyaneshwar7821/speakmate-ai-web-frontend@main/public';
      var MODEL_REGISTRY = {
        haru: {
          path: CDN_BASE + '/models/avatar/haru/haru_greeter_t03.model3.json',
          scaleMultiplier: 3.1,
          yOffsetRatio: -0.13,
        },
        chitose: {
          path: CDN_BASE + '/models/avatar/chitose/chitose.model.json',
          scaleMultiplier: 3.1,
          yOffsetRatio: -0.13,
        }
      };

      // ─────────────────────────────────────────────────────────────────────────────
      // Real-Time Phonetic Viseme Engine (Text-to-Mouth Synchronization)
      // ─────────────────────────────────────────────────────────────────────────────
      var VISEME_MAP = {
        REST: { yVal: 0.00, formVal: 0.00 },
        MBP:  { yVal: 0.12, formVal: 0.00 },  // M, B, P: bilabials, lips closed/touching
        AA:   { yVal: 0.95, formVal: 0.25 },  // A, AH: wide open mouth
        EE:   { yVal: 0.65, formVal: 0.85 },  // E, EE, I: wide smiling teeth
        IH:   { yVal: 0.55, formVal: 0.20 },  // Short vowels: neutral open
        OO:   { yVal: 0.82, formVal: -0.80 }, // OO, U, W: pursed round lips
        OH:   { yVal: 0.90, formVal: -0.35 }, // O, OH, AW: tall open oval
        FV:   { yVal: 0.38, formVal: -0.15 }, // F, V: upper teeth on lower lip
        LNT:  { yVal: 0.48, formVal: 0.15 }   // L, N, T, D, S, Z: dental open
      };

      function getWordVisemes(rawWord) {
        if (!rawWord) return [{ yVal: 0, formVal: 0, weight: 1 }];
        var word = rawWord.toLowerCase().replace(/[^a-z]/g, '');
        if (!word) return [{ yVal: 0, formVal: 0, weight: 1 }];

        var result = [];
        var i = 0;
        while (i < word.length) {
          var pair = word.substr(i, 2);
          if (pair === 'oo' || pair === 'ou' || pair === 'ow') {
            result.push({ yVal: VISEME_MAP.OO.yVal, formVal: VISEME_MAP.OO.formVal, weight: 1.2 });
            i += 2;
          } else if (pair === 'ee' || pair === 'ea' || pair === 'ie' || pair === 'ei') {
            result.push({ yVal: VISEME_MAP.EE.yVal, formVal: VISEME_MAP.EE.formVal, weight: 1.2 });
            i += 2;
          } else if (pair === 'ai' || pair === 'ay' || pair === 'ae') {
            result.push({ yVal: VISEME_MAP.EE.yVal, formVal: VISEME_MAP.EE.formVal, weight: 1.0 });
            i += 2;
          } else if (pair === 'oa' || pair === 'oh' || pair === 'aw' || pair === 'au') {
            result.push({ yVal: VISEME_MAP.OH.yVal, formVal: VISEME_MAP.OH.formVal, weight: 1.2 });
            i += 2;
          } else if (pair === 'th' || pair === 'sh' || pair === 'ch') {
            result.push({ yVal: VISEME_MAP.LNT.yVal, formVal: VISEME_MAP.LNT.formVal, weight: 0.9 });
            i += 2;
          } else if (pair === 'mb' || pair === 'mp') {
            result.push({ yVal: VISEME_MAP.MBP.yVal, formVal: VISEME_MAP.MBP.formVal, weight: 0.8 });
            i += 2;
          } else {
            var ch = word[i];
            if (ch === 'm' || ch === 'b' || ch === 'p') {
              result.push({ yVal: VISEME_MAP.MBP.yVal, formVal: VISEME_MAP.MBP.formVal, weight: 0.7 });
            } else if (ch === 'f' || ch === 'v') {
              result.push({ yVal: VISEME_MAP.FV.yVal, formVal: VISEME_MAP.FV.formVal, weight: 0.8 });
            } else if (ch === 'a') {
              result.push({ yVal: VISEME_MAP.AA.yVal, formVal: VISEME_MAP.AA.formVal, weight: 1.0 });
            } else if (ch === 'e' || ch === 'i') {
              result.push({ yVal: VISEME_MAP.EE.yVal, formVal: VISEME_MAP.EE.formVal, weight: 0.9 });
            } else if (ch === 'o') {
              result.push({ yVal: VISEME_MAP.OH.yVal, formVal: VISEME_MAP.OH.formVal, weight: 1.0 });
            } else if (ch === 'u' || ch === 'w') {
              result.push({ yVal: VISEME_MAP.OO.yVal, formVal: VISEME_MAP.OO.formVal, weight: 0.9 });
            } else if (ch === 'l' || ch === 'n' || ch === 't' || ch === 'd' || ch === 's' || ch === 'z' || ch === 'r') {
              result.push({ yVal: VISEME_MAP.LNT.yVal, formVal: VISEME_MAP.LNT.formVal, weight: 0.7 });
            } else {
              result.push({ yVal: VISEME_MAP.IH.yVal, formVal: VISEME_MAP.IH.formVal, weight: 0.6 });
            }
            i++;
          }
        }
        return result.length > 0 ? result : [{ yVal: VISEME_MAP.IH.yVal, formVal: VISEME_MAP.IH.formVal, weight: 1 }];
      }

      function buildSpeechSchedule(text, speed) {
        if (!text) return [];
        var speedFactor = Math.max(0.6, Math.min(1.8, Number(speed) || 1.0));
        var tokens = String(text).trim().split(/\s+/);
        var schedule = [];
        var cumulativeTime = 0;

        for (var idx = 0; idx < tokens.length; idx++) {
          var token = tokens[idx];
          var cleanWord = token.replace(/[^a-zA-Z]/g, '');
          var hasPunctuation = /[.,!?;:]$/.test(token);

          if (cleanWord) {
            var visemes = getWordVisemes(cleanWord);
            var totalWeight = 0;
            for (var v = 0; v < visemes.length; v++) totalWeight += visemes[v].weight;

            var baseDuration = Math.max(130, Math.min(480, cleanWord.length * 58)) / speedFactor;

            for (var w = 0; w < visemes.length; w++) {
              var frameDur = (visemes[w].weight / totalWeight) * baseDuration;
              schedule.push({
                start: cumulativeTime,
                end: cumulativeTime + frameDur,
                yVal: visemes[w].yVal,
                formVal: visemes[w].formVal
              });
              cumulativeTime += frameDur;
            }

            var gap = (hasPunctuation ? 220 : 45) / speedFactor;
            schedule.push({
              start: cumulativeTime,
              end: cumulativeTime + gap,
              yVal: 0.05,
              formVal: 0.0
            });
            cumulativeTime += gap;
          }
        }
        return schedule;
      }

      var activeModelKey = '${activeModel}';
      var app = null;
      var currentModel = null;
      var isSpeaking = false;
      var currentSpokenText = '';
      var currentSpeechSpeed = 1.0;
      var speechSchedule = [];
      var speechStartTime = 0;
      var currentMouthY = 0;
      var currentMouthForm = 0;

      var container = document.getElementById('stage-container');

      function notifyReactNative(payload) {
        try {
          if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        } catch (_) {}
      }

      function initPixi() {
        var width = window.innerWidth || 360;
        var height = window.innerHeight || 420;

        app = new PIXI.Application({
          width: width,
          height: height,
          backgroundAlpha: 0,
          resolution: window.devicePixelRatio || 2,
          autoDensity: true,
          antialias: true,
        });

        container.appendChild(app.view);
        window.addEventListener('resize', handleResize);

        // Continuous high-precision 60fps lip-sync evaluation loop
        app.ticker.add(function() {
          updateLipSync();
        });
      }

      function handleResize() {
        if (!app || !currentModel) return;
        var w = window.innerWidth;
        var h = window.innerHeight;
        app.renderer.resize(w, h);
        positionModel(currentModel, activeModelKey);
      }

      function positionModel(model, modelKey) {
        if (!model) return;
        var cfg = MODEL_REGISTRY[modelKey] || MODEL_REGISTRY.haru;
        var screenW = app.screen.width;
        var screenH = app.screen.height;
        var nativeH = (model.internalModel && model.internalModel.height) || model.height || 1000;

        if (model.anchor) {
          model.anchor.set(0.5, 0.0);
        }

        var scale = (screenH * cfg.scaleMultiplier) / nativeH;
        model.scale.set(scale, scale);
        model.x = screenW / 2;
        model.y = Math.round(screenH * (cfg.yOffsetRatio || 0));
      }

      function applyMouthParameters(model, yVal, formVal, speaking) {
        if (!model || !model.internalModel) return;
        var core = model.internalModel.coreModel;
        if (!core) return;

        var clampedY = Math.max(0.0, Math.min(1.0, yVal));
        var clampedForm = Math.max(-1.0, Math.min(1.0, formVal));

        var t = performance.now() * 0.001;
        var headNodY = speaking ? Math.sin(t * 2.4) * 2.2 : 0;
        var headTiltZ = speaking ? Math.cos(t * 1.5) * 1.4 : 0;
        var bodyAngleX = speaking ? Math.sin(t * 1.1) * 1.1 : 0;

        // 1. Cubism 4 (Haru)
        if (typeof core.setParameterValueById === 'function') {
          try { core.setParameterValueById('ParamMouthOpenY', clampedY); } catch (_) {}
          try { core.setParameterValueById('PARAM_MOUTH_OPEN_Y', clampedY); } catch (_) {}
          try { core.setParameterValueById('ParamMouthForm', clampedForm); } catch (_) {}
          try { core.setParameterValueById('PARAM_MOUTH_FORM', clampedForm); } catch (_) {}
          if (speaking) {
            try { core.setParameterValueById('ParamAngleY', headNodY); } catch (_) {}
            try { core.setParameterValueById('PARAM_ANGLE_Y', headNodY); } catch (_) {}
            try { core.setParameterValueById('ParamAngleZ', headTiltZ); } catch (_) {}
            try { core.setParameterValueById('PARAM_ANGLE_Z', headTiltZ); } catch (_) {}
            try { core.setParameterValueById('ParamBodyAngleX', bodyAngleX); } catch (_) {}
            try { core.setParameterValueById('PARAM_BODY_ANGLE_X', bodyAngleX); } catch (_) {}
          }
        }

        // 2. Cubism 2 (Chitose)
        if (typeof core.setParamFloat === 'function') {
          try { core.setParamFloat('PARAM_MOUTH_OPEN_Y', clampedY, 1.0); } catch (_) {}
          try { core.setParamFloat('PARAM_MOUTH_OPEN', clampedY, 1.0); } catch (_) {}
          try { core.setParamFloat('PARAM_MOUTH_A', clampedY, 1.0); } catch (_) {}
          try { core.setParamFloat('PARAM_MOUTH_O', clampedForm < -0.3 ? clampedY : 0.0, 1.0); } catch (_) {}
          try { core.setParamFloat('PARAM_MOUTH_FORM', clampedForm, 1.0); } catch (_) {}
          if (speaking) {
            try { core.setParamFloat('PARAM_ANGLE_Y', headNodY, 1.0); } catch (_) {}
            try { core.setParamFloat('PARAM_ANGLE_Z', headTiltZ, 1.0); } catch (_) {}
            try { core.setParamFloat('PARAM_BODY_ANGLE_X', bodyAngleX, 1.0); } catch (_) {}
          }
        }
      }

      function updateLipSync() {
        var targetY = 0;
        var targetForm = 0;

        if (isSpeaking) {
          var elapsed = performance.now() - speechStartTime;

          if (speechSchedule.length > 0 && elapsed <= speechSchedule[speechSchedule.length - 1].end) {
            // Precise phonetic viseme schedule tracking
            for (var i = 0; i < speechSchedule.length; i++) {
              var frame = speechSchedule[i];
              if (elapsed >= frame.start && elapsed <= frame.end) {
                var progress = (elapsed - frame.start) / Math.max(1, (frame.end - frame.start));
                var syllableArc = Math.sin(progress * Math.PI);
                targetY = frame.yVal * Math.max(0.65, syllableArc);
                targetForm = frame.formVal;
                break;
              }
            }
          } else {
            // Adaptive speech cadence with natural 3.8 Hz speech rhythm
            var t = performance.now() * 0.001;
            var cadence = (t * 3.8 * Math.PI * 2) % (Math.PI * 2);
            var wave = Math.sin(cadence);
            targetY = wave > 0 ? Math.pow(wave, 0.8) * 0.85 : 0.06;
            targetForm = Math.sin(t * 2.2) * 0.25;
          }
        }

        // Fast attack on opening for crisp articulation, smooth release on closing
        var isOpening = targetY > currentMouthY;
        var lerpSpeed = isSpeaking ? (isOpening ? 0.62 : 0.38) : 0.26;
        currentMouthY += (targetY - currentMouthY) * lerpSpeed;
        currentMouthForm += (targetForm - currentMouthForm) * lerpSpeed;

        if (!isSpeaking && currentMouthY < 0.01) {
          currentMouthY = 0;
          currentMouthForm = 0;
        }

        applyMouthParameters(currentModel, currentMouthY, currentMouthForm, isSpeaking);
      }

      async function loadModel(modelKey) {
        var Live2D = (window.PIXI && window.PIXI.live2d) ? window.PIXI.live2d.Live2DModel : null;
        if (!Live2D) {
          notifyReactNative({ type: 'ERROR', message: 'Live2D runtime not loaded.' });
          return;
        }

        var cfg = MODEL_REGISTRY[modelKey] || MODEL_REGISTRY.haru;

        try {
          if (currentModel) {
            app.stage.removeChild(currentModel);
            currentModel.destroy();
            currentModel = null;
          }

          var model = await Live2D.from(cfg.path, {
            autoInteract: false,
            onError: function (err) {
              console.warn('[StandaloneLive2D] Model load warning:', err);
            }
          });

          if ('eventMode' in model) {
            model.eventMode = 'none';
          }
          model.interactive = false;

          positionModel(model, modelKey);

          // Hook internal motionManager to ensure mouth parameters always override idle curves
          if (model.internalModel && model.internalModel.motionManager) {
            var mm = model.internalModel.motionManager;
            if (typeof mm.update === 'function') {
              var origUpdate = mm.update.bind(mm);
              mm.update = function(coreModel, now) {
                origUpdate(coreModel, now);
                applyMouthParameters(model, currentMouthY, currentMouthForm, isSpeaking);
              };
            }
          }

          app.stage.addChild(model);
          currentModel = model;
          activeModelKey = modelKey;

          notifyReactNative({ type: 'READY', model: modelKey });
        } catch (err) {
          console.error('[StandaloneLive2D] Failed to load model:', err);
          notifyReactNative({ type: 'ERROR', message: err.message || 'Failed to load model.' });
        }
      }

      function handleMessage(event) {
        try {
          var raw = event.data;
          var data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!data || typeof data !== 'object') return;

          if (data.type === 'SPEAK' || data.type === 'STATE') {
            var speaking = Boolean(data.isSpeaking || data.state === 'speaking');
            var text = (data.text || '').trim();
            var speed = Number(data.speed) || 1.0;

            if (speaking) {
              if (!isSpeaking || (text && text !== currentSpokenText) || speed !== currentSpeechSpeed) {
                isSpeaking = true;
                currentSpokenText = text;
                currentSpeechSpeed = speed;
                speechSchedule = buildSpeechSchedule(text, speed);
                speechStartTime = performance.now();
              }
            } else {
              isSpeaking = false;
              currentSpokenText = '';
              speechSchedule = [];
            }
          } else if (data.type === 'MODEL') {
            var req = (data.model || '').toLowerCase();
            var target = req.includes('chitose') || req === 'male' ? 'chitose' : 'haru';
            if (target !== activeModelKey) {
              loadModel(target);
            }
          }
        } catch (_) {}
      }

      window.addEventListener('message', handleMessage);
      document.addEventListener('message', handleMessage);

      initPixi();
      loadModel(activeModelKey);
    })();
  </script>
</body>
</html>`;
}
