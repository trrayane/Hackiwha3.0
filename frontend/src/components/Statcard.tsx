import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  type: 'created' | 'review' | 'approved';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, type }) => {
  const config = {
    created: {
      bg: '#EBF5EE',
      color: '#2E6F40',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12c3-1.5 3-5.5 6-5.5s3 9.5 6 9.5 3-4 6-4" />
        </svg>
      )
    },
    review: {
      bg: '#FAF8EB',
      color: '#BFAF10',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      )
    },
    approved: {
      bg: '#EAF7ED',
      color: '#2E6F40',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )
    }
  };

  const style = config[type];

  return (
    <div
      style={{
        backgroundColor: style.bg,
        borderRadius: '24px',
        padding: '20px 24px',
        width: '175px',
        height: '115px',
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#4A5043', fontWeight: '500' }}>
          {title}
        </span>
        <div
          style={{
            width: '26px',
            height: '26px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: style.color,
          }}
        >
          {style.icon}
        </div>
      </div>
      
      <div style={{ fontSize: '36px', fontWeight: '700', color: '#111111', lineHeight: '1', fontFamily: 'sans-serif' }}>
        {value}
      </div>
      
      {/* Background Graphic Pillars */}
      <div style={{ position: 'absolute', bottom: '0', right: '20px', display: 'flex', gap: '4px', alignItems: 'flex-end', opacity: 0.06 }}>
        <div style={{ width: '10px', height: '20px', backgroundColor: '#000000', borderRadius: '3px 3px 0 0' }}></div>
        <div style={{ width: '10px', height: '40px', backgroundColor: '#000000', borderRadius: '3px 3px 0 0' }}></div>
        <div style={{ width: '10px', height: '30px', backgroundColor: '#000000', borderRadius: '3px 3px 0 0' }}></div>
      </div>
    </div>
  );
};