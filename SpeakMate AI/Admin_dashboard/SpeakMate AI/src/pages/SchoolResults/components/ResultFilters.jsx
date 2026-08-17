import React from 'react';
import { ACADEMIC_YEAR_OPTIONS } from '../data/resultsMockData';

const ResultFilters = ({
  academicYear,
  searchStandard,
  onAcademicYearChange,
  onSearchChange,
  onReset,
}) => {
  return (
    <div className="filter-bar-card">
      <div className="filter-bar-grid">
        {/* Academic Year Dropdown */}
        <div className="filter-item-wrapper">
          <label className="filter-label">Academic Year</label>
          <div className="filter-select-container">
            <svg className="filter-icon-left" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <select
              value={academicYear}
              onChange={(e) => onAcademicYearChange(e.target.value)}
              className="filter-select"
            >
              {ACADEMIC_YEAR_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <svg className="filter-arrow-right" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Search Standard */}
        <div className="filter-item-wrapper search-grow">
          <label className="filter-label">Search Standard</label>
          <div className="filter-input-container">
            <svg className="filter-icon-left" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchStandard}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search standard (e.g. Standard 5)..."
              className="filter-input"
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="filter-item-wrapper flex-end">
          <button
            type="button"
            onClick={onReset}
            className="btn-reset-filters"
            title="Reset all filters"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultFilters;
