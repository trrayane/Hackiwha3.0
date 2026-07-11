import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import '../App.css';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Bell, 
  Play, 
  Pause, 
  Download 
} from 'lucide-react';

interface JingleDetailsProps {
  onBack: () => void;
}

export default function JingleDetails({ onBack }: JingleDetailsProps) {
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
  const [isPlayingMain, setIsPlayingMain] = useState(false);
  const [playingVersionId, setPlayingVersionId] = useState<string | null>(null);

  const versions = [
    { id: 'v3', name: 'V3 - Latest', timestamp: 'Today , 10:33 Am', processingAction: false },
    { id: 'v2', name: 'V2 - Latest', timestamp: 'Today , 10:33 Am', processingAction: true },
    { id: 'v1', name: 'V1 - Latest', timestamp: 'Today , 10:33 Am', processingAction: true }
  ];

  const waveformBars = [
    6, 12, 18, 10, 14, 22, 16, 24, 12, 18, 20, 14, 26, 10, 16, 22, 14, 20, 24, 12,
    18, 14, 22, 26, 16, 20, 24, 12, 18, 10, 22, 16, 24, 12, 18, 20, 14, 26, 10, 16,
    22, 14, 20, 24, 12, 18, 14, 22, 26, 16, 20, 24, 12, 18, 10, 22, 16, 24, 12, 18,
    20, 14, 26, 10, 16, 22, 14, 20, 24, 12, 18, 14, 22, 26, 16, 20, 24, 12, 18, 10
  ];

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: colors.white, 
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      color: '#111111' 
    }}>
      
      {/* SIDEBAR */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />

      {/* CORE FRAME LAYOUT */}
      <main style={{ 
        flexGrow: 1, 
        padding: '24px 24px 0 24px', 
        boxSizing: 'border-box', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        height: '100vh'
      }}>
        
        {/* TOP NAVBAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.backgroundLightMode, borderRadius: '40px', padding: '12px 28px', border: '1px solid ' + colors.border }}>
          <div onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color={colors.headings} strokeWidth={2.5} />
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

        {/* MAIN DISPLAY CONTAINER */}
        <div style={{ 
          flexGrow: 1, 
          backgroundColor: colors.backgroundLightMode, 
          border: '1px solid ' + colors.border, 
          borderBottom: 'none', 
          borderRadius: '36px 36px 0 0', 
          padding: '44px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          
          {/* TITLE HEADER BLOCK */}
          <div style={{ marginBottom: '8px' }}>
            <h1 style={{ fontSize: '32px', color: colors.headings, margin: '0 0 6px 0', fontWeight: '700', letterSpacing: '-0.5px' }}>
              Jingle name
            </h1>
            <p style={{ fontSize: '18px', color: colors.secondaryText, margin: 0, fontWeight: '500' }}>
              Brand - Platform
            </p>
          </div>

          {/* LINE 1: AUDIO WAVEFORM CARD + FEEDBACK SCORE CARD (EQUAL HEIGHT) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'stretch' }}>
            
            {/* SLIM WAVE AUDIO CARD */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '20px 24px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <button
                  onClick={() => setIsPlayingMain(!isPlayingMain)}
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
                  {isPlayingMain ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
                </button>

                {/* THIN DYNAMIC WAVEFORM LINES */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexGrow: 1, paddingRight: '24px' }}>
                  {waveformBars.map((bHeight, idx) => (
                    <div
                      key={idx}
                      style={{
                        flexGrow: 1,
                        maxWidth: '2px',
                        height: `${bHeight}px`,
                        backgroundColor: colors.primaryAccent,
                        borderRadius: '1px'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '1px solid #EAE9E4',
                backgroundColor: colors.white,
                color: colors.headings,
                cursor: 'pointer'
              }}>
                <Download size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* FEEDBACK SCORE CARD */}
            <div style={{
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '20px 24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.headings, margin: '0 0 8px 0' }}>
                Feedback score
              </h3>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.primaryAccent }}>
                4.8 / 5
              </div>
            </div>

          </div>

          {/* LINE 2: VERSIONS HISTORY CARD + METADATA CARD (EQUAL HEIGHT) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'stretch' }}>
            
            {/* VERSIONS TIMELINE WRAPPER BOX */}
            <div style={{
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '24px 28px',
              boxSizing: 'border-box'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.headings, margin: '0 0 20px 0' }}>
                Versions History
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {versions.map((ver) => (
                  <div
                    key={ver.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #EAE9E4',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      backgroundColor: '#FCFBF9'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: colors.headings }}>{ver.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#7E7E7A' }}>{ver.timestamp}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {ver.processingAction && (
                        <button style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: colors.primaryAccent,
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}>
                          Restore
                        </button>
                      )}
                      
                      <button
                        onClick={() => setPlayingVersionId(playingVersionId === ver.id ? null : ver.id)}
                        style={{
                          width: '32px',
                          height: '32px',
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
                        {playingVersionId === ver.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: '1px' }} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* METADATA PARAMETERS */}
            <div style={{
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.headings, margin: 0 }}>
                Metadata
              </h3>

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#7E7E7A', marginBottom: '4px' }}>Brand</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: colors.headings }}>Brand name</div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#7E7E7A', marginBottom: '4px' }}>Created</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: colors.headings }}>Date</div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#7E7E7A', marginBottom: '8px' }}>Tone Tags</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {['Date', 'Date', 'Date'].map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '15px',
                        fontWeight: '700',
                        color: colors.headings
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}