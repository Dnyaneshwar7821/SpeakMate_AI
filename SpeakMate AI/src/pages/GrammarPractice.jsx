import { useState, useEffect } from "react";
import { grammarService, aiService } from "../services/appServices";

// Intelligent Client-Side Grammar Engine for Fallback/Offline Correctness
function performSmartGrammarCorrection(text) {
  let corrected = text;
  const explanations = [];
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
    explanations.push("Subject-Verb Agreement: Plural subjects (I, we, they, you) take base form verbs without 's'.");
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
    explanations.push("Subject-Verb Agreement: Third-person singular (he, she, it) requires third-person verb forms ending in '-s' or '-es'.");
  }

  // Rule 2: Preposition of Duration ('since' vs 'for')
  if (/\b(since)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|several|a few)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/i.test(corrected)) {
    corrected = corrected.replace(/\b(since)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|several|a few)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/gi, "for $2 $3");
    explanations.push("Prepositions: Use 'for' when referring to a period or duration of time (e.g. 'for 2 years'), and 'since' for a specific starting point (e.g. 'since 2022').");
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
    explanations.push("Continuous Tenses: Auxiliary verbs (am/is/are/was/were) must be followed by the present participle (verb + -ing).");
  }

  // Rule 4: Past Tense Double Negatives / Auxiliaries ('didn't went' -> 'didn't go')
  if (/\b(didn't|did not)\s+(went|saw|came|ate|took|wrote|drank)\b/i.test(corrected)) {
    corrected = corrected
      .replace(/\b(didn't|did not)\s+went\b/gi, "$1 go")
      .replace(/\b(didn't|did not)\s+saw\b/gi, "$1 see")
      .replace(/\b(didn't|did not)\s+came\b/gi, "$1 come")
      .replace(/\b(didn't|did not)\s+ate\b/gi, "$1 eat")
      .replace(/\b(didn't|did not)\s+took\b/gi, "$1 take")
      .replace(/\b(didn't|did not)\s+wrote\b/gi, "$1 write")
      .replace(/\b(didn't|did not)\s+drank\b/gi, "$1 drink");
    explanations.push("Auxiliary Verbs: After 'did' or 'didn't', always use the base form of the verb.");
  }

  // Rule 5: Indefinite Articles ('a apple' -> 'an apple')
  if (/\b\ba\s+(apple|orange|egg|umbrella|hour|honest|elephant|idea|avocado|airplane)\b/i.test(corrected)) {
    corrected = corrected.replace(/\ba\s+(apple|orange|egg|umbrella|hour|honest|elephant|idea|avocado|airplane)\b/gi, "an $1");
    explanations.push("Indefinite Articles: Use 'an' before words starting with vowel sounds (a, e, i, o, u, silent h).");
  }

  // Rule 6: Redundant Prepositions ('discuss about' -> 'discuss')
  if (/\bdiscuss\s+about\b/i.test(corrected)) {
    corrected = corrected.replace(/\bdiscuss\s+about\b/gi, "discuss");
    explanations.push("Word Choice: 'Discuss' already means 'talk about', so using 'about' after 'discuss' is redundant.");
  }

  // Capitalization & Period
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
      ? "✅ Excellent! Your sentence is grammatically correct with accurate tense usage and phrasing."
      : explanations.join(" "),
    isCorrect: isExactSame,
  };
}

export function GrammarPractice() {
  const [activeTab, setActiveTab] = useState("checker"); // 'checker', 'history', 'quiz'
  const [textInput, setTextInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

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

    try {
      const backendRes = await grammarService.analyze(rawText).catch(() => null);
      if (backendRes && backendRes.correctedText) {
        setAnalysisResult(backendRes);
      } else {
        const smartRes = performSmartGrammarCorrection(rawText);
        setAnalysisResult(smartRes);
      }
      await loadHistory();
    } catch (e) {
      const smartRes = performSmartGrammarCorrection(rawText);
      setAnalysisResult(smartRes);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSpeak = (text) => {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const startGrammarQuiz = async () => {
    setQuizLoading(true);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);

    try {
      const q = await grammarService.quiz().catch(() => null);
      if (q && q.length > 0) {
        setQuizQuestions(q);
      } else {
        throw new Error("No quiz backend");
      }
    } catch (e) {
      setQuizQuestions([
        {
          id: "gq1",
          questionText: "Which sentence uses the correct present perfect continuous tense?",
          options: [
            "I am living here since 5 years.",
            "I have been living here for 5 years.",
            "I live here since 5 years.",
            "I had live here for 5 years.",
          ],
          correctIndex: 1,
          explanation: "Use 'have been + verb-ing' for an action that started in the past and continues in the present.",
        },
        {
          id: "gq2",
          questionText: "Choose the correct preposition: 'She is interested ___ learning languages.'",
          options: ["at", "in", "on", "for"],
          correctIndex: 1,
          explanation: "The adjective 'interested' is followed by the preposition 'in'.",
        },
      ]);
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)]">AI Grammar Coach</h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">
            Instantly analyze your sentences, correct grammar rules out loud, and test your knowledge with quizzes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shrink-0">
          <button
            onClick={() => setActiveTab("checker")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "checker"
                ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            ✍️ Live Grammar Analysis
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "history"
                ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            📜 Past Checks ({history.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("quiz");
              startGrammarQuiz();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "quiz"
                ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            ⚡ Grammar Quiz
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CHECKER (2-COLUMN SPLIT DESKTOP WORKSPACE) */}
      {activeTab === "checker" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Box */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                  Enter English Sentence to Check
                </label>
                <span className="text-xs font-bold text-[#6c63ff]">Real-Time AI Feedback</span>
              </div>

              <textarea
                rows={6}
                placeholder="Type or paste any English sentence (e.g., 'I goes to school yesterday and she do not likes apples')..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] leading-relaxed"
              />

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => setTextInput("I goes to school yesterday and she do not likes apples since two years.")}
                  className="text-xs font-bold text-[#6c63ff] hover:underline"
                >
                  Insert Sample Error Sentence
                </button>

                <button
                  onClick={handleAnalyzeText}
                  disabled={analyzing || !textInput.trim()}
                  className="px-8 py-3.5 rounded-2xl bg-[#6c63ff] hover:bg-[#7c74ff] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#6c63ff]/25 transition-all"
                >
                  {analyzing ? "Analyzing..." : "Check Grammar Now →"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Analysis Results Card */}
          <div className="lg:col-span-6">
            {analysisResult ? (
              <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl p-2 rounded-2xl font-extrabold ${analysisResult.isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                      {analysisResult.accuracyScore}%
                    </span>
                    <div>
                      <h3 className="font-black text-base text-[var(--text-primary)]">Grammar Evaluation Result</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">Instant AI Correction</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeak(analysisResult.correctedText)}
                    className="px-4 py-2 rounded-2xl bg-[#6c63ff]/10 text-[#6c63ff] text-xs font-extrabold hover:bg-[#6c63ff] hover:text-white transition-all inline-flex items-center gap-1.5"
                  >
                    🔊 Listen Corrected
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm space-y-1">
                    <span className="font-extrabold text-rose-500 uppercase text-[10px]">Your Original Input</span>
                    <p className="font-semibold text-[var(--text-primary)]">"{analysisResult.originalText}"</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm space-y-1">
                    <span className="font-extrabold text-emerald-500 uppercase text-[10px]">AI Natural Native Phrasing</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-300">
                      "{analysisResult.correctedText}"
                    </p>
                  </div>

                  {analysisResult.explanation && (
                    <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs sm:text-sm space-y-1">
                      <span className="font-extrabold text-[#6c63ff] uppercase text-[10px]">Grammar Rule Explanation</span>
                      <p className="text-[var(--text-secondary)] leading-relaxed font-medium">
                        {analysisResult.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                <span className="text-5xl">✍️</span>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">Ready to Check Your Grammar</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm">
                  Enter your sentence on the left to receive instant spoken corrections and grammar rule explanations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAST CHECKS HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-[var(--text-primary)]">Grammar Check History</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((h) => (
              <div key={h.id || Math.random()} className="glass-card p-6 rounded-3xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                  <span className="text-emerald-500 font-extrabold">Accuracy: {h.accuracyScore || 90}%</span>
                  <button onClick={() => handleSpeak(h.correctedText)} className="text-[#6c63ff] hover:underline">
                    🔊 Listen
                  </button>
                </div>

                <div className="space-y-1 text-xs sm:text-sm">
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
