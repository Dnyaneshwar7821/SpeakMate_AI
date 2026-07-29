import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../context/ToastContext";

export function useSpeech(options = {}) {
  const { lang = "en-US", rate = 1, pitch = 1, onResult, onError } = options;
  const toast = useToast();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const recognitionRef = useRef(null);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      const defaultEnglish = voices.find((v) => v.lang.startsWith("en") && v.name.includes("Natural")) ||
                            voices.find((v) => v.lang.startsWith("en")) ||
                            voices[0];
      if (defaultEnglish && !selectedVoice) {
        setSelectedVoice(defaultEnglish);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoice]);

  // Speech Recognition (STT) Setup
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.warning("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        if (onResult) {
          onResult(currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (onError) {
          onError(event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  }, [lang, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Speech Synthesis (TTS)
  const speak = useCallback(
    (text) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;

      window.speechSynthesis.cancel();

      const personaKey = localStorage.getItem("speakmate_voice_persona") || "Friendly";
      const personaMap = {
        Friendly: { pitch: 1.15, rate: 1.0 },
        Professional: { pitch: 0.9, rate: 0.9 },
        Energetic: { pitch: 1.15, rate: 1.2 },
        Calm: { pitch: 0.95, rate: 0.85 },
        Teacher: { pitch: 1.05, rate: 0.95 },
        "Native Speaker": { pitch: 1.0, rate: 1.05 },
      };

      const pConfig = personaMap[personaKey] || personaMap.Friendly;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = (rate || 1) * pConfig.rate;
      utterance.pitch = (pitch || 1) * pConfig.pitch;
      utterance.lang = lang;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [rate, pitch, lang, selectedVoice]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
  };
}

export default useSpeech;
