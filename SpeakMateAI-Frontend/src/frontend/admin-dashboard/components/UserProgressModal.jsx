import React, { useState, useEffect, useCallback } from "react";
import Modal from "@components/common/Modal";
import { adminUserApi } from "@services/admin/adminUserApi";
import { schoolAdminDataApi } from "@services/admin/schoolAdminDataApi";
import { AlertCircle, RefreshCw } from "lucide-react";

import StudentProfileHeader from "./student-profile/StudentProfileHeader";
import StickyNav from "./student-profile/StickyNav";
import ProgressKpiGrid from "./student-profile/ProgressKpiGrid";
import TeacherEvaluationSynthesis from "./student-profile/TeacherEvaluationSynthesis";
import LearningSummary from "./student-profile/LearningSummary";
import LearningJourney from "./student-profile/LearningJourney";
import StrengthsAndAttentionSection from "./student-profile/StrengthsAndAttentionSection";
import ActivitySummary from "./student-profile/ActivitySummary";
import LessonsCurriculumSection from "./student-profile/LessonsCurriculumSection";
import SpeakingAnalyticsSection from "./student-profile/SpeakingAnalyticsSection";
import GrammarAnalyticsSection from "./student-profile/GrammarAnalyticsSection";
import VocabularyAnalyticsSection from "./student-profile/VocabularyAnalyticsSection";

export function UserProgressModal({ isOpen, user, student, onClose }) {
  const targetUser = user || student;
  const isModalOpen = isOpen !== undefined ? (isOpen && Boolean(targetUser)) : Boolean(targetUser);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [lessonsDetail, setLessonsDetail] = useState([]);
  const [activeSection, setActiveSection] = useState("section-overview");

  const isStudentScope = Boolean(
    student ||
    targetUser?.schoolId !== undefined ||
    targetUser?.studentId !== undefined ||
    targetUser?.standard !== undefined ||
    targetUser?.rollNumber !== undefined ||
    targetUser?.role === "STUDENT" ||
    window.location.pathname.startsWith("/school-admin") ||
    window.location.pathname.startsWith("/teacher")
  );

  const fetchProfileData = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      let profilePromise;
      let lessonsPromise;

      if (isStudentScope) {
        profilePromise = schoolAdminDataApi.getStudentProgressProfile(userId);
        lessonsPromise = schoolAdminDataApi.getStudentLessonsDetail(userId);
      } else {
        profilePromise = adminUserApi.getUserProgressProfile(userId);
        lessonsPromise = adminUserApi.getUserLessonsDetail(userId);
      }

      const [profileRes, lessonsRes] = await Promise.allSettled([
        profilePromise,
        lessonsPromise,
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value) {
        const val = profileRes.value;
        const profileData = val?.data !== undefined ? val.data : val;
        setProfile(profileData);
      } else {
        console.error("Failed to load profile data:", profileRes.reason);
        setError("Unable to load student progress analytics. Please try again.");
      }

      if (lessonsRes.status === "fulfilled" && lessonsRes.value) {
        const val = lessonsRes.value;
        const lessonsData = val?.data !== undefined ? val.data : val;
        setLessonsDetail(Array.isArray(lessonsData) ? lessonsData : []);
      }
    } catch (err) {
      console.error("Error fetching student profile:", err);
      setError("An unexpected error occurred while fetching the student profile.");
    } finally {
      setLoading(false);
    }
  }, [isStudentScope]);

  useEffect(() => {
    if (isModalOpen && targetUser?.id) {
      fetchProfileData(targetUser.id);
    } else {
      setProfile(null);
      setLessonsDetail([]);
      setError(null);
      setActiveSection("section-overview");
    }
  }, [isModalOpen, targetUser?.id, fetchProfileData]);

  const handleScrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-6xl"
      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden"
    >
      <div className="relative max-h-[88vh] overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-5 animate-pulse">
            <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        )}

        {/* Error State with Retry */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-8 text-center space-y-3">
            <AlertCircle size={36} className="mx-auto text-red-500" />
            <h3 className="text-base font-bold text-red-900 dark:text-red-200">
              {error}
            </h3>
            <p className="text-xs text-red-700/80 dark:text-red-400">
              Check your network connection or verify that student ID #{targetUser?.id} has valid permissions.
            </p>
            <button
              type="button"
              onClick={() => fetchProfileData(targetUser?.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 transition shadow-sm"
            >
              <RefreshCw size={14} /> Retry Loading Profile
            </button>
          </div>
        )}

        {/* Loaded Profile Content */}
        {!loading && !error && profile && (
          <>
            {/* 1. Student Header */}
            <StudentProfileHeader student={profile.student} />

            {/* 2. Sticky Quick Navigation */}
            <StickyNav
              isSchoolStudent={Boolean(profile.assessments?.schoolStudent)}
              activeSection={activeSection}
              onScrollToSection={handleScrollToSection}
            />

            {/* 3. Top KPI Cards */}
            <ProgressKpiGrid
              summary={profile.summary}
              speaking={profile.speaking}
              grammar={profile.grammar}
              vocabulary={profile.vocabulary}
              onScrollToSection={handleScrollToSection}
            />

            {/* 4. Teacher Evaluation Synthesis (Deterministic Executive Summary) */}
            <TeacherEvaluationSynthesis
              learningPhase={profile.learningPhase}
              engagement={profile.engagement}
              strengths={profile.strengths}
              areasNeedingAttention={profile.areasNeedingAttention}
              summary={profile.summary}
            />

            {/* 5. Learning Summary (Engagement & Curriculum %) */}
            <LearningSummary
              learningPhase={profile.learningPhase}
              engagement={profile.engagement}
              lessons={profile.lessons}
            />

            {/* 6. Learning Journey (6-stage roadmap) */}
            <LearningJourney currentPhase={profile.learningPhase} />

            {/* 7. Strengths & Areas Needing Attention (Elevated to top evaluation) */}
            <StrengthsAndAttentionSection
              strengths={profile.strengths}
              areasNeedingAttention={profile.areasNeedingAttention}
            />

            {/* 8. What the Student Has Done / Practice Habits (Zero duplicate metrics) */}
            <ActivitySummary
              engagement={profile.engagement}
            />

            {/* 9. Lessons & Curriculum Progress (with Growth Chart, Sorting & Pagination) */}
            <LessonsCurriculumSection
              lessons={profile.lessons}
              lessonsDetail={lessonsDetail}
              timeSeries={profile.timeSeries}
            />

            {/* 10. Speaking Analysis */}
            <SpeakingAnalyticsSection
              speaking={profile.speaking}
              timeSeries={profile.timeSeries}
            />

            {/* 11. Grammar Analysis */}
            <GrammarAnalyticsSection
              grammar={profile.grammar}
              timeSeries={profile.timeSeries}
            />

            {/* 12. Vocabulary Analysis */}
            <VocabularyAnalyticsSection
              vocabulary={profile.vocabulary}
              timeSeries={profile.timeSeries}
            />
          </>
        )}
      </div>
    </Modal>
  );
}

export default UserProgressModal;
