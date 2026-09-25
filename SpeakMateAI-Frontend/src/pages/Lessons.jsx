import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { lessonModuleService } from "../services/appServices";
import {
  MASTER_LESSONS,
  getLessonsForSchoolGrade,
  getLessonsForAgeGroup,
} from "../constants/masterCurriculum";

const DIFFICULTY_TABS = ["All", "Beginner", "Intermediate", "Advanced"];

const DIFF_COLORS = {
  Beginner: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  Intermediate: { bg: "bg-amber-500/15", text: "text-amber-500" },
  Advanced: { bg: "bg-rose-500/15", text: "text-rose-500" },
};

export function Lessons() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";

  // User Profile
  const accountType = user?.accountType || localStorage.getItem("speakmate_account_type") || "INDIVIDUAL_USER";
  const schoolGrade = user?.schoolGrade || localStorage.getItem("speakmate_school_grade") || "1st Std";
  const rawAge = user?.ageGroup || localStorage.getItem("speakmate_age_group") || "Professional";
  const isStudent = accountType === "STUDENT" || Boolean(user?.schoolGrade);

  const normalizeAgeGroup = (raw) => {
    if (!raw) return "Professional";
    const s = String(raw).toLowerCase();
    if (s.includes("kid") || s.includes("6-12")) return "Kids";
    if (s.includes("teen") || s.includes("13-24") || s.includes("young")) return "Teens";
    if (s.includes("senior")) return "Senior";
    if (s.includes("prof") || s.includes("25+")) return "Professional";
    return "Professional";
  };
  const effectiveAge = normalizeAgeGroup(rawAge);

  // Exact profile-scoped 20 academic lessons
  const profileLessons = useMemo(() => {
    if (isStudent) {
      return getLessonsForSchoolGrade(schoolGrade);
    }
    if (effectiveAge === "Kids") return getLessonsForAgeGroup("Kids (Age 6–12)");
    if (effectiveAge === "Teens") return getLessonsForAgeGroup("Teens & Young Adults (Age 13–24)");
    return getLessonsForAgeGroup("Professionals & Seniors (Age 25+)");
  }, [isStudent, schoolGrade, effectiveAge]);

  const [lessons, setLessons] = useState(profileLessons);
  const [continueItems, setContinueItems] = useState(profileLessons.length > 0 ? [profileLessons[0]] : []);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(urlSearchQuery);
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Distinct categories computed strictly from user's profile lessons
  const categories = useMemo(() => {
    const counts = {};
    profileLessons.forEach((l) => {
      const cat = l.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, lessonCount]) => ({ name, lessonCount }));
  }, [profileLessons]);

  const loadData = async () => {
    try {
      const [cont, list] = await Promise.all([
        lessonModuleService.continueLearning().catch(() => null),
        lessonModuleService.list({}).catch(() => null),
      ]);

      const targetTitles = new Set(profileLessons.map((t) => (t.title || "").toLowerCase().trim()));

      if (cont && Array.isArray(cont) && cont.length > 0) {
        const matchedCont = cont.filter((c) => targetTitles.has((c.title || "").toLowerCase().trim()));
        if (matchedCont.length > 0) {
          setContinueItems(matchedCont);
        } else if (profileLessons.length > 0) {
          setContinueItems([profileLessons[0]]);
        }
      } else if (profileLessons.length > 0) {
        setContinueItems([profileLessons[0]]);
      }

      if (list && Array.isArray(list) && list.length > 0) {
        const matchedBackend = list.filter((b) => targetTitles.has((b.title || "").toLowerCase().trim()));
        const backendTitles = new Set(matchedBackend.map((b) => (b.title || "").toLowerCase().trim()));
        const unseeded = profileLessons.filter((t) => !backendTitles.has((t.title || "").toLowerCase().trim()));
        setLessons([...matchedBackend, ...unseeded]);
      } else {
        setLessons(profileLessons);
      }
    } catch {
      setLessons(profileLessons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLessons(profileLessons);
    if (profileLessons.length > 0) {
      setContinueItems([profileLessons[0]]);
    }
    loadData();
  }, [profileLessons]);

  const handleSearch = useCallback(
    async (text, currentLessons = lessons) => {
      setSearchText(text);
      if (!text.trim()) {
        setSearchResults(null);
        return;
      }
      try {
        const query = text.toLowerCase();
        const localResults = currentLessons.filter(
          (l) =>
            l.title.toLowerCase().includes(query) ||
            l.description?.toLowerCase().includes(query) ||
            l.category?.toLowerCase().includes(query) ||
            l.level?.toLowerCase().includes(query)
        );
        setSearchResults(localResults);
      } catch (e) {
        setSearchResults([]);
      }
    },
    [lessons]
  );

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
    // 1. Filter by difficulty tab
    if (activeTab !== "All") {
      result = result.filter((l) => l.level === activeTab || l.difficulty === activeTab);
    }
    // 2. Filter by category
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
            {isStudent ? `🎓 School Grade: ${schoolGrade}` : `👤 Target Profile: ${effectiveAge}`}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-2.5">
            {isStudent ? `${schoolGrade} Academic Lessons` : `${effectiveAge} English Masterclasses`}
          </h1>
          <p className="text-sm sm:text-base text-indigo-200 font-medium leading-relaxed">
            {isStudent
              ? `20 structured academic masterclasses teaching grammar formulas, phonics rules, and sentence syntax tailored to your ${schoolGrade} curriculum.`
              : `20 structured academic masterclasses teaching grammar formulas, executive sentence syntax, and formal communication tailored to your ${effectiveAge} profile.`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="🔍 Search lessons, grammar rules, phonics, topics..."
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
              Category: {continueItems[0].category} • Level: {continueItems[0].level} • +{continueItems[0].xpReward || 35} XP Reward
            </p>
          </div>
          <button
            onClick={() => navigate(`/lessons/${continueItems[0].id}`)}
            className="px-8 py-4 rounded-2xl bg-white text-[#6C63FF] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            Start Masterclass ▶
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {categories.length > 0 && searchResults === null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[var(--text-primary)]">Curriculum Categories</h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-black text-[#6C63FF] hover:underline"
              >
                Clear Filter ({selectedCategory})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.slice(0, 12).map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all text-center space-y-1 ${
                  selectedCategory === cat.name
                    ? "bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] border-[#6C63FF] text-white shadow-xl scale-102"
                    : "glass-card glass-card-hover border-[var(--border-default)]"
                }`}
              >
                <p className="font-black text-xs truncate">{cat.name}</p>
                <p className="text-[10px] opacity-80 font-black">{cat.lessonCount} lessons</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Lessons Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">
            {isStudent ? `${schoolGrade} Academic Lessons` : `${effectiveAge} Lessons`} ({filteredLessons.length})
          </h2>
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            Showing 20 targeted concept lessons
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center font-extrabold text-sm text-[var(--text-secondary)]">
            Loading lessons...
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-2 glass-card rounded-3xl">
            <p className="text-4xl">📖</p>
            <p className="font-extrabold text-base text-[var(--text-primary)]">
              No lessons found matching your filters.
            </p>
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
                      <span
                        className={`text-[10px] font-black px-3 py-1 rounded-full ${diffBadge.bg} ${diffBadge.text}`}
                      >
                        {l.level || l.difficulty || "Beginner"}
                      </span>
                    </div>

                    <h3 className="font-black text-lg text-[var(--text-primary)] group-hover:text-[#6C63FF] transition-colors leading-snug">
                      {l.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-2">
                      {l.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] font-extrabold">
                      ⏱️ {l.estimatedMinutes || 15} mins • +{l.xpReward || 35} XP
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
