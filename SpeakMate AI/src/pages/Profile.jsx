import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import { profileService } from "../services/appServices";
import { getLiveProgressStats } from "../utils/progressTracker";
import ROUTES from "../constants/routes";

const PRESET_AVATARS = [
  "🎓", "🦁", "🚀", "🦉", "👑", "⚡",
  "🦊", "🎯", "💎", "🌟", "🔥", "🏆",
  "🌸", "🐱", "🐶", "🦄", "🍀", "🎨"
];

const SCHOOL_GRADES = [
  "1st Std", "2nd Std", "3rd Std", "4th Std", "5th Std",
  "6th Std", "7th Std", "8th Std", "9th Std", "10th Std"
];

const ENGLISH_LEVELS = [
  "Basic (A1)", "Elementary (A2)", "Intermediate (B1)", "Upper Intermediate (B2)", "Advanced (C1)", "Mastery (C2)"
];

const ACCENT_OPTIONS = [
  { code: "US", label: "American English (US)", flag: "🇺🇸" },
  { code: "UK", label: "British English (UK)", flag: "🇬🇧" },
  { code: "AU", label: "Australian English (AU)", flag: "🇦🇺" },
  { code: "IN", label: "Indian English (IN)", flag: "🇮🇳" },
];

const getRankTier = (xp = 0) => {
  if (xp < 100) return { name: "Bronze III", icon: "🥉", badgeColor: "from-amber-700 to-amber-900", nextXp: 100 };
  if (xp < 300) return { name: "Bronze II", icon: "🥉", badgeColor: "from-amber-600 to-amber-800", nextXp: 300 };
  if (xp < 600) return { name: "Bronze I", icon: "🥉", badgeColor: "from-amber-500 to-amber-700", nextXp: 600 };
  if (xp < 1000) return { name: "Silver III", icon: "🥈", badgeColor: "from-slate-400 to-slate-600", nextXp: 1000 };
  if (xp < 1500) return { name: "Silver II", icon: "🥈", badgeColor: "from-slate-300 to-slate-500", nextXp: 1500 };
  if (xp < 2100) return { name: "Silver I", icon: "🥈", badgeColor: "from-slate-200 to-slate-400", nextXp: 2100 };
  return { name: "Gold Master", icon: "👑", badgeColor: "from-amber-400 to-yellow-600", nextXp: 3000 };
};

export function Profile() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("general"); // 'general', 'preferences', 'security'
  const accountType = localStorage.getItem("speakmate_account_type") || user?.accountType || "INDIVIDUAL_USER";
  const isStudent = accountType === "STUDENT" || Boolean(user?.schoolGrade);

  const [liveStats, setLiveStats] = useState(() => getLiveProgressStats(user));

  const [form, setForm] = useState({
    firstName: user?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    nativeLanguage: user?.nativeLanguage || user?.nativeLang || "English",
  });

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "🎓");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [schoolGrade, setSchoolGrade] = useState(
    isStudent ? (localStorage.getItem("speakmate_school_grade") || user?.schoolGrade || "1st Std") : "1st Std"
  );
  const [cefrLevel, setCefrLevel] = useState(user?.level || user?.englishLevel || "Intermediate (B1)");

  // Preferences State
  const [dailyGoal, setDailyGoal] = useState(
    () => parseInt(localStorage.getItem("speakmate_daily_goal") || "15", 10)
  );
  const [preferredAccent, setPreferredAccent] = useState(
    () => localStorage.getItem("speakmate_accent") || "US"
  );
  const [preferredVoice, setPreferredVoice] = useState(
    () => localStorage.getItem("speakmate_voice_gender") || "female"
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const rank = getRankTier(liveStats.xp || user?.xp || 150);

  useEffect(() => {
    profileService
      .get()
      .then((profile) => {
        if (profile) {
          setForm({
            firstName: profile.firstName || user?.firstName || "",
            lastName: profile.lastName || user?.lastName || "",
            email: profile.email || user?.email || "",
            nativeLanguage: profile.nativeLanguage || "English",
          });
          if (profile.avatar) setSelectedAvatar(profile.avatar);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const cleanFirstName = form.firstName.trim();
    const cleanLastName = form.lastName.trim();
    const cleanEmail = form.email.trim().toLowerCase();

    if (!cleanFirstName || !cleanLastName || !cleanEmail) {
      toast.error("First name, last name, and email cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      if (isStudent && schoolGrade) {
        localStorage.setItem("speakmate_school_grade", schoolGrade);
      }
      localStorage.setItem("speakmate_daily_goal", dailyGoal.toString());
      localStorage.setItem("speakmate_accent", preferredAccent);
      localStorage.setItem("speakmate_voice_gender", preferredVoice);

      const updatedProfile = await profileService.update({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        nativeLanguage: form.nativeLanguage,
        avatar: selectedAvatar,
      }).catch(() => null);

      updateUser({
        ...(updatedProfile || {}),
        name: `${cleanFirstName} ${cleanLastName}`.trim(),
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        avatar: selectedAvatar,
        schoolGrade: isStudent ? schoolGrade : null,
        englishLevel: isStudent ? null : cefrLevel,
      });

      setSaved(true);
      toast.success("Profile preferences updated successfully!");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      toast.error("Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteModal = () => {
    setDeleteEmail(user?.email || form.email || "");
    setDeleteOtp("");
    setOtpSent(false);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const handleSendDeleteOtp = async () => {
    const cleanEmail = deleteEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setDeleteError("Please enter your registered email address.");
      return;
    }
    setDeleteError("");
    setSendingOtp(true);
    try {
      await authService.sendDeleteAccountOtp({ email: cleanEmail });
      setOtpSent(true);
      toast.success(`Verification code sent to ${cleanEmail}.`);
    } catch (err) {
      setDeleteError("Failed to send deletion OTP. Please verify your email.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmDeleteAccount = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = deleteEmail.trim().toLowerCase();
    const cleanOtp = deleteOtp.trim();

    if (!cleanEmail || !cleanOtp || cleanOtp.length !== 6) {
      setDeleteError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setDeleteError("");
    setDeletingAccount(true);
    try {
      await authService.deleteAccount({ email: cleanEmail, otp: cleanOtp });
      setShowDeleteModal(false);
      toast.success("Account permanently deleted.");
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      setDeleteError("Invalid or expired OTP code.");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 p-4 sm:p-6">
      {/* Header Profile Card with Glassmorphism */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#4f46e5] to-[#312e81] text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
          <div
            onClick={() => setShowAvatarModal(true)}
            className="group relative cursor-pointer grid h-24 w-24 place-items-center rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-inner shrink-0 hover:scale-105 transition-all overflow-hidden"
            title="Click to change avatar"
          >
            {selectedAvatar && (selectedAvatar.startsWith("http") || selectedAvatar.startsWith("/")) ? (
              <img src={selectedAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">{selectedAvatar || "🎓"}</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all grid place-items-center text-xs font-black text-white">
              ✏️ Edit
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full bg-gradient-to-r ${rank.badgeColor} text-white uppercase tracking-wider shadow-md`}>
                {rank.icon} {rank.name}
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider border border-white/30">
                {isStudent ? `🎓 ${schoolGrade}` : `👤 ${cefrLevel}`}
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider border border-white/30">
                ⭐ {liveStats.xp || 0} XP
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider border border-white/30">
                🔥 {liveStats.streak || 0} Day Streak
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}`.trim() : "Learner"}
            </h1>
            <p className="text-xs sm:text-sm font-medium opacity-90">{form.email}</p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex sm:flex-col gap-2 z-10 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "general" ? "bg-white text-[#6c63ff] shadow-lg" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            👤 General Details
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "preferences" ? "bg-white text-[#6c63ff] shadow-lg" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            🎯 Preferences & Goals
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "security" ? "bg-white text-rose-600 shadow-lg" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            🔒 Security
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black text-center animate-in fade-in duration-200">
          ✓ Profile and learning goals updated successfully!
        </div>
      )}

      {/* TAB 1: GENERAL PROFILE DETAILS */}
      {activeTab === "general" && (
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)]">Personal Details</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
              Manage your personal identity, contact email, and standard level.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Native Language</label>
                <input
                  type="text"
                  value={form.nativeLanguage}
                  onChange={(e) => setForm({ ...form, nativeLanguage: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
                />
              </div>
            </div>

            <div>
              {isStudent ? (
                <>
                  <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">
                    Configured School Standard Grade
                  </label>
                  <select
                    value={schoolGrade}
                    onChange={(e) => setSchoolGrade(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
                  >
                    {SCHOOL_GRADES.map((g) => (
                      <option key={g} value={g}>🎓 {g} Standard</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">
                    Configured English Proficiency Level
                  </label>
                  <select
                    value={cefrLevel}
                    onChange={(e) => setCefrLevel(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
                  >
                    {ENGLISH_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>👤 {lvl}</option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#6c63ff]/25 transition-all cursor-pointer"
              >
                {saving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PREFERENCES & LEARNING GOALS */}
      {activeTab === "preferences" && (
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)]">Learning Goals & Voice Settings</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
              Customize your daily study cadence and Live2D tutor voice.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-3">
                Daily Speaking Target (Minutes)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyGoal(mins)}
                    className={`p-4 rounded-2xl border text-center font-black transition-all cursor-pointer ${
                      dailyGoal === mins
                        ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] shadow-md"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="text-lg block">⏱️ {mins} Mins</span>
                    <span className="text-[10px] opacity-75">{mins === 15 ? "Recommended" : mins === 30 ? "Intense" : "Casual"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-3">
                Preferred Tutor Accent
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ACCENT_OPTIONS.map((acc) => (
                  <button
                    key={acc.code}
                    type="button"
                    onClick={() => setPreferredAccent(acc.code)}
                    className={`p-3.5 rounded-2xl border text-center font-black transition-all cursor-pointer ${
                      preferredAccent === acc.code
                        ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] shadow-md"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="text-xl block mb-1">{acc.flag}</span>
                    <span className="text-xs">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-3">
                Tutor Voice & Avatar Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredVoice("female")}
                  className={`p-4 rounded-2xl border text-center font-black transition-all cursor-pointer ${
                    preferredVoice === "female"
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  }`}
                >
                  <span className="text-2xl block mb-1">👩 Haru (Female Tutor)</span>
                  <span className="text-xs opacity-75">Warm, clear, and encouraging</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredVoice("male")}
                  className={`p-4 rounded-2xl border text-center font-black transition-all cursor-pointer ${
                    preferredVoice === "male"
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  }`}
                >
                  <span className="text-2xl block mb-1">👨 Chitose (Male Tutor)</span>
                  <span className="text-xs opacity-75">Confident, articulate, and supportive</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#6c63ff]/25 transition-all cursor-pointer"
              >
                {saving ? "Saving Preferences..." : "Save Preferences"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SECURITY & ACCOUNT DELETION */}
      {activeTab === "security" && (
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-rose-500">Security & Danger Zone</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
              Manage account lifecycle and permanent data removal.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-black text-sm">Permanent Account Deletion</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Deleting your account permanently removes all your saved vocabulary, speaking practice recordings, learning streak milestones, and progress analytics. This action requires email OTP authentication.
            </p>
            <button
              onClick={handleOpenDeleteModal}
              className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-rose-600/25"
            >
              Request Account Deletion →
            </button>
          </div>
        </div>
      )}

      {/* ── PRESET AVATAR SELECTOR MODAL ── */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full glass-card p-6 rounded-3xl shadow-2xl border border-[var(--border-default)] space-y-5 bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="font-black text-lg text-[var(--text-primary)]">Choose Profile Avatar</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-6 gap-3 p-2">
              {PRESET_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setSelectedAvatar(emoji);
                    setShowAvatarModal(false);
                  }}
                  className={`h-12 text-2xl rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                    selectedAvatar === emoji
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 scale-105"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ACCOUNT WITH OTP MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-rose-500/40 space-y-6 relative overflow-hidden bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div className="flex items-center gap-2 text-rose-500 font-black text-lg sm:text-xl">
                <span>🗑️</span>
                <h3>Delete Account</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {deleteError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
                ⚠️ {deleteError}
              </div>
            )}

            {!otpSent ? (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                  Are you sure you want to delete your account? This action is permanent and cannot be undone.
                </p>

                <div>
                  <label className="block text-xs font-black text-[var(--text-primary)] mb-2">
                    Confirm Your Email Address
                  </label>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  🔒 Step 1: Click below to receive a 6-digit verification code.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendDeleteOtp}
                    disabled={sendingOtp || !deleteEmail.trim()}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    {sendingOtp ? "Sending OTP..." : "Send Verification OTP →"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmDeleteAccount} className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  📧 OTP Code sent to <strong>{deleteEmail}</strong>.
                </div>

                <div>
                  <label className="block text-xs font-black text-[var(--text-primary)] mb-2 text-center">
                    Enter 6-Digit Verification OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-rose-500 bg-[var(--bg-elevated)] text-center text-2xl font-black tracking-widest text-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)] cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={deletingAccount || !deleteOtp.trim()}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-black shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    {deletingAccount ? "Deleting..." : "Verify & Permanently Delete"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
