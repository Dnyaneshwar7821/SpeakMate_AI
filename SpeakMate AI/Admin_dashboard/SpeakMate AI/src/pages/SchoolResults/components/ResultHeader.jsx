import React from 'react';

const ResultHeader = () => {
  return (
    <div className="results-header-container">
      <div className="results-header-left">
        <div className="results-header-icon-badge">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="results-header-title">English Result Analytics</h1>
          <p className="results-header-subtitle">
            Comprehensive performance insights, metrics, and trends across Standard 1 to Standard 10.
          </p>
        </div>
      </div>

      <div className="results-header-right">
        <div className="live-status-pill">
          <span className="pulse-dot" />
          <span>Live Data</span>
        </div>
        <button type="button" className="btn-export-report">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export Analytics</span>
        </button>
      </div>
    </div>
  );
};

export default ResultHeader;
