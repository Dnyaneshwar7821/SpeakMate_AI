import React, { useState } from 'react';

const StudentStats = ({ stats = {} }) => {
  const {
    totalStudents = 0,
    activeStudents = 0,
    avgXp = 0,
    avgStreak = 0,
    newStudents = 0,
  } = stats;

  const inactiveStudents = stats.inactiveStudents ?? Math.max(0, totalStudents - activeStudents);

  // Initially, no statistics card is visible
  const [activeTab, setActiveTab] = useState(null);

  const tabs = [
    { id: 'totalStudents', label: 'Total Students', icon: '👨‍🎓' },
    { id: 'activeStudents', label: 'Active Students', icon: '✅' },
    { id: 'inactiveStudents', label: 'Inactive Students', icon: '⏸️' },
    { id: 'avgXp', label: 'Average XP', icon: '⭐' },
    { id: 'avgStreak', label: 'Average Streak', icon: '🔥' },
    { id: 'newStudents', label: 'New Students', icon: '✨' },
  ];

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '24px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '480px',
    width: '100%',
  };

  const iconCircleStyle = (bgColor, textColor, borderColor) => ({
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: bgColor,
    color: textColor,
    border: `1px solid ${borderColor}`,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0,
  });

  const titleStyle = {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  };

  const valueStyle = {
    fontSize: '42px',
    fontWeight: 800,
    color: '#111827',
    margin: '6px 0 2px 0',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
  };

  const descStyle = {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '14px',
    lineHeight: 1.3,
  };

  const trendBadgeStyle = (bg = '#dcfce7', color = '#15803d', border = '#bbf7d0') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: '9999px',
    backgroundColor: bg,
    color: color,
    border: `1px solid ${border}`,
    width: 'fit-content',
  });

  const renderActiveCard = () => {
    switch (activeTab) {
      case 'totalStudents':
        return (
          <div className="premium-stat-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={titleStyle}>Total Students</span>
              <div className="stat-icon-wrapper" style={iconCircleStyle('#eff6ff', '#2563eb', '#bfdbfe')}>
                👨‍🎓
              </div>
            </div>
            <div>
              <div style={valueStyle}>{totalStudents}</div>
              <div style={descStyle}>Enrolled school accounts</div>
              <div style={trendBadgeStyle('#dcfce7', '#15803d', '#bbf7d0')}>
                <span>↑ +8% This Month</span>
              </div>
            </div>
          </div>
        );

      case 'activeStudents':
        return (
          <div className="premium-stat-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={titleStyle}>Active Students</span>
              <div className="stat-icon-wrapper" style={iconCircleStyle('#f0fdf4', '#16a34a', '#bbf7d0')}>
                ✅
              </div>
            </div>
            <div>
              <div style={valueStyle}>{activeStudents}</div>
              <div style={descStyle}>Active in last 7 days</div>
              <div style={trendBadgeStyle('#dcfce7', '#15803d', '#bbf7d0')}>
                <span>↑ 92% Active Rate</span>
              </div>
            </div>
          </div>
        );

      case 'inactiveStudents':
        return (
          <div className="premium-stat-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={titleStyle}>Inactive Students</span>
              <div className="stat-icon-wrapper" style={iconCircleStyle('#f1f5f9', '#64748b', '#cbd5e1')}>
                ⏸️
              </div>
            </div>
            <div>
              <div style={valueStyle}>{inactiveStudents}</div>
              <div style={descStyle}>Inactive school accounts</div>
              <div style={trendBadgeStyle('#f1f5f9', '#475569', '#cbd5e1')}>
                <span>↓ Needs Re-engagement</span>
              </div>
            </div>
          </div>
        );

      case 'avgXp':
        return (
          <div className="premium-stat-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={titleStyle}>Average XP</span>
              <div className="stat-icon-wrapper" style={iconCircleStyle('#fffbeb', '#d97706', '#fde68a')}>
                ⭐
              </div>
            </div>
            <div>
              <div style={valueStyle}>⭐ {avgXp.toLocaleString()}</div>
              <div style={descStyle}>Avg points earned</div>
              <div style={trendBadgeStyle('#dcfce7', '#15803d', '#bbf7d0')}>
                <span>↑ +14% Performance</span>
              </div>
            </div>
          </div>
        );

      case 'avgStreak':
        return (
          <div className="premium-stat-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={titleStyle}>Average Streak</span>
              <div className="stat-icon-wrapper" style={iconCircleStyle('#fff7ed', '#ea580c', '#fed7aa')}>
                🔥
              </div>
            </div>
            <div>
              <div style={valueStyle}>🔥 {avgStreak} Days</div>
              <div style={descStyle}>Daily practice streak</div>
              <div style={trendBadgeStyle('#dcfce7', '#15803d', '#bbf7d0')}>
                <span>↑ +2.4 Days Avg</span>
              </div>
            </div>
          </div>
        );

      case 'newStudents':
        return (
          <div className="premium-stat-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={titleStyle}>New Students</span>
              <div className="stat-icon-wrapper" style={iconCircleStyle('#faf5ff', '#9333ea', '#e9d5ff')}>
                ✨
              </div>
            </div>
            <div>
              <div style={valueStyle}>{newStudents}</div>
              <div style={descStyle}>Newly registered</div>
              <div style={trendBadgeStyle('#dcfce7', '#15803d', '#bbf7d0')}>
                <span>↑ Registered This Term</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Horizontal list of clickable labels/buttons */}
      <div
        className="stats-tabs-row"
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: activeTab ? '16px' : '0',
          scrollbarWidth: 'thin',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`stat-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab((prev) => (prev === tab.id ? null : tab.id))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                borderRadius: '12px',
                border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Display ONLY selected card below labels when activeTab is set */}
      {activeTab && (
        <div
          key={activeTab}
          style={{
            animation: 'statCardFadeIn 250ms ease-in-out forwards',
          }}
        >
          {renderActiveCard()}
        </div>
      )}
    </div>
  );
};

export default StudentStats;
