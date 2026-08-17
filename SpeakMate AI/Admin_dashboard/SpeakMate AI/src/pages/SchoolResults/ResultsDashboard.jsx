import React, { useState, useMemo } from 'react';
import ResultHeader from './components/ResultHeader';
import ResultStats from './components/ResultStats';
import ResultFilters from './components/ResultFilters';
import ResultGraph from './components/ResultGraph';
import ResultTable from './components/ResultTable';
import { STANDARD_PERFORMANCE_DATA } from './data/resultsMockData';
import './styles/result.css';

const ResultsDashboard = () => {
  const [academicYear, setAcademicYear] = useState('Academic Year 2025-2026');
  const [searchStandard, setSearchStandard] = useState('');

  // Filter standards by search standard input
  const filteredData = useMemo(() => {
    if (!searchStandard.trim()) {
      return STANDARD_PERFORMANCE_DATA;
    }
    const query = searchStandard.toLowerCase().trim();
    return STANDARD_PERFORMANCE_DATA.filter(
      (item) =>
        item.standard.toLowerCase().includes(query) ||
        item.shortName.toLowerCase().includes(query)
    );
  }, [searchStandard]);

  const handleReset = () => {
    setAcademicYear('Academic Year 2025-2026');
    setSearchStandard('');
  };

  return (
    <div className="results-page-wrapper">
      <div className="results-content-container">
        {/* 1. Page Header */}
        <ResultHeader />

        {/* 2. Four Colorful KPI Cards */}
        <ResultStats />

        {/* 3. Filter Bar (Without School Selector) */}
        <ResultFilters
          academicYear={academicYear}
          searchStandard={searchStandard}
          onAcademicYearChange={setAcademicYear}
          onSearchChange={setSearchStandard}
          onReset={handleReset}
        />

        {/* 4. Large Responsive Area Chart */}
        <ResultGraph data={filteredData} />

        {/* 5. Responsive Performance Table */}
        <ResultTable data={filteredData} />
      </div>
    </div>
  );
};

export default ResultsDashboard;
