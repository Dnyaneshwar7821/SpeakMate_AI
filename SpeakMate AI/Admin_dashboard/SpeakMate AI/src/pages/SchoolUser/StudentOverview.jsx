import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from './common/StatusBadge';
import {
  OverviewProfileCard,
  OverviewStatsGrid,
  OverviewProgressCard,
  OverviewLessonsTable,
  OverviewSpeakingCard,
  OverviewGrammarCard,
  OverviewVocabularyCard,
  OverviewListeningCard,
  OverviewAIConversationsCard,
  OverviewAchievementsCard,
  OverviewActivityTimeline,
} from './common';
import { schoolUsersMockData } from './data/schoolUsersMockData';
import './styles/schoolUser.css';

const StudentOverview = ({ student: propStudent, onBack: propOnBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const student = propStudent || schoolUsersMockData.find((s) => s.id === id);
  const handleBack = propOnBack || (() => navigate('/school/users'));

  if (!student) {
    return (
      <div className="user-module-container">
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className="btn-view"
            onClick={handleBack}
            style={{ padding: '8px 16px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
          >
            ← School Users
          </button>
        </div>
        <div className="empty-state-card">
          <h3 className="empty-state-title">No student selected</h3>
          <p className="empty-state-desc">Select a student from the list to view complete learning analytics.</p>
        </div>
      </div>
    );
  }

  const {
    stats = {},
    progress = {},
    lessons = [],
    speakingPractice = {},
    grammarPractice = {},
    vocabulary = {},
    listeningPractice = {},
    aiConversations = [],
    achievements = [],
    recentActivity = [],
    joinedDate = '2023-09-01',
    status = 'Active',
  } = student;

  return (
    <div className="user-module-container">
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          {/* Back Button */}
          <button
            type="button"
            className="btn-view"
            onClick={handleBack}
            style={{ padding: '8px 16px', fontSize: '13px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
          >
            ← School Users
          </button>

          {/* Top Right Status Badge */}
          <div>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1 className="page-header-title" style={{ fontSize: '26px' }}>Student Overview</h1>
          <p className="page-header-subtitle">View learning progress, performance and activity.</p>
        </div>
      </div>

      {/* 11 VERTICAL SECTIONS WITH CONSISTENT SPACING */}
      <div className="overview-container">
        {/* 1. Profile Card */}
        <OverviewProfileCard data={student} type="student" />

        {/* 2. Statistics Grid */}
        <OverviewStatsGrid stats={stats} speakingPractice={speakingPractice} grammarPractice={grammarPractice} />

        {/* 3. Progress Card */}
        <OverviewProgressCard progress={progress} />

        {/* 4. Lessons Table */}
        <OverviewLessonsTable lessons={lessons} />

        {/* 5. Speaking Practice Card */}
        <OverviewSpeakingCard speakingPractice={speakingPractice} />

        {/* 6. Grammar Practice Card */}
        <OverviewGrammarCard grammarPractice={grammarPractice} />

        {/* 7. Vocabulary Card */}
        <OverviewVocabularyCard vocabulary={vocabulary} />

        {/* 8. Listening Practice Card */}
        <OverviewListeningCard listeningPractice={listeningPractice} />

        {/* 9. AI Conversations Card */}
        <OverviewAIConversationsCard aiConversations={aiConversations} />

        {/* 10. Achievements Card */}
        <OverviewAchievementsCard achievements={achievements} />

        {/* 11. Activity Timeline */}
        <OverviewActivityTimeline recentActivity={recentActivity} joinedDate={joinedDate} />
      </div>
    </div>
  );
};

export default StudentOverview;
