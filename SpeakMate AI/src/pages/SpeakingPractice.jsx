import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakingService } from "../services/appServices";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const STANDARD_SCENARIOS = {
  "1st Std": [
    { id: "std1_1", title: "Alphabet & Sounds Fun", category: "General", difficulty: "1st Std (Starter)", duration: 4, xp: 15, icon: "🎨", desc: "Practice letters A to Z and phonics sounds with your SpeakMate AI teacher." },
    { id: "std1_2", title: "Colors & Drawing", category: "General", difficulty: "1st Std (Starter)", duration: 4, xp: 15, icon: "🖌️", desc: "Describe your favorite colors and what you love to draw." },
    { id: "std1_3", title: "Animal Friends at Zoo", category: "Daily Life", difficulty: "1st Std (Starter)", duration: 5, xp: 15, icon: "🐾", desc: "Talk about lions, monkeys, and elephants at the zoo." },
    { id: "std1_4", title: "Friendly School Greetings", category: "Daily Life", difficulty: "1st Std (Starter)", duration: 4, xp: 15, icon: "👋", desc: "Say Good Morning, Hello Teacher, and Thank You at school." },
    { id: "std1_5", title: "My Body Parts & Health", category: "General", difficulty: "1st Std (Starter)", duration: 4, xp: 15, icon: "😊", desc: "Learn and speak names of eyes, ears, hands, and feet." },
    { id: "std1_6", title: "My Family Members", category: "Daily Life", difficulty: "1st Std (Starter)", duration: 4, xp: 15, icon: "❤️", desc: "Introduce your Father, Mother, Brother, and Sister." },
  ],
  "2nd Std": [
    { id: "std2_1", title: "Classroom Objects & Tools", category: "General", difficulty: "2nd Std (Elementary)", duration: 4, xp: 15, icon: "🏫", desc: "Name pencils, erasers, notebooks, and school bags." },
    { id: "std2_2", title: "My Daily Morning Routine", category: "Daily Life", difficulty: "2nd Std (Elementary)", duration: 5, xp: 15, icon: "☀️", desc: "Describe waking up, brushing teeth, and eating breakfast." },
    { id: "std2_3", title: "Weather & Clothes Today", category: "Daily Life", difficulty: "2nd Std (Elementary)", duration: 4, xp: 15, icon: "🌧️", desc: "Talk about sunny, rainy, and cold days and what you wear." },
    { id: "std2_4", title: "Ordering Ice Cream", category: "Daily Life", difficulty: "2nd Std (Elementary)", duration: 4, xp: 15, icon: "🍦", desc: "Practice ordering chocolate, vanilla, and fruit scoops." },
    { id: "std2_5", title: "Toys & Playground Games", category: "General", difficulty: "2nd Std (Elementary)", duration: 5, xp: 15, icon: "⚽", desc: "Invite friends to play on swings, slides, and football ground." },
    { id: "std2_6", title: "Expressing My Feelings", category: "Daily Life", difficulty: "2nd Std (Elementary)", duration: 4, xp: 15, icon: "💬", desc: "Practice saying 'I am happy', 'I am tired', and 'I like reading'." },
  ],
  "3rd Std": [
    { id: "std3_1", title: "Action Verbs & Activities", category: "General", difficulty: "3rd Std (Upper Elem)", duration: 5, xp: 20, icon: "⚡", desc: "Speak using action words like running, jumping, writing, and singing." },
    { id: "std3_2", title: "Friendly Doctor Visit", category: "Daily Life", difficulty: "3rd Std (Upper Elem)", duration: 5, xp: 20, icon: "🩺", desc: "Explain how you feel ('I have a headache') to a doctor." },
    { id: "std3_3", title: "Community Helpers", category: "General", difficulty: "3rd Std (Upper Elem)", duration: 5, xp: 20, icon: "👥", desc: "Talk about Teachers, Doctors, Firefighters, and Police Officers." },
    { id: "std3_4", title: "Telling Time & Schedule", category: "Daily Life", difficulty: "3rd Std (Upper Elem)", duration: 4, xp: 15, icon: "⏰", desc: "Practice saying time ('It is 8 o'clock', 'Time for lunch')." },
    { id: "std3_5", title: "Stationery Shop Visit", category: "Daily Life", difficulty: "3rd Std (Upper Elem)", duration: 4, xp: 15, icon: "✏️", desc: "Ask shopkeepers for rulers, crayons, and notebooks politely." },
    { id: "std3_6", title: "My Favorite Story & Hero", category: "General", difficulty: "3rd Std (Upper Elem)", duration: 5, xp: 20, icon: "📖", desc: "Tell a short story about a superhero or fairytale character." },
  ],
  "4th Std": [
    { id: "std4_1", title: "School Canteen Order", category: "Daily Life", difficulty: "4th Std (Pre-Interm)", duration: 5, xp: 20, icon: "🍔", desc: "Order fruit juice, sandwiches, and snacks at the school canteen." },
    { id: "std4_2", title: "Space Rocket Journey", category: "Travel", difficulty: "4th Std (Pre-Interm)", duration: 6, xp: 25, icon: "🚀", desc: "Fly a rocket ship to the Moon and Mars with your space buddy." },
    { id: "std4_3", title: "Asking Directions at School", category: "Daily Life", difficulty: "4th Std (Pre-Interm)", duration: 5, xp: 20, icon: "🧭", desc: "Ask 'Where is the library?' and 'Where is the computer lab?'." },
    { id: "std4_4", title: "Grandpa's Farm Visit", category: "Travel", difficulty: "4th Std (Pre-Interm)", duration: 5, xp: 20, icon: "🚜", desc: "Describe tractors, cows, fresh milk, and farm animals." },
    { id: "std4_5", title: "Healthy Habits & Sports", category: "Daily Life", difficulty: "4th Std (Pre-Interm)", duration: 5, xp: 20, icon: "🏆", desc: "Discuss eating vegetables, drinking water, and playing sports." },
    { id: "std4_6", title: "Comparing Animal Size", category: "General", difficulty: "4th Std (Pre-Interm)", duration: 5, xp: 20, icon: "📊", desc: "Practice comparative words (bigger, faster, taller) with animals." },
  ],
  "5th Std": [
    { id: "std5_1", title: "First Day in 5th Grade", category: "General", difficulty: "5th Std (Intermediate)", duration: 5, xp: 20, icon: "🎒", desc: "Introduce yourself to new classmates and talk about favorite subjects." },
    { id: "std5_2", title: "Planning a Class Picnic", category: "Daily Life", difficulty: "5th Std (Intermediate)", duration: 6, xp: 25, icon: "🧺", desc: "Discuss picnic spots, sports games, and group snacks with friends." },
    { id: "std5_3", title: "Science Project Idea Pitch", category: "General", difficulty: "5th Std (Intermediate)", duration: 6, xp: 25, icon: "🔬", desc: "Explain your science project model (volcano, solar system, plants)." },
    { id: "std5_4", title: "Storybook Character Review", category: "General", difficulty: "5th Std (Intermediate)", duration: 6, xp: 25, icon: "📚", desc: "Describe the main hero, plot, and moral of a story you read." },
    { id: "std5_5", title: "Environmental Care & Trees", category: "Daily Life", difficulty: "5th Std (Intermediate)", duration: 5, xp: 20, icon: "🌍", desc: "Talk about planting trees, recycling paper, and keeping school clean." },
    { id: "std5_6", title: "Planning a Weekend Trip", category: "Travel", difficulty: "5th Std (Intermediate)", duration: 6, xp: 25, icon: "🗺️", desc: "Plan a trip to a museum or beach using future tense (will, going to)." },
  ],
  "6th Std": [
    { id: "std6_1", title: "Asking Teacher Homework Help", category: "General", difficulty: "6th Std (Upper Interm)", duration: 5, xp: 20, icon: "📝", desc: "Ask your teacher polite questions about science and math homework." },
    { id: "std6_2", title: "Robotics Club Interview", category: "General", difficulty: "6th Std (Upper Interm)", duration: 6, xp: 25, icon: "🤖", desc: "Present your project idea and interview for the robotics club." },
    { id: "std6_3", title: "Annual School Sports Day", category: "Daily Life", difficulty: "6th Std (Upper Interm)", duration: 6, xp: 25, icon: "🏆", desc: "Describe running races, football matches, and winning medals." },
    { id: "std6_4", title: "Shopping for Clothes", category: "Daily Life", difficulty: "6th Std (Upper Interm)", duration: 5, xp: 20, icon: "👕", desc: "Try on shoes, check sizes, and ask sales staff for assistance." },
    { id: "std6_5", title: "School Debate on Homework", category: "General", difficulty: "6th Std (Upper Interm)", duration: 6, xp: 25, icon: "💬", desc: "Argue whether homework should be given daily or on weekends." },
    { id: "std6_6", title: "Daily Habits & Tenses Practice", category: "General", difficulty: "6th Std (Upper Interm)", duration: 5, xp: 20, icon: "✅", desc: "Speak about daily routines using present perfect (I have completed)." },
  ],
  "7th Std": [
    { id: "std7_1", title: "Saving Water Conservation", category: "General", difficulty: "7th Std (Intermediate)", duration: 6, xp: 25, icon: "💧", desc: "Participate in a group discussion on environmental water conservation." },
    { id: "std7_2", title: "Movie & Novel Review Chat", category: "General", difficulty: "7th Std (Intermediate)", duration: 6, xp: 25, icon: "🎬", desc: "Share your ratings, character analysis, and movie recommendations." },
    { id: "std7_3", title: "Organizing Cultural Fest", category: "General", difficulty: "7th Std (Intermediate)", duration: 7, xp: 30, icon: "🎭", desc: "Divide responsibilities for music, dance, and stage decorations." },
    { id: "std7_4", title: "Asking Directions in New City", category: "Travel", difficulty: "7th Std (Intermediate)", duration: 5, xp: 20, icon: "🗺️", desc: "Practice asking locals for bus stops, landmarks, and subway stations." },
    { id: "std7_5", title: "Polite Expressions & Requests", category: "Daily Life", difficulty: "7th Std (Intermediate)", duration: 6, xp: 25, icon: "💬", desc: "Use formal polite phrases (Could you please, I would appreciate)." },
    { id: "std7_6", title: "Public Presentation on History", category: "Work", difficulty: "7th Std (Intermediate)", duration: 6, xp: 25, icon: "🎤", desc: "Deliver a short presentation on a historical figure or invention." },
  ],
  "8th Std": [
    { id: "std8_1", title: "Debate: Social Media vs Books", category: "General", difficulty: "8th Std (Upper Interm)", duration: 7, xp: 30, icon: "⚖️", desc: "Defend your viewpoint with clear arguments and respectful points." },
    { id: "std8_2", title: "Student Council Interview", category: "Career", difficulty: "8th Std (Upper Interm)", duration: 7, xp: 30, icon: "🎙️", desc: "Answer leadership questions and present school improvement plans." },
    { id: "std8_3", title: "Tech & AI Innovations Chat", category: "Work", difficulty: "8th Std (Upper Interm)", duration: 6, xp: 25, icon: "💻", desc: "Discuss how smartphones, AI tools, and computers shape our future." },
    { id: "std8_4", title: "Planning Charity Fundraiser", category: "Work", difficulty: "8th Std (Upper Interm)", duration: 7, xp: 30, icon: "🤝", desc: "Pitch ideas for helping community causes and collecting donations." },
    { id: "std8_5", title: "Formal Email & Speech Delivery", category: "Work", difficulty: "8th Std (Upper Interm)", duration: 6, xp: 25, icon: "✉️", desc: "Practice speaking out loud a formal request email to your principal." },
    { id: "std8_6", title: "Career Aspirations & Dreams", category: "Career", difficulty: "8th Std (Upper Interm)", duration: 7, xp: 30, icon: "💼", desc: "Discuss dream careers in Engineering, Medicine, Arts, and Tech." },
  ],
  "9th Std": [
    { id: "std9_1", title: "Mock Admission Interview", category: "Career", difficulty: "9th Std (Advanced)", duration: 8, xp: 35, icon: "🎓", desc: "Answer formal interview questions regarding academic choices and goals." },
    { id: "std9_2", title: "Keynote Speech: Climate Action", category: "Work", difficulty: "9th Std (Advanced)", duration: 8, xp: 35, icon: "🌍", desc: "Deliver a structured 3-minute keynote address on renewable energy." },
    { id: "std9_3", title: "Debate: Online vs Classroom", category: "General", difficulty: "9th Std (Advanced)", duration: 8, xp: 35, icon: "🏫", desc: "Argue the pros and cons of digital education vs physical schools." },
    { id: "std9_4", title: "Resolving Conflicts Politely", category: "Daily Life", difficulty: "9th Std (Advanced)", duration: 7, xp: 30, icon: "👥", desc: "Handle misunderstandings constructively using diplomatic language." },
    { id: "std9_5", title: "Current Affairs & Global News", category: "General", difficulty: "9th Std (Advanced)", duration: 8, xp: 35, icon: "📰", desc: "Discuss recent scientific breakthroughs and global news events." },
    { id: "std9_6", title: "Essay Structure Speech Delivery", category: "Work", difficulty: "9th Std (Advanced)", duration: 7, xp: 30, icon: "📖", desc: "Organize a spoken essay with introduction, points, and conclusion." },
  ],
  "10th Std": [
    { id: "std10_1", title: "10th Board Oral Exam Simulation", category: "Career", difficulty: "10th Std (Board Prep)", duration: 10, xp: 50, icon: "📋", desc: "Simulate official 10th Board oral examination with strict feedback." },
    { id: "std10_2", title: "Career Major Pitch", category: "Career", difficulty: "10th Std (Board Prep)", duration: 8, xp: 40, icon: "🚀", desc: "Pitch your chosen career roadmap in Engineering, Medicine, Arts, or Tech." },
    { id: "std10_3", title: "Public Keynote & Q&A Defense", category: "Work", difficulty: "10th Std (Board Prep)", duration: 9, xp: 45, icon: "🎤", desc: "Deliver a persuasive speech and answer challenging follow-up questions." },
    { id: "std10_4", title: "Global Youth Leadership Summit", category: "General", difficulty: "10th Std (Board Prep)", duration: 10, xp: 50, icon: "🌐", desc: "Discuss international relations, innovation, and youth leadership." },
    { id: "std10_5", title: "Idioms & Advanced Phrasal Verbs", category: "General", difficulty: "10th Std (Board Prep)", duration: 8, xp: 40, icon: "🎗️", desc: "Practice incorporating native idioms and expressions into speeches." },
    { id: "std10_6", title: "CEFR C1 Level Oratory Mastery", category: "Work", difficulty: "10th Std (Board Prep)", duration: 10, xp: 50, icon: "⭐", desc: "Master persuasive rhetoric, tone modulation, and spontaneous fluency." },
  ],
};

const CATEGORIES = ["All", "General", "Daily Life", "Travel", "Work", "Career"];

export function SpeakingPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userGrade =
    user?.schoolGrade ||
    localStorage.getItem("speakmate_school_grade") ||
    user?.level ||
    "5th Std";

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState(userGrade);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyData, meData] = await Promise.all([
        speakingService.history().catch(() => []),
        authService.me().catch(() => null),
      ]);
      setHistory(historyData || []);

      const activeGrade =
        meData?.schoolGrade ||
        user?.schoolGrade ||
        localStorage.getItem("speakmate_school_grade") ||
        "5th Std";

      setSelectedGrade(activeGrade);
      localStorage.setItem("speakmate_school_grade", activeGrade);
    } catch (e) {
      console.warn("Failed to load speaking data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalXP = history.reduce((sum, item) => sum + (item.xpEarned || 0), 0);
  const totalSessions = history.length;

  const currentScenarios = STANDARD_SCENARIOS[selectedGrade] || STANDARD_SCENARIOS["5th Std"];

  const filteredScenarios = currentScenarios.filter((scenario) => {
    const matchesCategory = selectedCategory === "All" || scenario.category === selectedCategory;
    const matchesSearch =
      scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartScenario = (scenario) => {
    const scenarioGrade = selectedGrade || "5th Std";
    localStorage.setItem("speakmate_school_grade", scenarioGrade);

    navigate(ROUTES.CONVERSATION_SESSION, {
      state: {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        scenarioIcon: scenario.icon,
        scenarioDesc: scenario.desc,
        level: scenarioGrade,
      },
    });

    speakingService.start({
      topic: scenario.title,
      level: scenarioGrade,
      targetLanguage: "English",
    }).catch(() => {});
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-6 sm:p-10 text-white shadow-2xl space-y-5">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
              🎓 Configured Standard: {selectedGrade}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">Speaking Practice Drills</h1>
            <p className="text-sm sm:text-base text-indigo-200 font-medium leading-relaxed">
              Interactive AI conversation scenarios tailored to your <strong>{selectedGrade}</strong> curriculum selected during onboarding.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[90px]">
              <span className="block text-xs text-indigo-200 font-bold uppercase">Sessions</span>
              <span className="text-2xl font-black text-white">{totalSessions}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[100px]">
              <span className="block text-xs text-indigo-200 font-bold uppercase">Total XP</span>
              <span className="text-2xl font-black text-amber-300">⭐ {totalXP}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Search Bar Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-md shadow-[#6c63ff]/25 scale-102"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="🔍 Search 6 scenarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] w-full sm:w-64"
        />
      </div>

      {/* Scenarios Grid (Displays the 6 scenarios of the Onboarding Standard) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-3">
            <span>🏫 {selectedGrade} Speaking Drills</span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-black border border-emerald-500/20">
              Auto-Adapted from Onboarding Profile
            </span>
          </h3>
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            {filteredScenarios.length} Scenarios Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => handleStartScenario(scenario)}
              className="group glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between cursor-pointer border border-[var(--border-default)] hover:border-[#6c63ff]/50 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-3xl p-3 rounded-2xl bg-[var(--bg-elevated)] shadow-inner">
                    {scenario.icon}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#6c63ff]/15 text-[#6c63ff]">
                      {scenario.category}
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500">
                      ⭐ +{scenario.xp} XP
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-lg text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">
                    {scenario.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5 line-clamp-2 font-medium">
                    {scenario.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] font-bold">
                  ⏱️ {scenario.duration} mins • {selectedGrade}
                </span>
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] group-hover:opacity-90 text-white font-extrabold text-xs shadow-md transition-all">
                  Start Drill →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpeakingPractice;
