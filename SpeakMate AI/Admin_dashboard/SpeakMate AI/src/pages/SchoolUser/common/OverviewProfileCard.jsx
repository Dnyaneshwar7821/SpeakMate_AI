import React from 'react';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import { PROFICIENCY_LEVEL_COLORS } from '../constants/userConstants';

const OverviewProfileCard = ({ data, type = 'student' }) => {
  if (!data) return null;

  const {
    avatar,
    firstName,
    lastName,
    email,
    englishLevel,
    xp = 0,
    level = 1,
    currentStreak = 0,
    status = 'Active',
    joinedDate = '2023-09-01',
    grade = '10th Standard',
    schoolName = 'Lincoln High School',
    occupation = 'Software Engineer',
    userType = 'Professional',
    subscription = 'Pro Plan',
  } = data;

  const levelBadgeStyle = (englishLevel && PROFICIENCY_LEVEL_COLORS[englishLevel]) || { bg: '#e0f2fe', text: '#0369a1' };

  return (
    <div className="profile-banner-card">
      <div className="profile-info-main">
        <Avatar src={avatar} name={`${firstName || ''} ${lastName || ''}`} size={84} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="profile-title-name">{firstName} {lastName}</h2>
            <StatusBadge status={status} />
          </div>
          <div className="profile-sub-meta">
            <span>📧 {email}</span>
            <span>•</span>
            {type === 'student' ? (
              <>
                <span>🎓 Standard: {grade}</span>
                <span>•</span>
                <span>🏫 {schoolName}</span>
              </>
            ) : (
              <>
                <span>💼 {occupation} ({userType})</span>
                <span>•</span>
                <span>💳 {subscription}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
            {type !== 'student' && englishLevel && (
              <span
                className="level-badge"
                style={{ backgroundColor: levelBadgeStyle.bg, color: levelBadgeStyle.text, fontSize: '13px', padding: '4px 12px' }}
              >
                Proficiency: {englishLevel}
              </span>
            )}
            <span className="xp-badge" style={{ fontSize: '13px' }}>
              ⭐ {xp.toLocaleString()} XP
            </span>
            <span className="streak-badge" style={{ fontSize: '13px' }}>
              🔥 {currentStreak} Days Streak
            </span>
            <span className="level-badge" style={{ background: '#f1f5f9', color: '#334155', fontSize: '13px', padding: '4px 12px' }}>
              Level {level}
            </span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right', zIndex: 1 }}>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Registration Date</div>
        <div style={{ fontWeight: 600, fontSize: '15px', color: '#ffffff', marginTop: '2px' }}>{joinedDate}</div>
      </div>
    </div>
  );
};

export default OverviewProfileCard;
