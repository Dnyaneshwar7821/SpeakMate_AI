import React from 'react';

const OverviewActivityTimeline = ({ recentActivity = [], joinedDate = '2023-09-01' }) => {
  const defaultActivities = [
    { id: 'act1', type: 'Lesson Completed', description: 'Finished Advanced Business English Module', time: '2 hours ago' },
    { id: 'act2', type: 'Speaking Practice', description: 'Completed 15 min fluency session on Public Speaking', time: '5 hours ago' },
    { id: 'act3', type: 'Grammar Practice', description: 'Mastered Conditionals Type 3 drill', time: 'Yesterday' },
    { id: 'act4', type: 'AI Conversation', description: '18 min dialogue with AI Tutor Alex on Debating', time: '2 days ago' },
    { id: 'act5', type: 'Vocabulary Session', description: 'Mastered 20 new C1 level words', time: '3 days ago' },
  ];

  const list = recentActivity.length > 0 ? recentActivity : defaultActivities;

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            ⚡
          </div>
          <div>
            <h3 className="overview-card-title">Activity Timeline</h3>
            <div className="overview-card-subtitle">Recent activity logs including lessons, grammar, speaking, AI conversations, and vocabulary sessions</div>
          </div>
        </div>
      </div>

      <div className="timeline-list">
        {list.map((act) => (
          <div className="timeline-item" key={act.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="timeline-title" style={{ color: '#2563eb' }}>{act.type}:</span>
              <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{act.description}</span>
            </div>
            <div className="timeline-time" style={{ marginTop: '2px' }}>{act.time}</div>
          </div>
        ))}
        <div className="timeline-item">
          <div className="timeline-title" style={{ color: '#16a34a' }}>Account Registered</div>
          <div className="timeline-time">Registered on {joinedDate}</div>
        </div>
      </div>
    </div>
  );
};

export default OverviewActivityTimeline;
