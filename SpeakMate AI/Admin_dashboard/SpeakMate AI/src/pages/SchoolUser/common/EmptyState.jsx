import React from 'react';

const EmptyState = ({
  icon = '🔍',
  title = 'No students found',
  description = 'Try changing your search or filters.',
  onReset,
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {onReset && (
        <button type="button" className="btn-reset-filters" onClick={onReset}>
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
