import { useState, useEffect } from "react";
import { grammarService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";
import { recordVocabularyMastered } from "../utils/progressTracker";
import {
  analyzeSentenceGrammarLocally,
  EXTENSIVE_GRAMMAR_GUIDE,
  getDailyGrammarQuizzes,
  playWebAudioChime,
} from "../utils/grammarEngine";

export function GrammarPractice() {
  const [activeTab, setActiveTab] = useState("checker"); // 'checker', 'guide', 'quiz', 'history'
  const [textInput, setTextInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Handbook search & filter
  const [guideSearch, setGuideSearch] = useState("");
  const [selectedGuideCategory, setSelectedGuideCategory] = useState("ALL");
  const [expandedGuideId, setExpandedGuideId] = useState(EXTENSIVE_GRAMMAR_GUIDE[0]?.id || null);

  // Daily Sentence Quiz State (8 fresh non-repeating questions rotating daily)
  const [quizOffset, setQuizOffset] = useState(0);
  const [dailyQuizzes, setDailyQuizzes] = useState(() => getDailyGrammarQuizzes(new Date(), 0));
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    grammarService
      .history()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setHistory(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleAnalyzeText = async (overrideText) => {
    const raw = typeof overrideText === "string" ? overrideText : textInput;
    const cleanText = (raw || "").trim();
    if (!cleanText) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    // 1. Run local multi-pass grammar engine immediately
    const localResult = analyzeSentenceGrammarLocally(cleanText);
    setAnalysisResult(localResult);

    try {
      // 2. Query backend grammar endpoint for deep contextual analysis
      const backendRes = await grammarService.check(cleanText).catch(() => null);

      if (backendRes && backendRes.correctedText) {
        // Parse backend errors if present in explanation
        let structuredErrors = localResult.errors;
        let isCorrect = backendRes.grammarScore >= 100 || backendRes.correctedText.trim().toLowerCase() === cleanText.toLowerCase();

        if (backendRes.explanation && backendRes.explanation.includes("[")) {
          // Exploded error lines
          const lines = backendRes.explanation.split("\n").filter(Boolean);
          if (lines.length > 0) {
            structuredErrors = lines.map((line) => {
              const typeMatch = line.match(/\[(.*?)\]/);
              return {
                errorSnippet: line.split("(")[0].replace(/^\d+\.\s*/, "").trim(),
                type: typeMatch ? typeMatch[1] : "Grammar Issue",
                issue: line,
                rule: "Ensure correct tense, agreement, and word order.",
                correction: backendRes.correctedText,
              };
            });
          }
        }

        const mergedResult = {
          isCorrect,
          accuracyScore: backendRes.grammarScore || (isCorrect ? 100 : 80),
          originalText: cleanText,
          correctedText: backendRes.correctedText,
          nativeAlternative: localResult.nativeAlternative,
          errors: structuredErrors,
          explanation: backendRes.explanation || localResult.explanation,
          praiseMessage: isCorrect ? "🌟 Perfect English Grammar! Your sentence is 100% accurate, natural, and well-structured." : "",
        };
        setAnalysisResult(mergedResult);
        setHistory((prev) => [mergedResult, ...prev]);
        speakFeedback(mergedResult);
      } else {
        setHistory((prev) => [localResult, ...prev]);
        speakFeedback(localResult);
      }
    } catch {
      // Fallback already active
      setHistory((prev) => [localResult, ...prev]);
      speakFeedback(localResult);
    } finally {
      setAnalyzing(false);
    }
  };

  const speakFeedback = (res) => {
    if (!res) return;
    setIsAiSpeaking(true);

    let speech = "";
    if (res.isCorrect) {
      speech = `Your sentence is 100% grammatically correct! ${res.correctedText}. Excellent structure and grammar.`;
    } else {
      speech = `Corrected sentence: ${res.correctedText}. `;
      if (res.errors && res.errors.length > 0) {
        speech += `Found ${res.errors.length} improvement${res.errors.length > 1 ? "s" : ""}: `;
        res.errors.forEach((err, i) => {
          speech += `${i + 1}. ${err.issue} `;
        });
      }
    }

    speakGlobalText(speech, 1.0, {
      onend: () => setIsAiSpeaking(false),
      onerror: () => setIsAiSpeaking(false),
    });
  };

  // Daily Quiz Handling (8 non-repeating questions rotated daily)
  const activeQuiz = dailyQuizzes[currentQuizIndex] || dailyQuizzes[0];

  const handleSelectQuizAnswer = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitQuizAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === activeQuiz.correctAnswerIndex;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      playWebAudioChime("correct");
      speakGlobalText("Correct! Well done.", 1.05);
    } else {
      playWebAudioChime("incorrect");
      speakGlobalText(`Not quite. ${activeQuiz.explanation}`, 1.0);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex + 1 < dailyQuizzes.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
      recordVocabularyMastered(quizScore * 15 + 25);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const handleLoadNewQuizBatch = () => {
    const nextOffset = quizOffset + 1;
    setQuizOffset(nextOffset);
    setDailyQuizzes(getDailyGrammarQuizzes(new Date(), nextOffset));
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  // Filtered guides
  const filteredGuides = EXTENSIVE_GRAMMAR_GUIDE.filter((g) => {
    const matchesCat = selectedGuideCategory === "ALL" || g.category === selectedGuideCategory;
    const q = guideSearch.toLowerCase();
    const matchesSearch =
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.summary.toLowerCase().includes(q) ||
      g.rules.some((r) => r.name.toLowerCase().includes(q) || r.usage.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const guideCategories = ["ALL", ...new Set(EXTENSIVE_GRAMMAR_GUIDE.map((g) => g.category))];

  const samplePracticeSentences = [
    { label: "🚨 Multiple Mistakes", text: "She don't goes to school yesterday and discuss about exam." },
    { label: "✅ 100% Perfect Sentence", text: "He ate an apple and completed his homework on time." },
    { label: "⚖️ Subject-Verb Agreement", text: "Neither of my two friend are interested in the project." },
    { label: "⏱️ Tense & Preposition", text: "I have been living in this city since four years." },
    { label: "🔮 Subjunctive Conditional", text: "If I was you, I would have accepted the job offer." },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-3 sm:px-6 py-4">
      {/* Top Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#312E81] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold">
            <span>✨ AI Grammar Doctor & Master Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            English Grammar Doctor ✍️
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Deep multi-clause sentence analysis, instant corrections, spoken explanations, sentence quizzes, and comprehensive CEFR grammar handbooks.
          </p>
        </div>

        {/* Quick Tabs Nav */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("checker")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "checker" ? "bg-white text-[#6C63FF] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            🩺 AI Doctor
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "guide" ? "bg-white text-[#6C63FF] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            📖 Handbook
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "quiz" ? "bg-white text-[#6C63FF] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            🎯 Sentence Quizzes
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "history" ? "bg-white text-[#6C63FF] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            📜 History ({history.length})
          </button>
        </div>
      </div>

      {/* TAB 1: AI GRAMMAR DOCTOR */}
      {activeTab === "checker" && (
        <div className="space-y-6">
          {/* Input Box Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <span>📝 Enter Any English Sentence (Short or Complex):</span>
              </label>
              {textInput.length > 0 && (
                <button
                  onClick={() => setTextInput("")}
                  className="text-xs text-[var(--text-muted)] hover:text-rose-500 transition-colors font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAnalyzeText();
                  }
                }}
                rows={3}
                placeholder="Type or paste any English sentence here... (e.g. 'She don't goes to school yesterday and discuss about the project.')"
                className="w-full p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all resize-none shadow-inner"
              />
            </div>

            {/* Quick Practice Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                ⚡ Try Sample Sentences:
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePracticeSentences.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTextInput(sample.text);
                      handleAnalyzeText(sample.text);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#6C63FF] hover:text-white border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {textInput.trim() ? `${textInput.trim().split(/\s+/).length} words` : "Supports any sentence length"}
              </span>

              <button
                onClick={() => handleAnalyzeText()}
                disabled={analyzing || !textInput.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#ff6584] text-white text-xs sm:text-sm font-black shadow-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Analyzing Grammar...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Check Sentence Grammar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RESULTS DISPLAY: ORDERED PROMINENTLY */}
          {analysisResult && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* 1. TOP PROMINENT CARD: CORRECTED / PERFECT SENTENCE */}
              <div
                className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
                  analysisResult.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                    : "bg-[var(--bg-surface)] border-[var(--border-default)]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      analysisResult.isCorrect
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-[#6C63FF] text-white shadow-sm"
                    }`}>
                      {analysisResult.isCorrect ? "✅ 100% Perfect Sentence" : "🌟 Corrected Sentence"}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      Score: <strong className="text-[var(--text-primary)]">{analysisResult.accuracyScore}%</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakFeedback(analysisResult)}
                      disabled={isAiSpeaking}
                      className="px-3.5 py-1.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      title="Hear Spoken Feedback"
                    >
                      <span>{isAiSpeaking ? "🔊 Speaking..." : "🔊 Speak Sentence & Feedback"}</span>
                    </button>
                  </div>
                </div>

                {/* Display Corrected Text */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {analysisResult.isCorrect ? "Your Sentence:" : "Corrected English Phrasing:"}
                  </p>
                  <p className="text-base sm:text-xl font-extrabold text-[var(--text-primary)] leading-relaxed">
                    "{analysisResult.correctedText}"
                  </p>
                </div>

                {/* Praise message if perfect */}
                {analysisResult.isCorrect && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <span>🎉</span>
                    <span>{analysisResult.praiseMessage || "Given sentence is correct with no grammar mistakes!"}</span>
                  </div>
                )}

                {/* Native Phrasing Alternative (if available) */}
                {analysisResult.nativeAlternative && (
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs sm:text-sm font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                    <span>💡</span>
                    <span>
                      <strong>Native Speaker Upgrade:</strong> "{analysisResult.nativeAlternative}"
                    </span>
                  </div>
                )}
              </div>

              {/* 2. ITEMIZED MISTAKES BREAKDOWN (IF NOT PERFECT) */}
              {!analysisResult.isCorrect && analysisResult.errors && analysisResult.errors.length > 0 && (
                <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                    <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] flex items-center gap-2">
                      <span>🔍 Identified Grammar Mistakes & Improvements ({analysisResult.errors.length}):</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {analysisResult.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] hover:border-[#6C63FF]/50 transition-all space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-black grid place-items-center">
                              {idx + 1}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-[#6C63FF]/10 text-[#6C63FF] text-[11px] font-extrabold uppercase tracking-wide">
                              {err.type || "Grammar Rule"}
                            </span>
                          </div>
                          {err.errorSnippet && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                              Wrong: "{err.errorSnippet}"
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                          👉 {err.issue}
                        </p>

                        {err.rule && (
                          <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] sm:text-xs text-[var(--text-secondary)]">
                            <strong className="text-[var(--text-primary)]">Grammar Rule: </strong>
                            {err.rule}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPREHENSIVE GRAMMAR HANDBOOK & GUIDES */}
      {activeTab === "guide" && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                placeholder="Search grammar topics or rules..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#6C63FF]"
              />
              <span className="absolute left-3 top-3 text-xs">🔍</span>
            </div>

            {/* Category Pills */}
            <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {guideCategories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedGuideCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedGuideCategory === cat
                      ? "bg-[#6C63FF] text-white shadow-sm"
                      : "bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Guide Modules List */}
          <div className="space-y-4">
            {filteredGuides.map((guide) => {
              const isExpanded = expandedGuideId === guide.id;
              return (
                <div
                  key={guide.id}
                  className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm overflow-hidden transition-all"
                >
                  {/* Guide Header */}
                  <button
                    onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] shrink-0">
                        {guide.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#6C63FF]/10 text-[#6C63FF] text-[10px] font-black uppercase">
                            {guide.level}
                          </span>
                          <span className="text-xs font-bold text-[var(--text-muted)] truncate">
                            {guide.category}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate mt-0.5">
                          {guide.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] font-medium truncate mt-0.5">
                          {guide.summary}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-[var(--text-muted)] shrink-0">
                      {isExpanded ? "▲ Collapse" : "▼ Learn"}
                    </span>
                  </button>

                  {/* Expanded Guide Rules Body */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-4">
                      {guide.rules.map((rule, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-black text-[#6C63FF]">
                              📌 {rule.name}
                            </h4>
                          </div>

                          {rule.formula && (
                            <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)] font-bold">
                              Formula: {rule.formula}
                            </div>
                          )}

                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                            {rule.usage}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-1">
                              <span className="text-[10px] font-black text-emerald-600 uppercase">✅ Correct Example:</span>
                              <p className="font-bold text-emerald-900 dark:text-emerald-200">{rule.correctExample}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs space-y-1">
                              <span className="text-[10px] font-black text-rose-600 uppercase">❌ Common Mistake:</span>
                              <p className="font-bold text-rose-900 dark:text-rose-200 line-through opacity-80">{rule.wrongExample}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE SENTENCE GRAMMAR QUIZZES */}
      {activeTab === "quiz" && (
        <div className="space-y-6">
          {!quizCompleted ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg space-y-6">
              {/* Progress & Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] text-[10px] font-black uppercase">
                      Daily Challenge: {currentQuizIndex + 1} of {dailyQuizzes.length}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      {activeQuiz.category}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                    Spot & Fix the Sentence Error
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[var(--text-muted)]">Current Score:</span>
                  <p className="text-base sm:text-lg font-black text-[#6C63FF]">
                    {quizScore} / {dailyQuizzes.length}
                  </p>
                </div>
              </div>

              {/* Problem Sentence Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm font-semibold space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Target Sentence with Problem:
                </span>
                <p className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100">
                  "{activeQuiz.sentenceWithProblem}"
                </p>
              </div>

              {/* Question */}
              <p className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                {activeQuiz.question}
              </p>

              {/* Options */}
              <div className="space-y-2.5">
                {activeQuiz.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === activeQuiz.correctAnswerIndex;
                  let optStyle = "bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-[#6C63FF]";

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold";
                    } else if (isSelected && !isCorrect) {
                      optStyle = "bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-100 line-through";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-[#6C63FF]/15 border-[#6C63FF] text-[#6C63FF] font-bold";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizAnswer(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && isCorrect && <span className="text-emerald-500 font-bold">✅ Correct</span>}
                      {isAnswerSubmitted && isSelected && !isCorrect && <span className="text-rose-500 font-bold">❌ Incorrect</span>}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon submission */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-xs sm:text-sm space-y-1 animate-in fade-in">
                  <span className="text-[10px] font-black uppercase text-[#6C63FF]">Rule Explanation:</span>
                  <p className="font-semibold text-indigo-950 dark:text-indigo-200">{activeQuiz.explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitQuizAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-3 rounded-2xl bg-[#6C63FF] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#5a52e0] disabled:opacity-40 transition-all"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#ff6584] text-white text-xs sm:text-sm font-black shadow-lg hover:opacity-90 transition-all"
                  >
                    {currentQuizIndex + 1 < dailyQuizzes.length ? "Next Question →" : "View Final Results 🏆"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed Results Card */
            <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl text-center space-y-6">
              <span className="text-5xl">🏆</span>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                  Grammar Quiz Completed!
                </h2>
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  You scored <strong className="text-[#6C63FF]">{quizScore} out of {dailyQuizzes.length}</strong>!
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                  <span>+75 XP Earned</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={handleRestartQuiz}
                  className="px-6 py-3 rounded-2xl bg-[#6C63FF] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#5a52e0] transition-all"
                >
                  🔄 Retake Today's 8 Quizzes
                </button>
                <button
                  onClick={handleLoadNewQuizBatch}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#ff6584] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-90 transition-all"
                >
                  ⚡ Load Next 8 New Quizzes
                </button>
                <button
                  onClick={() => setActiveTab("checker")}
                  className="px-6 py-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs sm:text-sm font-bold hover:bg-[var(--bg-elevated)] transition-all"
                >
                  🩺 Back to Grammar Doctor
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CHECK HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Recently Analyzed Sentences ({history.length})
            </h3>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-xs text-rose-500 font-semibold hover:underline"
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-muted)] text-xs sm:text-sm font-semibold">
              No previous grammar checks yet. Type a sentence in the AI Doctor tab!
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    item.isCorrect ? "bg-emerald-500/15 text-emerald-600" : "bg-indigo-500/15 text-[#6C63FF]"
                  }`}>
                    {item.isCorrect ? "100% Correct" : `Score: ${item.accuracyScore || 85}%`}
                  </span>

                  <button
                    onClick={() => speakFeedback(item)}
                    className="p-1.5 rounded-lg bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] text-xs"
                    title="Replay Audio"
                  >
                    🔊 Hear
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[var(--text-muted)] font-medium">Original: "{item.originalText}"</p>
                  <p className="text-sm font-extrabold text-[var(--text-primary)]">👉 "{item.correctedText}"</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default GrammarPractice;
