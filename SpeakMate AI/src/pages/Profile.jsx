import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import { profileService, subscriptionService, onboardingService } from "../services/appServices";
import { getLiveProgressStats, syncBackendProgress } from "../utils/progressTracker";
import { EventBus, AVATAR_EVENTS } from "../services/live2d/EventBus";
import { AVATAR_LIST, getAvatarById } from "../config/AvatarCatalog";
import { Link } from "react-router-dom";
import ROUTES from "../constants/routes";

const PRESET_AVATARS = [
  "🎓", "🦁", "🚀", "🦉", "👑", "⚡",
  "🦊", "🎯", "💎", "🌟", "🔥", "🏆",
  "🌸", "🐱", "🐶", "🦄", "🍀", "🎨"
];

const SCHOOL_GRADES = [
  "1st Std", "2nd Std", "3rd Std", "4th Std", "5th Std",
  "6th Std", "7th Std", "8th Std", "9th Std", "10th Std",
  "11th Std", "12th Std"
];

const ENGLISH_LEVELS = [
  "Beginner", "Intermediate", "Advanced"
];

const ACCENT_OPTIONS = [
  { code: "US", label: "American English (US)", flag: "🇺🇸" },
  { code: "UK", label: "British English (UK)", flag: "🇬🇧" },
  { code: "AU", label: "Australian English (AU)", flag: "🇦🇺" },
  { code: "IN", label: "Indian English (IN)", flag: "🇮🇳" },
];

const AGE_OPTIONS = [
  { code: "Kids", label: "Kids (6-12)", icon: "🎈", desc: "Simple words, fun stories & high encouragement" },
  { code: "Teens", label: "Teens (13-17)", icon: "⚡", desc: "School life, pop culture & casual chatter" },
  { code: "Young Adult", label: "Young Adults (18-24)", icon: "🎓", desc: "Campus life, travel & interview prep" },
  { code: "Professional", label: "Professionals (25-50)", icon: "💼", desc: "Business English, executive tone & presentations" },
  { code: "Senior", label: "Seniors (50+)", icon: "☕", desc: "Relaxed conversation, culture & life stories" },
];

const normalizeAgeGroup = (rawAge) => {
  if (!rawAge) return "Professional";
  const s = String(rawAge).toLowerCase();
  if (s.includes("kid")) return "Kids";
  if (s.includes("teen")) return "Teens";
  if (s.includes("young")) return "Young Adult";
  if (s.includes("senior")) return "Senior";
  if (s.includes("prof")) return "Professional";
  return "Professional";
};

const getRankTier = (xp = 0) => {
  if (xp < 100) return { name: "Bronze III", icon: "🥉", badgeColor: "from-amber-700 to-amber-900", nextXp: 100 };
  if (xp < 300) return { name: "Bronze II", icon: "🥉", badgeColor: "from-amber-600 to-amber-800", nextXp: 300 };
  if (xp < 600) return { name: "Bronze I", icon: "🥉", badgeColor: "from-amber-500 to-amber-700", nextXp: 600 };
  if (xp < 1000) return { name: "Silver III", icon: "🥈", badgeColor: "from-slate-500 to-slate-700", nextXp: 1000 };
  if (xp < 1500) return { name: "Silver II", icon: "🥈", badgeColor: "from-slate-400 to-slate-600", nextXp: 1500 };
  if (xp < 2200) return { name: "Silver I", icon: "🥈", badgeColor: "from-slate-300 to-slate-500", nextXp: 2200 };
  if (xp < 3000) return { name: "Gold III", icon: "🥇", badgeColor: "from-amber-500 to-yellow-600", nextXp: 3000 };
  if (xp < 4000) return { name: "Gold II", icon: "🥇", badgeColor: "from-amber-400 to-yellow-600", nextXp: 4000 };
  if (xp < 5000) return { name: "Gold I", icon: "🥇", badgeColor: "from-amber-300 to-yellow-500", nextXp: 5000 };
  if (xp < 7000) return { name: "Platinum Master", icon: "💎", badgeColor: "from-cyan-500 to-blue-600", nextXp: 7000 };
  return { name: "Diamond Orator", icon: "👑", badgeColor: "from-purple-500 to-indigo-700", nextXp: 10000 };
};

const isImageAvatar = (avatar) => {
  if (!avatar || typeof avatar !== "string") return false;
  const clean = avatar.trim();
  return (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("/") ||
    clean.startsWith("data:image/") ||
    clean.startsWith("blob:")
  );
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
    isStudent ? (user?.schoolGrade || localStorage.getItem("speakmate_school_grade") || "1st Std") : "1st Std"
  );
  const [ageGroup, setAgeGroup] = useState(
    () => normalizeAgeGroup(user?.ageGroup || localStorage.getItem("speakmate_age_group") || "Professional")
  );
  const [cefrLevel, setCefrLevel] = useState(user?.level || user?.englishLevel || "Intermediate (B1)");

  // Preferences State
  const [dailyGoal, setDailyGoal] = useState(
    () => parseInt(localStorage.getItem("speakmate_daily_goal") || "15", 10)
  );
  const [preferredAccent, setPreferredAccent] = useState(
    () => localStorage.getItem("speakmate_accent") || "US"
  );
  const [activeAvatarId, setActiveAvatarId] = useState(
    () => localStorage.getItem("speakmate_avatar_model") || "haru"
  );
  const [preferredVoice, setPreferredVoice] = useState(
    () => localStorage.getItem("speakmate_voice_gender") || "female"
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subInfo, setSubInfo] = useState(null);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [playingTutor, setPlayingTutor] = useState(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const rank = getRankTier(liveStats.xp || user?.xp || 0);

  useEffect(() => {
    if (user?.ageGroup) setAgeGroup(normalizeAgeGroup(user.ageGroup));
    if (user?.schoolGrade) setSchoolGrade(user.schoolGrade);
  }, [user?.ageGroup, user?.schoolGrade]);

  useEffect(() => {
    profileService
      .get()
      .then((profile) => {
        if (profile) {
          syncBackendProgress(profile, user);
          setLiveStats(getLiveProgressStats(user));
          setForm({
            firstName: profile.firstName || user?.firstName || "",
            lastName: profile.lastName || user?.lastName || "",
            email: profile.email || user?.email || "",
            nativeLanguage: profile.nativeLanguage || "English",
          });
          if (profile.avatar) setSelectedAvatar(profile.avatar);
          if (profile.ageGroup) {
            const norm = normalizeAgeGroup(profile.ageGroup);
            setAgeGroup(norm);
            localStorage.setItem("speakmate_age_group", norm);
          }
          if (profile.schoolGrade) {
            setSchoolGrade(profile.schoolGrade);
            localStorage.setItem("speakmate_school_grade", profile.schoolGrade);
          }
        }
      })
      .catch(() => {});

    subscriptionService
      .getMySubscription()
      .then((sub) => setSubInfo(sub))
      .catch(() => {});
  }, [user]);

  const playAvatarPreview = (av) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.info(`Switched voice to ${av.name}`);
      return;
    }
    window.speechSynthesis.cancel();
    setPlayingTutor(av.id);
    const greetingText = `Hello! I'm ${av.name}, your AI speaking coach. Let's practice English together!`;
    const utterance = new SpeechSynthesisUtterance(greetingText);
    utterance.pitch = av.defaultPitch || 1.0;
    utterance.rate = 1.0;
    utterance.onend = () => setPlayingTutor(null);
    utterance.onerror = () => setPlayingTutor(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectTutor = (avatarInput) => {
    const entry = typeof avatarInput === "object" ? avatarInput : getAvatarById(avatarInput);
    const model = entry.id;
    const gender = entry.gender;
    const voiceCode = entry.voiceProfile;
    const pitch = entry.defaultPitch;

    setActiveAvatarId(model);
    setPreferredVoice(gender);
    localStorage.setItem("speakmate_voice_gender", gender);
    localStorage.setItem("speakmate_avatar_model", model);
    localStorage.setItem("speakmate_selected_voice", voiceCode);
    localStorage.setItem("speakmate_ai_voice", voiceCode);
    localStorage.setItem("speakmate_voice_code", voiceCode);
    localStorage.setItem("speakmate_voice_pitch", String(pitch));

    EventBus.emit(AVATAR_EVENTS.GENDER_CHANGED, { gender, model });

    toast.success(`Switched to ${entry.name} (${entry.voiceLabel} Active) ${entry.emoji}`);
  };

  const handleSelectProficiencyLevel = async (newLevel) => {
    setCefrLevel(newLevel);
    localStorage.setItem("speakmate_english_level", newLevel);
    try {
      await Promise.allSettled([
        profileService.update({
          firstName: form.firstName || user?.firstName,
          lastName: form.lastName || user?.lastName,
          email: form.email || user?.email,
          englishLevel: newLevel,
        }),
        onboardingService.update({ englishLevel: newLevel }),
      ]);
      if (updateUser) updateUser({ englishLevel: newLevel });
      window.dispatchEvent(new CustomEvent("speakmate_settings_updated", { detail: { englishLevel: newLevel } }));
      toast.success(`AI Tutor Level set to ${newLevel}! 🎯`);
    } catch {
      toast.error("Could not update proficiency level.");
    }
  };

  const handleSelectAgeGroup = async (newAge) => {
    const val = normalizeAgeGroup(newAge);
    setAgeGroup(val);
    localStorage.setItem("speakmate_age_group", val);
    try {
      await Promise.allSettled([
        profileService.update({
          firstName: form.firstName || user?.firstName,
          lastName: form.lastName || user?.lastName,
          email: form.email || user?.email,
          ageGroup: val,
        }),
        onboardingService.update({ ageGroup: val }),
      ]);
      if (updateUser) updateUser({ ageGroup: val });
      window.dispatchEvent(new CustomEvent("speakmate_age_group_changed", { detail: { ageGroup: val } }));
      window.dispatchEvent(new CustomEvent("speakmate_settings_updated", { detail: { ageGroup: val } }));
      toast.success(`Target Persona set to ${val}! 👥`);
    } catch {
      toast.error("Could not update age group.");
    }
  };

  const handleSelectSchoolGrade = async (newGrade) => {
    setSchoolGrade(newGrade);
    localStorage.setItem("speakmate_school_grade", newGrade);
    try {
      await Promise.allSettled([
        profileService.update({
          firstName: form.firstName || user?.firstName,
          lastName: form.lastName || user?.lastName,
          email: form.email || user?.email,
          schoolGrade: newGrade,
          englishLevel: null,
        }),
        onboardingService.update({ schoolGrade: newGrade, englishLevel: null }),
      ]);
      if (updateUser) updateUser({ schoolGrade: newGrade, englishLevel: null });
      window.dispatchEvent(new CustomEvent("speakmate_settings_updated", { detail: { schoolGrade: newGrade } }));
      toast.success(`School Curriculum set to ${newGrade}! 🎓`);
    } catch {
      toast.error("Could not update school grade.");
    }
  };

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
      } else {
        localStorage.setItem("speakmate_age_group", ageGroup);
        window.dispatchEvent(new CustomEvent("speakmate_age_group_changed", { detail: { ageGroup } }));
      }
      localStorage.setItem("speakmate_english_level", cefrLevel);
      localStorage.setItem("speakmate_daily_goal", dailyGoal.toString());
      localStorage.setItem("speakmate_accent", preferredAccent);
      localStorage.setItem("speakmate_voice_gender", preferredVoice);
      localStorage.setItem("speakmate_avatar_model", activeAvatarId);

      EventBus.emit(AVATAR_EVENTS.GENDER_CHANGED, { gender: preferredVoice, model: activeAvatarId });

      const [updatedProfile] = await Promise.all([
        profileService.update({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          email: cleanEmail,
          nativeLanguage: form.nativeLanguage,
          avatar: selectedAvatar,
          ageGroup: isStudent ? undefined : ageGroup,
          englishLevel: isStudent ? undefined : cefrLevel,
          schoolGrade: isStudent ? schoolGrade : undefined,
        }).catch(() => null),
        onboardingService.update({
          ageGroup: isStudent ? undefined : ageGroup,
          englishLevel: isStudent ? undefined : cefrLevel,
          schoolGrade: isStudent ? schoolGrade : undefined,
          nativeLanguage: form.nativeLanguage,
        }).catch(() => null),
      ]);

      updateUser({
        ...(updatedProfile || {}),
        name: `${cleanFirstName} ${cleanLastName}`.trim(),
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        avatar: selectedAvatar,
        schoolGrade: isStudent ? schoolGrade : null,
        ageGroup: isStudent ? null : ageGroup,
        englishLevel: isStudent ? null : cefrLevel,
      });

      window.dispatchEvent(new CustomEvent("speakmate_settings_updated", {
        detail: {
          firstName: cleanFirstName,
          lastName: cleanLastName,
          ageGroup: isStudent ? null : ageGroup,
          englishLevel: isStudent ? null : cefrLevel,
          schoolGrade: isStudent ? schoolGrade : null,
        }
      }));

      setSaved(true);
      toast.success("Profile preferences updated successfully!");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      toast.error("Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPresetAvatar = async (emoji) => {
    setSelectedAvatar(emoji);
    setShowAvatarModal(false);
    try {
      await profileService.updateAvatar(emoji);
      if (updateUser) updateUser({ avatar: emoji });
      toast.success(`Avatar updated to ${emoji}! 🎉`);
    } catch {
      toast.error("Failed to save avatar to server.");
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Resize to max 128x128 thumbnail to prevent excessive database egress (< 8KB)
          const canvas = document.createElement("canvas");
          const maxDim = 128;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUri = canvas.toDataURL("image/jpeg", 0.82);

          setSelectedAvatar(compressedUri);
          setShowAvatarModal(false);
          await profileService.updateAvatar(compressedUri);
          if (updateUser) updateUser({ avatar: compressedUri });
          toast.success("Profile photo updated successfully! 📸");
        } catch {
          toast.error("Failed to upload profile photo.");
        }
      };
      img.onerror = () => {
        toast.error("Failed to process selected image.");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your Pro subscription? You will return to the Free Starter plan.")) {
      return;
    }
    try {
      const res = await subscriptionService.cancelSubscription();
      setSubInfo(res || { isPro: false, planType: "FREE", status: "ACTIVE" });
      if (updateUser) {
        updateUser({ ...user, isPro: false, subscriptionPlan: "FREE" });
      }
      toast.success("Your Pro subscription has been cancelled. You are now on the Free Starter plan.");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to cancel subscription.");
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
    <div className="w-full max-w-5xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* Header Profile Card with Glassmorphism */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#312E81] text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
          <div
            onClick={() => setShowAvatarModal(true)}
            className="group relative cursor-pointer grid h-24 w-24 place-items-center rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-inner shrink-0 hover:scale-105 transition-all overflow-hidden"
            title="Click to change avatar"
          >
            {isImageAvatar(selectedAvatar) ? (
              <img src={selectedAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">{selectedAvatar || "🎓"}</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all grid place-items-center text-xs font-black text-white">
              ✏️ Edit
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3.5 sm:mb-4">
              <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-full bg-gradient-to-r ${rank.badgeColor} text-white uppercase tracking-wider shadow-md inline-flex items-center gap-1.5`}>
                {rank.icon} {rank.name}
              </span>
              <span className="text-[10px] font-black px-3.5 py-1.5 rounded-full bg-white/20 uppercase tracking-wider border border-white/30 inline-flex items-center gap-1.5">
                {isStudent ? `🎓 ${schoolGrade}` : `👤 ${cefrLevel}`}
              </span>
              <span className="text-[10px] font-black px-3.5 py-1.5 rounded-full bg-white/20 uppercase tracking-wider border border-white/30 text-amber-300 inline-flex items-center gap-1.5">
                ⭐ {liveStats.xp || 0} XP
              </span>
              <span className="text-[10px] font-black px-3.5 py-1.5 rounded-full bg-white/20 uppercase tracking-wider border border-white/30 text-rose-300 inline-flex items-center gap-1.5">
                🔥 {liveStats.streak || 0} Day Streak
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
              {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}`.trim() : "Learner"}
            </h1>
            <p className="text-xs sm:text-sm font-medium opacity-90">{form.email}</p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex sm:flex-col gap-2 z-10 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
              activeTab === "general" ? "bg-white text-[#6C63FF] shadow-lg" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            👤 General Details
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
              activeTab === "preferences" ? "bg-white text-[#6C63FF] shadow-lg" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            🎯 Goals & Voices
          </button>
          {!isStudent && (
            <button
              onClick={() => setActiveTab("subscription")}
              className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
                activeTab === "subscription" ? "bg-white text-amber-600 shadow-lg" : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              ⭐ Subscription
            </button>
          )}
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
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
        <div className="space-y-6">
          {/* ── SECTION 1: AI TUTOR ENGLISH LEVEL (OR SCHOOL GRADE FOR STUDENTS) ── */}
          {isStudent ? (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-default)]">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                    <span>🏫</span> School Curriculum Grade
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-0.5">
                    Select your current school standard for personalized tests & syllabus
                  </p>
                </div>
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30 self-start sm:self-auto">
                  Syllabus Sync Active 📚
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {SCHOOL_GRADES.map((grade) => {
                  const active = (schoolGrade || "").toLowerCase() === grade.toLowerCase();
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => handleSelectSchoolGrade(grade)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border active:scale-95 ${
                        active
                          ? "bg-[#6C63FF] text-white border-[#6C63FF] shadow-md shadow-[#6C63FF]/25"
                          : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[#6C63FF]/50"
                      }`}
                    >
                      🎓 {grade}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-default)]">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                    <span>👤</span> AI Tutor English Level
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-0.5">
                    Controls speaking & chat response complexity
                  </p>
                </div>
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30 self-start sm:self-auto">
                  Live Speaking Adaptation 🎯
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {[
                  { level: "Beginner", icon: "🌱", desc: "Simple words & basic sentence structures" },
                  { level: "Intermediate", icon: "🚀", desc: "Fluent conversations & daily situations" },
                  { level: "Advanced", icon: "👑", desc: "Complex vocabulary & executive tone" },
                ].map((item) => {
                  const active = (cefrLevel || "").toLowerCase().includes(item.level.toLowerCase());
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => handleSelectProficiencyLevel(item.level)}
                      className={`p-5 rounded-3xl text-left border transition-all cursor-pointer active:scale-95 group overflow-hidden ${
                        active
                          ? "bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white border-[#6C63FF] shadow-lg shadow-[#6C63FF]/20 ring-2 ring-[#6C63FF]/30"
                          : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[#6C63FF]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{item.icon}</span>
                        {active && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/20 text-white shadow-sm">
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className={`text-base font-black mt-3 ${active ? "text-white" : "text-[var(--text-primary)]"}`}>
                        {item.level}
                      </h4>
                      <p className={`text-xs font-medium mt-1 leading-relaxed ${active ? "text-white/85" : "text-[var(--text-secondary)]"}`}>
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SECTION 2: ACTIVE AI SPEAKING TUTOR SUMMARY CARD WITH POPUP MODAL ── */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-default)]">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                  <span>🎭</span> Active AI Speaking Tutor Persona
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-0.5">
                  Your personalized AI speaking partner from our full character catalog.
                </p>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30 self-start sm:self-auto">
                Auto Voice Sync Active 🎙️
              </span>
            </div>

            {/* Active Selected Tutor Highlight Card */}
            {(() => {
              const activeTutorObj = getAvatarById(activeAvatarId);
              return (
                <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-inner flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] text-white grid place-items-center text-3xl shadow-lg shrink-0">
                      {activeTutorObj.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-[#6C63FF] tracking-wider px-2.5 py-0.5 rounded-full bg-[#6C63FF]/15">
                          Active Selected Tutor
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-cyan-500/15 text-cyan-400 border-cyan-500/30">
                          {activeTutorObj.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[var(--text-primary)] mt-1">
                        {activeTutorObj.name}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                        {activeTutorObj.subtitle} • 🎙️ {activeTutorObj.voiceLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => playAvatarPreview(activeTutorObj)}
                      className="px-4 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs font-black text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white transition-all shrink-0 active:scale-95 shadow-sm cursor-pointer"
                    >
                      {playingTutor === activeTutorObj.id ? "🔊 Speaking..." : "▶ Test Voice"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTutorModal(true)}
                      className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#6C63FF]/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <span>🎭 Choose AI Avatar (10 Options)</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── SECTION 3: PERSONAL INFORMATION CARD ── */}
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)]">Personal Details</h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                Manage your personal identity, contact email, and native language.
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
                    className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] shadow-inner"
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
                    className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Native Language</label>
                  <input
                    type="text"
                    value={form.nativeLanguage}
                    onChange={(e) => setForm({ ...form, nativeLanguage: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-95 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#6C63FF]/25 transition-all cursor-pointer active:scale-95"
                >
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PREFERENCES & LEARNING GOALS */}
      {activeTab === "preferences" && (
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)]">Learning Goals & Preferences</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
              Customize your daily study cadence, target accent, and AI tutor partner.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* ── AI Speaking Tutor Persona inside Preferences (Universal Catalog) ── */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)]">
                  🎭 AI Speaking Tutor Persona
                </label>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30">
                  Auto Voice Sync 🎙️
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVATAR_LIST.map((av) => {
                  const isSelected = activeAvatarId === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectTutor(av)}
                      className={`p-4 rounded-2xl border text-left font-black transition-all cursor-pointer active:scale-95 flex flex-col justify-between ${
                        isSelected
                          ? "border-[#6C63FF] bg-[#6C63FF]/15 text-[#6C63FF] shadow-md ring-2 ring-[#6C63FF]/30"
                          : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[#6C63FF]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <span className="text-2xl">{av.emoji}</span>
                        {isSelected && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#6C63FF] text-white">
                            ✓ Active
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-black">{av.name}</span>
                          <span
                            className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${
                              av.category === "cartoon"
                                ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                                : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                            }`}
                          >
                            {av.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] font-medium line-clamp-1">
                          {av.subtitle}
                        </p>
                        <div className="pt-1">
                          <span className="text-[9px] font-bold opacity-90 px-2 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-default)] inline-block">
                            🎙️ {av.voiceLabel}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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
                    className={`p-4 rounded-2xl border text-center font-black transition-all cursor-pointer active:scale-95 ${
                      dailyGoal === mins
                        ? "border-[#6C63FF] bg-[#6C63FF]/15 text-[#6C63FF] shadow-md"
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
                    className={`p-3.5 rounded-2xl border text-center font-black transition-all cursor-pointer active:scale-95 ${
                      preferredAccent === acc.code
                        ? "border-[#6C63FF] bg-[#6C63FF]/15 text-[#6C63FF] shadow-md"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="text-xl block mb-1">{acc.flag}</span>
                    <span className="text-xs">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-95 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#6C63FF]/25 transition-all cursor-pointer active:scale-95"
              >
                {saving ? "Saving Preferences..." : "Save Preferences"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION & PLAN (INDIVIDUAL USERS ONLY) */}
      {activeTab === "subscription" && !isStudent && (
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)]">My Subscription & License</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
              View your active SpeakMate AI plan, daily practice quotas, and upgrade options.
            </p>
          </div>

          {subInfo?.isPro ? (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-indigo-500/15 border border-indigo-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌟</span>
                  <div>
                    <h3 className="font-black text-lg text-indigo-500">
                      SpeakMate Pro Member ({subInfo?.planType === "YEARLY_PRO" ? "Annual Pass" : "Monthly Pass"})
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                      Status: <span className="text-emerald-500 font-bold">Active</span>
                      {subInfo?.endDate && ` • Valid until ${new Date(subInfo.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold text-center shadow-sm transition-all"
                  >
                    Cancel Plan
                  </button>
                  <Link
                    to={ROUTES.PRICING}
                    className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center shadow-md transition-all active:scale-95"
                  >
                    Change Plan ➔
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block">AI Speaking</span>
                  <strong className="text-indigo-400 text-sm">Unlimited</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block">Grammar Doctor</span>
                  <strong className="text-indigo-400 text-sm">Unlimited</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block">Voice Personas</span>
                  <strong className="text-indigo-400 text-sm">All Unlocked</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block">Live2D Avatars</span>
                  <strong className="text-indigo-400 text-sm">All Unlocked</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    Free Starter Plan
                  </span>
                  <h3 className="font-black text-lg text-[var(--text-primary)] mt-2">
                    Free Forever Tier
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    10 minutes daily AI talk & 5 grammar checks per day.
                  </p>
                </div>

                <Link
                  to={ROUTES.PRICING}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-black text-center shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
                >
                  Upgrade to Pro (From ₹149/mo) ➔
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 flex items-center justify-between">
                <span>🔥 Upgrade to Pro for <strong>Unlimited 24/7 practice</strong>, all voice avatars, and interview tracks.</span>
                <span className="font-black">Save 33% on Annual Pass ⭐</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SECURITY & ACCOUNT DELETION */}
      {activeTab === "security" && (
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-6">
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
              className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-rose-600/25 active:scale-95"
            >
              Request Account Deletion →
            </button>
          </div>
        </div>
      )}

      {/* ── PRESET AVATAR SELECTOR MODAL ── */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border border-[var(--border-default)] space-y-5 bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="font-black text-lg text-[var(--text-primary)]">Choose Profile Avatar</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Custom Photo Upload Option */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl overflow-hidden grid place-items-center bg-[#6C63FF]/20 border border-[#6C63FF]/30 shrink-0">
                  {isImageAvatar(selectedAvatar) ? (
                    <img src={selectedAvatar} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">📸</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-[var(--text-primary)]">Custom Photo</p>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium">Upload JPG or PNG from device</p>
                </div>
              </div>
              <label className="py-2 px-3.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B52E0] text-white text-xs font-black cursor-pointer shadow-md shadow-[#6C63FF]/25 active:scale-95 transition-all">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadPhoto}
                />
              </label>
            </div>

            <div className="text-xs font-bold text-[var(--text-secondary)] px-1">Or select an emoji avatar:</div>

            <div className="grid grid-cols-6 gap-3 p-1 max-h-48 overflow-y-auto">
              {PRESET_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelectPresetAvatar(emoji)}
                  className={`h-12 text-2xl rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                    selectedAvatar === emoji
                      ? "border-[#6C63FF] bg-[#6C63FF]/15 scale-105"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6C63FF]/50"
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
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
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
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-black shadow-xl shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    {deletingAccount ? "Deleting..." : "Verify & Permanently Delete"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* ── 10 AI AVATAR OPTIONS POPUP MODAL ── */}
      {showTutorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-4xl w-full glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border border-[var(--border-default)] space-y-6 max-h-[90vh] overflow-y-auto bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div>
                <h3 className="font-black text-xl text-[var(--text-primary)]">Choose AI Speaking Partner 🎭</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                  Select your tutor character — click <strong>Test Voice</strong> to preview their speech and personality!
                </p>
              </div>
              <button
                onClick={() => setShowTutorModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)] hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* AVATAR OPTIONS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVATAR_LIST.map((av) => {
                const isSelected = activeAvatarId === av.id;
                return (
                  <div
                    key={av.id}
                    onClick={() => {
                      handleSelectTutor(av);
                      playAvatarPreview(av);
                      setShowTutorModal(false);
                    }}
                    className={`p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 flex flex-col justify-between group ${
                      isSelected
                        ? "border-[#6C63FF] bg-[#6C63FF]/15 shadow-xl scale-102 ring-2 ring-[#6C63FF]/30"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6C63FF]/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] grid place-items-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                          {av.emoji}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-[#6C63FF] text-white shadow-sm">
                              ✓ Active
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                              av.category === "cartoon"
                                ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                                : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                            }`}
                          >
                            {av.badge}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-black text-base text-[var(--text-primary)] group-hover:text-[#6C63FF] transition-colors mt-3">
                        {av.name}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-2 mt-0.5">
                        {av.subtitle}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-default)] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-[var(--text-secondary)]">
                        🎙️ {av.voiceLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAvatarPreview(av);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-[10px] font-black text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white transition-all shrink-0 cursor-pointer"
                      >
                        {playingTutor === av.id ? "🔊 Playing" : "▶ Test"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
