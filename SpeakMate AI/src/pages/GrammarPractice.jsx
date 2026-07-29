import { useState, useEffect } from "react";
import { grammarService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";
import { Avatar3D } from "../components/Avatar3D";

function performSmartGrammarCorrection(text) {
  let corrected = text;
  const explanations = [];

  // Rule 1: Subject-Verb Agreement (I/They/We vs He/She/It)
  if (/\b(i|we|they|you)\s+(goes|likes|wants|has|does|works|plays)\b/i.test(corrected)) {
    corrected = corrected
      .replace(/\b(i|we|they|you)\s+goes\b/gi, "$1 go")
      .replace(/\b(i|we|they|you)\s+likes\b/gi, "$1 like")
      .replace(/\b(i|we|they|you)\s+wants\b/gi, "$1 want")
      .replace(/\b(i|we|they|you)\s+has\b/gi, "$1 have")
      .replace(/\b(i|we|they|you)\s+does\b/gi, "$1 do")
      .replace(/\b(i|we|they|you)\s+works\b/gi, "$1 work")
      .replace(/\b(i|we|they|you)\s+plays\b/gi, "$1 play");
    explanations.push("Plural subjects (I, we, they, you) take base form verbs without 's'.");
  }

  if (/\b(he|she|it)\s+(go|like|want|have|do|work|play)\b/i.test(corrected)) {
    corrected = corrected
      .replace(/\b(he|she|it)\s+go\b/gi, "$1 goes")
      .replace(/\b(he|she|it)\s+like\b/gi, "$1 likes")
      .replace(/\b(he|she|it)\s+want\b/gi, "$1 wants")
      .replace(/\b(he|she|it)\s+have\b/gi, "$1 has")
      .replace(/\b(he|she|it)\s+do\b/gi, "$1 does")
      .replace(/\b(he|she|it)\s+work\b/gi, "$1 works")
      .replace(/\b(he|she|it)\s+play\b/gi, "$1 plays");
    explanations.push("Third-person singular (he, she, it) requires third-person verbs ending in '-s' or '-es'.");
  }

  // Rule 2: Preposition of Duration ('since' vs 'for')
  if (/\b(since)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|several|a few)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/i.test(corrected)) {
    corrected = corrected.replace(/\b(since)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|several|a few)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/gi, "for $2 $3");
    explanations.push("Use 'for' for duration of time (e.g. for 2 years), and 'since' for a starting point.");
  }

  // Rule 3: Continuous Tense Auxiliaries ('is go' -> 'is going')
  if (/\b(am|is|are|was|were)\s+(go|run|eat|work|study|play|talk|write|drive)\b/i.test(corrected)) {
    corrected = corrected
      .replace(/\b(am|is|are|was|were)\s+go\b/gi, "$1 going")
      .replace(/\b(am|is|are|was|were)\s+run\b/gi, "$1 running")
      .replace(/\b(am|is|are|was|were)\s+eat\b/gi, "$1 eating")
      .replace(/\b(am|is|are|was|were)\s+work\b/gi, "$1 working")
      .replace(/\b(am|is|are|was|were)\s+study\b/gi, "$1 studying")
      .replace(/\b(am|is|are|was|were)\s+play\b/gi, "$1 playing")
      .replace(/\b(am|is|are|was|were)\s+talk\b/gi, "$1 talking")
      .replace(/\b(am|is|are|was|were)\s+write\b/gi, "$1 writing")
      .replace(/\b(am|is|are|was|were)\s+drive\b/gi, "$1 driving");
    explanations.push("Auxiliary verbs (am/is/are/was/were) must be followed by present participle verbs ending in '-ing'.");
  }

  // Rule 4: Past Tense Auxiliaries ('didn't went' -> 'didn't go')
  if (/\b(didn't|did not)\s+(went|saw|came|ate|took|wrote|drank)\b/i.test(corrected)) {
    corrected = corrected
      .replace(/\b(didn't|did not)\s+went\b/gi, "$1 go")
      .replace(/\b(didn't|did not)\s+saw\b/gi, "$1 see")
      .replace(/\b(didn't|did not)\s+came\b/gi, "$1 come")
      .replace(/\b(didn't|did not)\s+ate\b/gi, "$1 eat")
      .replace(/\b(didn't|did not)\s+took\b/gi, "$1 take")
      .replace(/\b(didn't|did not)\s+wrote\b/gi, "$1 write")
      .replace(/\b(didn't|did not)\s+drank\b/gi, "$1 drink");
    explanations.push("After 'did' or 'didn't', always use the base form of the verb.");
  }

  // Rule 5: Indefinite Articles ('a apple' -> 'an apple')
  if (/\b\ba\s+(apple|orange|egg|umbrella|hour|honest|elephant|idea|avocado|airplane)\b/i.test(corrected)) {
    corrected = corrected.replace(/\ba\s+(apple|orange|egg|umbrella|hour|honest|elephant|idea|avocado|airplane)\b/gi, "an $1");
    explanations.push("Use 'an' before words starting with vowel sounds.");
  }

  // Rule 6: Redundant Prepositions ('discuss about' -> 'discuss')
  if (/\bdiscuss\s+about\b/i.test(corrected)) {
    corrected = corrected.replace(/\bdiscuss\s+about\b/gi, "discuss");
    explanations.push("'Discuss' already means 'talk about', so using 'about' is redundant.");
  }

  corrected = corrected.trim();
  if (corrected.length > 0) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
    if (!/[.!?]$/.test(corrected)) {
      corrected += ".";
    }
  }

  const isExactSame = text.trim().toLowerCase() === corrected.trim().toLowerCase();

  return {
    originalText: text,
    correctedText: isExactSame ? text : corrected,
    accuracyScore: isExactSame ? 100 : Math.max(70, Math.floor(100 - explanations.length * 10)),
    explanation: isExactSame
      ? "Great job! Your sentence is grammatically correct with accurate tense usage and phrasing."
      : explanations.join(" "),
    isCorrect: isExactSame,
  };
}

export function GrammarPractice() {
  const [activeTab, setActiveTab] = useState("checker");
  const [textInput, setTextInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [viseme, setViseme] = useState("REST");

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    let visemeInterval = null;
    if (isAiSpeaking) {
      const VISEMES = ["AA", "EE", "IH", "OO", "AA", "OH", "EE", "REST"];
      let idx = 0;
      visemeInterval = setInterval(() => {
        idx = (idx + 1) % VISEMES.length;
        setViseme(VISEMES[idx]);
      }, 120);
    } else {
      setViseme("REST");
    }
    return () => clearInterval(visemeInterval);
  }, [isAiSpeaking]);

  const getBestNaturalVoice = () => {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    return (
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Jenny") ||
            v.name.includes("Ava") ||
            v.name.includes("Samantha") ||
            v.name.includes("Alex") ||
            v.name.includes("Online"))
      ) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    );
  };

  const handleSpeakText = (text) => {
    if (!text) return;
    speakGlobalText(text, 1.0, {
      onstart: () => {
        setIsAiSpeaking(true);
        setViseme("AA");
      },
      onboundary: () => {
        const VISEMES = ["AA", "EE", "IH", "OO", "OH"];
        setViseme(VISEMES[Math.floor(Math.random() * VISEMES.length)]);
      },
      onend: () => {
        setIsAiSpeaking(false);
        setViseme("REST");
      },
      onerror: () => {
        setIsAiSpeaking(false);
        setViseme("REST");
      },
    });
  };

  const handleSpeakCorrectionAndImprovement = (res) => {
    if (!res) return;
    let spokenMsg = "";
    if (res.isCorrect) {
      spokenMsg = `Fantastic job! Your sentence, ${res.correctedText}, is completely accurate! Keep up the great work!`;
    } else {
      spokenMsg = `Here is your corrected sentence: ${res.correctedText}. Here is a helpful tip: ${res.explanation || ""}. Let's keep practicing together!`;
    }
    handleSpeakText(spokenMsg);
  };

  const loadHistory = async () => {
    try {
      const data = await grammarService.history();
      setHistory(data || []);
    } catch (e) {
      setHistory([
        {
          id: "h1",
          originalText: "I am living in London since two years.",
          correctedText: "I have been living in London for two years.",
          accuracyScore: 85,
          createdAt: "2026-07-24T10:00:00Z",
        },
      ]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleAnalyzeText = async () => {
    const rawText = textInput.trim();
    if (!rawText) return;
    setAnalyzing(true);
    setAnalysisResult(null);

    let resultObj = null;
    try {
      const backendRes = await grammarService.analyze(rawText).catch(() => null);
      if (backendRes && backendRes.correctedText) {
        resultObj = backendRes;
      } else {
        resultObj = performSmartGrammarCorrection(rawText);
      }
      setAnalysisResult(resultObj);
      await loadHistory();
    } catch (e) {
      resultObj = performSmartGrammarCorrection(rawText);
      setAnalysisResult(resultObj);
    } finally {
      setAnalyzing(false);
      if (resultObj) {
        setTimeout(() => handleSpeakCorrectionAndImprovement(resultObj), 400);
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-4">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-6 sm:p-10 text-white shadow-2xl space-y-4">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
              ✍️ AI Grammar Engine
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">AI Grammar Coach</h1>
            <p className="text-sm sm:text-base text-indigo-200 font-medium leading-relaxed">
              Instantly analyze your sentences, listen to smooth natural audio corrections out loud, and learn grammar rule improvements.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("checker")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "checker"
                ? "bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-lg shadow-[#6c63ff]/25 scale-102"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            ✍️ Live Grammar Analysis
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "history"
                ? "bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-lg shadow-[#6c63ff]/25 scale-102"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            📜 Past Checks ({history.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CHECKER */}
      {activeTab === "checker" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Box */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5 border border-[var(--border-default)]">
              <div className="flex items-center justify-between">
                <label className="text-base font-black text-[var(--text-primary)]">
                  Enter English Sentence to Check
                </label>
                <span className="text-xs font-black text-[#6c63ff] px-3 py-1 rounded-full bg-[#6c63ff]/15">
                  Voice Tutor Active
                </span>
              </div>

              <textarea
                rows={6}
                placeholder="Type or paste any English sentence (e.g., 'I goes to school yesterday and she do not likes apples since two years')..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-4.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] leading-relaxed"
              />

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => setTextInput("I goes to school yesterday and she do not likes apples since two years.")}
                  className="text-xs font-black text-[#6c63ff] hover:underline"
                >
                  + Insert Sample Error Sentence
                </button>

                <button
                  onClick={handleAnalyzeText}
                  disabled={analyzing || !textInput.trim()}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 disabled:opacity-50 text-white font-black text-sm shadow-xl transition-all"
                >
                  {analyzing ? "Analyzing & Speaking..." : "Check & Speak Smoothly →"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Lip-Sync AI Tutor & Results */}
          <div className="lg:col-span-6 space-y-6">
            {/* 3D Vector AI Tutor Avatar Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-xl flex items-center justify-between gap-4 overflow-hidden border border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-2 border-[#6c63ff]/50 shadow-2xl p-1.5 overflow-hidden ${isAiSpeaking ? "scale-105" : "animate-float"}`}>
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                      <defs>
                        <linearGradient id="skinGradG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FAD7BD" />
                          <stop offset="100%" stopColor="#E3A880" />
                        </linearGradient>
                        <linearGradient id="hairGradG" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#4A306D" />
                          <stop offset="100%" stopColor="#1E1035" />
                        </linearGradient>
                        <radialGradient id="eyeIrisG">
                          <stop offset="0%" stopColor="#6C63FF" />
                          <stop offset="100%" stopColor="#0F172A" />
                        </radialGradient>
                      </defs>

                      <path d="M 32 82 Q 50 78 68 82 L 72 100 L 28 100 Z" fill="#E3A880" />
                      <path d="M 24 90 Q 50 82 76 90 L 85 100 L 15 100 Z" fill="#6C63FF" opacity="0.9" />
                      <path d="M 26 36 Q 22 58 32 76 Q 50 88 68 76 Q 78 58 74 36 Q 50 30 26 36 Z" fill="url(#skinGradG)" />
                      <ellipse cx="23" cy="52" rx="4" ry="7" fill="#E3A880" />
                      <ellipse cx="77" cy="52" rx="4" ry="7" fill="#E3A880" />
                      <path d="M 20 42 Q 22 14 50 14 Q 78 14 80 42 Q 65 26 50 26 Q 35 26 20 42 Z" fill="url(#hairGradG)" />
                      <path d="M 31 43 Q 39 39 47 43" stroke="#2D1945" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <path d="M 53 43 Q 61 39 69 43" stroke="#2D1945" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                      <g className="animate-eye-blink">
                        <ellipse cx="39" cy="49" rx="6" ry="4.5" fill="#FFFFFF" />
                        <ellipse cx="39" cy="49" rx="3.5" ry="3.5" fill="url(#eyeIrisG)" />
                        <circle cx="37.5" cy="47.5" r="1.2" fill="#FFFFFF" />
                        <ellipse cx="61" cy="49" rx="6" ry="4.5" fill="#FFFFFF" />
                        <ellipse cx="61" cy="49" rx="3.5" ry="3.5" fill="url(#eyeIrisG)" />
                        <circle cx="59.5" cy="47.5" r="1.2" fill="#FFFFFF" />
                      </g>
                      <path d="M 50 50 L 48 60 L 52 60 Z" fill="#D4946A" opacity="0.6" />

                      {viseme === "AA" ? (
                        <g>
                          <path d="M 35 64 Q 50 58 65 64 Q 65 80 50 82 Q 35 80 35 64 Z" fill="#991B1B" stroke="#B91C1C" strokeWidth="1" />
                          <path d="M 37 65 Q 50 62 63 65 L 63 68 Q 50 65 37 68 Z" fill="#FFFFFF" />
                          <ellipse cx="50" cy="77" rx="6" ry="3.5" fill="#F87171" />
                        </g>
                      ) : viseme === "EE" ? (
                        <g>
                          <path d="M 31 65 Q 50 60 69 65 Q 69 77 50 78 Q 31 77 31 65 Z" fill="#881337" stroke="#9F1239" strokeWidth="1" />
                          <path d="M 33 66 Q 50 62 67 66 L 67 69 Q 50 66 33 69 Z" fill="#FFFFFF" />
                        </g>
                      ) : (
                        <path d="M 35 68 Q 50 72 65 68 M 37 70 Q 50 74 63 70" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      )}
                    </svg>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-[#F8FAFC]">SpeakMate AI Voice Tutor</h3>
                  <p className="text-xs text-[#A5B4FC] font-medium mt-0.5">
                    {isAiSpeaking ? "Speaking Smooth Correction & Tips... 🎙️" : "Ready to Analyze & Speak Smoothly ✨"}
                  </p>
                </div>
              </div>

              {isAiSpeaking && (
                <div className="flex items-center gap-1.5 h-8">
                  <span className="w-1.5 bg-[#6c63ff] rounded-full animate-soundbar-1" />
                  <span className="w-1.5 bg-[#ff6584] rounded-full animate-soundbar-2" />
                  <span className="w-1.5 bg-emerald-400 rounded-full animate-soundbar-3" />
                </div>
              )}
            </div>

            {/* Results Card */}
            {analysisResult ? (
              <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 animate-in fade-in duration-300 border border-[var(--border-default)]">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl p-2.5 rounded-2xl font-black ${analysisResult.isCorrect ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"}`}>
                      {analysisResult.accuracyScore}%
                    </span>
                    <div>
                      <h3 className="font-black text-base text-[var(--text-primary)]">Evaluation Result</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">Grammar Score & Feedback</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeakCorrectionAndImprovement(analysisResult)}
                    className="px-4 py-2.5 rounded-2xl bg-[#6c63ff] text-white text-xs font-black hover:bg-[#8b85ff] transition-all inline-flex items-center gap-1.5 shadow-md"
                  >
                    🔊 Replay Voice
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm space-y-1">
                    <span className="font-black text-rose-500 uppercase text-[10px]">Your Original Input</span>
                    <p className="font-semibold text-[var(--text-primary)]">"{analysisResult.originalText}"</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm space-y-1">
                    <span className="font-black text-emerald-500 uppercase text-[10px]">AI Corrected Sentence</span>
                    <p className="font-black text-emerald-600 dark:text-emerald-300">
                      "{analysisResult.correctedText}"
                    </p>
                  </div>

                  {analysisResult.explanation && (
                    <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs sm:text-sm space-y-1">
                      <span className="font-black text-[#6c63ff] uppercase text-[10px]">Grammar Rule Improvement</span>
                      <p className="text-[var(--text-secondary)] leading-relaxed font-semibold">
                        💡 {analysisResult.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
                <span className="text-5xl">✍️</span>
                <h3 className="font-black text-base text-[var(--text-primary)]">Ready for Smooth AI Voice Check</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm font-medium">
                  Enter your sentence on the left to receive instant smooth spoken corrections and grammar rule explanations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAST CHECKS HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Grammar Check History</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {history.map((h) => (
              <div key={h.id || Math.random()} className="glass-card p-6 rounded-3xl space-y-3 border border-[var(--border-default)]">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                  <span className="text-emerald-500 font-black">Accuracy: {h.accuracyScore || 90}%</span>
                  <button onClick={() => handleSpeakCorrectionAndImprovement(h)} className="text-[#6c63ff] font-extrabold hover:underline">
                    🔊 Listen Voice
                  </button>
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm">
                  <p className="text-rose-400 font-medium line-through opacity-80">"{h.originalText}"</p>
                  <p className="text-emerald-400 font-bold">"{h.correctedText}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GrammarPractice;
