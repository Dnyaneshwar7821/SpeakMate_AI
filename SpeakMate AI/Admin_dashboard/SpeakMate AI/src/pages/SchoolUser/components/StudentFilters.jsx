import React from 'react';
import {
  SCHOOL_USER_STATUSES,
  SCHOOL_USER_STANDARDS,
} from '../constants/schoolUserConstants';

const StudentFilters = ({
  status = 'All',
  standard = 'All',
  onStatusChange,
  onStandardChange,
  onReset,
}) => {
  const isFiltered = status !== 'All' || standard !== 'All';

  return (
    <div className="filter-group">
      {/* Standard Filter */}
      <select
        className="filter-select"
        value={standard}
        onChange={(e) => onStandardChange && onStandardChange(e.target.value)}
      >
        <option value="All">Standard: All</option>
        {SCHOOL_USER_STANDARDS.filter((s) => s !== 'All').map((std) => (
          <option key={std} value={std}>
            Standard: {std}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        className="filter-select"
        value={status}
        onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
      >
        <option value="All">Status: All</option>
        {SCHOOL_USER_STATUSES.filter((st) => st !== 'All').map((st) => (
          <option key={st} value={st}>
            Status: {st}
          </option>
        ))}
      </select>

      {/* Reset Filters button */}
      {isFiltered && (
        <button type="button" className="btn-reset-filters" onClick={onReset}>
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default StudentFilters;
