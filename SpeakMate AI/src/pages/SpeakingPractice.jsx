import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";

const SCENARIOS = [
  {
    id: "job-interview",
    title: "Software Job Interview",
    category: "Business",
    level: "B2",
    duration: "10 mins",
    icon: "💼",
    desc: "Practice answering questions about work experience, problem solving, and career goals.",
  },
  {
    id: "coffee-shop",
    title: "Ordering Coffee & Pastry",
    category: "Daily Life",
    level: "A1",
    duration: "5 mins",
    icon: "☕",
    desc: "Order beverages, ask about ingredients, customize drinks, and pay the barista.",
  },
  {
    id: "airport-customs",
    title: "Airport Customs & Border Check",
    category: "Travel",
    level: "A2",
    duration: "7 mins",
    icon: "✈️",
    desc: "Answer passport control questions regarding your trip duration, hotel, and purpose of visit.",
  },
  {
    id: "ielts-part2",
    title: "IELTS Speaking Part 2 Cue Card",
    category: "Exams",
    level: "C1",
    duration: "12 mins",
    icon: "🎓",
    desc: "Speak continuously for 2 minutes on a given topic with high-level vocabulary and fluency.",
  },
];

export function SpeakingPractice() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleStartSession = (scenarioId) => {
    navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=${scenarioId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Live AI Speaking Practice</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Choose a scenario or start a free real-time voice conversation with your AI coach.
          </p>
        </div>

        <button
          onClick={() => handleStartSession("free-speak")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-sm shadow-lg shadow-[#6c63ff]/25 flex items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          <span>🎙️ Start Free Voice Conversation</span>
        </button>
      </div>

      {/* Recommended Hero Scenario */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff]/15 via-[#6c63ff]/5 to-transparent border border-[#6c63ff]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#6c63ff] text-white uppercase tracking-wider">
            Featured Practice Mode
          </span>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Interactive AI Roleplay</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Experience real-time interactive speech feedback. Get instant corrections on grammar, pronunciation, and fluency as you talk.
          </p>
        </div>

        <button
          onClick={() => handleStartSession("job-interview")}
          className="px-6 py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-bold text-sm shadow-md shrink-0"
        >
          Try Job Interview Roleplay →
        </button>
      </div>

      {/* Scenario Grid */}
      <div>
        <h2 className="text-lg font-extrabold text-[var(--text-primary)] mb-4">Roleplay Scenarios</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SCENARIOS.map((sc) => (
            <div
              key={sc.id}
              className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-3xl">{sc.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
                      {sc.category}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#ff6584]/10 text-[#ff6584]">
                      {sc.level}
                    </span>
                  </div>
                </div>

                <h3 className="font-extrabold text-lg text-[var(--text-primary)]">{sc.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-2">{sc.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] font-semibold">⏱️ {sc.duration}</span>
                <button
                  onClick={() => handleStartSession(sc.id)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#6c63ff] hover:text-white text-[var(--text-primary)] font-bold text-xs transition-all"
                >
                  Start Speaking
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
