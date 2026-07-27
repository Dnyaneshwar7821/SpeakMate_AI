import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakingService, onboardingService } from "../services/appServices";

const SCHOOL_GRADES = [
  "1st Std", "2nd Std", "3rd Std", "4th Std", "5th Std", 
  "6th Std", "7th Std", "8th Std", "9th Std", "10th Std"
];

const STANDARD_SCENARIOS = {
  "1st Std": [
    { id: "std1_1", title: "Show & Tell My Toy", category: "General", difficulty: "1st Std (Starter)", duration: 4, xp: 15, icon: "🎨", desc: "Share your favorite toy, pet, or drawing with your SpeakMate AI teacher." },
    { id: "std1_2", title: "At the Zoo with Animals", category: "Daily Life", difficulty: "1st Std (Starter)", duration: 5, xp: 15, icon: "🐾", desc: "Talk about lions, elephants, and monkeys at the zoo." },
    { id: "std1_3", title: "My Favorite Colors", category: "General", difficulty: "1st Std (Starter)", duration: 4, xp: 15, icon: "🌈", desc: "Describe your favorite colors and what you like to draw." },
    { id: "std1_4", title: "Greeting School Friends", category: "Daily Life", difficulty: "1st Std (Starter)", duration: 4, xp: 15, icon: "👋", desc: "Say Good Morning and practice simple hello greetings at school." },
  ],
  "2nd Std": [
    { id: "std2_1", title: "Ordering Ice Cream", category: "Daily Life", difficulty: "2nd Std (Elementary)", duration: 4, xp: 15, icon: "🍦", desc: "Pick your favorite ice cream flavors and scoops with your AI buddy." },
    { id: "std2_2", title: "My Pet & Home Animals", category: "General", difficulty: "2nd Std (Elementary)", duration: 5, xp: 15, icon: "🐶", desc: "Describe your dog, cat, or favorite pet at home." },
    { id: "std2_3", title: "Rainy Day Playground", category: "Daily Life", difficulty: "2nd Std (Elementary)", duration: 4, xp: 15, icon: "☔", desc: "Talk about paper boats, raincoats, and indoor games." },
    { id: "std2_4", title: "School Lunch Box", category: "Daily Life", difficulty: "2nd Std (Elementary)", duration: 4, xp: 15, icon: "🍎", desc: "Share what snacks and fruits are in your lunch box today." },
  ],
  "3rd Std": [
    { id: "std3_1", title: "Visiting the Doctor", category: "Daily Life", difficulty: "3rd Std (Upper Elem)", duration: 5, xp: 20, icon: "🩺", desc: "Explain how you feel and talk to a friendly doctor." },
    { id: "std3_2", title: "My Birthday Party Fun", category: "General", difficulty: "3rd Std (Upper Elem)", duration: 5, xp: 20, icon: "🎁", desc: "Talk about birthday cake, balloons, games, and gifts." },
    { id: "std3_3", title: "Superheroes & Fairytales", category: "General", difficulty: "3rd Std (Upper Elem)", duration: 5, xp: 20, icon: "⚡", desc: "Describe your favorite superhero and their special superpowers." },
    { id: "std3_4", title: "In the School Garden", category: "Daily Life", difficulty: "3rd Std (Upper Elem)", duration: 4, xp: 15, icon: "🌻", desc: "Talk about planting seeds, flowers, and butterflies." },
  ],
  "4th Std": [
    { id: "std4_1", title: "School Canteen Lunch", category: "Daily Life", difficulty: "4th Std (Pre-Interm)", duration: 5, xp: 20, icon: "🍔", desc: "Order juice, sandwiches, and snacks at the school canteen." },
    { id: "std4_2", title: "Space Rocket Expedition", category: "Travel", difficulty: "4th Std (Pre-Interm)", duration: 6, xp: 25, icon: "🚀", desc: "Fly a rocket ship to the Moon and Mars with your space buddy." },
    { id: "std4_3", title: "Visiting Grandpa's Farm", category: "Travel", difficulty: "4th Std (Pre-Interm)", duration: 5, xp: 20, icon: "🚜", desc: "Talk about tractors, cows, fresh milk, and farm life." },
    { id: "std4_4", title: "My Dream Vacation Trip", category: "Travel", difficulty: "4th Std (Pre-Interm)", duration: 6, xp: 25, icon: "🏖️", desc: "Describe beaches, mountains, and packing your travel bag." },
  ],
  "5th Std": [
    { id: "std5_1", title: "First Day in 5th Grade", category: "General", difficulty: "5th Std (Intermediate)", duration: 5, xp: 20, icon: "🎒", desc: "Introduce yourself to new classmates and talk about favorite subjects." },
    { id: "std5_2", title: "Planning a Class Picnic", category: "Daily Life", difficulty: "5th Std (Intermediate)", duration: 6, xp: 25, icon: "🧺", desc: "Discuss picnic spots, sports games, and group snacks with friends." },
    { id: "std5_3", title: "Favorite Storybook Review", category: "General", difficulty: "5th Std (Intermediate)", duration: 6, xp: 25, icon: "📚", desc: "Explain the main characters and plot of a book you love." },
    { id: "std5_4", title: "Toy & Game Shop Visit", category: "Daily Life", difficulty: "5th Std (Intermediate)", duration: 5, xp: 20, icon: "🎮", desc: "Discuss board games, puzzles, and video game rules." },
  ],
  "6th Std": [
    { id: "std6_1", title: "Asking Teacher for Homework Help", category: "General", difficulty: "6th Std (Upper Interm)", duration: 5, xp: 20, icon: "📝", desc: "Ask your teacher polite questions about science and math homework." },
    { id: "std6_2", title: "Joining Science & Robotics Club", category: "General", difficulty: "6th Std (Upper Interm)", duration: 6, xp: 25, icon: "🤖", desc: "Introduce your project idea and interview for the school science club." },
    { id: "std6_3", title: "Annual School Sports Day", category: "Daily Life", difficulty: "6th Std (Upper Interm)", duration: 6, xp: 25, icon: "🏆", desc: "Talk about running races, football matches, and winning medals." },
    { id: "std6_4", title: "Shopping for School Clothes", category: "Daily Life", difficulty: "6th Std (Upper Interm)", duration: 5, xp: 20, icon: "👕", desc: "Try on shoes, check sizes, and ask sales staff for assistance." },
  ],
  "7th Std": [
    { id: "std7_1", title: "Group Discussion: Saving Water", category: "General", difficulty: "7th Std (Intermediate)", duration: 6, xp: 25, icon: "💧", desc: "Participate in a school group discussion on environmental conservation." },
    { id: "std7_2", title: "Movie & Novel Review Chat", category: "General", difficulty: "7th Std (Intermediate)", duration: 6, xp: 25, icon: "🎬", desc: "Share your thoughts, recommendations, and ratings for movies." },
    { id: "std7_3", title: "Organizing School Cultural Fest", category: "General", difficulty: "7th Std (Intermediate)", duration: 7, xp: 30, icon: "🎭", desc: "Divide responsibilities for music, dance, and stage decorations." },
    { id: "std7_4", title: "Asking Directions in New City", category: "Travel", difficulty: "7th Std (Intermediate)", duration: 5, xp: 20, icon: "🗺️", desc: "Practice asking locals for bus stops, landmarks, and subway stations." },
  ],
  "8th Std": [
    { id: "std8_1", title: "Debate: Social Media vs Books", category: "General", difficulty: "8th Std (Upper Interm)", duration: 7, xp: 30, icon: "⚖️", desc: "Defend your viewpoint with clear arguments and respectful counter-points." },
    { id: "std8_2", title: "Student Council Leader Interview", category: "Career", difficulty: "8th Std (Upper Interm)", duration: 7, xp: 30, icon: "🎙️", desc: "Answer leadership questions and present your school improvement plan." },
    { id: "std8_3", title: "Tech & AI Innovations Chat", category: "Work", difficulty: "8th Std (Upper Interm)", duration: 6, xp: 25, icon: "💻", desc: "Discuss how smartphones, AI tools, and computers shape our future." },
    { id: "std8_4", title: "Planning a Charity Fundraiser", category: "Work", difficulty: "8th Std (Upper Interm)", duration: 7, xp: 30, icon: "🤝", desc: "Pitch ideas for helping community causes and collecting donations." },
  ],
  "9th Std": [
    { id: "std9_1", title: "Mock High School Admission Interview", category: "Career", difficulty: "9th Std (Advanced)", duration: 8, xp: 35, icon: "🎓", desc: "Answer formal interview questions regarding academic choices and goals." },
    { id: "std9_2", title: "Keynote Speech: Climate Action", category: "Work", difficulty: "9th Std (Advanced)", duration: 8, xp: 35, icon: "🌍", desc: "Deliver a structured 3-minute keynote address on renewable energy." },
    { id: "std9_3", title: "Debate: Online vs Classroom Learning", category: "General", difficulty: "9th Std (Advanced)", duration: 8, xp: 35, icon: "🏫", desc: "Argue the pros and cons of digital education vs physical schools." },
    { id: "std9_4", title: "Resolving Peer Conflict Politely", category: "Daily Life", difficulty: "9th Std (Advanced)", duration: 7, xp: 30, icon: "💬", desc: "Handle misunderstandings constructively using diplomatic language." },
  ],
  "10th Std": [
    { id: "std10_1", title: "10th Board Exam English Oral Test", category: "Career", difficulty: "10th Std (Board Prep)", duration: 10, xp: 50, icon: "📋", desc: "Simulate official 10th Board oral examination with strict feedback." },
    { id: "std10_2", title: "Future College Major & Career Pitch", category: "Career", difficulty: "10th Std (Board Prep)", duration: 8, xp: 40, icon: "🚀", desc: "Pitch your chosen career roadmap in Engineering, Medicine, Arts, or Tech." },
    { id: "std10_3", title: "Public Keynote & Q&A Defense", category: "Work", difficulty: "10th Std (Board Prep)", duration: 9, xp: 45, icon: "🎤", desc: "Deliver a persuasive speech and answer challenging follow-up questions." },
    { id: "std10_4", title: "Global Youth Leadership Summit", category: "General", difficulty: "10th Std (Board Prep)", duration: 10, xp: 50, icon: "🌐", desc: "Discuss international relations, innovation, and youth leadership." },
  ],
};

const AGE_SCENARIOS = {
  Kids: [
    { id: "k1", title: "Show & Tell", category: "General", difficulty: "Beginner", duration: 4, xp: 15, icon: "🎨", desc: "Share your favorite toy, book, or pet with your AI friend." },
    { id: "k2", title: "At the Zoo", category: "Daily Life", difficulty: "Beginner", duration: 5, xp: 15, icon: "🐾", desc: "Talk to the zoo guide about your favorite animals." },
    { id: "k3", title: "Ordering Ice Cream", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍦", desc: "Choose your favorite flavors and toppings at the ice cream shop." },
    { id: "k4", title: "My Favorite Superhero", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "⚡", desc: "Describe a superhero and their special powers!" },
  ],
  Teens: [
    { id: "t1", title: "First Day at High School", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "🎒", desc: "Introduce yourself and make new friends at school." },
    { id: "t2", title: "Ordering Fast Food", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍔", desc: "Order burgers, fries, and drinks with your friends." },
    { id: "t3", title: "Gaming & Hobbies", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "🎮", desc: "Discuss your favorite video games, sports, and music bands." },
  ],
  "Young Adult": [
    { id: "y1", title: "Daily Conversation", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "💬", desc: "Chat about campus life, daily habits, and weekend plans." },
    { id: "y2", title: "Campus Coffee Shop", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "☕", desc: "Order artisan coffee, study snacks, and chat with baristas." },
  ],
  Professional: [
    { id: "1", title: "Daily Conversation", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "💬", desc: "Chat about your day, hobbies, and general interests." },
    { id: "2", title: "Ordering in Restaurant", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍽️", desc: "Order food, ask about the menu, and pay the bill." },
    { id: "3", title: "Office Small Talk", category: "Work", difficulty: "Intermediate", duration: 5, xp: 20, icon: "👔", desc: "Engage with colleagues, discuss weekends, and plan lunches." },
  ],
};

const CATEGORIES = ["All", "General", "Daily Life", "Travel", "Work", "Career"];

export function SpeakingPractice() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("1st Std");
  const [activeTab, setActiveTab] = useState("grade"); // "grade" or "age"
  const [userAgeGroup, setUserAgeGroup] = useState("Professional");

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyData, onboardingData] = await Promise.all([
        speakingService.history().catch(() => []),
        onboardingService.get().catch(() => null),
      ]);
      setHistory(historyData || []);
      const savedGrade = localStorage.getItem("speakmate_school_grade");
      if (savedGrade) {
        setSelectedGrade(savedGrade);
      }
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

  const handleStartScenario = (scenario) => {
    const sessionId = Date.now().toString();
    navigate(
      `${ROUTES.CONVERSATION_SESSION}?sessionId=${sessionId}&scenario=${encodeURIComponent(
        scenario.title
      )}&xpReward=${scenario.xp || 20}`
    );

    speakingService
      .start({
        scenario: scenario.title,
        difficulty: scenario.difficulty,
        estimatedDuration: scenario.duration,
        xpReward: scenario.xp,
      })
      .catch(() => {});
  };

  const activeScenarios = activeTab === "grade"
    ? (STANDARD_SCENARIOS[selectedGrade] || STANDARD_SCENARIOS["1st Std"])
    : (AGE_SCENARIOS[userAgeGroup] || AGE_SCENARIOS["Professional"]);

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
              Choose a standard level, speak naturally with SpeakMate AI, and get real-time evaluation.
            </p>
          </div>

          <button
            onClick={() => handleStartScenario({ title: "Free Speaking Practice", difficulty: selectedGrade, duration: 5, xp: 20 })}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-xs sm:text-sm shadow-lg hover:scale-105 transition-transform shrink-0"
          >
            🎙️ Start Free Voice Conversation ({selectedGrade})
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

      {/* Search & Grade Level Filter Section */}
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

        {/* View Mode Toggle: School Standard vs Age Group */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
          <button
            onClick={() => setActiveTab("grade")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "grade"
                ? "bg-[#6c63ff] text-white shadow-md"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            🎓 School Standards (1st - 10th Std)
          </button>
          <button
            onClick={() => setActiveTab("age")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "age"
                ? "bg-[#6c63ff] text-white shadow-md"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            👤 General Age Groups
          </button>
        </div>

        {/* School Standard Selector Bar (1st Std to 10th Std) */}
        {activeTab === "grade" && (
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <span className="text-xs font-extrabold text-[#6c63ff] uppercase tracking-wider">
              School Grade:
            </span>
            {SCHOOL_GRADES.map((grade) => (
              <button
                key={grade}
                onClick={() => {
                  setSelectedGrade(grade);
                  localStorage.setItem("speakmate_school_grade", grade);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedGrade === grade
                    ? "bg-[#6c63ff] text-white shadow-md scale-105"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        )}

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                selectedCategory === cat
                  ? "bg-[var(--bg-card)] text-[#6c63ff] border border-[#6c63ff]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScenarios.map((scenario) => (
          <div
            key={scenario.id}
            onClick={() => handleStartScenario(scenario)}
            className="glass-card p-6 rounded-3xl space-y-4 hover:border-[#6c63ff] transition-all cursor-pointer group hover:-translate-y-1 shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl p-3 rounded-2xl bg-indigo-500/10 group-hover:scale-110 transition-transform">
                {scenario.icon}
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/10 text-[#6c63ff] uppercase tracking-wider">
                {scenario.difficulty}
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">
                {scenario.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 line-clamp-2">
                {scenario.desc}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-semibold">
              <span>⏱️ {scenario.duration} mins</span>
              <span className="text-amber-500 font-extrabold">⭐ +{scenario.xp} XP</span>
              <span className="text-[#6c63ff] font-bold group-hover:translate-x-1 transition-transform">Start →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpeakingPractice;
