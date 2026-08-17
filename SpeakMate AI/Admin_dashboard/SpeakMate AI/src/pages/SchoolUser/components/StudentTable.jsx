import React from 'react';
import Avatar from '../common/Avatar';
import StatusBadge from '../common/StatusBadge';

const StudentTable = ({ students = [], onViewStudent }) => {
  return (
    <div className="table-responsive">
      <table className="user-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Student Name</th>
            <th>Email</th>
            <th>Standard</th>
            <th>XP</th>
            <th>Streak</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            return (
              <tr key={student.id}>
                <td>
                  <Avatar src={student.avatar} name={`${student.firstName || ''} ${student.lastName || ''}`} size={38} />
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {student.firstName} {student.lastName}
                  </div>
                </td>
                <td>{student.email}</td>
                <td>
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                    {student.grade || student.standard || '10th Standard'}
                  </span>
                </td>
                <td>
                  <span className="xp-badge">
                    ⭐ {(student.xp || 0).toLocaleString()} XP
                  </span>
                </td>
                <td>
                  <span className="streak-badge">
                    🔥 {student.currentStreak || student.streak || 0} Days
                  </span>
                </td>
                <td>
                  <StatusBadge status={student.status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn-view"
                    onClick={() => onViewStudent(student.id)}
                    title="View Student Profile"
                  >
                    👁 View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
