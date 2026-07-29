import { useState, useEffect } from "react";
import { vocabularyService, progressService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";

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
      id: `quiz_q_${Date.now()}_${i}`,
      word: wordObj.word,
      questionText: `What is the correct definition of '${wordObj.word}'?`,
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
  const [speakingWord, setSpeakingWord] = useState(null);

  // Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Dynamic Quiz State
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
      setItems(data && data.length > 0 ? data : EXTENDED_DICTIONARY_POOL.slice(0, 6));
    } catch (e) {
      setItems(EXTENDED_DICTIONARY_POOL.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVocabulary();
  }, []);

  const handleSpeak = (text) => {
    if (!text) return;
    setSpeakingWord(text);
    speakGlobalText(text, 1.0, {
      onend: () => setSpeakingWord(null),
      onerror: () => setSpeakingWord(null),
    });
  };

  // Auto-speak word or meaning when Flashcard tab is active or card flips
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
        meaning: `Useful vocabulary word added to your personal lexicon.`,
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
    questionText: "What is the correct definition of your vocabulary word?",
    options: ["Definition A", "Definition B", "Definition C", "Definition D"],
    correctIndex: 0,
    explanation: "Review vocabulary definitions in your Word Bank.",
  };

  const favoriteCount = items.filter((i) => i.favorite).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-4">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4f46e5] via-[#6c63ff] to-[#8b5cf6] p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
              ✨ Dynamic Lexicon Studio
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Vocabulary Builder
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 font-medium leading-relaxed">
              Expand your English word bank, master pronunciations with AI speech, flip 3D study flashcards, and test retention with instant XP quizzes.
            </p>
          </div>

          {/* Key Metrics Pill Bar */}
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/15 shrink-0">
            <div className="px-4 py-2 text-center border-r border-white/15">
              <span className="text-xl sm:text-2xl font-black text-white">{items.length}</span>
              <span className="block text-[10px] sm:text-xs font-extrabold text-indigo-200 uppercase">Words</span>
            </div>
            <div className="px-4 py-2 text-center border-r border-white/15">
              <span className="text-xl sm:text-2xl font-black text-amber-300">⭐ {favoriteCount}</span>
              <span className="block text-[10px] sm:text-xs font-extrabold text-indigo-200 uppercase">Saved</span>
            </div>
            <div className="px-4 py-2 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-300">⚡ 100%</span>
              <span className="block text-[10px] sm:text-xs font-extrabold text-indigo-200 uppercase">Interactive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-sm">
        <div className="flex items-center gap-2 w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 ${
              activeTab === "list"
                ? "bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-lg shadow-[#6c63ff]/25 scale-102"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            <span>📚 Word Bank</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === "list" ? "bg-white/20 text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}>
              {filteredItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 ${
              activeTab === "flashcards"
                ? "bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-lg shadow-[#6c63ff]/25 scale-102"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            <span>🎴 3D Flashcards</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-500">
              Voice 🔊
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("quiz");
              startQuiz();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 ${
              activeTab === "quiz"
                ? "bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-lg shadow-[#6c63ff]/25 scale-102"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            <span>⚡ XP Retention Quiz</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-500">
              Auto-New
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: WORD BANK VIEW */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Action Strip: Add Word + Search + Filter Pills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Add New Word Form */}
            <div className="lg:col-span-6 flex gap-3">
              <input
                type="text"
                placeholder="Type a new word (e.g. Pragmatic)..."
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                className="flex-1 px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
              />
              <button
                onClick={handleAddWord}
                disabled={adding || !wordInput.trim()}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all shrink-0"
              >
                {adding ? "Adding..." : "+ Add Word"}
              </button>
            </div>

            {/* Search Input */}
            <div className="lg:col-span-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search words or definitions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
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
                      ? "bg-[var(--bg-surface)] text-[#6c63ff] shadow-sm"
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
            <div className="p-12 sm:p-16 rounded-3xl glass-card text-center space-y-3">
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
                    className="group relative glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-[var(--border-default)] hover:border-[#6c63ff]/50 transition-all duration-300"
                  >
                    <div className="space-y-3">
                      {/* Card Header: Word + TTS Voice Button + Favorite Star */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">
                            {item.word}
                          </h3>
                          <button
                            onClick={() => handleSpeak(item.word)}
                            className={`grid h-9 w-9 place-items-center rounded-2xl transition-all text-xs ${
                              isSpeaking
                                ? "bg-[#6c63ff] text-white animate-pulse"
                                : "bg-[#6c63ff]/10 text-[#6c63ff] hover:bg-[#6c63ff] hover:text-white"
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
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#6c63ff] px-2.5 py-1 rounded-md bg-[#6c63ff]/10">
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
            <span className="text-[#6c63ff] animate-pulse">
              Tap card to flip • AI Voice Auto-Reads 🔊
            </span>
          </div>

          {/* Interactive 3D Perspective Flip Container */}
          <div
            onClick={handleCardClick}
            className="group relative w-full h-88 sm:h-96 rounded-3xl cursor-pointer perspective-1000 select-none"
            style={{ perspective: "1000px" }}
          >
            <div
              className={`w-full h-full duration-500 transition-all transform-style-3d relative rounded-3xl shadow-2xl glass-card p-8 sm:p-12 flex flex-col items-center justify-center text-center border-2 border-[var(--border-default)] hover:border-[#6c63ff] ${
                isFlipped ? "bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)]" : "bg-gradient-to-br from-[#6c63ff]/10 via-[var(--bg-surface)] to-[var(--bg-elevated)]"
              }`}
            >
              {!isFlipped ? (
                /* FRONT SIDE: WORD */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6c63ff]/20 text-[#6c63ff] text-xs font-black uppercase tracking-wider">
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
                      className="px-5 py-2.5 rounded-2xl bg-[#6c63ff]/15 text-[#6c63ff] hover:bg-[#6c63ff] hover:text-white font-extrabold text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-sm"
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
                    💡 Definition & Context
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-relaxed">
                    {items[cardIndex].meaning}
                  </p>
                  {items[cardIndex].exampleSentence && (
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-subtle)]">
                      "{items[cardIndex].exampleSentence}"
                    </p>
                  )}
                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(items[cardIndex].meaning);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:text-white font-extrabold text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-sm"
                    >
                      🔊 Re-play Definition Speech
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Flashcard Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((i) => (i > 0 ? i - 1 : items.length - 1));
              }}
              className="px-6 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] text-xs sm:text-sm font-extrabold text-[var(--text-primary)] transition-all flex items-center gap-2"
            >
              ← Previous Card
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 text-xs sm:text-sm font-extrabold transition-all border border-amber-500/30"
            >
              🔄 Flip Card
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((i) => (i + 1 < items.length ? i + 1 : 0));
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 text-white text-xs sm:text-sm font-extrabold shadow-lg transition-all flex items-center gap-2"
            >
              Next Card →
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: XP RETENTION QUIZ (AUTOMATICALLY 100% DIFFERENT QUIZZES) */}
      {activeTab === "quiz" && (
        <div className="max-w-2xl mx-auto space-y-6 py-2">
          {quizLoading ? (
            <div className="p-16 text-center text-sm font-bold text-[var(--text-secondary)] space-y-3 glass-card rounded-3xl">
              <div className="h-10 w-10 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-base font-extrabold text-[var(--text-primary)]">Generating new unique quiz questions...</p>
            </div>
          ) : quizFinished ? (
            /* Quiz Completed Screen */
            <div className="p-8 sm:p-12 rounded-3xl glass-card text-center space-y-6 animate-in fade-in duration-300 border-2 border-[#6c63ff]/30 shadow-2xl">
              <div className="grid h-24 w-24 mx-auto place-items-center rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-400 text-white text-5xl shadow-xl animate-bounce">
                🏆
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#6c63ff] px-4 py-1.5 rounded-full bg-[#6c63ff]/15">
                  Dynamic Retention Challenge
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] pt-2">Quiz Completed!</h2>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">
                  You scored <strong className="text-[var(--text-primary)]">{quizScore}</strong> out of <strong className="text-[var(--text-primary)]">{quizQuestions.length}</strong> correct.
                </p>
              </div>

              <div className="inline-block px-6 py-3 rounded-full bg-emerald-500/20 text-emerald-500 font-black text-sm border border-emerald-500/30">
                🎉 +{earnedXP} XP Learning Bonus Claimed!
              </div>

              <div>
                <button
                  onClick={startQuiz}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 text-white text-sm font-black shadow-xl transition-all scale-102"
                >
                  ⚡ Generate Different Quiz ↻
                </button>
              </div>
            </div>
          ) : quizQuestions.length > 0 ? (
            /* Active Question Card */
            <div className="glass-card p-6 sm:p-10 rounded-3xl space-y-6 animate-in fade-in duration-200 border-2 border-[#6c63ff]/20 shadow-xl">
              {/* Question Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#6c63ff]/15 to-[#8b5cf6]/15 border border-[#6c63ff]/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-[#6c63ff]">
                  <span className="uppercase tracking-wider">
                    Question {currentQuizIdx + 1} of {quizQuestions.length}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">
                    +25 XP Per Correct Answer
                  </span>
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
                      className={`w-full p-4.5 rounded-2xl border text-left text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-between leading-relaxed ${
                        selectedQuizAnswer === null
                          ? "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff] hover:bg-[var(--bg-surface)] text-[var(--text-primary)]"
                          : isCorrect
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-500 shadow-md"
                          : isSelected
                          ? "border-rose-500 bg-rose-500/20 text-rose-500 shadow-md"
                          : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-50"
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedQuizAnswer !== null && isCorrect && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black shrink-0">
                          ✓ Correct
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Question Control */}
              {selectedQuizAnswer !== null && (
                <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
                    💡 <strong className="text-[var(--text-primary)]">Explanation:</strong> {currentQ.explanation}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuizQuestion}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 text-white text-xs sm:text-sm font-black shadow-lg transition-all"
                    >
                      Next Question →
                    </button>
                  </div>
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
