import { useState, useEffect } from "react";
import { grammarService } from "../services/appServices";

const GRAMMAR_TOPICS = [
  {
    id: "tenses",
    title: "English Tenses",
    description: "Learn Present, Past, and Future tenses and their aspects.",
    explanations: "Tenses express the time of an action. Simple Present is for habits, Present Continuous is for actions happening now, Past Simple is for completed past actions, and Future is for upcoming events.",
    examples: [
      { original: "She go to school yesterday.", corrected: "She went to school yesterday.", rule: 'Use Past Simple form of "go" (went) for completed past actions.' },
      { original: "I am playing tennis every Tuesday.", corrected: "I play tennis every Tuesday.", rule: "Use Simple Present instead of Present Continuous for recurring habits." }
    ],
    quiz: [
      { question: "Identify the correct sentence:", options: ["He has gone to Paris yesterday.", "He went to Paris yesterday.", "He goes to Paris yesterday.", "He was go to Paris yesterday."], correct: "He went to Paris yesterday." },
      { question: 'Complete: "I _______ English for three years now."', options: ["am study", "studied", "have been studying", "studies"], correct: "have been studying" }
    ]
  },
  {
    id: "prepositions",
    title: "Prepositions of Place & Time",
    description: 'Master when to use "in", "on", "at", "by", etc.',
    explanations: 'Use "at" for specific times and points. Use "on" for days/dates and surfaces. Use "in" for months/years, enclosed spaces, and general periods of time.',
    examples: [
      { original: "Meet me on 9:00 PM.", corrected: "Meet me at 9:00 PM.", rule: 'Use "at" for specific clock times.' },
      { original: "I am in the bus.", corrected: "I am on the bus.", rule: 'Use "on" for public transport vehicles like buses, trains, and planes.' }
    ],
    quiz: [
      { question: 'What is the correct preposition: "He graduated ____ 2021."', options: ["at", "on", "in", "by"], correct: "in" },
      { question: 'Complete: "The keys are lying _______ the kitchen table."', options: ["in", "at", "on", "underneath of"], correct: "on" }
    ]
  },
  {
    id: "passive-voice",
    title: "Active vs. Passive Voice",
    description: "Understand focus shifts between subject and action object.",
    explanations: "Use Active Voice when the subject performs the action. Use Passive Voice (Form: to be + past participle) when the object of the action is the main focus or the actor is unknown.",
    examples: [
      { original: "The cake baked by my mom.", corrected: "The cake was baked by my mom.", rule: 'Passive voice needs a form of "to be" (was/is/has been) before the past participle.' }
    ],
    quiz: [
      { question: 'Change to passive: "The chef cooked the food."', options: ["The food is cooked by the chef.", "The food cooked by the chef.", "The food was cooked by the chef.", "The chef was cooked by the food."], correct: "The food was cooked by the chef." }
    ]
  }
];

export function GrammarPractice() {
  const [activeTab, setActiveTab] = useState("checker"); // 'checker' or 'topics'
  const [inputText, setInputText] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Topic Quiz Modal State
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Load History on Mount
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await grammarService.history();
      setHistory(data || []);
    } catch (e) {
      console.warn("Failed to load grammar history", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSpeak = (txt) => {
    if (!txt || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(txt.replace(/[\*\_]/g, ""));
    utterance.rate = 1.0;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleCheckGrammar = async () => {
    if (!inputText.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const res = await grammarService.check(inputText.trim());
      setResult(res);
      setInputText("");
      await loadHistory();

      // Read out feedback automatically
      if (res) {
        const speechText = res.grammarScore >= 100
          ? `Your sentence is grammatically correct! ${res.explanation || ""}`
          : `Corrected sentence: ${res.correctedText}. ${res.explanation ? "Grammar explanation: " + res.explanation : ""}`;
        handleSpeak(speechText);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await grammarService.remove(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (result?.id === id) setResult(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Quiz Modal Handlers
  const startTopicQuiz = (topic) => {
    setSelectedTopic(topic);
    setQuizMode(true);
    setCurrentQuestionIndex(0);
    setSelectedQuizAnswer(null);
    setQuizScore(0);
    setQuizComplete(false);
  };

  const handleAnswerSelect = (opt) => {
    if (selectedQuizAnswer !== null) return;
    setSelectedQuizAnswer(opt);
    if (opt === selectedTopic.quiz[currentQuestionIndex].correct) {
      setQuizScore((s) => s + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizAnswer(null);
    if (currentQuestionIndex < selectedTopic.quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizComplete(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Grammar Coach & Guide</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Instant real-time grammar analysis, error explanations, and interactive rule mastery guides.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] max-w-sm">
        <button
          onClick={() => setActiveTab("checker")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "checker" ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <span>🛡️ AI Checker</span>
        </button>
        <button
          onClick={() => setActiveTab("topics")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "topics" ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <span>📖 Grammar Guide</span>
        </button>
      </div>

      {/* TAB 1: AI GRAMMAR CHECKER */}
      {activeTab === "checker" && (
        <div className="space-y-6">
          {/* Text Input Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Analyze English Sentences</h2>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your English text here..."
              className="w-full p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
            />
            <div className="flex justify-end">
              <button
                onClick={handleCheckGrammar}
                disabled={checking || !inputText.trim()}
                className="px-6 py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#8b85ff] disabled:opacity-50 text-white text-xs font-extrabold shadow-lg shadow-[#6c63ff]/20"
              >
                {checking ? "Analyzing..." : "Analyze & Correct"}
              </button>
            </div>
          </div>

          {/* Analysis Feedback Card */}
          {result && (
            <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border-2 border-[#6c63ff]/30 shadow-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">Analysis Feedback</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleSpeak(
                        result.grammarScore >= 100
                          ? `Your sentence is grammatically correct! ${result.explanation || ""}`
                          : `Corrected sentence: ${result.correctedText}. ${result.explanation || ""}`
                      )
                    }
                    className="px-3 py-1 rounded-xl bg-[#6c63ff]/10 text-[#6c63ff] text-xs font-bold hover:bg-[#6c63ff]/20"
                  >
                    🔊 Listen
                  </button>
                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${result.grammarScore >= 80 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {Math.round(result.grammarScore || 100)}% Accuracy
                  </span>
                </div>
              </div>

              {result.grammarScore >= 100 ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 space-y-1">
                  <p className="uppercase tracking-wider text-[10px]">Your Sentence (Perfect Grammar!)</p>
                  <p className="text-sm">✅ {result.originalText}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 space-y-1">
                    <p className="uppercase tracking-wider text-[10px]">Original Sentence</p>
                    <p className="text-sm">❌ {result.originalText}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 space-y-1">
                    <p className="uppercase tracking-wider text-[10px]">AI Corrected Sentence</p>
                    <p className="text-sm">✅ {result.correctedText}</p>
                  </div>
                </div>
              )}

              {result.explanation && (
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs space-y-1">
                  <p className="font-extrabold text-[#6c63ff] uppercase tracking-wider text-[10px]">💡 Grammar Rule & Explanation</p>
                  <p className="font-semibold text-[var(--text-primary)] leading-relaxed">{result.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* History Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Recent Analysis History</h3>
            {loadingHistory ? (
              <p className="text-xs font-bold text-[var(--text-secondary)]">Loading history...</p>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-default)]">
                No previous grammar analysis entries yet.
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setResult(item)}
                    className={`p-4 rounded-2xl bg-[var(--bg-surface)] border shadow-sm cursor-pointer hover:border-[#6c63ff] transition-all flex items-center justify-between gap-4 ${
                      result?.id === item.id ? "border-[#6c63ff] ring-1 ring-[#6c63ff]" : "border-[var(--border-default)]"
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden">
                      <p className="font-extrabold text-xs text-[var(--text-primary)] truncate">✅ {item.correctedText}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-semibold truncate">Original: {item.originalText}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-extrabold text-[#6c63ff]">Score: {item.grammarScore || 100}%</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item.id);
                        }}
                        className="text-red-500 text-xs font-bold hover:underline"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GRAMMAR TOPICS GUIDE */}
      {activeTab === "topics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {GRAMMAR_TOPICS.map((topic) => (
            <div key={topic.id} className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">{topic.title}</h3>
                  <span className="text-xs">📖</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-semibold">{topic.description}</p>

                <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                  <p className="text-[10px] font-extrabold uppercase text-[#6c63ff]">Core Concept</p>
                  <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">{topic.explanations}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)]">Examples</p>
                  {topic.examples.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs space-y-1">
                      <p className="text-red-500 font-bold line-through">❌ {ex.original}</p>
                      <p className="text-emerald-500 font-extrabold">✅ {ex.corrected}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] italic">{ex.rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => startTopicQuiz(topic)}
                className="w-full py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
              >
                <span>Practice Topic Quiz</span>
                <span>▶</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Topic Quiz Modal */}
      {quizMode && selectedTopic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">{selectedTopic.title} Quiz</h3>
              <button onClick={() => setQuizMode(false)} className="text-xs font-bold text-[var(--text-secondary)]">
                ✕
              </button>
            </div>

            {!quizComplete ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                  Question {currentQuestionIndex + 1} of {selectedTopic.quiz.length}
                </p>
                <p className="text-sm font-extrabold text-[var(--text-primary)]">
                  {selectedTopic.quiz[currentQuestionIndex].question}
                </p>

                <div className="space-y-2">
                  {selectedTopic.quiz[currentQuestionIndex].options.map((opt, idx) => {
                    const isSelected = selectedQuizAnswer === opt;
                    const isCorrect = opt === selectedTopic.quiz[currentQuestionIndex].correct;

                    let btnStyle = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]";
                    if (selectedQuizAnswer !== null) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-500 font-extrabold";
                      } else if (isSelected) {
                        btnStyle = "bg-red-500/10 border-red-500 text-red-500 font-extrabold";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedQuizAnswer !== null}
                        onClick={() => handleAnswerSelect(opt)}
                        className={`w-full p-4 rounded-2xl text-xs font-bold text-left border transition-all ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedQuizAnswer !== null && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuizQuestion}
                      className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold"
                    >
                      {currentQuestionIndex === selectedTopic.quiz.length - 1 ? "Finish" : "Next →"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4 py-4">
                <span className="text-4xl">🏅</span>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Quiz Complete!</h3>
                <p className="text-xs text-[var(--text-secondary)] font-semibold">
                  You scored {quizScore} out of {selectedTopic.quiz.length}
                </p>
                <p className="text-xs font-extrabold text-amber-500">+15 XP Earned 🎉</p>
                <button
                  onClick={() => setQuizMode(false)}
                  className="w-full py-3 rounded-2xl bg-[#6c63ff] text-white text-xs font-extrabold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GrammarPractice;
