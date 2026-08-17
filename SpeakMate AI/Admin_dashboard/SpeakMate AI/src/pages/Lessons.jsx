import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { lessonModuleService } from "../services/appServices";

const DIFFICULTY_TABS = ["All", "Beginner", "Intermediate", "Advanced"];

const DIFF_COLORS = {
  Beginner: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  Intermediate: { bg: "bg-amber-500/15", text: "text-amber-500" },
  Advanced: { bg: "bg-rose-500/15", text: "text-rose-500" },
};

const DEFAULT_CATEGORIES = [
  { name: "Grammar", lessonCount: 12 },
  { name: "Vocabulary", lessonCount: 15 },
  { name: "Business", lessonCount: 8 },
  { name: "Speaking", lessonCount: 14 },
  { name: "Academic", lessonCount: 10 },
  { name: "Daily Life", lessonCount: 11 },
];

const DEFAULT_LESSONS = [
  {
    id: "1",
    title: "Present Tenses Mastery",
    category: "Grammar",
    level: "Beginner",
    difficulty: "Beginner",
    estimatedMinutes: 15,
    xpReward: 25,
    description: "Master present simple vs continuous tenses with real-world sentence drills and voice audio exercises.",
  },
  {
    id: "2",
    title: "Professional Email & Business Writing",
    category: "Business",
    level: "Intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 20,
    xpReward: 35,
    description: "Learn executive tone, formal greetings, and persuasive communication strategies for business emails.",
  },
  {
    id: "3",
    title: "Job Interview Speaking Drills",
    category: "Business",
    level: "Advanced",
    difficulty: "Advanced",
    estimatedMinutes: 25,
    xpReward: 50,
    description: "Practice answering behavioral interview questions confidently with AI Tutor voice feedback.",
  },
  {
    id: "4",
    title: "Essential Everyday Vocabulary",
    category: "Vocabulary",
    level: "Beginner",
    difficulty: "Beginner",
    estimatedMinutes: 15,
    xpReward: 20,
    description: "Expand your word bank with 50 high-frequency nouns, verbs, and adjectives used in daily conversations.",
  },
  {
    id: "5",
    title: "Idioms & Phrasal Verbs for Natural Speech",
    category: "Speaking",
    level: "Intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 18,
    xpReward: 30,
    description: "Sound like a native speaker using popular English idioms, phrasal verbs, and expressive collocations.",
  },
  {
    id: "6",
    title: "Past & Present Perfect Tense Drills",
    category: "Grammar",
    level: "Intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 20,
    xpReward: 35,
    description: "Understand the subtle differences between simple past and present perfect with step-by-step quizzes.",
  },
  {
    id: "7",
    title: "10th Board Oral Exam & Public Speaking Prep",
    category: "Academic",
    level: "Advanced",
    difficulty: "Advanced",
    estimatedMinutes: 30,
    xpReward: 60,
    description: "Comprehensive public speaking prep, keynote delivery, and oral presentation mastery for 10th standard students.",
  },
  {
    id: "8",
    title: "Social Small Talk & Networking Confidence",
    category: "Daily Life",
    level: "Beginner",
    difficulty: "Beginner",
    estimatedMinutes: 15,
    xpReward: 25,
    description: "Break the ice easily at social gatherings, coffee shops, and campus events with effortless small talk.",
  },
];

export function Lessons() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [lessons, setLessons] = useState(DEFAULT_LESSONS);
  const [continueItems, setContinueItems] = useState([DEFAULT_LESSONS[0]]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const loadData = async () => {
    try {
      const fetchWithTimeout = (promise, ms = 2000) =>
        Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
        ]);

      const [cats, cont, list] = await Promise.all([
        fetchWithTimeout(lessonModuleService.categories()).catch(() => null),
        fetchWithTimeout(lessonModuleService.continueLearning()).catch(() => null),
        fetchWithTimeout(lessonModuleService.list({})).catch(() => null),
      ]);

      if (cats && Array.isArray(cats) && cats.length > 0) setCategories(cats);
      if (cont && Array.isArray(cont) && cont.length > 0) setContinueItems(cont);
      if (list && Array.isArray(list) && list.length > 0) setLessons(list);
    } catch (e) {
      console.warn("Using default CEFR lessons fallback:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLessons = useMemo(() => {
    let result = searchResults !== null ? searchResults : lessons;
    if (activeTab !== "All") {
      result = result.filter((l) => l.level === activeTab || l.difficulty === activeTab);
    }
    if (selectedCategory) {
      result = result.filter((l) => l.category === selectedCategory);
    }
    return result;
  }, [lessons, searchResults, activeTab, selectedCategory]);

  const handleSearch = async (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await lessonModuleService.search(text.trim()).catch(() => null);
      if (results && Array.isArray(results)) {
        setSearchResults(results);
      } else {
        const query = text.toLowerCase();
        const localResults = lessons.filter(
          (l) =>
            l.title.toLowerCase().includes(query) ||
            l.description.toLowerCase().includes(query) ||
            l.category.toLowerCase().includes(query)
        );
        setSearchResults(localResults);
      }
    } catch (e) {
      setSearchResults([]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-4">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-6 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
            🎓 Structured CEFR Path
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">CEFR English Lessons</h1>
          <p className="text-sm sm:text-base text-indigo-200 font-medium leading-relaxed">
            Bite-sized interactive lessons covering grammar, vocabulary, business communication, and natural speaking drills.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="🔍 Search lessons, topics, categories..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-5 pr-4 py-3.5 rounded-2xl bg-white/15 border border-white/25 text-white placeholder-indigo-200 text-sm font-bold focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>
      </div>

      {/* Difficulty Level Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider px-2 shrink-0">
            Level Tier:
          </span>
          {DIFFICULTY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black shrink-0 transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-md shadow-[#6c63ff]/25 scale-102"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Continue Learning Banner */}
      {continueItems.length > 0 && searchResults === null && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-3.5 py-1 rounded-full border border-white/20">
              📚 Continue Learning
            </span>
            <h3 className="text-2xl font-black">{continueItems[0].title}</h3>
            <p className="text-xs sm:text-sm font-semibold opacity-90">
              Category: {continueItems[0].category} • Level: {continueItems[0].level} • {continueItems[0].progressPercent || 40}% Complete
            </p>
          </div>
          <button
            onClick={() => navigate(`/lessons/${continueItems[0].id}`)}
            className="px-8 py-4 rounded-2xl bg-white text-[#6c63ff] font-black text-sm shadow-xl hover:scale-105 transition-all shrink-0"
          >
            Resume Lesson ▶
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {categories.length > 0 && searchResults === null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[var(--text-primary)]">Lesson Categories</h2>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className="text-xs font-black text-[#6c63ff] hover:underline">
                Clear Filter ({selectedCategory})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all text-center space-y-2 ${
                  selectedCategory === cat.name
                    ? "bg-gradient-to-br from-[#6c63ff] to-[#4f46e5] border-[#6c63ff] text-white shadow-xl scale-102"
                    : "glass-card glass-card-hover border-[var(--border-default)]"
                }`}
              >
                <p className="text-3xl">📂</p>
                <p className="font-black text-xs sm:text-sm truncate">{cat.name}</p>
                <p className="text-[10px] opacity-80 font-extrabold">{cat.lessonCount || 8} lessons</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Lessons Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-[var(--text-primary)]">
          {selectedCategory ? `${selectedCategory} Lessons` : `${activeTab} Lessons`} ({filteredLessons.length})
        </h2>

        {loading ? (
          <div className="p-16 text-center font-extrabold text-sm text-[var(--text-secondary)]">Loading lessons...</div>
        ) : filteredLessons.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-2 glass-card rounded-3xl">
            <p className="text-4xl">📖</p>
            <p className="font-extrabold text-base text-[var(--text-primary)]">No lessons found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((l) => {
              const diffBadge = DIFF_COLORS[l.level] || DIFF_COLORS[l.difficulty] || DIFF_COLORS.Beginner;
              return (
                <div
                  key={l.id}
                  onClick={() => navigate(`/lessons/${l.id}`)}
                  className="group glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between cursor-pointer border border-[var(--border-default)] hover:border-[#6c63ff]/50 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#6c63ff]/15 text-[#6c63ff]">
                        {l.category || "General"}
                      </span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${diffBadge.bg} ${diffBadge.text}`}>
                        {l.level || l.difficulty || "Beginner"}
                      </span>
                    </div>

                    <h3 className="font-black text-lg text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">
                      {l.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-2">{l.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] font-bold">
                      ⏱️ {l.estimatedMinutes || l.duration || 15} mins • +{l.xpReward || 25} XP
                    </span>
                    <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] group-hover:opacity-90 text-white font-extrabold text-xs shadow-md transition-all">
                      Start →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Lessons;
