import { useState } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../constants/routes";

const MOCK_LESSONS = [
  {
    id: "1",
    title: "Mastering Self Introductions",
    category: "Daily Life",
    level: "A1",
    duration: "8 mins",
    xp: 50,
    progress: 100,
    completed: true,
    description: "Learn essential phrases to introduce yourself with confidence in any setting.",
    lessonsCount: 4,
  },
  {
    id: "2",
    title: "Ordering Food & Coffee Like a Native",
    category: "Travel",
    level: "A2",
    duration: "10 mins",
    xp: 65,
    progress: 60,
    completed: false,
    description: "Polite expressions, dietary preferences, and handling restaurant bills.",
    lessonsCount: 5,
  },
  {
    id: "3",
    title: "Business Email & Professional Greeting",
    category: "Business",
    level: "B1",
    duration: "12 mins",
    xp: 80,
    progress: 0,
    completed: false,
    description: "Formal tone, scheduling meetings, and clear professional follow-ups.",
    lessonsCount: 6,
  },
  {
    id: "4",
    title: "Present Perfect vs. Past Simple",
    category: "Grammar",
    level: "B2",
    duration: "15 mins",
    xp: 100,
    progress: 30,
    completed: false,
    description: "Master time expressions, life experiences, and finished past actions.",
    lessonsCount: 7,
  },
  {
    id: "5",
    title: "Job Interview Speaking Skills",
    category: "Business",
    level: "B2",
    duration: "18 mins",
    xp: 120,
    progress: 0,
    completed: false,
    description: "Answer STAR-method questions with fluency, clarity, and strong vocabulary.",
    lessonsCount: 8,
  },
  {
    id: "6",
    title: "Expressing Complex Opinions & Debating",
    category: "Academic",
    level: "C1",
    duration: "20 mins",
    xp: 150,
    progress: 0,
    completed: false,
    description: "Use nuance, hedging, and persuasive rhetorical connectors.",
    lessonsCount: 10,
  },
];

const CATEGORIES = ["All", "Daily Life", "Business", "Travel", "Grammar", "Academic"];
const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];

export function Lessons() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLessons = MOCK_LESSONS.filter((l) => {
    const matchesCategory = selectedCategory === "All" || l.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || l.level === selectedLevel;
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Interactive Lessons</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Structured bite-sized lessons designed to boost your speaking fluency & confidence.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#6c63ff]/10 to-[#ff6584]/10 border border-[#6c63ff]/20">
          <span className="text-lg">⚡</span>
          <span className="text-xs font-bold text-[#6c63ff]">Level Progress: B1 Intermediate</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3.5 top-3 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search lessons, topics, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0 mr-1">Category:</span>
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

        {/* Levels */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0 mr-1">CEFR Level:</span>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedLevel === lvl
                  ? "bg-[#ff6584] text-white shadow-md shadow-[#ff6584]/20"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
                  {lesson.category}
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#ff6584]/10 text-[#ff6584]">
                  {lesson.level}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-[var(--text-primary)] leading-snug">{lesson.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">{lesson.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border-default)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
                <span>⏱️ {lesson.duration}</span>
                <span>⭐ +{lesson.xp} XP</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)]">
                  <span>Progress</span>
                  <span>{lesson.progress}%</span>
                </div>
                <div className="w-full bg-[var(--border-subtle)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6c63ff] h-full rounded-full transition-all"
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
              </div>

              <Link
                to={ROUTES.LESSON_DETAIL.replace(":id", lesson.id)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  lesson.completed
                    ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                    : lesson.progress > 0
                    ? "bg-[#6c63ff] text-white hover:bg-[#8b85ff] shadow-md shadow-[#6c63ff]/20"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[#6c63ff] hover:text-white"
                }`}
              >
                <span>{lesson.completed ? "✓ Review Lesson" : lesson.progress > 0 ? "Continue Lesson" : "Start Lesson"}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lessons;
