import React from 'react';

const OverviewGrammarCard = ({ grammarPractice = {} }) => {
  const {
    masteredTopics = 24,
    accuracyRate = '92%',
    weakArea = 'Conditionals Type 3',
  } = grammarPractice;

  const totalMistakesCount = 8;
  const recentCorrections = [
    { mistake: 'If I would have known...', correction: 'If I had known...', topic: 'Third Conditional' },
    { mistake: 'He suggested me to go...', correction: 'He suggested that I go...', topic: 'Subjunctive Mood' },
    { mistake: 'Despite of the rain...', correction: 'Despite the rain...', topic: 'Prepositions' },
  ];

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            📝
          </div>
          <div>
            <h3 className="overview-card-title">Grammar Practice</h3>
            <div className="overview-card-subtitle">Grammar accuracy, mistake tracking, recent corrections, and target focus areas</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Grammar Accuracy</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#14532d', marginTop: '2px' }}>{accuracyRate}</div>
          <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>{masteredTopics} topics mastered</div>
        </div>

        <div style={{ padding: '16px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
          <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: 600 }}>Tracked Mistakes</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#9a3412', marginTop: '2px' }}>{totalMistakesCount} Mistakes</div>
          <div style={{ fontSize: '11px', color: '#c2410c', marginTop: '2px' }}>↓ -4 from last week</div>
        </div>

        <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
          <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: 600 }}>Target Focus Area</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#991b1b', marginTop: '4px' }}>⚠️ {weakArea}</div>
          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>Assigned practice module</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Recent Sentence Corrections
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentCorrections.map((item, idx) => (
            <div key={idx} style={{ padding: '12px 16px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#dc2626' }}>❌ {item.mistake}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>✅ {item.correction}</div>
              </div>
              <span className="level-badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                {item.topic}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewGrammarCard;
