import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import JingleDetails from './JingleDetails'; // Make sure the path matches your project layout
import '../App.css';
import { 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  Play, 
  Pause, 
  Download, 
  SquarePen, 
  ChevronDown 
} from 'lucide-react';

export default function JingleLibrary() {
  const colors = {
    color: '#EDF7ED',
    white: '#FFFFFF',
    border: '#D9D9D9',
    backgroundLightMode: '#FCFBF6',
    backgroundDarkMode: '#282900',
    primaryAccent: '#337738',
    secondaryAccent: '#B4D44D',
    success: '#A4E3A4',
    headings: '#282900',
    secondaryText: '#5C6B4D',
    cardBackgroundsLavender: '#EDF9ED',
    cardBackgroundsPeach: '#F5F9E3',
    cardBackgroundsMint: '#E6F5E2',
    primaryAccentlight: 'color-mix(in srgb, #337738 14%, transparent)',
    dangerRed: '#D9383A',
    nextGreenButton: '#2E6F40'
  };

  const [activeTab, setActiveTab] = useState('library');
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [playingRowId, setPlayingRowId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track clicked jingle for full detail view rendering
  const [selectedJingleId, setSelectedJingleId] = useState<number | null>(null);

  const initialJingles = [
    { id: 1, name: 'Jingle name', platform: 'TikTok', feedback: '4.8', status: 'Approved', duration: '0:15', date: 'Jul 8, 2026' },
    { id: 2, name: 'Jingle name', platform: 'TikTok', feedback: '4.8', status: 'In Review', duration: '0:15', date: 'Jul 8, 2026' },
    { id: 3, name: 'Jingle name', platform: 'TikTok', feedback: '4.8', status: 'Draft', duration: '0:15', date: 'Jul 8, 2026' },
    { id: 4, name: 'Jingle name', platform: 'TikTok', feedback: '4.8', status: 'Draft', duration: '0:15', date: 'Jul 8, 2026' },
    { id: 5, name: 'Jingle name', platform: 'TikTok', feedback: '4.8', status: 'Draft', duration: '0:15', date: 'Jul 8, 2026' },
  ];

  const waveformBars = [
    10, 16, 12, 20, 24, 14, 18, 22, 12, 26, 20, 16, 24, 10, 18, 22, 14, 20, 26, 12,
    16, 10, 22, 24, 14, 18, 20, 12, 26, 16, 24, 10, 18, 22, 14, 20, 26, 12, 16, 10,
    12, 20, 24, 14, 18, 22, 12, 26, 20, 16, 24, 10, 18, 22, 14, 20, 26, 12, 16, 10
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Approved': return { backgroundColor: '#E1F3E4', color: '#2E6F40' };
      case 'In Review': return { backgroundColor: '#FAFAEB', color: '#B2BA32' };
      default: return { backgroundColor: '#F1F1EF', color: '#7E7E7A' };
    }
  };

  // Condition Check: If a row was selected, break out and swap layout structures seamlessly
  if (selectedJingleId !== null) {
    return <JingleDetails onBack={() => setSelectedJingleId(null)} />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: colors.white, 
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      color: '#111111' 
    }}>
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />

      <main style={{ 
        flexGrow: 1, 
        padding: '24px 24px 0 24px', 
        boxSizing: 'border-box', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        height: '100vh'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.backgroundLightMode, borderRadius: '40px', padding: '12px 28px', border: '1px solid ' + colors.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'transparent', width: '40%' }}>
            <Search size={20} color="#7E7E7A" strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search for jungles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '16px', fontWeight: '500', color: colors.headings }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '95px', height: '51px', display: 'flex', backgroundColor: colors.primaryAccentlight, borderRadius: '40px', padding: '2px 4px', alignItems: 'center', gap: '4px', border: '1px solid ' + colors.border }}>
              <button style={{ border: 'none', backgroundColor: 'transparent', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Moon size={23} color={colors.primaryAccent} strokeWidth={2.2} />
              </button>
              <button style={{ width: '43px', height: '43px', border: 'none', backgroundColor: colors.white, borderRadius: '50%', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' }}>
                <Sun size={23} color={colors.headings} strokeWidth={2.2} />
              </button>
            </div>
            <div style={{ width: '51px', height: '51px', backgroundColor: colors.primaryAccentlight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EAE9E4', cursor: 'pointer' }}>
              <Bell size={23} color={colors.headings} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        <div style={{ 
          flexGrow: 1, 
          backgroundColor: colors.backgroundLightMode, 
          border: '1px solid ' + colors.border, 
          borderBottom: 'none', 
          borderRadius: '36px 36px 0 0', 
          padding: '44px 44px 24px 44px', 
          display: 'flex', 
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', color: colors.headings, margin: '0 0 6px 0', fontWeight: '700', letterSpacing: '-0.5px' }}>Jingle Library</h1>
            <p style={{ fontSize: '18px', color: colors.secondaryText, margin: 0, fontWeight: '500' }}>Browse and manage all your generated audio assets.</p>
          </div>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            
            <div style={{ flexGrow: 1, border: '1px solid #D5D5D1', borderRadius: '16px', backgroundColor: colors.white, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #EAE9E4', height: '54px', fontSize: '14px', color: '#7E7E7A', fontWeight: '600' }}>
                    <th style={{ paddingLeft: '24px', width: '32%' }}>Jingle</th>
                    <th style={{ width: '15%' }}>Platform</th>
                    <th style={{ width: '14%' }}>Feedback</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '12%' }}>Duration</th>
                    <th style={{ paddingRight: '24px', width: '12%' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {initialJingles.map((row) => {
                    const isRowExpanded = hoveredRowId === row.id;

                    return (
                      <React.Fragment key={row.id}>
                        <tr 
                          onMouseEnter={() => setHoveredRowId(row.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                          onClick={() => setSelectedJingleId(row.id)} // Trigger full page state swap
                          style={{ 
                            borderBottom: isRowExpanded ? 'none' : '1px solid #F1F1EF', 
                            height: '58px',
                            fontSize: '15px', 
                            fontWeight: '600', 
                            color: colors.headings,
                            backgroundColor: isRowExpanded ? colors.white : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          <td style={{ paddingLeft: '24px', fontWeight: '700' }}>{row.name}</td>
                          <td>{row.platform}</td>
                          <td>{row.feedback}</td>
                          <td>
                            <span style={{ 
                              padding: '4px 12px', 
                              borderRadius: '6px', 
                              fontSize: '13px', 
                              fontWeight: '700',
                              ...getStatusStyle(row.status)
                            }}>
                              {row.status}
                            </span>
                          </td>
                          <td>{row.duration}</td>
                          <td style={{ paddingRight: '24px', color: '#7E7E7A', fontSize: '14px' }}>{row.date}</td>
                        </tr>

                        {isRowExpanded && (
                          <tr
                            onMouseEnter={() => setHoveredRowId(row.id)}
                            onMouseLeave={() => setHoveredRowId(null)}
                            style={{ backgroundColor: colors.white, borderBottom: '1px solid #EAE9E4' }}
                          >
                            <td colSpan={6} style={{ padding: '0 24px 20px 24px' }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                backgroundColor: 'transparent',
                                gap: '16px',
                                width: '100%'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation(); // Stop clicking play from choosing row
                                      setPlayingRowId(playingRowId === row.id ? null : row.id);
                                    }}
                                    style={{
                                      width: '42px',
                                      height: '42px',
                                      borderRadius: '50%',
                                      backgroundColor: colors.primaryAccent,
                                      border: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: colors.white,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {playingRowId === row.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
                                  </button>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexGrow: 1, maxWidth: '520px' }}>
                                    {waveformBars.map((bHeight, i) => (
                                      <div 
                                        key={i} 
                                        style={{ 
                                          flexGrow: 1,
                                          height: `${bHeight}px`, 
                                          backgroundColor: colors.primaryAccent, 
                                          borderRadius: '2px' 
                                        }} 
                                      />
                                    ))}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button 
                                    onClick={(e) => e.stopPropagation()} 
                                    style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', border: '1px solid #D5D5D1', backgroundColor: colors.white, color: colors.headings, cursor: 'pointer' }}
                                  >
                                    <Download size={18} strokeWidth={2.2} />
                                  </button>
                                  <button 
                                    onClick={(e) => e.stopPropagation()} 
                                    style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', border: '1px solid #D5D5D1', backgroundColor: colors.white, color: colors.headings, cursor: 'pointer' }}
                                  >
                                    <SquarePen size={18} strokeWidth={2.2} />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ 
              width: '280px', 
              backgroundColor: colors.white, 
              border: '1px solid #D5D5D1', 
              borderRadius: '16px', 
              padding: '24px', 
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.headings, margin: 0 }}>Filter</h2>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: colors.headings, margin: '0 0 12px 0' }}>Platform</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['TikTok', 'Instagram Reels', 'Spotify', 'YouTube', 'Radio', 'In-store'].map((p) => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: colors.secondaryText, cursor: 'pointer' }}>
                      <input type="radio" name="platform" style={{ accentColor: colors.primaryAccent, width: '16px', height: '16px' }} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: colors.headings, margin: '0 0 12px 0' }}>Status</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Draft', 'In review', 'Approved'].map((s) => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: colors.secondaryText, cursor: 'pointer' }}>
                      <input type="radio" name="status" style={{ accentColor: colors.primaryAccent, width: '16px', height: '16px' }} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: colors.headings, margin: '0 0 8px 0' }}>Date range</h4>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select style={{ width: '100%', height: '42px', padding: '0 36px 0 16px', borderRadius: '10px', border: '1px solid #D5D5D1', backgroundColor: colors.white, outline: 'none', fontSize: '14px', fontWeight: '500', color: colors.headings, appearance: 'none', cursor: 'pointer' }}>
                    <option>All time</option>
                    <option>Past 7 days</option>
                    <option>Past month</option>
                  </select>
                  <ChevronDown size={16} color={colors.headings} style={{ position: 'absolute', right: '14px', pointerEvents: 'none' }} />
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: colors.headings, margin: '0 0 12px 0' }}>Min Feedback Score</h4>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.1"
                  style={{ width: '100%', accentColor: colors.primaryAccent, cursor: 'pointer', marginBottom: '4px' }} 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: colors.headings }}>
                  <span>0</span>
                  <span>5</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}