import React from 'react';
import { resultsMockData } from '../data/resultsMockData';
import { calculateSubjectAverages } from '../utils/resultHelpers';

const SubjectPerformance = ({ data = resultsMockData }) => {
  const subjectAverages = calculateSubjectAverages(data);

  // Find top performing subject
  const topSubject = subjectAverages.reduce(
    (max, item) => (item.avg > max.avg ? item : max),
    subjectAverages[0] || { subject: 'N/A', avg: 0 }
  );

  return (
    <div className="subject-perf-card">
      <div className="subject-perf-header">
        <div>
          <div className="subject-perf-title-row">
            <div className="subject-perf-badge">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="subject-perf-title">Subject Performance</h3>
          </div>
          <p className="subject-perf-subtitle">Average marks of all students across key subjects (Max: 100)</p>
        </div>

        <div className="subject-perf-top-badge">
          <span>🏆 Top Subject: </span>
          <strong>{topSubject.subject} ({topSubject.avg}/100)</strong>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="subject-chart-wrapper">
        {/* Y-Axis Grid Lines */}
        <div className="chart-grid-lines">
          <div className="grid-line"><span className="grid-label">100</span></div>
          <div className="grid-line"><span className="grid-label">75</span></div>
          <div className="grid-line"><span className="grid-label">50</span></div>
          <div className="grid-line"><span className="grid-label">25</span></div>
          <div className="grid-line"><span className="grid-label">0</span></div>
        </div>

        {/* Bar Columns Container */}
        <div className="chart-bars-container">
          {subjectAverages.map((item) => {
            const heightPct = Math.min(100, Math.max(0, item.avg));
            return (
              <div key={item.key || item.subject} className="chart-bar-column">
                <div className="bar-value-tooltip">{item.avg}</div>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${heightPct}%`,
                      background: item.gradient,
                    }}
                  />
                </div>

                <div className="bar-label-group">
                  <span className="bar-icon">{item.icon}</span>
                  <span className="bar-label">{item.subject}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubjectPerformance;
