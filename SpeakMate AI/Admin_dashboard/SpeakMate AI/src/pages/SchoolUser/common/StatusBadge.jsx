import React from 'react';
import { STATUS_COLORS } from '../constants/userConstants';

const StatusBadge = ({ status = 'Active' }) => {
  const colorScheme = STATUS_COLORS[status] || STATUS_COLORS.Inactive;

  const style = {
    backgroundColor: colorScheme.bg,
    color: colorScheme.text,
    borderColor: colorScheme.border,
  };

  return (
    <span className="status-badge" style={style}>
      <span className="status-badge-dot" />
      {status}
    </span>
  );
};

export default StatusBadge;
