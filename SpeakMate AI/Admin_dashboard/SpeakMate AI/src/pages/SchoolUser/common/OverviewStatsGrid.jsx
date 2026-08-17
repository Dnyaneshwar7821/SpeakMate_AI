import React from 'react';

const OverviewStatsGrid = ({ stats = {}, speakingPractice = {}, grammarPractice = {} }) => {
  const {
    totalLessons = 142,
    hoursSpent = 68.5,
  } = stats;

  const speakingSessions = speakingPractice.sessionsCount || 38;
  const grammarAccuracy = grammarPractice.accuracyRate || '92%';

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            📊
          </div>
          <div>
            <h3 className="overview-card-title">Learning Performance Overview</h3>
            <div className="overview-card-subtitle">Key metrics for lessons, speaking, grammar, and total practice time</div>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 0 }}>
        {/* Card 1: Lessons Completed */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            📚
          </div>
          <div>
            <div className="stat-content-title">Lessons Completed</div>
            <div className="stat-content-value">{totalLessons}</div>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>
              ↑ +12% this month
            </span>
          </div>
        </div>

        {/* Card 2: Speaking Sessions */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}>
            🎙️
          </div>
          <div>
            <div className="stat-content-title">Speaking Sessions</div>
            <div className="stat-content-value">{speakingSessions}</div>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>
              ↑ +6 sessions this week
            </span>
          </div>
        </div>

        {/* Card 3: Grammar Accuracy */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            📝
          </div>
          <div>
            <div className="stat-content-title">Grammar Accuracy</div>
            <div className="stat-content-value">{grammarAccuracy}</div>
            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>
              Top 5% accuracy rate
            </span>
          </div>
        </div>

        {/* Card 4: Practice Time */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
            ⏱️
          </div>
          <div>
            <div className="stat-content-title">Practice Time</div>
            <div className="stat-content-value">{hoursSpent} hrs</div>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>
              ↑ +4.5 hrs this week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewStatsGrid;
