import { useState, useEffect } from "react";
import { vocabularyService, progressService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";
import { recordVocabularyMastered } from "../utils/progressTracker";

// Curated CEFR Dictionary Pool for 100% Unique Automatic Quiz Generation
const EXTENDED_DICTIONARY_POOL = [
  { id: "dict_1", word: "Eloquent", meaning: "Fluent or persuasive in speaking and writing.", synonym: "Articulate", antonym: "Inarticulate", exampleSentence: "His eloquent speech captivated the entire audience." },
  { id: "dict_2", word: "Resilient", meaning: "Able to withstand or recover quickly from difficult conditions.", synonym: "Tough", antonym: "Fragile", exampleSentence: "She showed a resilient spirit during challenging times." },
  { id: "dict_3", word: "Coherent", meaning: "Logical, clear, and consistent in thought or expression.", synonym: "Logical", antonym: "Confused", exampleSentence: "Make sure your essay argument remains clear and coherent." },
  { id: "dict_4", word: "Meticulous", meaning: "Showing great attention to detail; very careful and precise.", synonym: "Precise", antonym: "Careless", exampleSentence: "He was meticulous about maintaining his vocabulary journal." },
  { id: "dict_5", word: "Pragmatic", meaning: "Dealing with things sensibly and realistically in a practical way.", synonym: "Practical", antonym: "Idealistic", exampleSentence: "They took a pragmatic approach to solving the complex issue." },
  { id: "dict_6", word: "Articulate", meaning: "Having or showing the ability to speak fluently and coherently.", synonym: "Expressive", antonym: "Inarticulate", exampleSentence: "An articulate speaker can convey complex ideas effortlessly." },
  { id: "dict_7", word: "Ambiguous", meaning: "Open to more than one interpretation; not clear or explicit.", synonym: "Vague", antonym: "Explicit", exampleSentence: "The contract instructions were ambiguous and caused confusion." },
  { id: "dict_8", word: "Versatile", meaning: "Able to adapt or be adapted to many different functions or activities.", synonym: "Flexible", antonym: "Rigid", exampleSentence: "Python is a versatile programming language used in web and AI." },
  { id: "dict_9", word: "Formidable", meaning: "Inspiring respect or awe through being impressively powerful.", synonym: "Impressive", antonym: "Weak", exampleSentence: "The team faced a formidable opponent in the championship final." },
  { id: "dict_10", word: "Plausible", meaning: "Seeming reasonable or probable based on logical grounds.", synonym: "Believable", antonym: "Implausible", exampleSentence: "Her explanation for being late was entirely plausible." },
  { id: "dict_11", word: "Tenacious", meaning: "Persistent, determined, and holding firm to a purpose.", synonym: "Determined", antonym: "Yielding", exampleSentence: "Her tenacious effort paid off when she mastered English fluency." },
  { id: "dict_12", word: "Scrupulous", meaning: "Very diligent, thorough, and attentive to moral or practical detail.", synonym: "Conscientious", antonym: "Sloppy", exampleSentence: "The researcher kept scrupulous records of all experimental data." },
  { id: "dict_13", word: "Candor", meaning: "The quality of being open, honest, and sincere in expression.", synonym: "Honesty", antonym: "Deceit", exampleSentence: "I appreciate your candor when giving constructive feedback." },
  { id: "dict_14", word: "Empathy", meaning: "The ability to understand and share the feelings of another.", synonym: "Compassion", antonym: "Apathy", exampleSentence: "Great communicators speak with empathy and active listening." },
  { id: "dict_15", word: "Gregarious", meaning: "Fond of company; sociable and outgoing.", synonym: "Sociable", antonym: "Reclusive", exampleSentence: "His gregarious personality makes him popular at every event." },
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
      distractors.push("Expressing thoughts in a temporary or brief manner.");
    }

    const options = shuffleArray([correctMeaning, ...distractors]);
    const correctIndex = options.indexOf(correctMeaning);

    return {
      id: i + 1,
      targetWord: wordObj.word,
      question: `What is the exact definition of "${wordObj.word}"?`,
      options,
      correctIndex,
      explanation: `"${wordObj.word}" means: ${correctMeaning}`,
    };
  });
}

export function Vocabulary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Word Input State
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Tabs: "dictionary" | "flashcards" | "quiz"
  const [activeTab, setActiveTab] = useState("dictionary");

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Dynamic Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Speech Playing State
  const [speakingWord, setSpeakingWord] = useState(null);

  useEffect(() => {
    let isMounted = true;
    vocabularyService
      .list()
      .then((data) => {
        if (!isMounted) return;
        if (data && Array.isArray(data) && data.length > 0) {
          setItems(data);
          setQuizQuestions(generateDifferentRandomQuiz(data));
        } else {
          setItems(EXTENDED_DICTIONARY_POOL);
          setQuizQuestions(generateDifferentRandomQuiz(EXTENDED_DICTIONARY_POOL));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setItems(EXTENDED_DICTIONARY_POOL);
        setQuizQuestions(generateDifferentRandomQuiz(EXTENDED_DICTIONARY_POOL));
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) return;

    const wordData = {
      id: Date.now().toString(),
      word: newWord.trim(),
      meaning: newMeaning.trim(),
      favorite: false,
    };

    try {
      const saved = await vocabularyService.create(wordData).catch(() => null);
      const itemToAdd = saved || wordData;
      setItems((prev) => [itemToAdd, ...prev]);
      recordVocabularyMastered(1);
    } catch (e) {
      setItems((prev) => [wordData, ...prev]);
      recordVocabularyMastered(1);
    }

    setNewWord("");
    setNewMeaning("");
  };

  const handleToggleFavorite = async (item) => {
    const updated = !item.favorite;
    setItems((prev) => prev.map((w) => (w.id === item.id ? { ...w, favorite: updated } : w)));

    try {
      await vocabularyService.toggleFavorite(item.id, updated).catch(() => null);
    } catch (e) {}
  };

  const handleDeleteWord = async (id) => {
    setItems((prev) => prev.filter((w) => w.id !== id));
    try {
      await vocabularyService.delete(id).catch(() => null);
    } catch (e) {}
  };

  const handleSpeak = (text) => {
    setSpeakingWord(text);
    speakGlobalText(text);
    setTimeout(() => setSpeakingWord(null), 2500);
  };

  const handleCardClick = () => {
    if (!isFlipped && items[cardIndex]) {
      handleSpeak(items[cardIndex].word);
    }
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    const nextIdx = (cardIndex + 1) % items.length;
    setCardIndex(nextIdx);
    if (items[nextIdx]) handleSpeak(items[nextIdx].word);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    const prevIdx = (cardIndex - 1 + items.length) % items.length;
    setCardIndex(prevIdx);
    if (items[prevIdx]) handleSpeak(items[prevIdx].word);
  };

  const handleAnswerQuiz = (optionIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);

    const q = quizQuestions[currentQuizStep];
    const isCorrect = optionIndex === q.correctIndex;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizStep < quizQuestions.length - 1) {
      setCurrentQuizStep((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
      recordVocabularyMastered(quizScore + 1);
    }
  };

  const handleRestartQuiz = () => {
    const newQuiz = generateDifferentRandomQuiz(items);
    setQuizQuestions(newQuiz);
    setCurrentQuizStep(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "favorites" ? item.favorite : true;
    return matchesSearch && matchesFilter;
  });

  const favoriteCount = items.filter((i) => i.favorite).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-4 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-indigo-800 via-indigo-700 to-purple-700 p-6 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
            📚 Interactive CEFR Vocabulary Bank
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">Vocabulary Builder</h1>
          <p className="text-sm sm:text-base text-indigo-100/90 font-medium leading-relaxed">
            Expand your active word bank, study definitions, listen to AI pronunciations, flip 3D flashcards, and test your knowledge with dynamic quizzes!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("dictionary")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "dictionary"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            📖 Word Bank ({items.length})
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "flashcards"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            🎴 3D Flashcards
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "quiz"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            🎯 Dynamic Quiz
          </button>
        </div>
      </div>

      {/* TAB 1: DICTIONARY WORD BANK */}
      {activeTab === "dictionary" && (
        <div className="space-y-6">
          {/* Add New Word Bar & Search Filter Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Add Word Form */}
            <form onSubmit={handleAddWord} className="lg:col-span-6 glass-panel p-4 rounded-2xl border border-[var(--border-default)] flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Word (e.g. Resilient)"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="w-full sm:w-1/3 px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Meaning or definition..."
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newWord.trim() || !newMeaning.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black shrink-0 transition-all shadow-md"
              >
                + Add Word
              </button>
            </form>

            {/* Search Input */}
            <div className="lg:col-span-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search words or definitions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>

            {/* Favorites Filter Switcher */}
            <div className="lg:col-span-2">
              <div className="flex w-full items-center p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                <button
                  onClick={() => setFilterType("all")}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                    filterType === "all"
                      ? "bg-[var(--bg-surface)] text-indigo-500 shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  All ({items.length})
                </button>
                <button
                  onClick={() => setFilterType("favorites")}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                    filterType === "favorites"
                      ? "bg-[var(--bg-surface)] text-amber-500 shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  ⭐ Saved ({favoriteCount})
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="p-16 text-center text-sm font-bold text-[var(--text-secondary)]">
              Loading word bank...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 sm:p-16 rounded-3xl glass-panel text-center space-y-3 shadow-xl">
              <span className="text-5xl">📚</span>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">No Vocabulary Words Found</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                Type a new word in the input box above to start building your personal word bank.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isSpeaking = speakingWord === item.word;
                return (
                  <div
                    key={item.id || item.word}
                    className="group relative glass-card-interactive p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-[var(--border-default)] hover:border-indigo-500/50 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="space-y-3">
                      {/* Card Header: Word + TTS Voice Button + Favorite Star */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">
                            {item.word}
                          </h3>
                          <button
                            onClick={() => handleSpeak(item.word)}
                            className={`grid h-9 w-9 place-items-center rounded-2xl transition-all text-xs ${
                              isSpeaking
                                ? "bg-indigo-600 text-white animate-pulse"
                                : "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-600 hover:text-white"
                            }`}
                            title="Listen Pronunciation (AI Voice)"
                          >
                            🔊
                          </button>
                        </div>

                        <button
                          onClick={() => handleToggleFavorite(item)}
                          className={`text-xl transition-all duration-200 hover:scale-125 ${
                            item.favorite ? "text-amber-400 drop-shadow-md" : "text-[var(--text-secondary)] opacity-40 hover:opacity-100"
                          }`}
                          title="Save to favorites"
                        >
                          ★
                        </button>
                      </div>

                      {/* Word Definition */}
                      <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                        {item.meaning}
                      </p>

                      {/* Example Sentence */}
                      {item.exampleSentence && (
                        <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] italic leading-relaxed">
                          "{item.exampleSentence}"
                        </div>
                      )}

                      {/* Synonyms & Antonyms */}
                      {(item.synonym || item.antonym) && (
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold pt-1">
                          {item.synonym && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Synonym: {item.synonym}
                            </span>
                          )}
                          {item.antonym && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              Antonym: {item.antonym}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 px-2.5 py-1 rounded-md bg-indigo-500/10">
                        CEFR Vocabulary
                      </span>
                      <button
                        onClick={() => handleDeleteWord(item.id)}
                        className="text-xs font-bold text-rose-500/70 hover:text-rose-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE 3D FLASHCARDS DECK (WITH FLIP & AI VOICE) */}
      {activeTab === "flashcards" && items.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6 py-2">
          {/* Deck Status Bar */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-black text-[var(--text-secondary)]">
            <span className="px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              Card {cardIndex + 1} of {items.length}
            </span>
            <span className="text-indigo-500 animate-pulse">
              Tap card to flip • AI Voice Auto-Reads 🔊
            </span>
          </div>

          {/* Interactive 3D Card */}
          <div
            onClick={handleCardClick}
            className="group relative w-full h-88 sm:h-96 rounded-3xl cursor-pointer perspective-1000 select-none"
            style={{ perspective: "1000px" }}
          >
            <div
              className={`w-full h-full duration-500 transition-all transform-style-3d relative rounded-3xl shadow-2xl glass-panel p-8 sm:p-12 flex flex-col items-center justify-center text-center border-2 border-[var(--border-default)] hover:border-indigo-500 ${
                isFlipped ? "bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)]" : "bg-gradient-to-br from-indigo-500/10 via-[var(--bg-surface)] to-[var(--bg-elevated)]"
              }`}
            >
              {!isFlipped ? (
                /* FRONT SIDE: WORD */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 text-xs font-black uppercase tracking-wider">
                    ✨ Word Flashcard
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight">
                    {items[cardIndex].word}
                  </h2>
                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(items[cardIndex].word);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-indigo-500/15 text-indigo-500 hover:bg-indigo-600 hover:text-white font-extrabold text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-sm"
                    >
                      🔊 Re-play Word Pronunciation
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-bold">
                    (Tap card to reveal definition)
                  </p>
                </div>
              ) : (
                /* BACK SIDE: DEFINITION & EXAMPLE */
                <div className="space-y-6 animate-in fade-in duration-200 max-w-lg">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-wider">
                    📖 Meaning & Context
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-[var(--text-primary)] leading-relaxed">
                    {items[cardIndex].meaning}
                  </p>
                  {items[cardIndex].exampleSentence && (
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold italic bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-subtle)]">
                      "{items[cardIndex].exampleSentence}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Flashcard Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevCard}
              className="px-6 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs sm:text-sm font-black text-[var(--text-primary)] hover:bg-indigo-600 hover:text-white transition-all shadow-md"
            >
              ← Previous Card
            </button>
            <button
              onClick={handleNextCard}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black transition-all shadow-md"
            >
              Next Card →
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DYNAMIC QUIZ */}
      {activeTab === "quiz" && (
        <div className="max-w-2xl mx-auto space-y-6 py-2">
          {!quizFinished && quizQuestions.length > 0 ? (
            <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-6 border border-[var(--border-default)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-wider">
                  Question {currentQuizStep + 1} of {quizQuestions.length}
                </span>
                <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Score: {quizScore}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  {quizQuestions[currentQuizStep].question}
                </h3>
              </div>

              <div className="space-y-3">
                {quizQuestions[currentQuizStep].options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === quizQuestions[currentQuizStep].correctIndex;
                  let btnStyle = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-indigo-500";

                  if (selectedAnswer !== null) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-500 font-black";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500/20 border-rose-500 text-rose-500 font-black";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerQuiz(idx)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all shadow-sm ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-black shadow-lg hover:scale-105 transition-all"
                  >
                    {currentQuizStep < quizQuestions.length - 1 ? "Next Question →" : "See Final Score 🏆"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-6 border border-[var(--border-default)] shadow-2xl">
              <span className="text-6xl block">🏆</span>
              <h2 className="text-3xl font-black text-[var(--text-primary)]">Quiz Completed!</h2>
              <p className="text-base text-[var(--text-secondary)] font-bold">
                You scored <span className="text-emerald-500 font-black text-xl">{quizScore}</span> out of{" "}
                <span className="text-indigo-500 font-black text-xl">{quizQuestions.length}</span>!
              </p>
              <button
                onClick={handleRestartQuiz}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl hover:scale-105 transition-all"
              >
                Take Another Quiz 🔄
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Vocabulary;
