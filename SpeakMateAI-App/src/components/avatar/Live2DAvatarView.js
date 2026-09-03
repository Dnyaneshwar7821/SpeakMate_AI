import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { getWebAvatarEmbedUrl } from '../../constants/config';

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
  const [hasError, setHasError] = useState(false);
  const normalizedModel = (model || 'haru').toLowerCase();

  const embedUrl = useMemo(
    () => getWebAvatarEmbedUrl(normalizedModel),
    [normalizedModel]
  );

  // Send state and spoken text updates to embedded web avatar
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

  // Safety guard: if not ready within 5 seconds, notify parent to prevent infinite spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isReady) {
        setIsReady(true);
        if (onLoaded) onLoaded();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isReady, onLoaded]);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'READY') {
        setIsReady(true);
        if (onLoaded) onLoaded();
      } else if (data.type === 'ERROR') {
        console.warn('[Live2DAvatarView] WebView Error from embed:', data.message);
        setHasError(true);
        if (onError) onError(new Error(data.message));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleWebError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('[Live2DAvatarView] WebView load failure:', nativeEvent);
    setHasError(true);
    if (onError) onError(new Error(nativeEvent.description || 'WebView failed to load'));
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ uri: embedUrl }}
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
        cacheEnabled={true}
        onMessage={onMessage}
        onError={handleWebError}
        onHttpError={handleWebError}
      />

      {!isReady && !hasError && (
        <View style={[StyleSheet.absoluteFillObject, styles.spinnerContainer]}>
          <ActivityIndicator size="small" color="#A855F7" />
        </View>
      )}
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
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default Live2DAvatarView;
