import React from 'react';

export const TopPlatformsCard: React.FC = () => {
  const platforms = [
    { name: 'TikTok', width: '85%', color: '#2E6F40' },
    { name: 'Radio', width: '70%', color: '#B9D549' },
    { name: 'Podcast', width: '50%', color: '#A1E3A1' },
  ];

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '24px',
        padding: '24px',
        width: '300px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111111', marginBottom: '24px' }}>
        Top Platforms
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {platforms.map((platform) => (
          <div key={platform.name} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '70px', fontSize: '14px', color: '#4A4A4A', fontWeight: '500' }}>
              {platform.name}
            </span>
            <div style={{ flexGrow: 1, height: '16px', backgroundColor: '#FFFFFF', position: 'relative' }}>
              <div
                style={{
                  width: platform.width,
                  height: '100%',
                  backgroundColor: platform.color,
                  borderRadius: '4px',
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};