import React from 'react';

const OverviewAchievementsCard = ({ achievements = [] }) => {
  const defaultAchievements = [
    { id: 'a1', title: '20 Day Streak Master', icon: '🔥', description: 'Maintained a daily learning streak for 20 consecutive days', earnedDate: '2026-07-20' },
    { id: 'a2', title: 'Grammar Wizard', icon: '🧙‍♂️', description: 'Achieved 90%+ accuracy on 20 advanced syntax drills', earnedDate: '2026-07-15' },
    { id: 'a3', title: 'Fluent Speaker', icon: '🎙️', earnedDate: '2026-07-10', description: 'Completed 30 interactive AI voice practice sessions' },
    { id: 'a4', title: 'Vocabulary Collector', icon: '📚', description: 'Mastered over 1,000 active English vocabulary words', earnedDate: '2026-07-01' },
  ];

  const list = achievements.length > 0 ? achievements.map(a => ({
    ...a,
    description: a.description || 'Awarded for completing milestone learning achievements',
  })) : defaultAchievements;

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            🏆
          </div>
          <div>
            <h3 className="overview-card-title">Achievements Grid</h3>
            <div className="overview-card-subtitle">Badges, description details, and unlocked dates</div>
          </div>
        </div>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          {list.length} Badges Unlocked
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {list.map((ach) => (
          <div
            key={ach.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '16px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              background: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '32px' }}>{ach.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{ach.title}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: 1.3 }}>{ach.description}</div>
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, marginTop: '6px' }}>Unlocked: {ach.earnedDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewAchievementsCard;
