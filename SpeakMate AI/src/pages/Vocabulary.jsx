import { useState, useEffect } from "react";
import { vocabularyService, progressService } from "../services/appServices";

export function Vocabulary() {
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'flashcards', 'quiz'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordInput, setWordInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'favorites'

  // Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const loadVocabulary = async () => {
    setLoading(true);
    try {
      const data = await vocabularyService.all();
      setItems(data || []);
    } catch (e) {
      setItems([
        { id: "1", word: "Eloquent", meaning: "Fluent or persuasive in speaking or writing.", exampleSentence: "His eloquent speech captivated everyone.", favorite: true, synonym: "Articulate", antonym: "Inarticulate" },
        { id: "2", word: "Resilient", meaning: "Able to withstand or recover quickly from difficult conditions.", exampleSentence: "She showed resilient spirit during challenges.", favorite: false, synonym: "Tough", antonym: "Fragile" },
        { id: "3", word: "Coherent", meaning: "Logical and consistent in thought or expression.", exampleSentence: "Make sure your argument remains coherent.", favorite: true, synonym: "Logical", antonym: "Confused" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVocabulary();
  }, []);

  const handleSpeak = (text) => {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleAddWord = async () => {
    if (!wordInput.trim()) return;
    setAdding(true);
    try {
      await vocabularyService.add(wordInput.trim());
      setWordInput("");
      await loadVocabulary();
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleFavorite = async (item) => {
    try {
      const updated = await vocabularyService.toggleFavorite(item.id);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, favorite: updated.favorite } : i))
      );
    } catch (e) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, favorite: !i.favorite } : i))
      );
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      await vocabularyService.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // Filtered Vocabulary Items
  const filteredItems = items.filter((i) => {
    const matchesSearch =
      i.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.meaning && i.meaning.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === "all" || (filterType === "favorites" && i.favorite);
    return matchesSearch && matchesFilter;
  });

  // Start Quiz Engine
  const startQuiz = async () => {
    setQuizLoading(true);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuizIdx(0);
    setSelectedQuizAnswer(null);
    setEarnedXP(0);
    setActiveTab("quiz");

    try {
      const questions = await vocabularyService.quiz();
      if (questions && questions.length > 0) {
        setQuizQuestions(questions);
      } else {
        setQuizQuestions(fallbackQuizQuestions);
      }
    } catch (e) {
      setQuizQuestions(fallbackQuizQuestions);
    } finally {
      setQuizLoading(false);
    }
  };

  const fallbackQuizQuestions = [
    { word: "Eloquent", options: ["Fluent or persuasive in speaking", "Difficult to understand", "Quiet and reserved"], correctAnswer: "Fluent or persuasive in speaking" },
    { word: "Resilient", options: ["Able to recover quickly from difficulty", "Fragile and easily broken", "Loud and noisy"], correctAnswer: "Able to recover quickly from difficulty" },
    { word: "Coherent", options: ["Logical and consistent in thought", "Confusing and random", "Slow and inactive"], correctAnswer: "Logical and consistent in thought" },
  ];

  const handleAnswerSelect = (option) => {
    if (selectedQuizAnswer !== null) return;
    setSelectedQuizAnswer(option);
    const correct = option === quizQuestions[currentQuizIdx].correctAnswer;
    if (correct) {
      setQuizScore((s) => s + 1);
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    const baseXP = quizScore * 10;
    const bonusXP = quizScore === quizQuestions.length ? 25 : 0;
    const totalAwarded = baseXP + bonusXP;
    setEarnedXP(totalAwarded);

    try {
      const prog = await progressService.get().catch(() => null);
      if (prog) {
        await progressService.update({
          ...prog,
          xp: (prog.xp || 0) + totalAwarded,
          totalVocabularyWords: (prog.totalVocabularyWords || 0) + quizScore,
        });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Vocabulary Coach & Quiz</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Build your personal word bank with AI definitions, 3D flashcards, and XP quiz challenges.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] max-w-md">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "list" ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <span>📋 My List ({filteredItems.length})</span>
        </button>

        <button
          onClick={() => {
            if (filteredItems.length === 0) return;
            setCardIndex(0);
            setIsFlipped(false);
            setActiveTab("flashcards");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "flashcards" ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <span>🎴 Flashcards</span>
        </button>

        <button
          onClick={startQuiz}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "quiz" ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <span>🏆 Quiz</span>
        </button>
      </div>

      {/* TAB 1: MY LIST */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Add Word Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Add to My Vocabulary</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type word (e.g. Eloquent)..."
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              />
              <button
                onClick={handleAddWord}
                disabled={adding || !wordInput.trim()}
                className="px-6 py-2.5 rounded-2xl bg-[#6c63ff] hover:bg-[#8b85ff] disabled:opacity-50 text-white text-xs font-extrabold shadow-md"
              >
                {adding ? "Adding..." : "+ Add Word"}
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Search vocabulary or meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filterType === "all" ? "bg-[#6c63ff] text-white" : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("favorites")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filterType === "favorites" ? "bg-[#6c63ff] text-white" : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)]"
                }`}
              >
                ★ Favorites Only
              </button>
            </div>
          </div>

          {/* Word List Grid */}
          {loading ? (
            <p className="text-xs font-bold text-[var(--text-secondary)]">Loading vocabulary...</p>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-default)]">
              No matching vocabulary words found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg text-[var(--text-primary)]">{item.word}</h3>
                        <button onClick={() => handleSpeak(item.word)} className="text-sm">🔊</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleFavorite(item)} className="text-amber-500 text-sm">
                          {item.favorite ? "★" : "☆"}
                        </button>
                        <button onClick={() => handleDeleteWord(item.id)} className="text-red-500 text-sm font-bold">
                          🗑️
                        </button>
                      </div>
                    </div>

                    {item.meaning && <p className="text-xs font-semibold text-[var(--text-secondary)]">{item.meaning}</p>}
                    {item.exampleSentence && (
                      <p className="text-xs italic text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-default)]">
                        "{item.exampleSentence}"
                      </p>
                    )}
                  </div>

                  {(item.synonym || item.antonym) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-default)]">
                      {item.synonym && <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold">Syn: {item.synonym}</span>}
                      {item.antonym && <span className="px-2.5 py-0.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-extrabold">Ant: {item.antonym}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLASHCARDS */}
      {activeTab === "flashcards" && filteredItems.length > 0 && (
        <div className="space-y-6">
          <p className="text-center text-xs font-bold text-[var(--text-secondary)] uppercase">
            Card {cardIndex + 1} of {filteredItems.length}
          </p>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#6c63ff] text-white shadow-2xl min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-102 space-y-4"
          >
            {!isFlipped ? (
              <>
                <h2 className="text-3xl sm:text-4xl font-extrabold">{filteredItems[cardIndex].word}</h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(filteredItems[cardIndex].word);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-2"
                >
                  🔊 Pronounce Word
                </button>
                <p className="text-xs text-[#A5B4FC] pt-4">Tap card to see AI meaning & examples 🔄</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-extrabold text-amber-400">{filteredItems[cardIndex].word}</h3>
                <p className="text-sm font-semibold text-white/90 max-w-md">{filteredItems[cardIndex].meaning}</p>

                {filteredItems[cardIndex].exampleSentence && (
                  <p className="text-xs italic text-[#A5B4FC]">"{filteredItems[cardIndex].exampleSentence}"</p>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(filteredItems[cardIndex].meaning);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-2"
                >
                  🔊 Listen Meaning
                </button>
                <p className="text-xs text-[#A5B4FC] pt-2">Tap to flip back</p>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
              }}
              className="px-6 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-extrabold"
            >
              ← Previous
            </button>
            <button
              onClick={() => handleToggleFavorite(filteredItems[cardIndex])}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-extrabold"
            >
              {filteredItems[cardIndex]?.favorite ? "★ Favorited" : "☆ Favorite"}
            </button>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((i) => (i + 1) % filteredItems.length);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold shadow-md"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: QUIZ */}
      {activeTab === "quiz" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
          {quizLoading ? (
            <p className="text-xs font-bold text-[var(--text-secondary)]">Generating vocabulary quiz questions...</p>
          ) : !quizFinished && quizQuestions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                  Question {currentQuizIdx + 1} of {quizQuestions.length}
                </span>
                <span className="text-xs font-extrabold text-amber-500">⚡ +{quizScore * 10} XP</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-[var(--text-secondary)]">What is the definition of:</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">{quizQuestions[currentQuizIdx].word}</h3>
                  <button onClick={() => handleSpeak(quizQuestions[currentQuizIdx].word)} className="text-sm">
                    🔊
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {quizQuestions[currentQuizIdx].options.map((opt, idx) => {
                  const isSelected = selectedQuizAnswer === opt;
                  const isCorrect = opt === quizQuestions[currentQuizIdx].correctAnswer;

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
                      className={`w-full p-4 rounded-2xl text-xs font-bold text-left border transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedQuizAnswer !== null && isCorrect && <span className="text-emerald-500 font-extrabold">✓ Correct</span>}
                      {selectedQuizAnswer !== null && isSelected && !isCorrect && <span className="text-red-500 font-extrabold">✗ Wrong</span>}
                    </button>
                  );
                })}
              </div>

              {selectedQuizAnswer !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (currentQuizIdx + 1 < quizQuestions.length) {
                        setCurrentQuizIdx((i) => i + 1);
                        setSelectedQuizAnswer(null);
                      } else {
                        finishQuiz();
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold shadow-md"
                  >
                    {currentQuizIdx + 1 < quizQuestions.length ? "Next Question →" : "Finish & Claim XP 🎉"}
                  </button>
                </div>
              )}
            </div>
          ) : quizFinished ? (
            <div className="text-center space-y-4 py-6">
              <span className="text-5xl">🏆</span>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Quiz Completed!</h2>
              <p className="text-xs text-[var(--text-secondary)] font-semibold">
                You answered {quizScore} out of {quizQuestions.length} questions correctly.
              </p>

              <div className="p-4 rounded-2xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 max-w-xs mx-auto space-y-1">
                <p className="text-xs font-extrabold text-[#6c63ff] uppercase">Total XP Added</p>
                <p className="text-xl font-extrabold text-amber-500">+{earnedXP} XP</p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={startQuiz}
                  className="px-6 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-extrabold"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={() => setActiveTab("list")}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold"
                >
                  Back to List
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default Vocabulary;
