import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import ROUTES from "../constants/routes";

const SCHOOL_GRADES = [
  "1st Std",
  "2nd Std",
  "3rd Std",
  "4th Std",
  "5th Std",
  "6th Std",
  "7th Std",
  "8th Std",
  "9th Std",
  "10th Std",
];

const CEFR_LEVELS = [
  "Beginner",
  "Elementary",
  "Intermediate",
  "Advanced",
  "Fluent",
];

export function Profile() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const accountType = localStorage.getItem("speakmate_account_type") || "INDIVIDUAL_USER";

  const [name, setName] = useState(user?.name || user?.firstName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : "Learner");
  const [email, setEmail] = useState(user?.email || "learner@example.com");
  const [nativeLang, setNativeLang] = useState(user?.nativeLang || "English");
  const [schoolGrade, setSchoolGrade] = useState(
    accountType === "STUDENT" ? (localStorage.getItem("speakmate_school_grade") || user?.schoolGrade || "1st Std") : null
  );
  const [cefrLevel, setCefrLevel] = useState(user?.level || "Intermediate");

  const [saved, setSaved] = useState(false);

  // ── Delete Account OTP States ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1: Send OTP, 2: Input OTP & Confirm
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const finalGrade = accountType === "STUDENT" ? schoolGrade : null;
    if (finalGrade) {
      localStorage.setItem("speakmate_school_grade", finalGrade);
    } else {
      localStorage.removeItem("speakmate_school_grade");
    }
    updateUser({
      name,
      email,
      nativeLang,
      level: accountType === "STUDENT" ? schoolGrade : cefrLevel,
      schoolGrade: finalGrade,
    });
    setSaved(true);
    toast.success("Profile updated successfully!");
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSendDeleteOtp = async () => {
    setDeleteError("");
    setDeleteSuccessMsg("");
    setDeleteLoading(true);

    try {
      await authService.sendDeleteAccountOtp({ email: email.trim() });
      setDeleteSuccessMsg(`A 6-digit deletion verification code has been sent to ${email.trim()}.`);
      setDeleteStep(2);
    } catch (err) {
      console.error("Send Delete OTP Error:", err);
      setDeleteError(
        err.userMessage ||
        err.response?.data?.message ||
        "Failed to send deletion OTP. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDeleteAccount = async (e) => {
    if (e) e.preventDefault();
    setDeleteError("");
    if (!deleteOtp.trim()) {
      setDeleteError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setDeleteLoading(true);
    try {
      await authService.deleteAccount({
        email: email.trim(),
        otp: deleteOtp.trim(),
      });

      // Clear auth state & storage, redirect to login with notification
      logout();
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { infoMessage: "Your SpeakMate AI account has been permanently deleted." },
      });
    } catch (err) {
      console.error("Delete Account Error:", err);
      setDeleteError(
        err.userMessage ||
        err.response?.data?.message ||
        "Invalid OTP verification code. Please check your email or use 123456."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Profile Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#8b85ff] to-[#ff6584] text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
          <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 text-4xl font-black shadow-inner shrink-0">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider border border-white/30">
                {accountType === "STUDENT" ? `🎓 ${schoolGrade} Student` : `👤 ${cefrLevel} Learner`}
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider border border-white/30">
                ⭐ {user?.xp || 150} XP
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider border border-white/30">
                🔥 {user?.streak || 3} Day Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{name}</h1>
            <p className="text-xs sm:text-sm font-medium opacity-90">{email}</p>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="z-10 py-2.5 px-4 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-400/40 text-rose-200 text-xs font-black transition-all flex items-center gap-2 backdrop-blur-md shadow-lg"
        >
          <span>⚠️</span>
          <span>Delete Account</span>
        </button>
      </div>

      {/* Profile Edit Form Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Personal Details & Curriculum Preferences</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
            Update your profile details and standard curriculum level.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black text-center animate-in fade-in duration-200">
            ✓ Profile preferences saved successfully!
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Native Language</label>
              <input
                type="text"
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              />
            </div>

            <div>
              {accountType === "STUDENT" ? (
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
                      <option key={g} value={g}>🎓 {g} Level</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">
                    Configured English CEFR Level
                  </label>
                  <select
                    value={cefrLevel}
                    onChange={(e) => setCefrLevel(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
                  >
                    {CEFR_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>👤 {lvl} Proficiency</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
            <button
              type="submit"
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#6c63ff]/25 transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* ── DELETE ACCOUNT WITH OTP MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-rose-500/30 space-y-6 relative overflow-hidden bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div className="flex items-center gap-2 text-rose-500 font-black text-lg sm:text-xl">
                <span>⚠️</span>
                <h3>Delete Account</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteStep(1);
                  setDeleteError("");
                  setDeleteSuccessMsg("");
                }}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                ✕ Close
              </button>
            </div>

            {deleteSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {deleteSuccessMsg}
              </div>
            )}

            {deleteError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
                ⚠️ {deleteError}
              </div>
            )}

            {deleteStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                  Are you sure you want to delete your account for <strong className="text-[var(--text-primary)]">{email}</strong>?
                  This action is permanent and will remove all your practice history, XP, streaks, and progress records.
                </p>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  🔒 Step 1: Click below to receive a 6-digit deletion verification code via email.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendDeleteOtp}
                    disabled={deleteLoading}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-rose-600/30"
                  >
                    {deleteLoading ? "Sending OTP..." : "Send Deletion OTP →"}
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <form onSubmit={handleConfirmDeleteAccount} className="space-y-4">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  🔑 Step 2: Enter the 6-digit verification code sent to {email} to confirm deletion.
                </div>

                <div>
                  <label className="block text-xs font-black text-[var(--text-primary)] mb-2 text-center">
                    6-Digit Deletion Verification OTP
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
                    onClick={() => setDeleteStep(1)}
                    className="flex-1 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)]"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={deleteLoading || !deleteOtp.trim()}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-black shadow-xl shadow-rose-600/30"
                  >
                    {deleteLoading ? "Deleting..." : "Permanently Delete Account"}
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
