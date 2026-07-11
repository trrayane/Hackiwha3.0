import React from 'react';

export const UsageCard: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '24px',
        padding: '24px',
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ alignSelf: 'flex-start', fontSize: '16px', fontWeight: 'bold', color: '#111111', marginBottom: '20px' }}>
        Your Usage
      </div>

      {/* Circular Progress Representation */}
      <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width="140" height="140" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="3.5"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#2E6F40"
            strokeDasharray="60, 100"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111111' }}>3</div>
          <div style={{ fontSize: '12px', color: '#777777', marginTop: '-2px' }}>Of 5 jingles</div>
        </div>
      </div>

      <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #E5E5E5', margin: '24px 0 16px 0' }} />

      <button
        style={{
          width: '100%',
          backgroundColor: '#2E6F40',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '10px',
          padding: '14px 0',
          fontSize: '15px',
          fontWeight: '500',
          cursor: 'pointer',
        }}
      >
        Increase Limit
      </button>
    </div>
  );
};