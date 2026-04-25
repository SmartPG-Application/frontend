import React from 'react';

const statusStyles = {
  active: 'bg-primary-container text-on-primary-container',
  paid: 'bg-primary-container text-on-primary-container',
  resolved: 'bg-primary-container text-on-primary-container',
  available: 'bg-primary-container text-on-primary-container',
  pending: 'bg-[#fff8e1] text-[#f57f17]',
  'in-progress': 'bg-[#fff8e1] text-[#f57f17]',
  maintenance: 'bg-[#fff8e1] text-[#f57f17]',
  inactive: 'bg-error-container text-on-error-container',
  overdue: 'bg-error-container text-on-error-container',
  open: 'bg-error-container text-on-error-container',
  occupied: 'bg-error-container text-on-error-container',
  rejected: 'bg-error-container text-on-error-container',
  closed: 'bg-surface-variant text-on-surface-variant',
};

const Badge = ({ status, label }) => {
  const displayText = label || status;
  const key = status?.toLowerCase()?.replace(/\s+/g, '-') || 'closed';
  const style = statusStyles[key] || 'bg-surface-variant text-on-surface-variant';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm capitalize ${style}`}>
      {displayText}
    </span>
  );
};

export default Badge;
