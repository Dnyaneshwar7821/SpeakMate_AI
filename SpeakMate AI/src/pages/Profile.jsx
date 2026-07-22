import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Loader from "@components/common/Loader";
import ModulePageShell from "@components/common/ModulePageShell";
import { profileMockData } from "@data/moduleMockData";

const PRESET_AVATARS = ['🎓', '🦁', '🚀', '🦉', '👑', '⚡', '🦊', '🎯', '💎', '🌟', '🔥', '🏆'];

export function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState('🎓');
  const [englishLevel, setEnglishLevel] = useState('Intermediate');
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ModulePageShell title={profileMockData.title} subtitle={profileMockData.subtitle} badge={profileMockData.badge}>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Loader label="Loading profile" />
        </div>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell
      title={profileMockData.title}
      subtitle={profileMockData.subtitle}
      badge={profileMockData.badge}
      actions={<Button variant="primary">Save Changes</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
          {/* Main Profile Header Card */}
          <Card className="relative overflow-hidden p-6">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-b-3xl opacity-95" />
            
            <div className="relative pt-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group cursor-pointer">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-3xl shadow-lg ring-4 ring-white/80">
                  {selectedAvatar}
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-indigo-600 p-1.5 text-white shadow-md">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-black text-slate-950">Dnyaneshwar Algule</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    🥈 Silver II Rank
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-1">dnyaneshwar@example.com • SpeakMate AI Learner</p>

                {/* XP & Level Bar */}
                <div className="mt-3 w-full max-w-md">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Level 4 Learner</span>
                    <span className="text-indigo-600">350 / 500 XP</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-4 text-center border border-slate-200/60">
              <div>
                <p className="text-lg font-black text-indigo-600">Lvl 4</p>
                <p className="text-xs font-medium text-slate-500">Level</p>
              </div>
              <div>
                <p className="text-lg font-black text-indigo-600">350</p>
                <p className="text-xs font-medium text-slate-500">Total XP</p>
              </div>
              <div>
                <p className="text-lg font-black text-amber-600">5d 🔥</p>
                <p className="text-xs font-medium text-slate-500">Streak</p>
              </div>
              <div>
                <p className="text-lg font-black text-emerald-600">120m</p>
                <p className="text-xs font-medium text-slate-500">Practice</p>
              </div>
            </div>
          </Card>

          {/* Avatar Emojis Selection Card */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Choose Learning Avatar</h3>
            <div className="flex flex-wrap gap-3">
              {PRESET_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl transition-all ${
                    selectedAvatar === emoji
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2 scale-110 shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="space-y-6">
          {/* AI Tutor Proficiency Level Switcher */}
          <Card className="p-6">
            <h2 className="text-lg font-black text-slate-950">AI Tutor Proficiency Level</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">Adjust speaking complexity & response style across AI modules.</p>
            
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1.5">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setEnglishLevel(lvl)}
                  className={`rounded-lg py-2 text-xs font-bold transition-all ${
                    englishLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </Card>

          {/* Learning Details */}
          <Card className="p-6">
            <h2 className="text-lg font-black text-slate-950">Account Details</h2>
            <div className="mt-4 grid gap-3">
              {profileMockData.details.map((detail) => (
                <div key={detail.label} className="flex justify-between items-center rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                  <span className="text-xs font-medium text-slate-500">{detail.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{detail.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <h2 className="text-lg font-black text-slate-950">Learning Preferences</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              {profileMockData.preferences.map((preference) => (
                <li key={preference} className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  <span className="font-medium">{preference}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </ModulePageShell>
  );
}

export default Profile;
