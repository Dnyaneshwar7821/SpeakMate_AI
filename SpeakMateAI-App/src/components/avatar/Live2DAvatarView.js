import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const HARU_MODEL_URL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';
const CHITOSE_MODEL_URL = 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/SenrenBanka/chitose/chitose.model.json';

const LIVE2D_HTML = `
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
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
    canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
      background: transparent !important;
    }
  </style>
  <!-- Cubism 2 & 4 Core SDKs with Unified Pixi-Live2D Display -->
  <script src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/pixi.js@7.3.2/dist/pixi.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <script>
    window.PIXI = PIXI;
    let app, model;
    let isSpeaking = false;
    let currentState = 'idle';
    let currentMood = 'neutral';
    let currentModelName = 'haru';
    let mouthPhase = 0;
    let currentMouthY = 0;
    let currentMouthForm = 0;
    
    // Interactive Touch / Gaze & Lifelike Saccades
    let targetLookX = 0;
    let targetLookY = 0;
    let currentLookX = 0;
    let currentLookY = 0;
    let isPointerInteracting = false;
    
    // Natural Autonomous Saccadic Gaze Glances
    let nextSaccadeTime = Date.now() + 2000;
    let saccadeTargetX = 0;
    let saccadeTargetY = 0;
    
    // Natural Blinking
    let nextBlinkTime = Date.now() + 2500;
    let isBlinking = false;
    let blinkProgress = 0;

    async function init() {
      try {
        const container = document.getElementById('canvas-container');
        const width = container.clientWidth || window.innerWidth || 360;
        const height = container.clientHeight || window.innerHeight || 200;

        app = new PIXI.Application({
          width: width,
          height: height,
          transparent: true,
          backgroundAlpha: 0,
          resolution: Math.min(window.devicePixelRatio || 2, 2.5),
          autoDensity: true,
          antialias: true,
        });

        container.appendChild(app.view);

        PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);

        await loadModel('${HARU_MODEL_URL}', 'haru');

        // Touch tracking listeners
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerReset);
        window.addEventListener('pointercancel', onPointerReset);

        // Window resize responsive adjustment
        window.addEventListener('resize', onResize);

        // Core ticker loop (60 FPS fluid rendering)
        app.ticker.add((delta) => {
          if (!model || !model.internalModel) return;

          const core = model.internalModel.coreModel;
          if (!core) return;

          const now = Date.now();
          const t = now / 1000;

          // 1. Natural Breathing Physics (chest & hair resonance)
          const breath = (Math.sin(t * 1.8) + 1) * 0.45;
          setParam(core, 'ParamBreath', 'PARAM_BREATH', breath);

          // 2. Autonomous Saccadic Eye Movements (Lifelike Glances)
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

          // 5. State-Driven Posture & Micro-Gestures
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

          // 6. Dynamic Phonetic Lip-Sync & Speaking Head Nodding
          if (isSpeaking) {
            mouthPhase += 0.38 * delta;
            
            // Dynamic multi-frequency viseme oscillation
            const rawOpen = Math.abs(Math.sin(mouthPhase)) * 0.75 + Math.abs(Math.cos(mouthPhase * 0.65)) * 0.3;
            const targetMouthY = Math.min(1.0, Math.max(0.18, rawOpen));
            const targetMouthForm = isHappy ? 1.0 : (Math.sin(mouthPhase * 0.5) * 0.4 + 0.35);

            currentMouthY += (targetMouthY - currentMouthY) * 0.42;
            currentMouthForm += (targetMouthForm - currentMouthForm) * 0.42;

            // Rhythmic speech head bob & body rhythm
            const headBob = (currentLookY * 14) + Math.sin(mouthPhase * 0.7) * 3.2;
            const headTilt = Math.cos(mouthPhase * 0.4) * 2.0;
            setParam(core, 'ParamAngleY', 'PARAM_ANGLE_Y', headBob);
            setParam(core, 'ParamAngleZ', 'PARAM_ANGLE_Z', headTilt);
            setParam(core, 'ParamBodyAngleX', 'PARAM_BODY_ANGLE_X', Math.sin(mouthPhase * 0.35) * 2.5);
          } else {
            currentMouthY += (0 - currentMouthY) * 0.28;
            currentMouthForm = isHappy ? 0.9 : 0.2;
          }

          // Apply Mouth Open & Form forcefully
          setParam(core, 'ParamMouthOpenY', 'PARAM_MOUTH_OPEN_Y', currentMouthY);
          setParam(core, 'ParamMouthForm', 'PARAM_MOUTH_FORM', currentMouthForm);
        });

        // Notify React Native that avatar is ready
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
      } catch (err) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: err.message }));
      }
    }

    function setParam(core, cubism4Id, cubism2Id, val) {
      try {
        if (core.setParameterValueById) {
          core.setParameterValueById(cubism4Id, val);
        } else if (core.setParamFloat) {
          core.setParamFloat(cubism2Id, val);
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
      const baseScale = Math.min(viewW / model.width, viewH / model.height);
      const portraitScale = baseScale * 1.58;
      model.scale.set(portraitScale);
      model.anchor.set(currentModelName === 'chitose' ? 0.50 : 0.52, 0.22);
      model.x = viewW / 2;
      model.y = viewH / 2;
    }

    async function loadModel(url, modelName) {
      if (model) {
        app.stage.removeChild(model);
        model.destroy({ children: true });
        model = null;
      }

      currentModelName = modelName || 'haru';

      try {
        model = await PIXI.live2d.Live2DModel.from(url, { autoInteract: false });
        
        // Get true physical bounds from the DOM to prevent square fallback stretching
        const container = document.getElementById('canvas-container');
        const viewW = container.clientWidth || window.innerWidth || 360;
        const viewH = container.clientHeight || window.innerHeight || 200;

        // Exact Head-to-Chest Portrait Framing: Zoom 1.58x with Face Centered
        const baseScale = Math.min(viewW / model.width, viewH / model.height);
        const portraitScale = baseScale * 1.58;

        model.scale.set(portraitScale);
        model.anchor.set(currentModelName === 'chitose' ? 0.50 : 0.52, 0.22);
        model.x = viewW / 2;
        model.y = viewH / 2;

        // Hook motionManager update to guarantee lipSync is never overridden by idle physics
        if (model.internalModel && model.internalModel.motionManager) {
          const origUpdate = model.internalModel.motionManager.update ? model.internalModel.motionManager.update.bind(model.internalModel.motionManager) : null;
          if (origUpdate) {
            model.internalModel.motionManager.update = function(coreModel, now) {
              origUpdate(coreModel, now);
              if (coreModel) {
                setParam(coreModel, 'ParamMouthOpenY', 'PARAM_MOUTH_OPEN_Y', currentMouthY);
                setParam(coreModel, 'ParamMouthForm', 'PARAM_MOUTH_FORM', currentMouthForm);
              }
            };
          }
        }

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
        } else if (data.type === 'STATE') {
          currentState = data.state || 'idle';
          isSpeaking = data.state === 'speaking';
        } else if (data.type === 'MOOD') {
          currentMood = data.mood || 'neutral';
        } else if (data.type === 'MODEL') {
          const targetName = (data.model || 'haru').toLowerCase();
          if (targetName !== currentModelName) {
            const url = targetName === 'chitose' ? '${CHITOSE_MODEL_URL}' : '${HARU_MODEL_URL}';
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

export const Live2DAvatarView = memo(function Live2DAvatarView({
  isSpeaking = false,
  state = 'idle',
  mood = 'neutral',
  model = 'haru',
  style,
  onLoaded,
  onError,
}) {
  const webViewRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Send state updates to Live2D WebView
  useEffect(() => {
    if (webViewRef.current && isReady) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'STATE',
          state: isSpeaking ? 'speaking' : state,
          isSpeaking,
        })
      );
    }
  }, [isSpeaking, state, isReady]);

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
          model,
        })
      );
    }
  }, [model, isReady]);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'READY') {
        setIsReady(true);
        if (onLoaded) onLoaded();
      } else if (data.type === 'ERROR') {
        if (onError) onError(data.message);
      }
    } catch (e) {}
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: LIVE2D_HTML }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        transparent={true}
        onMessage={onMessage}
        onError={(err) => onError && onError(err)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        androidLayerType="hardware"
      />
      {!isReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default Live2DAvatarView;
