import React from 'react';

const OverviewListeningCard = ({ listeningPractice = {} }) => {
  const {
    comprehensionRate = '95%',
    practiceHours = 24.2,
  } = listeningPractice;

  const listeningTime = `${practiceHours} Hours`;
  const completionRate = comprehensionRate || '95%';

  const accentStats = [
    { accent: 'American English (US)', score: '98%' },
    { accent: 'British English (UK)', score: '92%' },
    { accent: 'Australian English (AU)', score: '88%' },
  ];

  const recentLessons = [
    { title: 'BBC World Service Audio Briefing', duration: '12 mins', date: '2026-07-26' },
    { title: 'TED Talk: The Future of AI in Education', duration: '18 mins', date: '2026-07-24' },
  ];

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            🎧
          </div>
          <div>
            <h3 className="overview-card-title">Listening Practice</h3>
            <div className="overview-card-subtitle">Listening practice time, completion rates, accent familiarity, and recent audio lessons</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600 }}>Listening Time</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>{listeningTime}</div>
        </div>

        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Completion Rate</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#14532d', marginTop: '2px' }}>{completionRate}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Accent Familiarity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {accentStats.map((item) => (
              <div key={item.accent} style={{ padding: '10px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.accent}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{item.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Recent Audio Lessons
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentLessons.map((les, idx) => (
              <div key={idx} style={{ padding: '10px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>🎧 {les.title}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>⏱️ {les.duration} • {les.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewListeningCard;
