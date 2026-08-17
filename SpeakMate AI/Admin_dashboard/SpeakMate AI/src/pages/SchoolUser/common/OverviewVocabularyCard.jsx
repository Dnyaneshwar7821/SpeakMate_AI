import React from 'react';

const OverviewVocabularyCard = ({ vocabulary = {} }) => {
  const {
    learnedWordsCount = 1450,
    masteryRate = '88%',
    recentWords = ['Subviable', 'Pragmatic', 'Eloquent', 'Resilient'],
  } = vocabulary;

  const masteredWordsCount = Math.round(learnedWordsCount * 0.88);
  const retentionRate = masteryRate || '88%';

  const wordDetails = [
    { word: recentWords[0] || 'Pragmatic', meaning: 'Dealing with things sensibly and realistically', level: 'Advanced' },
    { word: recentWords[1] || 'Eloquent', meaning: 'Fluent or persuasive in speaking or writing', level: 'Intermediate' },
    { word: recentWords[2] || 'Resilient', meaning: 'Able to withstand or recover quickly from difficult conditions', level: 'Intermediate' },
    { word: recentWords[3] || 'Ubiquitous', meaning: 'Present, appearing, or found everywhere', level: 'Advanced' },
  ];

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#fcf5ff', color: '#a855f7' }}>
            📖
          </div>
          <div>
            <h3 className="overview-card-title">Vocabulary Bank</h3>
            <div className="overview-card-subtitle">Active words learned, mastered vocabulary, retention rates, and recent acquisitions</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600 }}>Words Learned</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>{learnedWordsCount} Words</div>
        </div>

        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Mastered Words</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#14532d', marginTop: '2px' }}>{masteredWordsCount} Words</div>
        </div>

        <div style={{ padding: '16px', background: '#fcf5ff', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
          <div style={{ fontSize: '12px', color: '#6b21a8', fontWeight: 600 }}>Retention Rate</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#581c87', marginTop: '2px' }}>{retentionRate}</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Recent Vocabulary Acquisitions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {wordDetails.map((item) => (
            <div key={item.word} style={{ padding: '12px 16px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#2563eb' }}>✨ {item.word}</span>
                <span className="level-badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', padding: '2px 8px' }}>
                  {item.level}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{item.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewVocabularyCard;
