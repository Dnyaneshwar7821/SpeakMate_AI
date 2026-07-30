import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import { profileService } from "../services/appServices";
import ROUTES from "../constants/routes";

const PRESET_AVATARS = ["🎓", "🦁", "🚀", "🦉", "👑", "⚡", "🦊", "🎯", "💎", "🌟", "🔥", "🏆"];

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

const ENGLISH_LEVELS = [
  "Basic",
  "Elementary",
  "Intermediate",
  "Advance",
  "Fluent",
];

const getRankTier = (xp = 0) => {
  if (xp < 100) return { name: "Bronze III", icon: "🥉", badgeColor: "from-amber-700 to-amber-900" };
  if (xp < 300) return { name: "Bronze II", icon: "🥉", badgeColor: "from-amber-600 to-amber-800" };
  if (xp < 600) return { name: "Bronze I", icon: "🥉", badgeColor: "from-amber-500 to-amber-700" };
  if (xp < 1000) return { name: "Silver III", icon: "🥈", badgeColor: "from-slate-400 to-slate-600" };
  if (xp < 1500) return { name: "Silver II", icon: "🥈", badgeColor: "from-slate-300 to-slate-500" };
  if (xp < 2100) return { name: "Silver I", icon: "🥈", badgeColor: "from-slate-200 to-slate-400" };
  return { name: "Gold I", icon: "🥇", badgeColor: "from-amber-400 to-yellow-600" };
};

export function Profile() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const accountType = localStorage.getItem("speakmate_account_type") || user?.accountType || "INDIVIDUAL_USER";

  const [form, setForm] = useState({
    firstName: user?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    nativeLanguage: user?.nativeLanguage || user?.nativeLang || "English",
  });

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "🎓");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [schoolGrade, setSchoolGrade] = useState(
    accountType === "STUDENT" ? (localStorage.getItem("speakmate_school_grade") || user?.schoolGrade || "1st Std") : null
  );
  const [cefrLevel, setCefrLevel] = useState(user?.level || user?.englishLevel || "Intermediate");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── DELETE ACCOUNT MODAL STATES ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const rank = getRankTier(user?.xp || 150);

  const loadProfileData = async () => {
    try {
      const profile = await profileService.get();
      if (profile) {
        setForm({
          firstName: profile.firstName || user?.firstName || "",
          lastName: profile.lastName || user?.lastName || "",
          email: profile.email || user?.email || "",
          nativeLanguage: profile.nativeLanguage || "English",
        });
        if (profile.avatar) setSelectedAvatar(profile.avatar);
      }
    } catch (e) {
      console.warn("Using local auth profile details");
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const cleanFirstName = form.firstName.trim();
    const cleanLastName = form.lastName.trim();
    const cleanEmail = form.email.trim().toLowerCase();

    if (!cleanFirstName || !cleanLastName || !cleanEmail) {
      toast.error("First name, last name, and email address cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const isStudentMode = accountType === "STUDENT" || Boolean(schoolGrade && schoolGrade.includes("Std"));
      const finalGrade = isStudentMode ? schoolGrade : null;
      const finalLevel = isStudentMode ? null : cefrLevel;

      if (finalGrade) {
        localStorage.setItem("speakmate_school_grade", finalGrade);
      } else {
        localStorage.removeItem("speakmate_school_grade");
      }

      const updatedProfile = await profileService.update({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        nativeLanguage: form.nativeLanguage,
        avatar: selectedAvatar,
      });

      updateUser({
        ...updatedProfile,
        name: `${cleanFirstName} ${cleanLastName}`.trim(),
        email: cleanEmail,
        avatar: selectedAvatar,
        level: finalLevel,
        englishLevel: finalLevel,
        schoolGrade: finalGrade,
      });

      setSaved(true);
      toast.success("Profile details updated successfully!");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error(err.userMessage || "Failed to update profile details.");
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
      toast.success(`Verification OTP code sent to ${cleanEmail}. Please check your inbox.`);
    } catch (err) {
      console.error("Send Delete OTP Error:", err);
      setDeleteError(
        err.userMessage || err.response?.data?.message || "Failed to send deletion OTP. Please ensure email is registered."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmDeleteAccount = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = deleteEmail.trim().toLowerCase();
    const cleanOtp = deleteOtp.trim();

    if (!cleanEmail) {
      setDeleteError("Please enter your email address.");
      return;
    }
    if (!cleanOtp || cleanOtp.length !== 6) {
      setDeleteError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setDeleteError("");
    setDeletingAccount(true);
    try {
      await authService.deleteAccount({
        email: cleanEmail,
        otp: cleanOtp,
      });

      setShowDeleteModal(false);
      toast.success("Your account and learning data have been permanently deleted.");
      logout();
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { infoMessage: "Your SpeakMate AI account has been permanently deleted." },
      });
    } catch (err) {
      console.error("Delete Account Error:", err);
      setDeleteError(
        err.userMessage || err.response?.data?.message || "Invalid or expired OTP verification code."
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Profile Card (Mobile App Parity) */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#4f46e5] to-[#312e81] text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
          <div
            onClick={() => setShowAvatarModal(true)}
            className="group relative cursor-pointer grid h-24 w-24 place-items-center rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 text-4xl shadow-inner shrink-0 hover:scale-105 transition-all"
          >
            <span>{selectedAvatar}</span>
            <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all grid place-items-center text-xs font-black text-white">
              ✏️ Change
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full bg-gradient-to-r ${rank.badgeColor} text-white uppercase tracking-wider shadow-md`}>
                {rank.icon} {rank.name}
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider border border-white/30">
                {accountType === "STUDENT" ? `🎓 ${schoolGrade || "1st Std"} Standard` : `👤 ${cefrLevel || "Intermediate"} Level`}
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider border border-white/30">
                ⭐ {user?.xp ?? 0} XP
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider border border-white/30">
                🔥 {user?.streak ?? 0} Day Streak
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}`.trim() : "Learner"}
            </h1>
            <p className="text-xs sm:text-sm font-medium opacity-90">{form.email}</p>
          </div>
        </div>

        <button
          onClick={handleOpenDeleteModal}
          className="z-10 py-2.5 px-4 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-400/40 text-rose-200 text-xs font-black transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shrink-0"
        >
          <span>🗑️</span>
          <span>Delete Account</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black text-center animate-in fade-in duration-200">
          ✓ Profile details updated successfully!
        </div>
      )}

      {/* Profile Edit Form Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Personal Profile Details</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
            Update your account details and standard learning grade.
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
                    <option key={lvl} value={lvl}>👤 {lvl} Level</option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#6c63ff]/25 transition-all"
            >
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* ── PRESET AVATAR SELECTOR MODAL ── */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full glass-card p-6 rounded-3xl shadow-2xl border border-[var(--border-default)] space-y-5 bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="font-black text-lg text-[var(--text-primary)]">Choose Preset Avatar</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 p-2">
              {PRESET_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setSelectedAvatar(emoji);
                    setShowAvatarModal(false);
                  }}
                  className={`h-16 text-3xl rounded-2xl border-2 flex items-center justify-center transition-all ${
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
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
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
                  Are you sure you want to delete your account? This action is permanent and will remove all practice history, XP, streaks, and progress records.
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
                  🔒 Step 1: Click below to receive a 6-digit verification OTP code via email.
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
                    disabled={sendingOtp || !deleteEmail.trim()}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all"
                  >
                    {sendingOtp ? "Sending OTP..." : "Send Verification OTP →"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmDeleteAccount} className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  📧 OTP Verification Code sent to <strong>{deleteEmail}</strong>.
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
                    className="flex-1 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)]"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={deletingAccount || !deleteOtp.trim()}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-black shadow-xl shadow-rose-600/30 transition-all"
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
