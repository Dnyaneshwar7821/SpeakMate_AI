import { useState } from "react";

const INITIAL_WORDS = [
  { id: "1", word: "Articulate", phonetic: "/ɑːrˈtɪkjuleɪt/", pos: "adj / v", definition: "Expressing oneself clearly and effectively in speech.", example: "She gave an articulate presentation during the interview.", level: "B2", favorite: true },
  { id: "2", word: "Eloquence", phonetic: "/ˈeləkwəns/", pos: "noun", definition: "Fluent or persuasive speaking or writing.", example: "His eloquence captivated the entire audience.", level: "C1", favorite: true },
  { id: "3", word: "Coherent", phonetic: "/koʊˈhɪrənt/", pos: "adj", definition: "Logical and consistent in thought or speech.", example: "Make sure your argument remains coherent throughout.", level: "B1", favorite: false },
  { id: "4", word: "Impromptu", phonetic: "/ɪmˈprɑːmptuː/", pos: "adj / adv", definition: "Done without being planned or rehearsed.", example: "She gave an impromptu speech at the party.", level: "B2", favorite: false },
  { id: "5", word: "Nuance", phonetic: "/ˈnuːɑːns/", pos: "noun", definition: "A subtle difference in meaning, expression, or sound.", example: "Native speakers pick up on cultural nuances in conversation.", level: "C2", favorite: true },
  { id: "6", word: "Resilience", phonetic: "/rɪˈzɪliəns/", pos: "noun", definition: "The capacity to recover quickly from difficulties.", example: "Her resilience helped her overcome initial language barriers.", level: "B2", favorite: false },
];

const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];

export function Vocabulary() {
  const [words, setWords] = useState(INITIAL_WORDS);
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Word Form State
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newLevel, setNewLevel] = useState("B1");

  // Audio Pronunciation
  const handleSpeak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleFav = (id) => {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, favorite: !w.favorite } : w))
    );
  };

  const handleAddWord = (e) => {
    e.preventDefault();
    if (!newWord.trim() || !newDefinition.trim()) return;

    const created = {
      id: Date.now().toString(),
      word: newWord.trim(),
      phonetic: `/${newWord.toLowerCase()}/`,
      pos: "word",
      definition: newDefinition.trim(),
      example: newExample.trim() || `Example sentence using ${newWord}`,
      level: newLevel,
      favorite: false,
    };

    setWords([created, ...words]);
    setNewWord("");
    setNewDefinition("");
    setNewExample("");
    setShowAddModal(false);
  };

  const filteredWords = words.filter((w) => {
    const matchesLevel = selectedLevel === "All" || w.level === selectedLevel;
    const matchesFav = !onlyFavorites || w.favorite;
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesFav && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Vocabulary Builder</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Expand your word bank with CEFR level flashcards, audio pronunciations, and personalized favorites.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-bold text-sm shadow-md shadow-[#6c63ff]/20 flex items-center justify-center gap-2 transition-all"
        >
          <span>➕ Add New Word</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-3.5 top-3 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search word or definition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
            />
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
              onlyFavorites
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)]"
            }`}
          >
            <span>{onlyFavorites ? "★ Favorites Only" : "☆ Show All"}</span>
          </button>
        </div>

        {/* Level Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0">CEFR:</span>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedLevel === lvl
                  ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Words Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWords.map((w) => (
          <div
            key={w.id}
            className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
                  {w.level} • {w.pos}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeak(w.word)}
                    className="p-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[#6c63ff]/10 text-[#6c63ff] transition-all"
                    title="Pronounce Word"
                  >
                    🔊
                  </button>
                  <button
                    onClick={() => handleToggleFav(w.id)}
                    className="text-lg transition-transform hover:scale-110"
                    title="Toggle Favorite"
                  >
                    {w.favorite ? "⭐" : "☆"}
                  </button>
                </div>
              </div>

              <h3 className="font-extrabold text-xl text-[var(--text-primary)]">{w.word}</h3>
              <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">{w.phonetic}</p>

              <p className="text-sm font-semibold text-[var(--text-primary)] mt-3 leading-snug">{w.definition}</p>
              <p className="text-xs italic text-[var(--text-secondary)] mt-2">"{w.example}"</p>
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)]">
              <span>Added to word bank</span>
              <button
                onClick={() => handleSpeak(w.example)}
                className="text-[#6c63ff] hover:underline"
              >
                Listen Example 🔊
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Add Custom Word</h2>
              <button onClick={() => setShowAddModal(false)} className="text-sm font-bold text-[var(--text-secondary)]">✕</button>
            </div>

            <form onSubmit={handleAddWord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Word</label>
                <input
                  type="text"
                  placeholder="e.g. Eloquent"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Definition</label>
                <textarea
                  rows={2}
                  placeholder="Meaning or definition..."
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Example Sentence</label>
                <input
                  type="text"
                  placeholder="e.g. She spoke eloquently..."
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">CEFR Level</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
                >
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6c63ff] text-white text-xs font-bold shadow-md"
                >
                  Save Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vocabulary;
