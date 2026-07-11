import { Sidebar } from '../components/Sidebar';
import '../App.css';
import react, { useState } from 'react';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Bell 
} from 'lucide-react';

interface JingleChangeRequestProps {
  jingleName: string;
  rating: number | null;
  onBack: () => void;
  onCancel: () => void;
  onRegenerate: (feedback: string) => void;
}

export default function JingleChangeRequest({ jingleName, rating, onBack, onCancel, onRegenerate }: JingleChangeRequestProps) {
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

  const [activeTab, setActiveTab] = useState('new-jingle');
  const [feedbackText, setFeedbackText] = useState('');

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ArrowLeft size={22} color={colors.headings} strokeWidth={2.5} />
              <span style={{ fontSize: '22px', fontWeight: '700', color: colors.headings }}>Change request</span>
            </div>
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

        {/* WORKSPACE DISPLAY */}
        <div style={{ 
          flexGrow: 1, 
          backgroundColor: colors.backgroundLightMode, 
          border: '1px solid ' + colors.border, 
          borderBottom: 'none', 
          borderRadius: '36px 36px 0 0', 
          padding: '50px 60px 44px 60px', // Adjusted padding slightly to give heading breathing room
          display: 'flex', 
          flexDirection: 'column', 
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          
          {/* FIXED: Moved this header section outside the centered container so it aligns to the far left */}
          <div style={{ marginBottom: '40px', textAlign: 'left' }}>
            <h1 style={{ fontSize: '36px', color: colors.headings, margin: '0 0 10px 0', fontWeight: '700', letterSpacing: '-0.5px' }}>
              {jingleName || 'Your jingle'}
            </h1>
            <p style={{ fontSize: '20px', color: colors.secondaryText, margin: 0, fontWeight: '500' }}>
              Review the variant below and provide your feedback.
            </p>
          </div>

          {/* CONTENT CENTERED COMPONENT WRAPPER */}
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* VARIANT SUMMARY BOX */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '24px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: colors.headings }}>{jingleName || 'Your jingle'}</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#7E7E7A' }}>variant 1</span>
              </div>

              {/* RATING BADGE */}
              <div style={{
                border: '1px solid #D5D5D1',
                borderRadius: '10px',
                padding: '8px 18px',
                textAlign: 'center',
                backgroundColor: colors.white
              }}>
                <div style={{ fontSize: '11px', color: '#7E7E7A', fontWeight: '600', marginBottom: '2px', textTransform: 'uppercase' }}>Your rating</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: colors.primaryAccent }}>{rating != null ? `${rating} / 5` : 'Not rated'}</div>
              </div>
            </div>

            {/* FEEDBACK CONTAINER BOX */}
            <div style={{
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '24px',
              boxSizing: 'border-box',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.headings, margin: '0 0 16px 0' }}>
                What needs to change?
              </h3>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Provide your feedback , eg , change the tone ......."
                style={{
                  width: '100%',
                  height: '120px',
                  border: '1px solid #D5D5D1',
                  borderRadius: '12px',
                  padding: '16px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'none',
                  backgroundColor: '#FCFBF9',
                  color: colors.headings
                }}
              />
            </div>

            {/* ACTION FOOTER BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => onRegenerate(feedbackText)}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: colors.primaryAccent,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                Regenerate jingle
              </button>

              <button 
                onClick={onCancel}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: colors.white,
                  color: colors.dangerRed,
                  border: '1px solid ' + colors.dangerRed,
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                Cancel changes
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}