import React from 'react';

const OverviewAIConversationsCard = ({ aiConversations = [] }) => {
  const defaultConversations = [
    { id: 'c1', scenario: 'Job Interview Simulation', score: 95, duration: '14 mins', date: '2026-07-26' },
    { id: 'c2', scenario: 'Academic Debate on AI Ethics', score: 91, duration: '18 mins', date: '2026-07-24' },
    { id: 'c3', scenario: 'Executive Presentation Q&A', score: 94, duration: '20 mins', date: '2026-07-20' },
  ];

  const list = aiConversations.length > 0 ? aiConversations : defaultConversations;

  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <div className="overview-card-header-left">
          <div className="overview-card-icon" style={{ background: '#fcf5ff', color: '#a855f7' }}>
            🤖
          </div>
          <div>
            <h3 className="overview-card-title">AI Conversation History</h3>
            <div className="overview-card-subtitle">Detailed conversation history with topic, duration, score rating, and session date</div>
          </div>
        </div>
        <span className="level-badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
          {list.length} Sessions Logged
        </span>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Topic / Scenario</th>
              <th>Duration</th>
              <th>Score</th>
              <th style={{ textAlign: 'right' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {list.map((chat) => (
              <tr key={chat.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>💬 {chat.scenario}</div>
                </td>
                <td style={{ color: '#64748b', fontSize: '13px' }}>⏱️ {chat.duration}</td>
                <td>
                  <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '14px' }}>
                    {chat.score} / 100
                  </span>
                </td>
                <td style={{ textAlign: 'right', color: '#64748b', fontSize: '13px' }}>{chat.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverviewAIConversationsCard;
