import React from "react";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  ListChecks,
  BookOpen,
  Mic,
  SpellCheck,
  History,
  GraduationCap
} from "lucide-react";

export function StickyNav({ isSchoolStudent, activeSection, onScrollToSection }) {
  const navItems = [
    { id: "section-overview", label: "Overview", icon: LayoutDashboard },
    { id: "section-evaluation", label: "Evaluation", icon: FileText },
    { id: "section-strengths", label: "Strengths & Needs", icon: Sparkles },
    { id: "section-habits", label: "Habits & Recency", icon: ListChecks },
    { id: "section-lessons", label: "Curriculum", icon: BookOpen },
    { id: "section-speaking", label: "Speaking", icon: Mic },
    { id: "section-grammar", label: "Grammar", icon: SpellCheck },
    { id: "section-vocabulary", label: "Vocabulary", icon: BookOpen },
    { id: "section-activity", label: "Activity Log", icon: History },
  ];

  if (isSchoolStudent) {
    navItems.push({ id: "section-school", label: "School Exams", icon: GraduationCap });
  }

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onScrollToSection(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon size={13} className={isActive ? "text-white" : "text-slate-500 dark:text-slate-400"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StickyNav;
