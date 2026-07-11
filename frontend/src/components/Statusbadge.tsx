import React from 'react';

interface StatusBadgeProps {
  status: 'Approved' | 'In Review' | 'Draft';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    Approved: { bg: '#EAF7ED', text: '#2E6F40' },
    'In Review': { bg: '#FFFCEB', text: '#BFAF10' },
    Draft: { bg: '#F1F3F5', text: '#6C757D' },
  };

  const currentStyle = styles[status] || styles.Draft;

  return (
    <span
      style={{
        backgroundColor: currentStyle.bg,
        color: currentStyle.text,
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  );
};