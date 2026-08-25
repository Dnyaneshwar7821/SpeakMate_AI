import { useState, useEffect, useCallback } from "react";
import { grammarService } from "../services/appServices";
import { speakGlobalText, speakGlobalSequential } from "../utils/speechHelper";
import { recordQuizCompleted } from "../utils/progressTracker";
import {
  analyzeSentenceGrammarLocally,
  EXTENSIVE_GRAMMAR_GUIDE,
  getTailoredDailyGrammarQuizzes,
  playWebAudioChime,
  parseBackendGrammarExplanation,
  generateSpokenGrammarSegments,
} from "../utils/grammarEngine";

export function GrammarPractice() {
  const [activeTab, setActiveTab] = useState("checker"); // 'checker', 'guide', 'quiz', 'history'
  const [textInput, setTextInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Automatically read user profile / onboarding attributes (No manual selection needed)
  const accountType = (() => {
    try {
      const stored = localStorage.getItem("speakmate_account_type");
      return stored === "STUDENT" ? "STUDENT" : "INDIVIDUAL";
    } catch {
      return "INDIVIDUAL";
    }
  })();

  const selectedGrade = (() => {
    try {
      return localStorage.getItem("speakmate_user_grade") || localStorage.getItem("speakmate_school_grade") || "8th Std";
    } catch {
      return "8th Std";
    }
  })();

  const selectedAgeGroup = (() => {
    try {
      return localStorage.getItem("speakmate_age_group") || "Professional";
    } catch {
      return "Professional";
    }
  })();

  // Handbook search & filter
  const [guideSearch, setGuideSearch] = useState("");
  const [selectedGuideCategory, setSelectedGuideCategory] = useState("ALL");
  const [expandedGuideId, setExpandedGuideId] = useState(EXTENSIVE_GRAMMAR_GUIDE[0]?.id || null);

  // Daily Sentence Quiz State (Tailored by standard/age and rotated daily)
  const [quizOffset, setQuizOffset] = useState(0);
  const [dailyQuizzes, setDailyQuizzes] = useState(() =>
    getTailoredDailyGrammarQuizzes({
      userType: accountType,
      targetGrade: selectedGrade,
      ageGroup: selectedAgeGroup,
      customDate: new Date(),
      offset: 0,
    })
  );
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const reloadQuizzes = useCallback((offset = 0) => {
    const fresh = getTailoredDailyGrammarQuizzes({
      userType: accountType,
      targetGrade: selectedGrade,
      ageGroup: selectedAgeGroup,
      customDate: new Date(),
      offset,
    });
    setDailyQuizzes(fresh);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizCompleted(false);
  }, [accountType, selectedGrade, selectedAgeGroup]);

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
      const backendRes = await grammarService.check(cleanText).catch(() => null);

      if (backendRes && backendRes.correctedText) {
        const structuredErrors = parseBackendGrammarExplanation(
          backendRes.explanation,
          backendRes.correctedText,
          localResult.errors
        );

        const normOrig = cleanText.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const normCorr = backendRes.correctedText.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const backendNoChange = normOrig === normCorr;

        // If local engine detected concrete grammar errors but backend returned no change or praise, prefer local fix
        const effectiveErrors = (localResult.errors.length > 0 && backendNoChange)
          ? localResult.errors
          : (structuredErrors.length > 0 ? structuredErrors : (backendNoChange ? [] : localResult.errors));

        const effectiveCorrected = (localResult.errors.length > 0 && backendNoChange && localResult.correctedText)
          ? localResult.correctedText
          : backendRes.correctedText;

        const effectiveNormCorr = effectiveCorrected.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const isCorrect = effectiveErrors.length === 0 && normOrig === effectiveNormCorr;

        const mergedResult = {
          id: backendRes.id || Date.now(),
          isCorrect,
          accuracyScore: isCorrect ? 100 : Math.min(localResult.errors.length > 0 ? localResult.accuracyScore : (backendRes.grammarScore || 70), 85),
          originalText: cleanText,
          correctedText: effectiveCorrected,
          nativeAlternative: localResult.nativeAlternative,
          errors: effectiveErrors,
          explanation: isCorrect ? "Your sentence is 100% grammatically correct!" : (localResult.errors.length > 0 && backendNoChange ? localResult.explanation : (backendRes.explanation || localResult.explanation)),
          praiseMessage: isCorrect ? "🌟 Perfect English Grammar! Your sentence is 100% accurate, natural, and well-structured." : "",
          createdAt: backendRes.createdAt || new Date().toISOString(),
        };

        setAnalysisResult(mergedResult);
        speakFeedback(mergedResult);

        // Update history
        setHistory((prev) => [mergedResult, ...prev.filter((h) => h.id !== mergedResult.id)]);
      } else {
        speakFeedback(localResult);
      }
    } catch {
      speakFeedback(localResult);
    } finally {
      setAnalyzing(false);
    }
  };

  const speakFeedback = async (res) => {
    if (!res) return;
    setIsAiSpeaking(true);

    const segments = generateSpokenGrammarSegments(res);
    await speakGlobalSequential(segments, 1.0, 400);
    setIsAiSpeaking(false);
  };

  // Daily Quiz Handling
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
      recordQuizCompleted("grammar", quizScore, dailyQuizzes.length);
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
    reloadQuizzes(nextOffset);
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
    { label: "🔮 Subjunctive Clause", text: "If I was you, I would have accepted the job offer." },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">✍️</span>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Grammar Doctor & Quiz Mastery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            AI sentence analysis, itemized mistake breakdowns, CEFR handbook, and user-tailored quizzes.
          </p>
        </div>

        {/* 4 Interactive Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)]">
          <button
            onClick={() => setActiveTab("checker")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "checker"
                ? "bg-[#6C63FF] text-white shadow-md"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>🩺</span>
            <span>AI Doctor</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "guide"
                ? "bg-[#6C63FF] text-white shadow-md"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>📖</span>
            <span>Handbook</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "quiz"
                ? "bg-[#6C63FF] text-white shadow-md"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>🏆</span>
            <span>Daily Quizzes</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "history"
                ? "bg-[#6C63FF] text-white shadow-md"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>🕒</span>
            <span>History</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI GRAMMAR DOCTOR */}
      {activeTab === "checker" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center justify-between">
                <span>Enter Any Sentence to Inspect Grammar:</span>
                <span className="text-xs font-medium text-[var(--text-muted)] lowercase">
                  (Big, small, complex sentences)
                </span>
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. She don't goes to school yesterday and discuss about exam."
                rows={3}
                className="w-full p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all resize-none font-medium"
              />
            </div>

            {/* Quick Test Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                ⚡ Try Sample Sentence Errors:
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePracticeSentences.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTextInput(sample.text);
                      handleAnalyzeText(sample.text);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] hover:border-[#6C63FF] hover:text-[#6C63FF] transition-all"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => handleAnalyzeText()}
                disabled={analyzing || !textInput.trim()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#ff6584] text-white text-sm font-black shadow-lg hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Analyzing All Rules...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Check Grammar & Accuracy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RESULTS DISPLAY: ORDERED PROMINENTLY */}
          {analysisResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg space-y-6 animate-in slide-in-from-bottom-2">
              {/* 1. TOP STATUS & SCORE BAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    analysisResult.isCorrect
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-indigo-500/15 text-[#6C63FF]"
                  }`}>
                    {analysisResult.isCorrect ? "✅ 100% Grammatically Correct" : "🌟 Corrected Sentence"}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    Accuracy Score: <strong className="text-[var(--text-primary)]">{analysisResult.accuracyScore}%</strong>
                  </span>
                </div>

                <button
                  onClick={() => speakFeedback(analysisResult)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isAiSpeaking
                      ? "bg-indigo-500/20 text-[#6C63FF] animate-pulse"
                      : "bg-[#6C63FF] text-white hover:bg-[#5a52e0] shadow-sm"
                  }`}
                >
                  <span>🔊</span>
                  <span>{isAiSpeaking ? "Speaking..." : "Hear Audio Feedback"}</span>
                </button>
              </div>

              {/* 2. CORRECTED SENTENCE PROMINENT DISPLAY (FIRST) */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                  {analysisResult.isCorrect ? "Your Sentence (100% Correct):" : "Corrected English Sentence:"}
                </span>
                <div className={`p-4 sm:p-5 rounded-2xl border text-sm sm:text-base font-bold transition-all ${
                  analysisResult.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                    : "bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-100"
                }`}>
                  "{analysisResult.correctedText}"
                </div>
              </div>

              {/* Praise message if perfect */}
              {analysisResult.isCorrect && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  <span className="text-xl">🎉</span>
                  <span>{analysisResult.praiseMessage || "Given sentence is correct with no grammar mistakes!"}</span>
                </div>
              )}

              {/* Native Upgrade Alternative */}
              {analysisResult.nativeAlternative && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs sm:text-sm">
                  <span className="text-base">💡</span>
                  <div>
                    <span className="font-extrabold text-[#6C63FF]">Native Natural Phrasing: </span>
                    <span className="font-semibold text-[var(--text-primary)]">"{analysisResult.nativeAlternative}"</span>
                  </div>
                </div>
              )}

              {/* 3. ITEMIZED MISTAKES BREAKDOWN (WHEN ERRORS EXIST) */}
              {!analysisResult.isCorrect && analysisResult.errors && analysisResult.errors.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                    <span>🔍 Identified Mistakes & Rules</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-black">
                      {analysisResult.errors.length}
                    </span>
                  </h3>

                  <div className="grid gap-3">
                    {analysisResult.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] space-y-2 hover:border-[#6C63FF]/40 transition-all"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-[#6C63FF]/10 text-[#6C63FF] text-[10px] font-black uppercase">
                            {err.type || "Grammar Rule"}
                          </span>
                          {err.errorSnippet &&
                            err.errorSnippet.length <= 25 &&
                            !err.errorSnippet.includes("[") &&
                            !err.errorSnippet.toLowerCase().includes("missing") && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-xs font-bold line-through">
                                "{err.errorSnippet}"
                              </span>
                            )}
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                          👉 {err.issue}
                        </p>

                        {err.rule && (
                          <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                            <strong className="text-[#6C63FF]">Rule Insight: </strong>
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

      {/* TAB 2: COMPREHENSIVE GRAMMAR HANDBOOK */}
      {activeTab === "guide" && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <input
              type="text"
              value={guideSearch}
              onChange={(e) => setGuideSearch(e.target.value)}
              placeholder="🔍 Search grammar rules, tenses, conditionals..."
              className="w-full sm:w-80 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF]"
            />

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {guideCategories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedGuideCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedGuideCategory === cat
                      ? "bg-[#6C63FF] text-white shadow-sm"
                      : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Handbook Track Cards */}
          <div className="grid gap-4">
            {filteredGuides.map((guide) => {
              const isExpanded = expandedGuideId === guide.id;
              return (
                <div
                  key={guide.id}
                  className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-[var(--bg-base)]/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl sm:text-4xl">{guide.icon}</span>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-[#6C63FF] tracking-wider">
                          {guide.level} • {guide.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                          {guide.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] font-medium">
                          {guide.summary}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg text-[var(--text-muted)] font-bold">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]/30 space-y-4 animate-in fade-in">
                      {guide.rules.map((rule, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs sm:text-sm font-extrabold text-[#6C63FF]">
                              📌 {rule.name}
                            </h4>
                            {rule.formula && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#6C63FF]/10 text-[#6C63FF]">
                                {rule.formula}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[var(--text-secondary)] font-medium">
                            {rule.usage}
                          </p>

                          <div className="grid sm:grid-cols-2 gap-2 pt-1 text-xs font-semibold">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
                              <span className="font-bold">✅ Correct: </span>"{rule.correctExample}"
                            </div>
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 line-through">
                              <span className="font-bold">❌ Common Mistake: </span>"{rule.wrongExample}"
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

      {/* TAB 3: USER-TAILORED DAILY GRAMMAR QUIZZES */}
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
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black">
                      {activeQuiz.formatBadge || "✏️ Quiz Challenge"}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      {activeQuiz.category}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                    {activeQuiz.targetAudience === "STUDENT" ? `Class ${selectedGrade} Grammar Challenge` : "Mastery English Practice"}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[var(--text-muted)]">Current Score:</span>
                  <p className="text-base sm:text-lg font-black text-[#6C63FF]">
                    {quizScore} / {dailyQuizzes.length}
                  </p>
                </div>
              </div>

              {/* Target Prompt / Sentence Box */}
              {activeQuiz.promptSentence && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm font-semibold space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Given Sentence:
                  </span>
                  <p className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100">
                    {activeQuiz.promptSentence}
                  </p>
                </div>
              )}

              {/* Question Text */}
              <p className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                {activeQuiz.question}
              </p>

              {/* Options List */}
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
                    className="px-6 py-3 rounded-2xl bg-[#6C63FF] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#5a52e0] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#ff6584] text-white text-xs sm:text-sm font-black shadow-lg hover:opacity-90 transition-all cursor-pointer"
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
                  className="px-6 py-3 rounded-2xl bg-[#6C63FF] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#5a52e0] transition-all cursor-pointer"
                >
                  🔄 Retake Today's 8 Quizzes
                </button>
                <button
                  onClick={handleLoadNewQuizBatch}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#ff6584] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
                >
                  ⚡ Load Next 8 New Quizzes
                </button>
                <button
                  onClick={() => setActiveTab("checker")}
                  className="px-6 py-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs sm:text-sm font-bold hover:bg-[var(--bg-elevated)] transition-all cursor-pointer"
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
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    👉 {item.correctedText}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Original: "{item.originalText}"
                  </p>
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
