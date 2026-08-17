import React from 'react';

const OverviewProgressCard = ({ progress = {} }) => {
  const {
    overallProgress = 78,
    speakingScore = 88,
    grammarScore = 92,
    vocabularyScore = 85,
    listeningScore = 90,
  } = progress;

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            📈
          </div>
          <div>
            <h3 className="overview-card-title">Skill Mastery Breakdown</h3>
            <div className="overview-card-subtitle">Comprehensive competency tracking across core linguistic domains</div>
          </div>
        </div>
        <span className="level-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
          Overall Mastery: {overallProgress}%
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
            <span>🎙️ Speaking Skill</span>
            <span style={{ color: '#2563eb' }}>{speakingScore}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${speakingScore}%`, background: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Fluency & Accent Clarity</div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
            <span>📝 Grammar Mastery</span>
            <span style={{ color: '#16a34a' }}>{grammarScore}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${grammarScore}%`, background: '#16a34a' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Syntax & Structural Precision</div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
            <span>📖 Vocabulary Bank</span>
            <span style={{ color: '#8b5cf6' }}>{vocabularyScore}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${vocabularyScore}%`, background: '#8b5cf6' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Lexical Range & Active Words</div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
            <span>🎧 Listening Comprehension</span>
            <span style={{ color: '#f59e0b' }}>{listeningScore}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${listeningScore}%`, background: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Aural Processing & Accent Speed</div>
        </div>
      </div>
    </div>
  );
};

export default OverviewProgressCard;
