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
      -webkit-mask-image: linear-gradient(to bottom, black 0%, black 72%, transparent 95%);
      mask-image: linear-gradient(to bottom, black 0%, black 72%, transparent 95%);
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
          scaleMultiplier: 2.35,
          yOffsetRatio: 0.12,
        },
        chitose: {
          path: CDN_BASE + '/models/avatar/chitose/chitose.model.json',
          scaleMultiplier: 2.35,
          yOffsetRatio: 0.12,
        }
      };

      var activeModelKey = '${activeModel}';
      var app = null;
      var currentModel = null;
      var isSpeaking = false;
      var mouthAnimId = null;
      var mouthPhase = 0;

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
        model.y = Math.max(16, screenH * cfg.yOffsetRatio);
      }

      function setMouthOpen(val) {
        if (!currentModel || !currentModel.internalModel) return;
        var core = currentModel.internalModel.coreModel;
        if (!core) return;

        // Cubism 4 (Haru)
        if (typeof core.setParameterValueById === 'function') {
          try {
            core.setParameterValueById('ParamMouthOpenY', val);
          } catch (_) {}
        }
        // Cubism 2 (Chitose)
        if (typeof core.setParamFloat === 'function') {
          try {
            core.setParamFloat('PARAM_MOUTH_OPEN_Y', val);
          } catch (_) {}
        }
      }

      function startSpeakingAnimation() {
        if (mouthAnimId) return;
        function animate() {
          if (!isSpeaking) {
            setMouthOpen(0);
            mouthAnimId = null;
            return;
          }
          mouthPhase += 0.28;
          var raw = (Math.sin(mouthPhase) * 0.5 + 0.5) * 0.75 + (Math.sin(mouthPhase * 2.3) * 0.25);
          var open = Math.max(0.0, Math.min(1.0, raw));
          setMouthOpen(open);
          mouthAnimId = requestAnimationFrame(animate);
        }
        animate();
      }

      function stopSpeakingAnimation() {
        isSpeaking = false;
        if (mouthAnimId) {
          cancelAnimationFrame(mouthAnimId);
          mouthAnimId = null;
        }
        setMouthOpen(0);
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
            if (speaking !== isSpeaking) {
              isSpeaking = speaking;
              if (isSpeaking) {
                startSpeakingAnimation();
              } else {
                stopSpeakingAnimation();
              }
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
