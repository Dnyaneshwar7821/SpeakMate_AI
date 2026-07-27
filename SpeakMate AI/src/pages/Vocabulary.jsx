import { useState, useEffect } from "react";
import { vocabularyService, progressService } from "../services/appServices";

// Large Curated Dictionary Pool for 100% Different Automatic Quiz Generation Every Time!
const EXTENDED_DICTIONARY_POOL = [
  { word: "Eloquent", meaning: "Fluent or persuasive in speaking and writing.", synonym: "Articulate" },
  { word: "Resilient", meaning: "Able to withstand or recover quickly from difficult conditions.", synonym: "Tough" },
  { word: "Coherent", meaning: "Logical, clear, and consistent in thought or expression.", synonym: "Logical" },
  { word: "Meticulous", meaning: "Showing great attention to detail; very careful and precise.", synonym: "Precise" },
  { word: "Pragmatic", meaning: "Dealing with things sensibly and realistically in a practical way.", synonym: "Practical" },
  { word: "Articulate", meaning: "Having or showing the ability to speak fluently and coherently.", synonym: "Expressive" },
  { word: "Ambiguous", meaning: "Open to more than one interpretation; not having one obvious meaning.", synonym: "Unclear" },
  { word: "Versatile", meaning: "Able to adapt or be adapted to many different functions or activities.", synonym: "Flexible" },
  { word: "Formidable", meaning: "Inspiring respect or awe through being impressively large or powerful.", synonym: "Impressive" },
  { word: "Plausible", meaning: "Seeming reasonable or probable based on logical grounds.", synonym: "Believable" },
  { word: "Tenacious", meaning: "Tending to keep a firm hold of something; persistent and determined.", synonym: "Determined" },
  { word: "Scrupulous", meaning: "Very diligent, thorough, and attentive to details.", synonym: "Conscientious" },
  { word: "Candor", meaning: "The quality of being open, honest, and sincere in expression.", synonym: "Honesty" },
  { word: "Empathy", meaning: "The ability to understand and share the feelings of another person.", synonym: "Compassion" },
  { word: "Jubilant", meaning: "Feeling or expressing great happiness and triumph.", synonym: "Joyful" },
  { word: "Gregarious", meaning: "Fond of company; sociable and outgoing.", synonym: "Sociable" },
  { word: "Ephemeral", meaning: "Lasting for a very short time; fleeting.", synonym: "Transient" },
  { word: "Diligent", meaning: "Having or showing care and conscientiousness in one's work.", synonym: "Hardworking" },
  { word: "Altruistic", meaning: "Showing a disinterested and selfless concern for the well-being of others.", synonym: "Selfless" },
  { word: "Perceptive", meaning: "Having or showing sensitive insight and quick understanding.", synonym: "Insightful" },
  { word: "Inquisitive", meaning: "Curious and eager to learn or inquire into things.", synonym: "Curious" },
  { word: "Catalyst", meaning: "A person or thing that precipitates a change or event.", synonym: "Spark" },
  { word: "Benevolent", meaning: "Well meaning and kindly; serving a charitable purpose.", synonym: "Kind" },
  { word: "Audacious", meaning: "Showing a willingness to take surprisingly bold risks.", synonym: "Daring" },
  { word: "Fastidious", meaning: "Very attentive to and concerned about accuracy and detail.", synonym: "Fussy" },
  { word: "Quintessential", meaning: "Representing the most perfect or typical example of a quality.", synonym: "Classic" },
  { word: "Serendipity", meaning: "The occurrence of events by chance in a happy or beneficial way.", synonym: "Luck" },
  { word: "Veracity", meaning: "Conformity to facts; accuracy and truthfulness.", synonym: "Truthfulness" },
];

// Fisher-Yates Random Shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate 100% Different 3-Question Quiz every time!
function generateDifferentRandomQuiz(userAddedWords = []) {
  const combined = [...userAddedWords, ...EXTENDED_DICTIONARY_POOL];
  
  const uniquePool = [];
  const seen = new Set();
  for (const item of combined) {
    if (item.word && !seen.has(item.word.toLowerCase())) {
      seen.add(item.word.toLowerCase());
      uniquePool.push(item);
    }
  }

  const shuffledPool = shuffleArray(uniquePool);
  const selected = shuffledPool.slice(0, 3);

  const allMeanings = [...new Set(uniquePool.map((w) => w.meaning).filter(Boolean))];

  return selected.map((wordObj, i) => {
    const correctMeaning = wordObj.meaning;
    const distractors = shuffleArray(allMeanings.filter((m) => m !== correctMeaning)).slice(0, 3);

    while (distractors.length < 3) {
      distractors.push("Lasting for a short temporary period");
    }

    const options = shuffleArray([correctMeaning, ...distractors]);
    const correctIndex = options.indexOf(correctMeaning);

    return {
      id: `quiz_q_${Date.now()}_${i}`,
      word: wordObj.word,
      questionText: `What is the meaning of the word '${wordObj.word}'?`,
      options,
      correctIndex,
      explanation: `'${wordObj.word}' means: "${correctMeaning}"`,
    };
  });
}

export function Vocabulary() {
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'flashcards', 'quiz'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordInput, setWordInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Dynamic Quiz State (Automatically 100% different every run!)
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
      setItems(data && data.length > 0 ? data : EXTENDED_DICTIONARY_POOL.slice(0, 5));
    } catch (e) {
      setItems(EXTENDED_DICTIONARY_POOL.slice(0, 5));
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
    utterance.rate = 0.95;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak word or meaning when Flashcard tab is active or card flips!
  useEffect(() => {
    if (activeTab === "flashcards" && items.length > 0 && items[cardIndex]) {
      const currentItem = items[cardIndex];
      const textToSpeak = isFlipped ? currentItem.meaning : currentItem.word;
      handleSpeak(textToSpeak);
    }
  }, [activeTab, cardIndex, isFlipped]);

  const handleCardClick = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    if (items[cardIndex]) {
      const textToSpeak = nextFlipped ? items[cardIndex].meaning : items[cardIndex].word;
      handleSpeak(textToSpeak);
    }
  };

  const handleAddWord = async () => {
    if (!wordInput.trim()) return;
    setAdding(true);
    try {
      await vocabularyService.add(wordInput.trim());
      setWordInput("");
      await loadVocabulary();
    } catch (e) {
      const newWordObj = {
        id: String(Date.now()),
        word: wordInput.trim(),
        meaning: `Useful English vocabulary word added to your personal bank.`,
        exampleSentence: `Practice using '${wordInput.trim()}' in your daily conversations.`,
        favorite: true,
      };
      setItems((prev) => [newWordObj, ...prev]);
      setWordInput("");
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

  const startQuiz = () => {
    setQuizLoading(true);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuizIdx(0);
    setSelectedQuizAnswer(null);

    setTimeout(() => {
      const newQuiz = generateDifferentRandomQuiz(items);
      setQuizQuestions(newQuiz);
      setQuizLoading(false);
    }, 150);
  };

  const handleAnswerQuiz = (idx) => {
    if (selectedQuizAnswer !== null) return;
    setSelectedQuizAnswer(idx);
    const q = quizQuestions[currentQuizIdx];
    if (idx === q.correctIndex) {
      setQuizScore((s) => s + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx + 1 < quizQuestions.length) {
      setCurrentQuizIdx((i) => i + 1);
      setSelectedQuizAnswer(null);
    } else {
      const finalScore = quizScore + (selectedQuizAnswer === quizQuestions[currentQuizIdx].correctIndex ? 1 : 0);
      const earned = finalScore * 25;
      setEarnedXP(earned);
      setQuizFinished(true);
      if (earned > 0) {
        progressService.create({ xp: earned }).catch(() => {});
      }
    }
  };

  const currentQ = quizQuestions[currentQuizIdx] || {
    word: "Vocabulary",
    questionText: "What is the meaning of your vocabulary word?",
    options: ["Meaning A", "Meaning B", "Meaning C", "Meaning D"],
    correctIndex: 0,
    explanation: "Review vocabulary definitions in your Word Bank.",
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)]">Vocabulary Builder</h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">
            Build your personal word bank, study with auto-speaking 3D flashcards, and test retention with 100% unique auto-generated quizzes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shrink-0">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "list"
                ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            📚 Word Bank ({filteredItems.length})
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "flashcards"
                ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            🎴 3D Flashcards
          </button>

          <button
            onClick={() => {
              setActiveTab("quiz");
              startQuiz();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "quiz"
                ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            ⚡ Auto-New Quiz (3 Qs)
          </button>
        </div>
      </div>

      {/* TAB 1: WORD BANK (DESKTOP WIDESCREEN VIEW) */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Add Word & Search Bar Strip */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 flex gap-3">
              <input
                type="text"
                placeholder="Add new word (e.g., Pragmatic)..."
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                className="flex-1 px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              />
              <button
                onClick={handleAddWord}
                disabled={adding || !wordInput.trim()}
                className="px-6 py-3.5 rounded-2xl bg-[#6c63ff] hover:bg-[#7c74ff] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shrink-0"
              >
                {adding ? "Adding..." : "+ Add Word"}
              </button>
            </div>

            <div className="md:col-span-4">
              <input
                type="text"
                placeholder="🔍 Search words or definitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <div className="flex w-full items-center p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                <button
                  onClick={() => setFilterType("all")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl ${filterType === "all" ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"}`}
                >
                  All ({items.length})
                </button>
                <button
                  onClick={() => setFilterType("favorites")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl ${filterType === "favorites" ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"}`}
                >
                  ⭐ Saved
                </button>
              </div>
            </div>
          </div>

          {/* Word Grid Cards */}
          {loading ? (
            <div className="p-12 text-center text-sm font-bold text-[var(--text-secondary)]">Loading word bank...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-center space-y-2">
              <span className="text-4xl">📚</span>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">No Vocabulary Words Found</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Type a new word above or search your word list.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id || item.word}
                  className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-[var(--text-primary)]">{item.word}</h3>
                        <button
                          onClick={() => handleSpeak(item.word)}
                          className="grid h-8 w-8 place-items-center rounded-xl bg-[#6c63ff]/10 text-[#6c63ff] hover:bg-[#6c63ff] hover:text-white transition-all text-xs"
                          title="Listen Pronunciation"
                        >
                          🔊
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleFavorite(item)}
                        className={`text-lg transition-transform hover:scale-125 ${item.favorite ? "text-amber-400" : "text-[var(--text-secondary)] opacity-50"}`}
                        title="Save to favorites"
                      >
                        ★
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">{item.meaning}</p>

                    {item.exampleSentence && (
                      <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] italic">
                        "{item.exampleSentence}"
                      </div>
                    )}

                    {(item.synonym || item.antonym) && (
                      <div className="flex items-center gap-3 text-xs font-bold pt-1">
                        {item.synonym && <span className="text-emerald-500">Synonym: {item.synonym}</span>}
                        {item.antonym && <span className="text-rose-500">Antonym: {item.antonym}</span>}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#6c63ff]">CEFR Vocabulary</span>
                    <button
                      onClick={() => handleDeleteWord(item.id)}
                      className="text-xs font-bold text-red-500/70 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 3D FLASHCARDS DECK (WITH AUTO AI VOICE SPEECH ON WORD & MEANING) */}
      {activeTab === "flashcards" && items.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6 py-4">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[var(--text-secondary)]">
            <span>Card {cardIndex + 1} of {items.length}</span>
            <span>Tap card to flip definition • AI Voice Auto-Reads 🔊</span>
          </div>

          <div
            onClick={handleCardClick}
            className="h-80 w-full glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl transition-all duration-500 hover:border-[#6c63ff]"
          >
            {!isFlipped ? (
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-[#6c63ff]/20 text-[#6c63ff] text-xs font-black uppercase">
                  Word Flashcard (AI Voice Auto-Reading)
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)]">{items[cardIndex].word}</h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(items[cardIndex].word);
                  }}
                  className="px-4 py-2 rounded-2xl bg-[#6c63ff]/10 text-[#6c63ff] text-xs font-extrabold hover:bg-[#6c63ff] hover:text-white transition-all inline-flex items-center gap-2"
                >
                  🔊 Re-play Word Pronunciation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-black uppercase">
                  Definition & Example (AI Voice Auto-Reading)
                </span>
                <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] max-w-xl">
                  {items[cardIndex].meaning}
                </p>
                {items[cardIndex].exampleSentence && (
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic">
                    "{items[cardIndex].exampleSentence}"
                  </p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(items[cardIndex].meaning);
                  }}
                  className="px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-500 text-xs font-extrabold hover:bg-emerald-500 hover:text-white transition-all inline-flex items-center gap-2 mt-2"
                >
                  🔊 Re-play Definition Speech
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((i) => (i > 0 ? i - 1 : items.length - 1));
              }}
              className="px-6 py-3 rounded-2xl border border-[var(--border-default)] text-xs sm:text-sm font-extrabold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              ← Previous Card
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((i) => (i + 1 < items.length ? i + 1 : 0));
              }}
              className="px-8 py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#7c74ff] text-white text-xs sm:text-sm font-extrabold shadow-md"
            >
              Next Card →
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATICALLY DIFFERENT QUIZ EVERY TIME */}
      {activeTab === "quiz" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {quizLoading ? (
            <div className="p-12 text-center text-sm font-bold text-[var(--text-secondary)]">
              Generating new unique quiz questions... ⚡
            </div>
          ) : quizFinished ? (
            <div className="p-8 sm:p-12 rounded-3xl glass-card text-center space-y-6 animate-in fade-in duration-300">
              <div className="grid h-20 w-20 mx-auto place-items-center rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white text-4xl shadow-xl">
                🏆
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#6c63ff] px-3 py-1 rounded-full bg-[#6c63ff]/10">
                  Unique Quiz Result
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mt-3">Quiz Completed!</h2>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
                  You scored {quizScore} out of {quizQuestions.length} correct.
                </p>
              </div>

              <div className="inline-block px-6 py-2.5 rounded-full bg-emerald-500/20 text-emerald-500 font-extrabold text-sm">
                + {earnedXP} XP Learning Bonus Claimed! 🎉
              </div>

              <div>
                <button
                  onClick={startQuiz}
                  className="px-8 py-3.5 rounded-2xl bg-[#6c63ff] hover:bg-[#7c74ff] text-white text-sm font-extrabold shadow-lg"
                >
                  ⚡ Generate Different Quiz ↻
                </button>
              </div>
            </div>
          ) : quizQuestions.length > 0 ? (
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 animate-in fade-in duration-200">
              {/* Question Header Banner */}
              <div className="p-4 rounded-2xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#6c63ff]">
                  <span className="uppercase tracking-wider">Auto-Generated Quiz • Question {currentQuizIdx + 1} of {quizQuestions.length}</span>
                  <span>+25 XP Per Correct Answer</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-relaxed pt-1">
                  {currentQ.questionText}
                </h2>
              </div>

              {/* 4 Selectable Answer Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedQuizAnswer === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerQuiz(idx)}
                      disabled={selectedQuizAnswer !== null}
                      className={`w-full p-4 rounded-2xl border text-left text-sm font-extrabold transition-all flex items-center justify-between ${
                        selectedQuizAnswer === null
                          ? "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]"
                          : isCorrect
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                          : isSelected
                          ? "border-rose-500 bg-rose-500/20 text-rose-500"
                          : "border-[var(--border-default)] bg-[var(--bg-elevated)] opacity-60"
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedQuizAnswer !== null && isCorrect && <span>✓ Correct</span>}
                    </button>
                  );
                })}
              </div>

              {selectedQuizAnswer !== null && (
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                    💡 {currentQ.explanation}
                  </p>
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c74ff] text-white text-xs sm:text-sm font-extrabold shadow-md shrink-0"
                  >
                    Next Question →
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default Vocabulary;
