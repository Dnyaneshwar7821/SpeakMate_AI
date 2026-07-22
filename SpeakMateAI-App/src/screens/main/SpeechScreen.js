import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AppButton, AppInput, Card, Screen } from '../../components/ui';
import { speechService, speakingService } from '../../services/appServices';
import { COLORS } from '../../constants/colors';

export default function SpeechScreen() {
  const [transcript, setTranscript] = useState('');
  const [topic, setTopic] = useState('Speaking practice');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    setLoading(true);
    try {
      const response = await speechService.speechToText({
        uri: asset.uri,
        name: asset.name || 'speech.m4a',
        type: asset.mimeType || 'audio/mpeg',
      });
      setTranscript(response.transcript || '');
    } catch (error) {
      Alert.alert('Speech to text failed', error.userMessage || 'Unable to transcribe audio.');
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const pronunciation = await speechService.pronunciation(transcript.trim());
      const session = await speakingService.create({ topic, transcript: transcript.trim(), duration: 1 });
      setFeedback(pronunciation.feedback || session.feedback || 'Analysis completed.');
    } catch (error) {
      Alert.alert('Analysis failed', error.userMessage || 'Unable to analyze pronunciation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Speech" subtitle="Upload audio for speech-to-text, then send transcript for pronunciation analysis.">
      <Card>
        <AppInput label="Topic" value={topic} onChangeText={setTopic} />
        <AppButton title="Pick audio file" onPress={pickAudio} loading={loading} />
        <AppInput label="Transcript" value={transcript} onChangeText={setTranscript} multiline />
        <AppButton title="Analyze pronunciation" onPress={analyze} loading={loading} variant="secondary" />
      </Card>
      {!!feedback && (
        <Card>
          <Text style={{ color: COLORS.black, fontWeight: '900', marginBottom: 8 }}>Feedback</Text>
          <Text style={{ color: COLORS.text, lineHeight: 22 }}>{feedback}</Text>
        </Card>
      )}
    </Screen>
  );
}
