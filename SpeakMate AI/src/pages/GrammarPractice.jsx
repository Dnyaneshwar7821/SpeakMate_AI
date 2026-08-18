import { useState, useEffect } from "react";
import { grammarService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";
import { recordVocabularyMastered } from "../utils/progressTracker";

function performSmartGrammarCorrection(text) {
  if (!text || !text.trim()) return null;

  let corrected = text.trim();
  const corrections = [];

  const rules = [
    {
      regex: /\b(he|she|it|everyone|someone|nobody)\s+do\s+not\b/gi,
      replace: "$1 does not",
      rule: "Use 'does not' with third-person singular subjects (he, she, it, everyone).",
      category: "Subject-Verb Agreement",
    },
    {
      regex: /\b(he|she|it)\s+don't\b/gi,
      replace: "$1 doesn't",
      rule: "Use 'doesn't' with third-person singular subjects (he, she, it).",
      category: "Subject-Verb Agreement",
    },
    {
      regex: /\b(do|does|did|will|can|could|should|would|may|might|must)\s+not\s+(goes|went|eats|ate|walks|walked|played|plays)\b/gi,
      replace: (match, modal, verb) => {
        const baseMap = {
          goes: "go",
          went: "go",
          eats: "eat",
          ate: "eat",
          walks: "walk",
          walked: "walk",
          plays: "play",
          played: "play",
        };
        const base = baseMap[verb.toLowerCase()] || verb;
        return `${modal} not ${base}`;
      },
      rule: "After auxiliary/modal verbs with 'not', always use the base form of the verb.",
      category: "Auxiliary Verbs",
    },
    {
      regex: /\b(he|she|it)\s+(go|eat|walk|play|want|like|need)\b/gi,
      replace: (match, subj, verb) => {
        const thirdMap = {
          go: "goes",
          eat: "eats",
          walk: "walks",
          play: "plays",
          want: "wants",
          like: "likes",
          need: "needs",
        };
        return `${subj} ${thirdMap[verb.toLowerCase()] || verb + "s"}`;
      },
      rule: "In Simple Present tense, third-person singular subjects take verbs ending in -s or -es.",
      category: "Subject-Verb Agreement",
    },
    {
      regex: /\b(since)\s+(\d+\s+(?:days?|months?|years?|hours?|weeks?|minutes?))\b/gi,
      replace: "for $2",
      rule: "Use 'for' when referring to a duration of time (e.g. for 2 years). Use 'since' for a specific starting point.",
      category: "Prepositions of Time",
    },
    {
      regex: /\ba\s+([aeiou][a-z]+)\b/gi,
      replace: "an $1",
      rule: "Use 'an' before words that start with a vowel sound.",
      category: "Articles (A vs An)",
    },
    {
      regex: /\ban\s+([bcdfghjklmnpqrstvwxyz][a-z]+)\b/gi,
      replace: "a $1",
      rule: "Use 'a' before words that start with a consonant sound.",
      category: "Articles (A vs An)",
    },
    {
      regex: /\bdiscuss\s+about\b/gi,
      replace: "discuss",
      rule: "'Discuss' is a transitive verb meaning 'talk about'. Adding 'about' is redundant.",
      category: "Redundancy / Word Choice",
    },
  ];

  for (const r of rules) {
    if (typeof r.replace === "function") {
      const match = corrected.match(r.regex);
      if (match) {
        corrected = corrected.replace(r.regex, r.replace);
        corrections.push({ rule: r.rule, category: r.category });
      }
    } else {
      if (r.regex.test(corrected)) {
        corrected = corrected.replace(r.regex, r.replace);
        corrections.push({ rule: r.rule, category: r.category });
      }
    }
  }

  const isCorrect = corrected.trim().toLowerCase() === text.trim().toLowerCase();
  const accuracyScore = isCorrect ? 100 : Math.max(65, 100 - corrections.length * 15);

  return {
    isCorrect,
    accuracyScore,
    originalText: text,
    correctedText: corrected,
    corrections,
    explanation: isCorrect
      ? "Perfect grammar! Your sentence is syntactically accurate and natural."
      : `Found ${corrections.length} grammar improvements.`,
  };
}

const GRAMMAR_CHEAT_SHEETS = [
  {
    title: "Present Simple vs Continuous",
    category: "Verb Tenses",
    icon: "⏱️",
    rule: "Use Simple Present for habits/routines ('I drink coffee every morning'). Use Continuous for actions happening right now ('I am drinking coffee right now').",
    exampleGood: "She works at Google. / She is working on a new project today.",
    exampleBad: "She is work at Google.",
  },
  {
    title: "Since vs For (Time)",
    category: "Prepositions",
    icon: "📅",
    rule: "Use 'For' + duration (for 3 hours, for 5 years). Use 'Since' + starting point (since 9 AM, since Monday, since 2018).",
    exampleGood: "I have lived here for 4 years. / I have lived here since 2020.",
    exampleBad: "I have lived here since 4 years.",
  },
  {
    title: "A vs An (Articles)",
    category: "Articles",
    icon: "🔤",
    rule: "Use 'An' before vowel *sounds* (an hour, an honest man, an apple). Use 'A' before consonant sounds (a university, a European, a book).",
    exampleGood: "He is an honest person. / She attends a university.",
    exampleBad: "He is a honest person.",
  },
  {
    title: "Subject-Verb Agreement",
    category: "Syntax",
    icon: "⚖️",
    rule: "Singular third-person subjects (He, She, It, The student) take singular verbs (ends in -s). Plural subjects (They, We, Students) take base verbs.",
    exampleGood: "The teacher explains the lesson clearly.",
    exampleBad: "The teacher explain the lesson clearly.",
  },
];

const DAILY_GRAMMAR_QUIZ = [
  {
    id: 1,
    question: "Choose the correct sentence:",
    options: [
      "She don't like spicy food.",
      "She doesn't likes spicy food.",
      "She doesn't like spicy food.",
      "She isn't like spicy food.",
    ],
    correctIndex: 2,
    explanation: "With third person singular ('she'), use auxiliary 'does not / doesn't' followed by base verb 'like'.",
  },
  {
    id: 2,
    question: "Select the sentence with correct preposition:",
    options: [
      "I have been studying since two hours.",
      "I have been studying for two hours.",
      "I have been studying in two hours.",
      "I have been studying from two hours.",
    ],
    correctIndex: 1,
    explanation: "Use 'for' when referring to a duration of time (two hours).",
  },
  {
    id: 3,
    question: "Identify the grammatically correct option:",
    options: [
      "He did not went to the conference.",
      "He did not go to the conference.",
      "He did not goes to the conference.",
      "He was not go to the conference.",
    ],
    correctIndex: 1,
    explanation: "After auxiliary 'did not', always use the base form of the verb ('go').",
  },
  {
    id: 4,
    question: "Fill in the blank: 'We need to ______ this problem in detail.'",
    options: [
      "discuss about",
      "discuss on",
      "discuss",
      "discuss regarding",
    ],
    correctIndex: 2,
    explanation: "'Discuss' is a transitive verb meaning 'talk about'. Adding 'about' is redundant.",
  },
  {
    id: 5,
    question: "Choose the correct article: 'She has been waiting for ______ hour.'",
    options: ["a", "an", "the one", "no article"],
    correctIndex: 1,
    explanation: "'Hour' begins with a silent 'h' and a vowel sound /aʊər/, so it takes 'an'.",
  },
];

export function GrammarPractice() {
  const [activeTab, setActiveTab] = useState("checker"); // 'checker', 'quiz', 'rules', 'history'
  const [textInput, setTextInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    grammarService
      .history()
      .then((data) => {
        if (data && data.length > 0) setHistory(data);
      })
      .catch(() => {});
  }, []);

  const handleAnalyzeText = () => {
    if (!textInput.trim()) return;
    setAnalyzing(true);

    const localResult = performSmartGrammarCorrection(textInput);
    setAnalysisResult(localResult);
    setHistory((prev) => [localResult, ...prev]);

    grammarService
      .check({ text: textInput })
      .then((apiResult) => {
        if (apiResult && apiResult.correctedText) {
          setAnalysisResult(apiResult);
        }
      })
      .catch(() => {})
      .finally(() => {
        setAnalyzing(false);
        handleSpeakCorrection(localResult);
      });
  };

  const handleSpeakCorrection = (res) => {
    if (!res) return;
    setIsAiSpeaking(true);
    const speech = res.isCorrect
      ? "Great job! Your sentence is grammatically correct."
      : `Here is the corrected sentence: ${res.correctedText}.`;

    speakGlobalText(speech, 1.0, {
      onend: () => setIsAiSpeaking(false),
      onerror: () => setIsAiSpeaking(false),
    });
  };

  const handleSelectQuizOption = (questionId, optionIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    DAILY_GRAMMAR_QUIZ.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    recordVocabularyMastered(score * 15);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#312E81] text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 text-amber-300">
            ✨ AI Grammar Engine
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Grammar Doctor ✍️</h1>
          <p className="text-xs sm:text-sm font-medium text-indigo-100 max-w-xl leading-relaxed">
            Instant syntax correction, audio feedback, interactive quizzes, and CEFR rule cheat sheets.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("checker")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
              activeTab === "checker" ? "bg-white text-[#6C63FF] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            ⚡ Live Checker
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
              activeTab === "quiz" ? "bg-white text-[#6C63FF] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            🎯 Daily Quiz
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
              activeTab === "rules" ? "bg-white text-[#6C63FF] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            📚 Cheat Sheets
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
              activeTab === "history" ? "bg-white text-[#6C63FF] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            📜 History ({history.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CHECKER */}
      {activeTab === "checker" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-[var(--text-primary)]">
                  Enter English Sentence to Check
                </label>
                <span className="text-[10px] font-black text-[#6C63FF] px-3 py-1 rounded-full bg-[#6C63FF]/15">
                  AI Voice Feedback Active
                </span>
              </div>

              <textarea
                rows={5}
                placeholder="Type or paste any English sentence (e.g. 'She do not goes to school since two years and eats a apple')..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] leading-relaxed shadow-inner"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => setTextInput("she do not goes to school since two years and eats a apple.")}
                  className="text-xs font-black text-[#6C63FF] hover:underline text-left cursor-pointer"
                >
                  + Insert Sample Error Sentence
                </button>

                <button
                  onClick={handleAnalyzeText}
                  disabled={analyzing || !textInput.trim()}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-90 disabled:opacity-50 text-white font-black text-xs shadow-xl shadow-[#6C63FF]/25 transition-all cursor-pointer active:scale-95"
                >
                  {analyzing ? "Analyzing..." : "Check & Speak →"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            {analysisResult ? (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-xl p-2.5 rounded-2xl font-black ${analysisResult.isCorrect ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"}`}>
                      {analysisResult.accuracyScore}%
                    </span>
                    <div>
                      <h3 className="font-black text-sm text-[var(--text-primary)]">Grammar Accuracy</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">Evaluation Result</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeakCorrection(analysisResult)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-xs font-black hover:opacity-90 transition-all inline-flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                  >
                    🔊 Play Voice
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                    <span className="font-black text-rose-500 uppercase text-[10px]">Your Original Input</span>
                    <p className="font-semibold text-[var(--text-primary)]">"{analysisResult.originalText}"</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <span className="font-black text-emerald-500 uppercase text-[10px]">AI Corrected Phrasing</span>
                    <p className="font-black text-emerald-600 dark:text-emerald-300 text-sm">
                      "{analysisResult.correctedText}"
                    </p>
                  </div>

                  {analysisResult.corrections && analysisResult.corrections.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-3">
                      <span className="font-black text-[#6C63FF] uppercase text-[10px] tracking-wider">
                        Specific Improvements Applied:
                      </span>
                      <div className="space-y-2">
                        {analysisResult.corrections.map((c, i) => (
                          <div key={i} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-1">
                            <span className="font-black text-[#6C63FF] text-xs">
                              {i + 1}. [{c.category}]
                            </span>
                            <p className="text-xs text-[var(--text-secondary)] font-medium">
                              💡 Rule: {c.rule}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 rounded-3xl border border-[var(--border-default)] flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
                <span className="text-5xl">✍️</span>
                <h3 className="font-black text-sm text-[var(--text-primary)]">Ready for Grammar Evaluation</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm font-medium">
                  Enter your English sentence to see instant grammatical breakdown, corrections, and audio tutor playback.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DAILY QUIZ */}
      {activeTab === "quiz" && (
        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)]">Daily Grammar Challenge 🎯</h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                Answer all 5 questions to test your grammar mastery and earn +75 XP!
              </p>
            </div>
            {quizSubmitted && (
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 rounded-2xl bg-[#6C63FF]/15 text-[#6C63FF] font-black text-sm">
                  Score: {quizScore} / {DAILY_GRAMMAR_QUIZ.length}
                </span>
                <button
                  onClick={handleResetQuiz}
                  className="px-4 py-2 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-primary)] font-black text-xs border border-[var(--border-default)] cursor-pointer"
                >
                  🔄 Retake Quiz
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {DAILY_GRAMMAR_QUIZ.map((q, idx) => {
              const selectedOpt = quizAnswers[q.id];
              return (
                <div key={q.id} className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-md space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-sm text-[var(--text-primary)]">
                      {idx + 1}. {q.question}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-[#6C63FF]/50";
                      if (selectedOpt === optIdx) {
                        btnStyle = "bg-[#6C63FF] text-white border-[#6C63FF] shadow-md";
                      }
                      if (quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = "bg-emerald-500 text-white border-emerald-500 shadow-md";
                        } else if (selectedOpt === optIdx && optIdx !== q.correctIndex) {
                          btnStyle = "bg-rose-500 text-white border-rose-500";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectQuizOption(q.id, optIdx)}
                          className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] font-medium">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="text-center pt-4">
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length < DAILY_GRAMMAR_QUIZ.length}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white font-black text-xs shadow-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
              >
                Submit Answers & Check Score →
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CHEAT SHEETS */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GRAMMAR_CHEAT_SHEETS.map((sheet, i) => (
            <div key={i} className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2.5 rounded-2xl bg-[var(--bg-elevated)]">{sheet.icon}</span>
                <span className="px-3 py-1 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] text-[10px] font-black uppercase tracking-wider">
                  {sheet.category}
                </span>
              </div>

              <div>
                <h3 className="font-black text-base text-[var(--text-primary)]">{sheet.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                  {sheet.rule}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border-default)]">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Correct Example:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">✓ {sheet.exampleGood}</p>
                </div>

                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
                  <span className="text-[10px] font-black text-rose-500 uppercase">Common Mistake:</span>
                  <p className="font-bold text-rose-600 dark:text-rose-400">✗ {sheet.exampleBad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: PAST CHECKS HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-[var(--text-primary)]">Past Grammar Evaluations</h2>
          {history.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card border border-[var(--border-default)] text-center text-xs text-[var(--text-secondary)] font-medium">
              No saved checks yet. Use the Live Checker to evaluate your first sentence!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((h, idx) => (
                <div key={idx} className="glass-card p-6 rounded-3xl border border-[var(--border-default)] shadow-md space-y-3">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-emerald-500">Score: {h.accuracyScore || 90}%</span>
                    <button
                      onClick={() => handleSpeakCorrection(h)}
                      className="text-[#6C63FF] hover:underline cursor-pointer font-bold"
                    >
                      🔊 Listen Voice
                    </button>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-rose-500 line-through opacity-80">"{h.originalText}"</p>
                    <p className="text-emerald-500 font-bold">"{h.correctedText}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GrammarPractice;
