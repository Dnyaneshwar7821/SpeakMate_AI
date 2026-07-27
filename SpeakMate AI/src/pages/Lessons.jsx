import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { lessonModuleService } from "../services/appServices";

const DIFFICULTY_TABS = ["All", "Beginner", "Intermediate", "Advanced"];

const DIFF_COLORS = {
  Beginner: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  Intermediate: { bg: "bg-amber-500/10", text: "text-amber-500" },
  Advanced: { bg: "bg-red-500/10", text: "text-red-500" },
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
    <div className="w-full space-y-6">
      {/* Hero Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-xl space-y-5">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/10 uppercase tracking-wider text-amber-400">
            Structured CEFR & School Standard Path
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">CEFR English Lessons</h1>
          <p className="text-xs sm:text-sm text-[#A5B4FC] font-medium leading-relaxed">
            Bite-sized interactive lessons covering grammar, vocabulary, business communication, and natural speaking drills.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <svg className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search lessons, topics, categories..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
          />
        </div>
      </div>

      {/* Difficulty Level Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-subtle)] pb-3">
        <span className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider shrink-0">
          Level Tier:
        </span>
        {DIFFICULTY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all ${
              activeTab === tab
                ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Continue Learning Banner */}
      {continueItems.length > 0 && searchResults === null && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              📚 Continue Learning
            </span>
            <h3 className="text-xl font-extrabold">{continueItems[0].title}</h3>
            <p className="text-xs font-medium opacity-90">
              Category: {continueItems[0].category} • Level: {continueItems[0].level} • {continueItems[0].progressPercent || 40}% Complete
            </p>
          </div>
          <button
            onClick={() => navigate(`/lessons/${continueItems[0].id}`)}
            className="px-6 py-3 rounded-2xl bg-white text-[#6c63ff] font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 transition-transform shrink-0"
          >
            Resume Lesson ▶
          </button>
        </div>
      )}

      {/* Categories Carousel */}
      {categories.length > 0 && searchResults === null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Lesson Categories</h2>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className="text-xs font-extrabold text-[#6c63ff] hover:underline">
                Clear Filter ({selectedCategory})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all text-center space-y-1 ${
                  selectedCategory === cat.name
                    ? "bg-[#6c63ff] border-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/25"
                    : "glass-card glass-card-hover border-[var(--border-default)]"
                }`}
              >
                <p className="text-2xl">📂</p>
                <p className="font-extrabold text-xs truncate">{cat.name}</p>
                <p className="text-[10px] opacity-80 font-bold">{cat.lessonCount || 8} lessons</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Lessons Grid */}
      <div className="space-y-3">
        <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
          {selectedCategory ? `${selectedCategory} Lessons` : `${activeTab} Lessons`} ({filteredLessons.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center font-extrabold text-sm text-[var(--text-secondary)]">Loading lessons...</div>
        ) : filteredLessons.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-secondary)] space-y-2 glass-card rounded-3xl">
            <p className="text-3xl">📖</p>
            <p className="font-extrabold text-sm">No lessons found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLessons.map((l) => {
              const diffBadge = DIFF_COLORS[l.level] || DIFF_COLORS[l.difficulty] || DIFF_COLORS.Beginner;
              return (
                <div
                  key={l.id}
                  onClick={() => navigate(`/lessons/${l.id}`)}
                  className="glass-card glass-card-hover p-5 rounded-3xl space-y-3 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
                        {l.category || "General"}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${diffBadge.bg} ${diffBadge.text}`}>
                        {l.level || l.difficulty || "Beginner"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">
                      {l.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{l.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] font-bold">
                      ⏱️ {l.estimatedMinutes || l.duration || 15} mins • +{l.xpReward || 25} XP
                    </span>
                    <button className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] group-hover:bg-[#6c63ff] group-hover:text-white font-extrabold text-xs transition-all">
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
