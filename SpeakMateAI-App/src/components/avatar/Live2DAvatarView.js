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
    let currentMood = 'neutral';
    let mouthPhase = 0;

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
          resolution: window.devicePixelRatio || 2,
          autoDensity: true,
          antialias: true,
        });

        container.appendChild(app.view);

        PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);

        await loadModel('${HARU_MODEL_URL}');

        // Start animation loop for mouth / breathing
        app.ticker.add((delta) => {
          if (!model || !model.internalModel) return;

          const core = model.internalModel.coreModel;
          if (!core) return;

          // Natural breathing
          const t = Date.now() / 1000;
          const breath = (Math.sin(t * 1.5) + 1) / 2;
          try {
            model.internalModel.motionManager?.update?.(delta);
          } catch(e) {}

          // Speaking Lip-sync
          if (isSpeaking) {
            mouthPhase += 0.28 * delta;
            const mouthOpen = Math.abs(Math.sin(mouthPhase)) * 0.85 + 0.15;
            
            // Cubism 4 Parameter ID for Mouth Open
            if (model.internalModel.focusController) {
              model.internalModel.focusController.focus(0, 0);
            }
            
            try {
              if (core.setParameterValueById) {
                core.setParameterValueById('ParamMouthOpenY', mouthOpen);
                core.setParameterValueById('ParamMouthForm', currentMood === 'happy' ? 1.0 : 0.0);
              }
            } catch(e) {}
          } else {
            try {
              if (core.setParameterValueById) {
                core.setParameterValueById('ParamMouthOpenY', 0);
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

    async function loadModel(url) {
      if (model) {
        app.stage.removeChild(model);
        model.destroy({ children: true });
      }

      try {
        model = await PIXI.live2d.Live2DModel.from(url, { autoInteract: true });
        
        // Auto scale to fill view nicely
        const scaleX = (app.view.width / model.width) * 0.95;
        const scaleY = (app.view.height / model.height) * 0.95;
        const scale = Math.min(scaleX, scaleY);

        model.scale.set(scale);
        model.anchor.set(0.5, 0.5);
        model.x = app.view.width / (2 * (window.devicePixelRatio || 2));
        model.y = (app.view.height / (2 * (window.devicePixelRatio || 2))) + 15;

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
          isSpeaking = data.state === 'speaking';
          if (data.state === 'thinking' && model && model.internalModel) {
            try {
              model.internalModel.coreModel.setParameterValueById('ParamAngleZ', -8);
            } catch(e) {}
          } else if (data.state === 'listening' && model && model.internalModel) {
            try {
              model.internalModel.coreModel.setParameterValueById('ParamAngleX', 5);
            } catch(e) {}
          }
        } else if (data.type === 'MOOD') {
          currentMood = data.mood || 'neutral';
        } else if (data.type === 'MODEL') {
          const url = data.model === 'chitose' ? '${CHITOSE_MODEL_URL}' : '${HARU_MODEL_URL}';
          loadModel(url);
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
