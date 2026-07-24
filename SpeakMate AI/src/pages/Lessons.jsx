import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";
import { lessonModuleService } from "../services/appServices";

const DIFFICULTY_TABS = ["All", "Beginner", "Intermediate", "Advanced"];

const DIFF_COLORS = {
  Beginner: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  Intermediate: { bg: "bg-amber-500/10", text: "text-amber-500" },
  Advanced: { bg: "bg-red-500/10", text: "text-red-500" },
};

export function Lessons() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [continueItems, setContinueItems] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, recs, cont, list] = await Promise.all([
        lessonModuleService.categories().catch(() => []),
        lessonModuleService.recommended().catch(() => []),
        lessonModuleService.continueLearning().catch(() => []),
        lessonModuleService.list({}).catch(() => []),
      ]);
      setCategories(cats || []);
      setRecommended(recs || []);
      setContinueItems(cont || []);
      setLessons(list || []);
    } catch (e) {
      console.warn("Failed to load lessons data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter lessons by difficulty and category
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
      const results = await lessonModuleService.search(text.trim());
      setSearchResults(results || []);
    } catch (e) {
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-xl space-y-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/10 uppercase tracking-wider text-amber-400">
            Structured Learning Path
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">CEFR English Lessons</h1>
          <p className="text-xs sm:text-sm text-[#A5B4FC] leading-relaxed">
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
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
          />
        </div>
      </div>

      {/* Difficulty Level Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-subtle)] pb-3">
        <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0">Level Tier:</span>
        {DIFFICULTY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
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
            <p className="text-xs opacity-90">
              Category: {continueItems[0].category} • Level: {continueItems[0].level} • {continueItems[0].progressPercent || 40}% Complete
            </p>
          </div>
          <button
            onClick={() => navigate(`/lessons/${continueItems[0].id}`)}
            className="px-6 py-3 rounded-2xl bg-white text-[#6c63ff] font-extrabold text-xs shadow-lg hover:scale-105 transition-transform shrink-0"
          >
            Resume Lesson ▶
          </button>
        </div>
      )}

      {/* Categories Carousel */}
      {categories.length > 0 && searchResults === null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Lesson Categories</h2>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className="text-xs font-bold text-[#6c63ff] hover:underline">
                Clear Category Filter ({selectedCategory})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all text-center space-y-1 ${
                  selectedCategory === cat.name
                    ? "bg-[#6c63ff] border-[#6c63ff] text-white"
                    : "bg-[var(--bg-surface)] border-[var(--border-default)] hover:border-[#6c63ff]"
                }`}
              >
                <p className="text-2xl">📂</p>
                <p className="font-extrabold text-xs truncate">{cat.name}</p>
                <p className="text-[10px] opacity-75 font-semibold">{cat.lessonCount || 8} lessons</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Lessons Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
          {selectedCategory ? `${selectedCategory} Lessons` : `${activeTab} Lessons`} ({filteredLessons.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center font-bold text-[var(--text-secondary)]">Loading lessons...</div>
        ) : filteredLessons.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-secondary)] space-y-2">
            <p className="text-3xl">📖</p>
            <p className="font-bold text-sm">No lessons found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLessons.map((l) => {
              const diffBadge = DIFF_COLORS[l.level] || DIFF_COLORS[l.difficulty] || DIFF_COLORS.Beginner;
              return (
                <div
                  key={l.id}
                  onClick={() => navigate(`/lessons/${l.id}`)}
                  className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
                        {l.category || "General"}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${diffBadge.bg} ${diffBadge.text}`}>
                        {l.level || l.difficulty || "Beginner"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">{l.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed line-clamp-2">{l.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] font-semibold">⏱️ {l.estimatedMinutes || l.duration || 15} mins • +{l.xpReward || 25} XP</span>
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
