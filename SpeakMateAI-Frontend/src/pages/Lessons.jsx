import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { lessonModuleService } from "../services/appServices";
import { recordLessonCompleted } from "../utils/progressTracker";

const DIFFICULTY_TABS = ["All", "Beginner", "Intermediate", "Advanced"];

const DIFF_COLORS = {
  Beginner: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  Intermediate: { bg: "bg-amber-500/15", text: "text-amber-500" },
  Advanced: { bg: "bg-rose-500/15", text: "text-rose-500" },
};

const DEFAULT_CATEGORIES = [
  { name: "Grammar", lessonCount: 6 },
  { name: "Vocabulary", lessonCount: 5 },
  { name: "Business", lessonCount: 5 },
  { name: "Speaking", lessonCount: 5 },
  { name: "Phonics", lessonCount: 3 },
  { name: "Academic", lessonCount: 4 },
];

const DEFAULT_LESSONS = [
  {
    id: "1",
    title: "Present Tenses Mastery",
    category: "Grammar",
    level: "Beginner",
    difficulty: "Beginner",
    estimatedMinutes: 15,
    xpReward: 35,
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
    xpReward: 35,
    description: "Practice answering behavioral interview questions confidently with AI Tutor voice feedback.",
  },
  {
    id: "4",
    title: "Essential Everyday Vocabulary (Top 500 Words)",
    category: "Vocabulary",
    level: "Beginner",
    difficulty: "Beginner",
    estimatedMinutes: 15,
    xpReward: 35,
    description: "Expand your word bank with high-frequency nouns, verbs, and adjectives used in daily conversations.",
  },
  {
    id: "5",
    title: "Idioms & Phrasal Verbs for Natural Speech",
    category: "Speaking",
    level: "Intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 18,
    xpReward: 35,
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
    estimatedMinutes: 25,
    xpReward: 35,
    description: "Comprehensive public speaking prep, keynote delivery, and oral presentation mastery for 10th standard students.",
  },
  {
    id: "8",
    title: "Social Small Talk & Networking Confidence",
    category: "Speaking",
    level: "Beginner",
    difficulty: "Beginner",
    estimatedMinutes: 15,
    xpReward: 35,
    description: "Break the ice easily at social gatherings, coffee shops, and campus events with effortless small talk.",
  },
  {
    id: "9",
    title: "Conditionals: Real & Unreal 'If' Scenarios",
    category: "Grammar",
    level: "Intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 18,
    xpReward: 35,
    description: "Master Zero, 1st, 2nd, and 3rd conditionals to express facts, possibilities, hypotheses, and regrets.",
  },
  {
    id: "10",
    title: "English Vowel Minimal Pairs & Accent Clarity",
    category: "Phonics",
    level: "Beginner",
    difficulty: "Beginner",
    estimatedMinutes: 15,
    xpReward: 35,
    description: "Sharpen pronunciation with minimal pair drills like Ship vs Sheep, Cut vs Cat, and Bed vs Bad.",
  },
  {
    id: "11",
    title: "Overcoming Hesitation & Eliminating Fillers",
    category: "Speaking",
    level: "Intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 16,
    xpReward: 35,
    description: "Replace awkward pauses, 'umms', and 'aahs' with smooth transitional pacing and thought pauses.",
  },
  {
    id: "12",
    title: "Executive Presentation & Pitch Strategy",
    category: "Business",
    level: "Advanced",
    difficulty: "Advanced",
    estimatedMinutes: 22,
    xpReward: 35,
    description: "Structure compelling business slides, hook your audience, and handle tough investor Q&A with poise.",
  },
  {
    id: "13",
    title: "Word Stress & Sentence Intonation Rhythm",
    category: "Phonics",
    level: "Intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 15,
    xpReward: 35,
    description: "Learn pitch modulation, rising/falling intonation, and syllable stress rules in two-syllable nouns vs verbs.",
  },
  {
    id: "14",
    title: "Active vs Passive Voice in Formal Contexts",
    category: "Grammar",
    level: "Advanced",
    difficulty: "Advanced",
    estimatedMinutes: 20,
    xpReward: 35,
    description: "Learn when to use passive voice for diplomatic, scientific, and journalistic reporting.",
  },
  {
    id: "15",
    title: "Debate, Negotiation & Persuasive Rhetoric",
    category: "Speaking",
    level: "Advanced",
    difficulty: "Advanced",
    estimatedMinutes: 24,
    xpReward: 35,
    description: "Defend arguments logically, formulate respectful counter-points, and negotiate win-win agreements.",
  },
  {
    id: "16",
    title: "Academic Essay Rhetoric & Spoken Summaries",
    category: "Academic",
    level: "Advanced",
    difficulty: "Advanced",
    estimatedMinutes: 20,
    xpReward: 35,
    description: "Construct well-reasoned academic arguments with clear thesis statements, evidence, and conclusions.",
  },
];

export function Lessons() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [lessons, setLessons] = useState(DEFAULT_LESSONS);
  const [continueItems, setContinueItems] = useState([DEFAULT_LESSONS[0]]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(urlSearchQuery);
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

  const handleSearch = useCallback(async (text, currentLessons = lessons) => {
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
        const localResults = currentLessons.filter(
          (l) =>
            l.title.toLowerCase().includes(query) ||
            l.description?.toLowerCase().includes(query) ||
            l.category?.toLowerCase().includes(query) ||
            l.level?.toLowerCase().includes(query)
        );
        setSearchResults(localResults);
      }
    } catch (e) {
      setSearchResults([]);
    }
  }, [lessons]);

  // Sync search filter when URL search parameter changes
  useEffect(() => {
    handleSearch(urlSearchQuery, lessons);
  }, [urlSearchQuery, lessons, handleSearch]);

  const onSearchInputChange = (text) => {
    setSearchText(text);
    if (text.trim()) {
      setSearchParams({ search: text.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] p-6 sm:p-10 text-white shadow-2xl space-y-6 border border-white/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20 shadow-sm mb-3.5 sm:mb-4">
            🎓 Structured CEFR Curriculum
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-2.5">CEFR English Lessons</h1>
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
              onChange={(e) => onSearchInputChange(e.target.value)}
              className="w-full pl-5 pr-4 py-3.5 rounded-2xl bg-white/15 border border-white/25 text-white placeholder-indigo-200 text-sm font-bold focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all shadow-inner"
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
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black shrink-0 transition-all active:scale-95 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-md shadow-[#6C63FF]/25 scale-102"
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
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#FF6584] text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
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
            className="px-8 py-4 rounded-2xl bg-white text-[#6C63FF] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
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
              <button onClick={() => setSelectedCategory(null)} className="text-xs font-black text-[#6C63FF] hover:underline">
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
                    ? "bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] border-[#6C63FF] text-white shadow-xl scale-102"
                    : "glass-card glass-card-hover border-[var(--border-default)]"
                }`}
              >
                <p className="text-3xl">📂</p>
                <p className="font-black text-xs sm:text-sm truncate">{cat.name}</p>
                <p className="text-[10px] opacity-80 font-black">{cat.lessonCount || 8} lessons</p>
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
                  onClick={() => {
                    navigate(`/lessons/${l.id}`);
                  }}
                  className="group glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between cursor-pointer border border-[var(--border-default)] hover:border-[#6C63FF]/50 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#6C63FF]/15 text-[#6C63FF]">
                        {l.category || "General"}
                      </span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${diffBadge.bg} ${diffBadge.text}`}>
                        {l.level || l.difficulty || "Beginner"}
                      </span>
                    </div>

                    <h3 className="font-black text-lg text-[var(--text-primary)] group-hover:text-[#6C63FF] transition-colors">
                      {l.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-2">{l.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] font-extrabold">
                      ⏱️ {l.estimatedMinutes || l.duration || 15} mins • +{l.xpReward || 25} XP
                    </span>
                    <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] group-hover:opacity-95 text-white font-black text-xs shadow-md transition-all">
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
