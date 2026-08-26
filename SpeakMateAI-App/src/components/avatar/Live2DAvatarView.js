import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const HARU_MODEL_URL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';
const CHITOSE_MODEL_URL = 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/SenrenBanka/chitose/chitose.model3.json';

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
  <!-- Cubism 4 Core SDK & PixiJS Bundle -->
  <script src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/pixi.js@7.3.2/dist/pixi.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js"></script>
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
    
    // Interactive Touch / Gaze
    let targetLookX = 0;
    let targetLookY = 0;
    let currentLookX = 0;
    let currentLookY = 0;
    
    // Natural Blinking
    let nextBlinkTime = Date.now() + 2500;
    let isBlinking = false;
    let blinkProgress = 0;

    async function init() {
      try {
        const container = document.getElementById('canvas-container');
        const width = window.innerWidth || 300;
        const height = window.innerHeight || 300;

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
        window.addEventListener('pointerdown', onPointerMove);
        window.addEventListener('pointerup', onPointerReset);

        // Core animation & expression loop
        app.ticker.add((delta) => {
          if (!model || !model.internalModel) return;

          const core = model.internalModel.coreModel;
          if (!core) return;

          const now = Date.now();
          const t = now / 1000;

          // 1. Natural Breathing
          const breath = (Math.sin(t * 1.8) + 1) * 0.4;
          try {
            if (core.setParameterValueById) core.setParameterValueById('ParamBreath', breath);
          } catch(e) {}

          // 2. Smooth Gaze & Head Lerp
          currentLookX += (targetLookX - currentLookX) * 0.08;
          currentLookY += (targetLookY - currentLookY) * 0.08;

          try {
            if (core.setParameterValueById) {
              core.setParameterValueById('ParamEyeBallX', currentLookX * 0.75);
              core.setParameterValueById('ParamEyeBallY', currentLookY * 0.75);
              core.setParameterValueById('ParamAngleX', currentLookX * 22);
              core.setParameterValueById('ParamAngleY', currentLookY * 18);
            }
          } catch(e) {}

          // 3. Stochastic Blinking Cycle
          if (now > nextBlinkTime && !isBlinking) {
            isBlinking = true;
            blinkProgress = 0;
          }

          if (isBlinking) {
            blinkProgress += 0.12 * delta;
            // Half sine for quick close and open
            const eyeOpen = Math.max(0, 1 - Math.sin(blinkProgress * Math.PI));
            try {
              if (core.setParameterValueById) {
                core.setParameterValueById('ParamEyeLOpen', eyeOpen);
                core.setParameterValueById('ParamEyeROpen', eyeOpen);
              }
            } catch(e) {}

            if (blinkProgress >= 1.0) {
              isBlinking = false;
              nextBlinkTime = now + 2200 + Math.random() * 3200; // Next blink in 2.2-5.4s
            }
          }

          // 4. State-Driven Gestures & Expressions
          if (currentState === 'thinking') {
            try {
              if (core.setParameterValueById) {
                core.setParameterValueById('ParamAngleZ', -6.5);
                core.setParameterValueById('ParamEyeBallY', 0.45);
                core.setParameterValueById('ParamBrowLY', -0.3);
                core.setParameterValueById('ParamBrowRY', -0.3);
              }
            } catch(e) {}
          } else if (currentState === 'listening') {
            try {
              if (core.setParameterValueById) {
                core.setParameterValueById('ParamAngleX', 3.5);
                core.setParameterValueById('ParamAngleY', -2.5);
                core.setParameterValueById('ParamBrowLY', 0.25);
                core.setParameterValueById('ParamBrowRY', 0.25);
              }
            } catch(e) {}
          }

          // 5. Dynamic Phonetic Lip-Sync
          if (isSpeaking) {
            mouthPhase += 0.32 * delta;
            
            // Varied multi-viseme mouth shape modulation
            const rawOpen = Math.abs(Math.sin(mouthPhase)) * 0.75 + Math.abs(Math.cos(mouthPhase * 0.6)) * 0.25;
            const mouthOpen = Math.min(1.0, rawOpen);
            const mouthForm = (currentMood === 'happy' || currentMood === 'encouraging') ? 1.0 : (Math.sin(mouthPhase * 0.5) * 0.4 + 0.2);

            try {
              if (core.setParameterValueById) {
                core.setParameterValueById('ParamMouthOpenY', mouthOpen);
                core.setParameterValueById('ParamMouthForm', mouthForm);
                // Subtle speech head bobbing
                core.setParameterValueById('ParamAngleY', (currentLookY * 18) + Math.sin(mouthPhase * 0.7) * 2.2);
              }
            } catch(e) {}
          } else {
            try {
              if (core.setParameterValueById) {
                core.setParameterValueById('ParamMouthOpenY', 0);
                core.setParameterValueById('ParamMouthForm', (currentMood === 'happy' || currentMood === 'encouraging') ? 0.8 : 0);
              }
            } catch(e) {}
          }
        });

        // Notify React Native that avatar is ready
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
      } catch (err) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: err.message }));
      }
    }

    function onPointerMove(e) {
      const rect = app.view.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetLookX = Math.max(-1, Math.min(1, x));
      targetLookY = Math.max(-1, Math.min(1, y));
    }

    function onPointerReset() {
      targetLookX = 0;
      targetLookY = 0;
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
        
        // Portrait Framing (Face to Upper Chest): Zoom 2.15x
        const baseScale = Math.min(app.view.width / model.width, app.view.height / model.height);
        const portraitScale = baseScale * 2.15;

        model.scale.set(portraitScale);
        
        // Specific anchor calibration for Haru vs Chitose
        if (currentModelName === 'chitose') {
          model.anchor.set(0.5, 0.15);
          model.y = (app.view.height / (2 * (window.devicePixelRatio || 2))) * 0.76;
        } else {
          model.anchor.set(0.5, 0.18);
          model.y = (app.view.height / (2 * (window.devicePixelRatio || 2))) * 0.72;
        }

        model.x = app.view.width / (2 * (window.devicePixelRatio || 2));

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
    overflow: 'hidden',
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
