import { useState, useEffect } from "react";
import { grammarService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";
import { recordVocabularyMastered } from "../utils/progressTracker";

function performSmartGrammarCorrection(text) {
  let corrected = text;
  const corrections = [];

  // Rule 1: Subject-Verb Agreement
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
      rule: "Third-person singular (he, she, it) requires verbs ending in '-s' or '-es'.",
    });
  }

  // Rule 2: Preposition of Duration ('since' vs 'for')
  if (/\b(since)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|several|a few)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/i.test(corrected)) {
    corrected = corrected.replace(/\b(since)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|several|a few)\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/gi, "for $2 $3");
    corrections.push({
      category: "Prepositions",
      rule: "Use 'for' for duration of time (e.g., for 2 years), and 'since' for a starting point.",
    });
  }

  // Rule 3: Continuous Tense Auxiliaries
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
      category: "Verb Tenses",
      rule: "Auxiliary verbs (am/is/are/was/were) must be followed by present participle verbs ending in '-ing'.",
    });
  }

  // Rule 4: Past Tense Auxiliaries
  if (/\b(didn't|did not)\s+(went|saw|came|ate|took|wrote|drank)\b/i.test(corrected)) {
    corrected = corrected
      .replace(/\b(didn't|did not)\s+went\b/gi, "$1 go")
      .replace(/\b(didn't|did not)\s+saw\b/gi, "$1 see")
      .replace(/\b(didn't|did not)\s+came\b/gi, "$1 come")
      .replace(/\b(didn't|did not)\s+ate\b/gi, "$1 eat")
      .replace(/\b(didn't|did not)\s+took\b/gi, "$1 take")
      .replace(/\b(didn't|did not)\s+wrote\b/gi, "$1 write")
      .replace(/\b(didn't|did not)\s+drank\b/gi, "$1 drink");
    corrections.push({
      category: "Verb Forms",
      rule: "After 'did' or 'didn't', always use the base form of the verb.",
    });
  }

  // Rule 5: Indefinite Articles
  if (/\ba\s+(apple|orange|egg|umbrella|hour|honest|elephant|idea|avocado|airplane)\b/i.test(corrected)) {
    corrected = corrected.replace(/\ba\s+(apple|orange|egg|umbrella|hour|honest|elephant|idea|avocado|airplane)\b/gi, "an $1");
    corrections.push({
      category: "Articles",
      rule: "Use 'an' before words starting with vowel sounds.",
    });
  }

  // Rule 6: Redundancy
  if (/\bdiscuss\s+about\b/i.test(corrected)) {
    corrected = corrected.replace(/\bdiscuss\s+about\b/gi, "discuss");
    corrections.push({
      category: "Redundancy",
      rule: "'Discuss' already means 'talk about', so 'about' is redundant.",
    });
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

    speakGlobalText(speech, {
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 p-4 sm:p-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#4f46e5] to-[#312e81] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Smart Grammar Engine ✍️</h1>
          <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">
            Instant syntax correction, audio feedback, interactive quizzes, and CEFR rule cheat sheets.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/20 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("checker")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "checker" ? "bg-white text-[#6c63ff] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            ⚡ Live Checker
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "quiz" ? "bg-white text-[#6c63ff] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            🎯 Daily Quiz
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "rules" ? "bg-white text-[#6c63ff] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            📚 Cheat Sheets
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "history" ? "bg-white text-[#6c63ff] shadow-md" : "text-white/80 hover:text-white"
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
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-[var(--text-primary)]">
                  Enter English Sentence to Check
                </label>
                <span className="text-xs font-black text-[#6c63ff] px-3 py-1 rounded-full bg-[#6c63ff]/15">
                  AI Voice Feedback Active
                </span>
              </div>

              <textarea
                rows={5}
                placeholder="Type or paste any English sentence (e.g. 'She do not goes to school since two years and eats a apple')..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => setTextInput("she do not goes to school since two years and eats a apple.")}
                  className="text-xs font-black text-[#6c63ff] hover:underline text-left cursor-pointer"
                >
                  + Insert Sample Error Sentence
                </button>

                <button
                  onClick={handleAnalyzeText}
                  disabled={analyzing || !textInput.trim()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 disabled:opacity-50 text-white font-black text-xs shadow-xl transition-all cursor-pointer"
                >
                  {analyzing ? "Analyzing..." : "Check & Speak →"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            {analysisResult ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
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
                    className="px-4 py-2 rounded-2xl bg-[#6c63ff] text-white text-xs font-black hover:bg-[#8b85ff] transition-all inline-flex items-center gap-1.5 shadow-md cursor-pointer"
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
                      <span className="font-black text-[#6c63ff] uppercase text-[10px] tracking-wider">
                        Specific Improvements Applied:
                      </span>
                      <div className="space-y-2">
                        {analysisResult.corrections.map((c, i) => (
                          <div key={i} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                            <span className="font-black text-[#6c63ff] text-xs">
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
              <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
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
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)]">Daily Grammar Challenge 🎯</h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                Answer all 5 questions to test your grammar mastery and earn +75 XP!
              </p>
            </div>
            {quizSubmitted && (
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 rounded-2xl bg-[#6c63ff]/15 text-[#6c63ff] font-black text-sm">
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
                <div key={q.id} className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-sm text-[var(--text-primary)]">
                      {idx + 1}. {q.question}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]";
                      if (selectedOpt === optIdx) {
                        btnStyle = "bg-[#6c63ff] text-white border-[#6c63ff] shadow-md";
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
                          className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-medium">
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
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white font-black text-xs shadow-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
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
            <div key={i} className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{sheet.icon}</span>
                <span className="px-3 py-1 rounded-full bg-[#6c63ff]/15 text-[#6c63ff] text-[10px] font-black uppercase tracking-wider">
                  {sheet.category}
                </span>
              </div>

              <div>
                <h3 className="font-black text-base text-[var(--text-primary)]">{sheet.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                  {sheet.rule}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Correct Example:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">✓ {sheet.exampleGood}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
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
            <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-center text-xs text-[var(--text-secondary)] font-medium">
              No saved checks yet. Use the Live Checker to evaluate your first sentence!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((h, idx) => (
                <div key={idx} className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md space-y-3">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-emerald-500">Score: {h.accuracyScore || 90}%</span>
                    <button
                      onClick={() => handleSpeakCorrection(h)}
                      className="text-[#6c63ff] hover:underline cursor-pointer"
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
