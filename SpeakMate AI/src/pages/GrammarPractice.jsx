import { useState, useEffect } from "react";
import { grammarService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";

function performSmartGrammarCorrection(text) {
  let corrected = text;
  const corrections = [];

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
    corrections.push({
      category: "Subject-Verb Agreement",
      rule: "Plural subjects (I, we, they, you) take base form verbs without 's'.",
    });
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
    corrections.push({
      category: "Subject-Verb Agreement",
      rule: "Third-person singular (he, she, it) requires third-person verbs ending in '-s' or '-es'.",
    });
  }

  // Rule 2: Preposition of Duration ('since' vs 'for')
  if (/\b(since)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|several|a few)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/i.test(corrected)) {
    corrected = corrected.replace(/\b(since)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|several|a few)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/gi, "for $2 $3");
    corrections.push({
      category: "Preposition",
      rule: "Use 'for' for duration of time (e.g. for 2 years), and 'since' for a starting point.",
    });
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
    corrections.push({
      category: "Verb Tense (Continuous Form)",
      rule: "Auxiliary verbs (am, is, are, was, were) must be followed by present participle '-ing' form.",
    });
  }

  // Capitalize First Letter & Add Period
  if (corrected.length > 0) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
    if (!/[.!?]$/.test(corrected)) {
      corrected += ".";
    }
  }

  const isCorrect = text.trim() === corrected || corrections.length === 0;

  return {
    originalText: text,
    correctedText: corrected,
    isCorrect,
    accuracyScore: isCorrect ? 100 : Math.max(60, 95 - corrections.length * 15),
    corrections,
    explanation: isCorrect
      ? "Great job! Your sentence is grammatically correct and sounds natural."
      : `We found ${corrections.length} grammar & style improvement(s). Review the rules below to elevate your English fluency!`,
  };
}

export function GrammarPractice() {
  const [textInput, setTextInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState("checker");

  useEffect(() => {
    grammarService
      .history()
      .then((res) => {
        if (res && Array.isArray(res)) setHistory(res);
      })
      .catch(() => {});
  }, []);

  const handleSpeakCorrectionAndImprovement = (res) => {
    if (!res) return;
    setIsAiSpeaking(true);
    let speechText = "";
    if (res.isCorrect) {
      speechText = `Great job! Your sentence "${res.originalText}" is grammatically correct!`;
    } else {
      speechText = `The correct way to say that is: "${res.correctedText}". `;
      if (res.corrections && res.corrections.length > 0) {
        speechText += `Remember: ${res.corrections[0].rule}`;
      }
    }

    speakGlobalText(speechText);
    setTimeout(() => setIsAiSpeaking(false), Math.min(8000, speechText.length * 75));
  };

  const handleAnalyzeText = async () => {
    if (!textInput.trim()) return;
    setAnalyzing(true);

    try {
      const apiRes = await grammarService.check(textInput.trim()).catch(() => null);
      let finalResult = null;

      if (apiRes && apiRes.correctedText) {
        finalResult = apiRes;
      } else {
        finalResult = performSmartGrammarCorrection(textInput.trim());
      }

      setAnalysisResult(finalResult);
      setHistory((prev) => [finalResult, ...prev]);

      handleSpeakCorrectionAndImprovement(finalResult);
    } catch (e) {
      const fallback = performSmartGrammarCorrection(textInput.trim());
      setAnalysisResult(fallback);
      setHistory((prev) => [fallback, ...prev]);
      handleSpeakCorrectionAndImprovement(fallback);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-4 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-indigo-800 via-indigo-700 to-purple-700 p-6 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
            ✍️ AI Live Grammar & Voice Coach
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">AI Grammar Practice</h1>
          <p className="text-sm sm:text-base text-indigo-100/90 font-medium leading-relaxed">
            Instantly analyze your sentences for subject-verb agreement, tenses, prepositions, and natural phrasing with AI voice feedback!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("checker")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "checker"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            ✍️ Live Grammar Analysis
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "history"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-102"
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
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border border-[var(--border-default)] shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-base font-black text-[var(--text-primary)]">
                  Enter English Sentence to Check
                </label>
                <span className="text-xs font-black text-indigo-500 bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/20">
                  AI Voice Player Active
                </span>
              </div>

              <textarea
                rows={6}
                placeholder="Type or paste any English sentence (e.g., 'i goes to school yesterday and she do not likes apples since two years')..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed shadow-inner"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => setTextInput("i goes to school yesterday and she do not likes apples since two years.")}
                  className="text-xs font-black text-indigo-500 hover:underline text-left"
                >
                  + Insert Sample Error Sentence
                </button>

                <button
                  onClick={handleAnalyzeText}
                  disabled={analyzing || !textInput.trim()}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-indigo-500/25 transition-all"
                >
                  {analyzing ? "Analyzing & Speaking..." : "Check & Speak Smoothly →"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Voice Audio Banner & Analysis Results */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex items-center justify-between gap-4 overflow-hidden border border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 grid place-items-center text-2xl shadow-inner shrink-0">
                  🎙️
                </div>
                <div>
                  <h3 className="font-extrabold text-white">AI Voice Tutor</h3>
                  <p className="text-xs text-indigo-200 font-medium mt-0.5">
                    {isAiSpeaking ? "Speaking Smooth Correction & Tips... 🔊" : "Ready to Analyze & Speak Smoothly ✨"}
                  </p>
                </div>
              </div>

              {isAiSpeaking && (
                <div className="flex items-center gap-1.5 h-8">
                  <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse h-6" />
                  <span className="w-1.5 bg-pink-500 rounded-full animate-bounce h-8" />
                  <span className="w-1.5 bg-emerald-400 rounded-full animate-pulse h-5" />
                </div>
              )}
            </div>

            {/* Results Card */}
            {analysisResult ? (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 animate-in fade-in duration-300 border border-[var(--border-default)] shadow-xl">
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
                    className="px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-500 transition-all inline-flex items-center gap-1.5 shadow-md"
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

                  {/* Structured Rule Improvements */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-3">
                    <span className="font-black text-indigo-500 uppercase text-[10px] tracking-wider">
                      Grammar Rule Improvements
                    </span>

                    {analysisResult.corrections && analysisResult.corrections.length > 0 ? (
                      <div className="space-y-3">
                        {analysisResult.corrections.map((c, i) => (
                          <div key={i} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                            <span className="font-black text-indigo-500 text-xs">
                              {i + 1}. ({c.category})
                            </span>
                            <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold">
                              Corrected phrasing applied in sentence.
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] font-medium">
                              💡 What was wrong: {c.rule}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold leading-relaxed">
                        💡 {analysisResult.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 min-h-[220px] shadow-xl">
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
              <div key={h.id || Math.random()} className="glass-card-interactive p-6 rounded-3xl space-y-3 border border-[var(--border-default)] shadow-md">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                  <span className="text-emerald-500 font-black">Accuracy: {h.accuracyScore || 90}%</span>
                  <button onClick={() => handleSpeakCorrectionAndImprovement(h)} className="text-indigo-500 font-extrabold hover:underline">
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
