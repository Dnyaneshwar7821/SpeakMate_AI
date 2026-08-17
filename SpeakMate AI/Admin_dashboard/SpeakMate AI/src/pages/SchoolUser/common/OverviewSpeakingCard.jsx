import React from 'react';

const OverviewSpeakingCard = ({ speakingPractice = {} }) => {
  const {
    sessionsCount = 38,
    avgFluencyScore = 89,
    pronunciationAccuracy = '93%',
    topTopic = 'Debating & Public Speaking',
  } = speakingPractice;

  const clarityScore = pronunciationAccuracy || '93%';
  const fluencyScore = `${avgFluencyScore}%`;
  const grammarScore = '91%';
  const overallSpeakingScore = '91 / 100';
  const coachFeedback = 'Demonstrates excellent articulation and natural pacing. Continue practicing complex conditional clause transitions for native-level mastery.';

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            🎙️
          </div>
          <div>
            <h3 className="overview-card-title">Speaking Practice</h3>
            <div className="overview-card-subtitle">Speech acoustics, clarity, fluency, and AI coach evaluation feedback</div>
          </div>
        </div>
        <div className="waveform-container">
          <div className="waveform-bar" style={{ animationDelay: '0.1s' }}></div>
          <div className="waveform-bar" style={{ animationDelay: '0.3s' }}></div>
          <div className="waveform-bar" style={{ animationDelay: '0.2s' }}></div>
          <div className="waveform-bar" style={{ animationDelay: '0.4s' }}></div>
          <div className="waveform-bar" style={{ animationDelay: '0.15s' }}></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600 }}>Overall Speaking Score</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>{overallSpeakingScore}</div>
        </div>

        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Clarity</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#14532d', marginTop: '4px' }}>{clarityScore}</div>
        </div>

        <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '12px', color: '#92400e', fontWeight: 600 }}>Fluency</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#78350f', marginTop: '4px' }}>{fluencyScore}</div>
        </div>

        <div style={{ padding: '16px', background: '#fcf5ff', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
          <div style={{ fontSize: '12px', color: '#6b21a8', fontWeight: 600 }}>Grammar Score</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#581c87', marginTop: '4px' }}>{grammarScore}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Recent Practice Topic</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{topTopic}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{sessionsCount} practice sessions completed</div>
        </div>

        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>🗣️ Coach Feedback</div>
          <p style={{ fontSize: '13px', color: '#334155', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            "{coachFeedback}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewSpeakingCard;
