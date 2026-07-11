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
  Star 
} from 'lucide-react';

interface GeneratedJingleResultProps {
  onBack: () => void;
  onRequestChanges: () => void;
  onApprove: () => void;
}

export default function GeneratedJingleResult({
  onBack,
  onRequestChanges,
  onApprove
}: GeneratedJingleResultProps) {
  const colors = {
    white: '#FFFFFF',
    border: '#D9D9D9',
    backgroundLightMode: '#FCFBF6',
    primaryAccent: '#337738',
    headings: '#282900',
    secondaryText: '#5C6B4D',
    primaryAccentlight: 'color-mix(in srgb, #337738 14%, transparent)',
    nextGreenButton: '#2E6F40'
  };

  const [activeTab, setActiveTab] = useState('new-jingle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [rating, setRating] = useState(1); // Default showing 1 filled star from your design

  // Wave heights array for the stylized inner audio player track
  const waveformBars = [
    12, 18, 14, 22, 26, 16, 20, 24, 14, 28, 22, 18, 26, 12, 20, 24, 16, 22, 28, 14,
    18, 12, 24, 26, 16, 20, 22, 14, 28, 18, 26, 12, 20, 24, 16, 22, 28, 14, 18, 12
  ];

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: colors.white, 
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      color: '#111111' 
    }}>
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />

      {/* WINDOW HUB LAYOUT CONTAINER */}
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
            <span style={{ fontSize: '20px', fontWeight: '700', color: colors.headings }}>generated jingle</span>
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

        {/* GENERATION RESULT WORKSPACE CONTENT PANEL */}
        <div style={{ 
          flexGrow: 1, 
          backgroundColor: colors.backgroundLightMode, 
          border: '1px solid ' + colors.border, 
          borderBottom: 'none', 
          borderRadius: '36px 36px 0 0', 
          padding: '50px 80px 24px 80px', 
          display: 'flex', 
          flexDirection: 'column', 
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          
          {/* TRACK TITLES SECTIONS */}
          <div style={{ marginBottom: '60px' }}>
            <h1 style={{ fontSize: '36px', color: colors.headings, margin: '0 0 8px 0', fontWeight: '700', letterSpacing: '-0.5px' }}>
              Name of jingle
            </h1>
            <div style={{ display: 'flex', gap: '48px', fontSize: '20px', fontWeight: '500', color: colors.secondaryText }}>
              <span>variant 1</span>
              <span>0:15</span>
            </div>
          </div>

          {/* INNER CUSTOM AUDIO PLAYER CONTAINER */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: colors.white, 
            border: '1px solid #B4C2B0', 
            borderRadius: '20px', 
            padding: '24px 36px',
            maxWidth: '780px',
            width: '100%',
            margin: '0 auto 48px auto',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexGrow: 1 }}>
              {/* PLAY BUTTON TRIGGER */}
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: colors.primaryAccent,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.white,
                  cursor: 'pointer',
                  paddingLeft: isPlaying ? '0px' : '4px'
                }}
              >
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
              </button>

              {/* STYLIZED STATIC WAVEFORM GENERATOR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexGrow: 1, padding: '0 16px' }}>
                {waveformBars.map((height, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      flexGrow: 1,
                      maxWidth: '4px',
                      height: `${height}px`, 
                      backgroundColor: colors.primaryAccent,
                      borderRadius: '4px'
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* DURATION LOG */}
            <div style={{ fontSize: '20px', fontWeight: '600', color: colors.headings, marginLeft: '16px' }}>
              0:15
            </div>
          </div>

          {/* RATING WIDGET ZONE */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '64px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: colors.headings, margin: 0 }}>Rate jingle</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((starNum) => (
                <Star
                  key={starNum}
                  size={32}
                  onClick={() => setRating(starNum)}
                  style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                  color={starNum <= rating ? '#2E6F40' : '#282900'}
                  fill={starNum <= rating ? '#2E6F40' : 'transparent'}
                  strokeWidth={1.7}
                />
              ))}
            </div>
          </div>

          {/* LOWER FORM STEP APPROVAL TRIGGER BUTTONS */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px', 
            width: '100%', 
            maxWidth: '780px', 
            margin: 'auto auto 20px auto' 
          }}>
            <button 
              onClick={onRequestChanges}
              style={{ 
                flex: 1, 
                height: '52px', 
                border: `1px solid ${colors.primaryAccent}`, 
                backgroundColor: colors.white, 
                color: colors.primaryAccent, 
                borderRadius: '12px', 
                fontWeight: '700', 
                fontSize: '16px', 
                cursor: 'pointer' 
              }}
            >
              Request changes
            </button>
            <button 
              onClick={onApprove}
              style={{ 
                flex: 1, 
                height: '52px', 
                border: 'none', 
                backgroundColor: colors.nextGreenButton, 
                color: colors.white, 
                borderRadius: '12px', 
                fontWeight: '700', 
                fontSize: '16px', 
                cursor: 'pointer' 
              }}
            >
              Approve
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}