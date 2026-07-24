import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakingService, onboardingService } from "../services/appServices";

// ── Age-Tailored Scenarios matching React Native SpeakingHomeScreen ─────────
const AGE_SCENARIOS = {
  Kids: [
    { id: "k1", title: "Show & Tell", category: "General", difficulty: "Beginner", duration: 4, xp: 15, icon: "🎨", desc: "Share your favorite toy, book, or pet with your AI friend." },
    { id: "k2", title: "At the Zoo", category: "Daily Life", difficulty: "Beginner", duration: 5, xp: 15, icon: "🐾", desc: "Talk to the zoo guide about your favorite animals." },
    { id: "k3", title: "Ordering Ice Cream", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍦", desc: "Choose your favorite flavors and toppings at the ice cream shop." },
    { id: "k4", title: "My Favorite Superhero", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "⚡", desc: "Describe a superhero and their special powers!" },
    { id: "k5", title: "School Lunch Time", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍎", desc: "Chat with classmates about your lunch and playground games." },
    { id: "k6", title: "Space Adventure", category: "Travel", difficulty: "Intermediate", duration: 6, xp: 20, icon: "🚀", desc: "Explore new planets and talk to an alien space buddy." },
  ],
  Teens: [
    { id: "t1", title: "First Day at High School", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "🎒", desc: "Introduce yourself and make new friends at school." },
    { id: "t2", title: "Ordering Fast Food", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍔", desc: "Order burgers, fries, and drinks with your friends." },
    { id: "t3", title: "Gaming & Hobbies", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "🎮", desc: "Discuss your favorite video games, sports, and music bands." },
    { id: "t4", title: "Planning a Weekend Outing", category: "Daily Life", difficulty: "Intermediate", duration: 6, xp: 20, icon: "🎟️", desc: "Group chat to pick a movie or visit an amusement park." },
  ],
  "Young Adult": [
    { id: "y1", title: "Daily Conversation", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "💬", desc: "Chat about campus life, daily habits, and weekend plans." },
    { id: "y2", title: "Campus Coffee Shop", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "☕", desc: "Order artisan coffee, study snacks, and chat with baristas." },
    { id: "y3", title: "College Admission Interview", category: "Career", difficulty: "Intermediate", duration: 8, xp: 30, icon: "🎓", desc: "Answer admission questions and explain your choice of major." },
    { id: "y4", title: "Hostel & Roommate Chat", category: "Daily Life", difficulty: "Intermediate", duration: 5, xp: 20, icon: "🏠", desc: "Discuss sharing house chores, schedules, and groceries." },
  ],
  Professional: [
    { id: "1", title: "Daily Conversation", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "💬", desc: "Chat about your day, hobbies, and general interests." },
    { id: "2", title: "Ordering in Restaurant", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍽️", desc: "Order food, ask about the menu, and pay the bill." },
    { id: "3", title: "Hotel Check-in", category: "Travel", difficulty: "Beginner", duration: 5, xp: 20, icon: "🏨", desc: "Check in, request room services, and ask for local recommendations." },
    { id: "4", title: "Airport Customs", category: "Travel", difficulty: "Intermediate", duration: 6, xp: 25, icon: "✈️", desc: "Declare items, answer security questions, and handle arrivals." },
    { id: "5", title: "Office Small Talk", category: "Work", difficulty: "Intermediate", duration: 5, xp: 20, icon: "👔", desc: "Engage with colleagues, discuss weekends, and plan lunches." },
    { id: "6", title: "Business Meeting", category: "Work", difficulty: "Advanced", duration: 8, xp: 30, icon: "📊", desc: "Present updates, pitch ideas, and negotiate corporate terms." },
    { id: "7", title: "Job Interview Practice", category: "Career", difficulty: "Advanced", duration: 10, xp: 40, icon: "💼", desc: "Practice typical HR questions and explain your career goals." },
    { id: "8", title: "Salary & Contract Negotiation", category: "Career", difficulty: "Advanced", duration: 8, xp: 35, icon: "💵", desc: "Negotiate compensation, benefits, and start date." },
  ],
  Senior: [
    { id: "s1", title: "Relaxed Daily Conversation", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "☕", desc: "Chat comfortably about morning routines, weather, and life." },
    { id: "s2", title: "Tea Time & Gardening", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "🌿", desc: "Discuss plants, cooking recipes, and home hobbies." },
    { id: "s3", title: "Visiting the Pharmacy", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "💊", desc: "Ask a pharmacist about prescription directions and advice." },
  ],
};

const CATEGORIES = ["All", "General", "Daily Life", "Travel", "Work", "Career"];
const AGE_GROUPS = ["Kids", "Teens", "Young Adult", "Professional", "Senior"];

export function SpeakingPractice() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userAgeGroup, setUserAgeGroup] = useState("Professional");

  // Load history & profile age group
  const loadData = async () => {
    setLoading(true);
    try {
      const [historyData, onboardingData] = await Promise.all([
        speakingService.history().catch(() => []),
        onboardingService.get().catch(() => null),
      ]);
      setHistory(historyData || []);
      if (onboardingData?.ageGroup) {
        setUserAgeGroup(onboardingData.ageGroup);
      }
    } catch (e) {
      console.warn("Failed to load speaking data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalMinutes = history.reduce((sum, item) => sum + (item.duration || 0), 0) / 60;
  const totalXP = history.reduce((sum, item) => sum + (item.xpEarned || 0), 0);
  const totalSessions = history.length;
  const streak = history.length > 0 ? 3 : 0;

  const handleStartScenario = async (scenario) => {
    try {
      const session = await speakingService.start({
        scenario: scenario.title,
        difficulty: scenario.difficulty,
        estimatedDuration: scenario.duration,
        xpReward: scenario.xp,
      }).catch(() => ({ id: Date.now().toString() }));

      navigate(`${ROUTES.CONVERSATION_SESSION}?sessionId=${session.id}&scenario=${encodeURIComponent(scenario.title)}&xpReward=${scenario.xp}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this speaking session from your history?")) {
      try {
        await speakingService.remove(id);
        setHistory((prev) => prev.filter((h) => h.id !== id));
      } catch (err) {
        console.error("Delete history failed:", err);
      }
    }
  };

  const activeScenarios = AGE_SCENARIOS[userAgeGroup] || AGE_SCENARIOS["Professional"];
  const filteredScenarios = activeScenarios.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] to-[#1E1B4B] text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/10 uppercase tracking-wider">
              Interactive AI Voice Module
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Speaking Practice</h1>
          </div>

          <button
            onClick={() => handleStartScenario({ title: "Free Speaking Practice", difficulty: "Intermediate", duration: 5, xp: 20 })}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-xs shadow-lg shadow-[#6c63ff]/25 hover:scale-105 transition-all shrink-0"
          >
            🎙️ Start Free Voice Conversation
          </button>
        </div>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div>
            <p className="text-lg font-extrabold">{streak} 🔥</p>
            <p className="text-[10px] opacity-75 font-semibold">Streak Days</p>
          </div>
          <div>
            <p className="text-lg font-extrabold">{Math.round(totalMinutes)}m</p>
            <p className="text-[10px] opacity-75 font-semibold">Total Mins</p>
          </div>
          <div>
            <p className="text-lg font-extrabold">{totalXP} ⭐</p>
            <p className="text-[10px] opacity-75 font-semibold">XP Earned</p>
          </div>
          <div>
            <p className="text-lg font-extrabold">{totalSessions}</p>
            <p className="text-[10px] opacity-75 font-semibold">Sessions</p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3.5 top-3 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversation scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
          />
        </div>

        {/* Age Group Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-subtle)] pb-3">
          <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0">Target Audience:</span>
          {AGE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setUserAgeGroup(group)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                userAgeGroup === group
                  ? "bg-[#ff6584] text-white shadow-md shadow-[#ff6584]/20"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div>
        <h2 className="text-lg font-extrabold text-[var(--text-primary)] mb-4">Conversation Scenarios ({userAgeGroup})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScenarios.map((sc) => (
            <div
              key={sc.id}
              onClick={() => handleStartScenario(sc)}
              className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-3xl p-3 rounded-2xl bg-[#6c63ff]/10 group-hover:scale-110 transition-transform">
                    {sc.icon}
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
                    {sc.difficulty}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">{sc.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{sc.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] font-semibold">⏱️ {sc.duration} mins • +{sc.xp} XP</span>
                <span className="text-xs font-extrabold text-[#6c63ff] group-hover:translate-x-1 transition-transform">Start →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speaking History List */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Speaking History & Saved Sessions</h2>

        {history.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-secondary)] space-y-2">
            <p className="text-3xl">🎙️</p>
            <p className="font-bold text-sm">No speaking history yet.</p>
            <p className="text-xs">Start any scenario above to practice live speaking!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => navigate(`/speaking/history/${h.id}`)}
                className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[#6c63ff]/30 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2.5 rounded-xl bg-[#6c63ff]/10 text-[#6c63ff]">💬</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{h.scenario || "Speaking Practice"}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {new Date(h.createdAt || Date.now()).toLocaleDateString()} • {Math.round((h.duration || 180) / 60)}m • Score: {h.score || 88}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#6c63ff]">Replay →</span>
                  <button
                    onClick={(e) => handleDeleteHistory(h.id, e)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                    title="Delete Conversation"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SpeakingPractice;
