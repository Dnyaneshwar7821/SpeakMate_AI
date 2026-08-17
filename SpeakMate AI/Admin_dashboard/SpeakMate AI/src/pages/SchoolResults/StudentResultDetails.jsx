import React from 'react';
import { resultsMockData } from './data/resultsMockData';

const StudentResultDetails = ({ student = resultsMockData[0], onBack }) => {
  if (!student) {
    return (
      <div className="student-details-container">
        <button type="button" onClick={onBack} className="btn-back">
          ← Back to Results List
        </button>
        <p>No student data available.</p>
      </div>
    );
  }

  const subjects = [
    { label: 'English', score: student.english, icon: '📖', color: '#6C4CF1' },
    { label: 'Maths', score: student.maths, icon: '📐', color: '#2563EB' },
    { label: 'Science', score: student.science, icon: '🧪', color: '#10B981' },
    { label: 'History', score: student.history, icon: '🏛️', color: '#F59E0B' },
    { label: 'Geography', score: student.geography, icon: '🌍', color: '#EC4899' },
  ];

  // Subject Analysis Calculations
  const highestSubject = [...subjects].sort((a, b) => b.score - a.score)[0];
  const lowestSubject = [...subjects].sort((a, b) => a.score - b.score)[0];
  const totalSubjectMarks = subjects.reduce((sum, s) => sum + s.score, 0);
  const avgSubjectMark = (totalSubjectMarks / subjects.length).toFixed(1);

  return (
    <div className="student-details-container">
      {/* 12. Back Button */}
      <div className="details-nav-bar">
        <button type="button" onClick={onBack} className="btn-back">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Results Dashboard</span>
        </button>
      </div>

      {/* Profile & Header Banner: 1. Profile, 2. School Info, 3. Parent Info, 4. Attendance, 6. Total, 7. Percentage, 8. Grade */}
      <div className="student-details-banner">
        <div className="student-banner-left">
          <img
            src={student.photo}
            alt={student.studentName}
            className="student-banner-avatar-xl"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
            }}
          />
          <div className="student-profile-meta">
            <div className="student-profile-title">
              <h2 className="student-name-lg">{student.studentName}</h2>
              <span className={`result-status-badge ${student.status.toLowerCase()}`}>
                <span className="status-dot" />
                {student.status}
              </span>
            </div>

            <div className="profile-info-grid">
              <div className="info-chip">
                <span className="info-chip-label">Roll Number</span>
                <span className="info-chip-val">{student.rollNo}</span>
              </div>
              <div className="info-chip">
                <span className="info-chip-label">School</span>
                <span className="info-chip-val">{student.school}</span>
              </div>
              <div className="info-chip">
                <span className="info-chip-label">Standard</span>
                <span className="info-chip-val">{student.standard}</span>
              </div>
              <div className="info-chip">
                <span className="info-chip-label">Parent / Guardian</span>
                <span className="info-chip-val">{student.parentName}</span>
              </div>
              <div className="info-chip">
                <span className="info-chip-label">Attendance</span>
                <span className="info-chip-val attendance">{student.attendance}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="student-banner-right">
          <div className="summary-score-card">
            <div className="summary-pct-huge">{student.percentage}</div>
            <div className="summary-pct-label">Overall Percentage</div>
            <div className="summary-marks-total">Total: <strong>{student.total} / 500</strong></div>
            <div className="summary-grade-tag">Grade: {student.grade}</div>
          </div>
        </div>
      </div>

      {/* 5. Subject Marks Grid */}
      <div className="student-details-card">
        <div className="card-section-header">
          <h3 className="card-section-title">Subject Marks Breakdown</h3>
          <span className="card-section-tag">5 Subjects</span>
        </div>

        <div className="subject-marks-grid">
          {subjects.map((subj) => (
            <div key={subj.label} className="subject-score-card">
              <div className="subject-score-header">
                <span className="subject-mark-icon">{subj.icon}</span>
                <span className="subject-mark-title">{subj.label}</span>
              </div>

              <div className="subject-score-value">
                {subj.score} <span className="max-mark">/ 100</span>
              </div>

              <div className="subject-bar-track">
                <div
                  className="subject-bar-fill"
                  style={{ width: `${subj.score}%`, backgroundColor: subj.color }}
                />
              </div>

              <div className="subject-score-footer">
                <span>Pass mark: 50</span>
                <span className={subj.score >= 50 ? 'text-pass' : 'text-fail'}>
                  {subj.score >= 50 ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Performance Graph & 11. Subject Analysis Grid */}
      <div className="details-two-col-grid">
        {/* 10. Performance Graph (Visual Individual Student Chart) */}
        <div className="student-details-card">
          <div className="card-section-header">
            <h3 className="card-section-title">Individual Performance Graph</h3>
            <span className="card-section-tag">Score Comparison</span>
          </div>

          <div className="student-graph-wrapper">
            <div className="student-graph-bars">
              {subjects.map((subj) => (
                <div key={subj.label} className="student-graph-col">
                  <div className="graph-col-val">{subj.score}</div>
                  <div className="graph-col-track">
                    <div
                      className="graph-col-fill"
                      style={{ height: `${subj.score}%`, backgroundColor: subj.color }}
                    />
                  </div>
                  <span className="graph-col-label">{subj.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 11. Subject Analysis Cards */}
        <div className="student-details-card">
          <div className="card-section-header">
            <h3 className="card-section-title">Subject Analysis & Insights</h3>
          </div>

          <div className="analysis-cards-list">
            <div className="analysis-card highlight-green">
              <div className="analysis-icon">🌟</div>
              <div>
                <h4 className="analysis-title">Strongest Subject</h4>
                <p className="analysis-desc">
                  Highest score achieved in <strong>{highestSubject.label}</strong> with {highestSubject.score} marks.
                </p>
              </div>
            </div>

            <div className="analysis-card highlight-amber">
              <div className="analysis-icon">🎯</div>
              <div>
                <h4 className="analysis-title">Needs Attention</h4>
                <p className="analysis-desc">
                  Lowest score recorded in <strong>{lowestSubject.label}</strong> ({lowestSubject.score} marks). Recommend extra practice.
                </p>
              </div>
            </div>

            <div className="analysis-card highlight-blue">
              <div className="analysis-icon">📊</div>
              <div>
                <h4 className="analysis-title">Average Subject Score</h4>
                <p className="analysis-desc">
                  Maintained an average of <strong>{avgSubjectMark} marks</strong> per subject this term.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Remarks Section */}
      <div className="student-details-card">
        <div className="card-section-header">
          <h3 className="card-section-title">Academic Remarks & Assessment Summary</h3>
        </div>
        <div className="remarks-content-box">
          <div className="remarks-quote-icon">💬</div>
          <div>
            <h4 className="remarks-heading">Teacher & Assessor Comments</h4>
            <p className="remarks-text">{student.remarks}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResultDetails;
