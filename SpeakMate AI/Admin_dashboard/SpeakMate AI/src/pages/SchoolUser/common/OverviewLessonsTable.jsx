import React from 'react';

const OverviewLessonsTable = ({ lessons = [] }) => {
  const defaultLessons = [
    { id: 'l1', name: 'Advanced Business English & Pitching', category: 'Business', difficulty: 'Advanced', progress: '100%', score: '96%', date: '2026-07-25' },
    { id: 'l2', name: 'Formal Debating & Argumentation Skills', category: 'Speaking', difficulty: 'Advanced', progress: '100%', score: '92%', date: '2026-07-23' },
    { id: 'l3', name: 'Academic Essay Writing & Rhetoric', category: 'Writing', difficulty: 'Intermediate', progress: '65%', score: '88%', date: '2026-07-26' },
    { id: 'l4', name: 'Negotiation Strategy & Phrasal Verbs', category: 'Vocabulary', difficulty: 'Advanced', progress: '100%', score: '94%', date: '2026-07-20' },
  ];

  const list = lessons.length > 0 ? lessons.map(l => ({
    ...l,
    category: l.category || 'General',
    progress: l.status === 'Completed' ? '100%' : '65%',
    score: l.score || '90%',
    difficulty: l.difficulty || 'Intermediate',
  })) : defaultLessons;

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            📚
          </div>
          <div>
            <h3 className="overview-card-title">Curriculum Lessons</h3>
            <div className="overview-card-subtitle">Detailed breakdown of curriculum lessons, category, difficulty, progress, and quiz scores</div>
          </div>
        </div>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          {list.length} Lessons Logged
        </span>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Progress</th>
              <th>Quiz Score</th>
              <th style={{ textAlign: 'right' }}>Completed Date</th>
            </tr>
          </thead>
          <tbody>
            {list.map((les) => (
              <tr key={les.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{les.name}</div>
                </td>
                <td>
                  <span className="level-badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                    {les.category}
                  </span>
                </td>
                <td>
                  <span
                    className="level-badge"
                    style={{
                      background: les.difficulty === 'Advanced' ? '#fae8ff' : '#e0f2fe',
                      color: les.difficulty === 'Advanced' ? '#a21caf' : '#0369a1',
                    }}
                  >
                    {les.difficulty}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
                    <div className="progress-bar-bg" style={{ margin: 0, flex: 1 }}>
                      <div className="progress-bar-fill" style={{ width: les.progress, background: '#2563eb' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{les.progress}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '14px' }}>{les.score}</span>
                </td>
                <td style={{ textAlign: 'right', color: '#64748b', fontSize: '13px' }}>{les.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverviewLessonsTable;
