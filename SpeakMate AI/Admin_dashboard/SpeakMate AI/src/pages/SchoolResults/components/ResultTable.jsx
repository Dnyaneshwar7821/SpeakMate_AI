import React from 'react';
import { STANDARD_PERFORMANCE_DATA } from '../data/resultsMockData';

const ResultTable = ({ data = STANDARD_PERFORMANCE_DATA }) => {
  return (
    <div className="table-card-wrapper">
      <div className="table-card-header">
        <div>
          <h3 className="table-card-title">English Performance Breakdown</h3>
          <p className="table-card-subtitle">
            Detailed performance metrics and trends for Standard 1 through Standard 10
          </p>
        </div>
        <span className="count-pill">{data.length} Standards</span>
      </div>

      <div className="table-responsive-container">
        <table className="modern-result-table">
          <thead>
            <tr>
              <th>Standard</th>
              <th>Students</th>
              <th>Average Score</th>
              <th>Pass %</th>
              <th>Top Score</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.standard} className="table-row-hover">
                <td>
                  <div className="std-cell">
                    <div className="std-icon-box">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="std-name">{row.standard}</span>
                  </div>
                </td>
                <td>
                  <span className="students-text">{row.students}</span>
                </td>
                <td>
                  <div className="score-cell-wrapper">
                    <span className="score-number">{row.avgScore}%</span>
                    <div className="score-progress-track">
                      <div
                        className="score-progress-fill"
                        style={{ width: `${row.avgScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <span className="pass-badge">
                    {row.passRate}%
                  </span>
                </td>
                <td>
                  <span className="top-score-badge">
                    {row.topScore}%
                  </span>
                </td>
                <td>
                  <div className="trend-pill positive">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="12" height="12">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{row.trend}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;
