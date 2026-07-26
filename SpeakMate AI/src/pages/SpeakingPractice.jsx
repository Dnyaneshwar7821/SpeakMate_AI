import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakingService, onboardingService } from "../services/appServices";

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

  const activeScenarios = AGE_SCENARIOS[userAgeGroup] || AGE_SCENARIOS["Professional"];
  const filteredScenarios = activeScenarios.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Stats Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/10 uppercase tracking-wider">
              Interactive AI Voice Module
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Speaking Practice</h1>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium">
              Choose a scenario role, speak naturally, and get real-time audio evaluation.
            </p>
          </div>

          <button
            onClick={() => handleStartScenario({ title: "Free Speaking Practice", difficulty: "Intermediate", duration: 5, xp: 20 })}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-xs sm:text-sm shadow-lg hover:scale-105 transition-transform shrink-0"
          >
            🎙️ Start Free Voice Conversation
          </button>
        </div>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div>
            <p className="text-xl font-extrabold">{streak} 🔥</p>
            <p className="text-xs font-semibold opacity-80 mt-0.5">Streak Days</p>
          </div>
          <div>
            <p className="text-xl font-extrabold">{Math.round(totalMinutes)}m</p>
            <p className="text-xs font-semibold opacity-80 mt-0.5">Total Mins</p>
          </div>
          <div>
            <p className="text-xl font-extrabold">{totalXP} ⭐</p>
            <p className="text-xs font-semibold opacity-80 mt-0.5">XP Earned</p>
          </div>
          <div>
            <p className="text-xl font-extrabold">{totalSessions}</p>
            <p className="text-xs font-semibold opacity-80 mt-0.5">Sessions</p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <div className="glass-card p-5 rounded-3xl space-y-4">
        {/* Search Input */}
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3.5 top-3 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversation scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
          />
        </div>

        {/* Age Group Selector Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <span className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
            Target Audience:
          </span>
          {AGE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setUserAgeGroup(group)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                userAgeGroup === group
                  ? "bg-[#ff6584] text-white shadow-md"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedCategory === cat
                  ? "bg-[#6c63ff] text-white shadow-md"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Grid Cards */}
      <div className="space-y-3">
        <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
          {userAgeGroup} Practice Scenarios ({filteredScenarios.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => handleStartScenario(scenario)}
              className="glass-card glass-card-hover p-5 rounded-3xl space-y-3 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-[var(--bg-elevated)]">{scenario.icon}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#6c63ff]/20 text-[#6c63ff] text-[11px] font-black">
                    +{scenario.xp} XP
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">
                  {scenario.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{scenario.desc}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>⏱️ {scenario.duration} mins</span>
                <span className="text-[#6c63ff] font-extrabold group-hover:translate-x-1 transition-transform">Start Practice →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpeakingPractice;
