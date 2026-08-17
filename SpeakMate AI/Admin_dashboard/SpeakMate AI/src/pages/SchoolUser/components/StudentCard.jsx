import React from 'react';
import Avatar from '../common/Avatar';
import StatusBadge from '../common/StatusBadge';

const StudentCard = ({ students = [], onViewStudent }) => {
  return (
    <div className="mobile-card-grid">
      {students.map((student) => {
        return (
          <div className="mobile-user-card" key={student.id}>
            <div className="mobile-card-header">
              <div className="user-cell">
                <Avatar src={student.avatar} name={`${student.firstName || ''} ${student.lastName || ''}`} size={44} />
                <div>
                  <div className="user-cell-name">{student.firstName} {student.lastName}</div>
                  <div className="user-cell-email">{student.email}</div>
                </div>
              </div>
              <StatusBadge status={student.status} />
            </div>

            <div className="mobile-card-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Standard</span>
                <strong style={{ color: '#0f172a' }}>{student.grade || student.standard || '10th Standard'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>XP</span>
                <span className="xp-badge">⭐ {(student.xp || 0).toLocaleString()} XP</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Streak</span>
                <span className="streak-badge">🔥 {student.currentStreak || student.streak || 0} Days</span>
              </div>
            </div>

            <div className="mobile-card-footer">
              <span style={{ fontSize: '12px', color: '#64748b' }}>ID: {student.id}</span>
              <button
                type="button"
                className="btn-view"
                onClick={() => onViewStudent(student.id)}
              >
                👁 View
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentCard;
