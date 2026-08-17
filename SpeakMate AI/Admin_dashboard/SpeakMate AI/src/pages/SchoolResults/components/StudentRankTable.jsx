import React from 'react';
import { resultsMockData } from '../data/resultsMockData';
import { getTopStudents } from '../utils/resultHelpers';

const StudentRankTable = ({ data = resultsMockData }) => {
  const topStudents = getTopStudents(data, 5);

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return <span className="rank-badge rank-1">🥇 #1</span>;
      case 1:
        return <span className="rank-badge rank-2">🥈 #2</span>;
      case 2:
        return <span className="rank-badge rank-3">🥉 #3</span>;
      default:
        return <span className="rank-badge rank-other">#{index + 1}</span>;
    }
  };

  return (
    <div className="rank-table-card">
      <div className="rank-table-header">
        <div className="rank-table-title-group">
          <div className="rank-table-icon-badge">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h3 className="rank-table-title">Top 5 Performers</h3>
            <p className="rank-table-subtitle">Highest percentage rank leaderboards</p>
          </div>
        </div>

        <span className="rank-count-badge">{topStudents.length} Students</span>
      </div>

      <div className="rank-table-responsive">
        <table className="rank-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Photo</th>
              <th>Student Name</th>
              <th>School</th>
              <th>Standard</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {topStudents.map((student, index) => {
              const pctNum = typeof student.percentage === 'string' ? parseFloat(student.percentage) : student.percentage;
              return (
                <tr key={student.id || index}>
                  <td>{getRankBadge(index)}</td>
                  <td>
                    <img
                      src={student.photo}
                      alt={student.studentName}
                      className="rank-student-avatar"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
                      }}
                    />
                  </td>
                  <td>
                    <div className="rank-student-info">
                      <span className="rank-student-name">{student.studentName}</span>
                      <span className="rank-student-roll">Roll No: {student.rollNo}</span>
                    </div>
                  </td>
                  <td>
                    <span className="rank-school-name">{student.school}</span>
                  </td>
                  <td>
                    <span className="rank-standard-badge">{student.standard}</span>
                  </td>
                  <td>
                    <div className="rank-pct-cell">
                      <span className="rank-pct-value">{student.percentage}</span>
                      <div className="rank-pct-bar-bg">
                        <div
                          className="rank-pct-bar-fill"
                          style={{ width: `${Math.min(100, Math.max(0, pctNum))}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentRankTable;
