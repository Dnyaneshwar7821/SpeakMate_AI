import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { getPixiPuppetHtml } from '../../utils/puppetHtmlEngine';
import { AVATAR_IMAGES, getAvatarById } from '../../config/AvatarCatalog';
import { TEACHER_DATA_URI } from '../../utils/puppets/TeacherBase64';
import { MALE_TEACHER_DATA_URI } from '../../utils/puppets/MaleTeacherBase64';
import { SHIZUKA_DATA_URI } from '../../utils/puppets/ShizukaBase64';
import { DORAEMON_DATA_URI } from '../../utils/puppets/DoraemonBase64';
import { SPONGEBOB_DATA_URI } from '../../utils/puppets/SpongeBobBase64';
import { CHHOTA_BHEEM_DATA_URI } from '../../utils/puppets/ChhotaBheemBase64';
import { NINJA_HATTORI_DATA_URI } from '../../utils/puppets/NinjaHattoriBase64';
import { TOM_DATA_URI } from '../../utils/puppets/TomBase64';
import { BEN_TEN_DATA_URI } from '../../utils/puppets/BenTenBase64';
import { SCOOBY_DATA_URI } from '../../utils/puppets/ScoobyBase64';

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

  const assetUri = useMemo(() => {
    try {
      if (normalizedModel === 'haru' || normalizedModel === 'teacher') {
        return TEACHER_DATA_URI;
      }
      if (normalizedModel === 'chitose' || normalizedModel === 'maleteacher' || normalizedModel === 'male') {
        return MALE_TEACHER_DATA_URI;
      }
      if (normalizedModel === 'shizuku' || normalizedModel === 'shizuka') {
        return SHIZUKA_DATA_URI;
      }
      if (normalizedModel === 'robopaws' || normalizedModel === 'doraemon') {
        return DORAEMON_DATA_URI;
      }
      if (normalizedModel === 'spongebob') {
        return SPONGEBOB_DATA_URI;
      }
      if (normalizedModel === 'sparky' || normalizedModel === 'bheem' || normalizedModel === 'chhotabheem') {
        return CHHOTA_BHEEM_DATA_URI;
      }
      if (normalizedModel === 'koharu' || normalizedModel === 'hattori' || normalizedModel === 'ninjahattori') {
        return NINJA_HATTORI_DATA_URI;
      }
      if (normalizedModel === 'haruto' || normalizedModel === 'tom') {
        return TOM_DATA_URI;
      }
      if (normalizedModel === 'mao' || normalizedModel === 'ben10') {
        return BEN_TEN_DATA_URI;
      }
      if (normalizedModel === 'puppy' || normalizedModel === 'scooby' || normalizedModel === 'scoobydoo') {
        return SCOOBY_DATA_URI;
      }
      const avatarMeta = getAvatarById(normalizedModel);
      const img = AVATAR_IMAGES[avatarMeta.id] || AVATAR_IMAGES[normalizedModel];
      if (img) {
        const resolved = Image.resolveAssetSource(img);
        return resolved?.uri || '';
      }
    } catch (e) {
      console.warn('[Live2DAvatarView] Asset resolve error:', e);
    }
    return '';
  }, [normalizedModel]);

  const webViewSource = useMemo(() => {
    const customUrl = process.env.EXPO_PUBLIC_WEB_AVATAR_URL;
    if (customUrl) {
      return { uri: `${customUrl}?model=${normalizedModel}&framing=faceToChest` };
    }
    return {
      html: getPixiPuppetHtml(normalizedModel, assetUri),
      baseUrl: 'https://cdnjs.cloudflare.com',
    };
  }, [normalizedModel, assetUri]);

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

  // Safety guard: guarantee spinner is dismissed within 3s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isReady) {
        setIsReady(true);
        if (onLoaded) onLoaded();
      }
    }, 3000);
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
      // ignore non-json messages
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
        source={webViewSource}
        style={styles.webView}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        scalesPageToFit={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
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
    overflow: 'visible',
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
