import React from 'react';
import { Sidebar } from '../components/Sidebar';
import '../App.css';
import { ArrowLeft, Moon, Sun, Bell } from 'lucide-react';
import { ApiError, type TargetAgeRange } from '../lib/api';

export interface Step2Data {
  targetAgeRange: TargetAgeRange;
  moodContext: string;
}

/** Maps the 0-100 slider position to the backend's 3-bucket enum — the
 * slider UI has no real "13-24 / 25-40 / 41+" discrete stops, so split the
 * range into thirds. */
function sliderToAgeRange(value: number): TargetAgeRange {
  if (value < 34) return '13-24';
  if (value < 67) return '25-40';
  return '41+';
}

export default function NewJingleStep2({
  onNext,
  onBack
}: {
  onNext: (data: Step2Data) => Promise<void>;
  onBack: () => void;
}) {
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
    nextGreenButton: '#2E6F40' // Accent green matching the design's main action buttons
  };

  const [activeTab, setActiveTab] = React.useState('new-jingle');
  
  // Widget states
  const [ageRange, setAgeRange] = React.useState('50'); // Slider midpoint default
  const [moodContext, setMoodContext] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleNext = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onNext({ targetAgeRange: sliderToAgeRange(Number(ageRange)), moodContext });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: colors.white, 
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      color: '#111111' 
    }}>
      
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
            <span style={{ fontSize: '20px', fontWeight: '700', color: colors.headings }}>New Jingle</span>
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

        {/* MIDDLE FORM PANEL */}
        <div style={{ 
          flexGrow: 1, 
          backgroundColor: colors.backgroundLightMode, 
          border: '1px solid ' + colors.border, 
          borderBottom: 'none', 
          borderRadius: '36px 36px 0 0', 
          padding: '40px 60px 24px 60px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '40px', 
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          
          <div>
            <h1 style={{ fontSize: '32px', color: colors.headings, margin: '0 0 6px 0', fontWeight: '700', letterSpacing: '-0.5px' }}>Create New Jingle</h1>
            <p style={{ fontSize: '18px', color: colors.secondaryText, margin: 0, fontWeight: '500' }}>Tell us about your brand and let the magic happen.</p>
          </div>

          {/* STEPPER METRIC TRACK (Step 2 Active) */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '10px 0 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '70%', justifyContent: 'space-between' }}>
              
              {/* Stepper Connecting Lines */}
              <div style={{ position: 'absolute', top: '20px', left: 0, right: 0, height: '2px', backgroundColor: '#E2E2DF', zIndex: 1 }}></div>
              {/* Active filled line connecting Node 1 to Node 2 */}
              <div style={{ position: 'absolute', top: '20px', left: 0, width: '33.3%', height: '2px', backgroundColor: colors.primaryAccent, zIndex: 1 }}></div>
              
              {/* Step 1 Node (Completed) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: colors.primaryAccent, color: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>1</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.secondaryText, position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Brand basics</span>
              </div>

              {/* Step 2 Node (Active Highlighted Green) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: colors.primaryAccent, color: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>2</div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: colors.primaryAccent, position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Audience & Context</span>
              </div>

              {/* Step 3 Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: '#EBEBE8', color: colors.secondaryText, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>3</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#A1A19D', position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Platform Selection</span>
              </div>

              {/* Step 4 Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: '#EBEBE8', color: colors.secondaryText, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>4</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#A1A19D', position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Creative Direction</span>
              </div>

            </div>
          </div>

          {/* DYNAMIC FORM CONTEXT ELEMENTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '720px', width: '100%', margin: '20px auto 0 auto' }}>
            {error && (
              <div style={{
                backgroundColor: '#FDEDED',
                border: '1px solid #D9383A',
                color: '#D9383A',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                {error}
              </div>
            )}

            {/* Widget 1: Age Range Slider Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>Target Age range</label>
              
              <div style={{ width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="custom-range-slider"
                  style={{ 
                    width: '100%', 
                    cursor: 'pointer',
                    accentColor: '#EBEBE8'
                  }} 
                />
                
                {/* Horizontal Scale Text Values */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '14px', fontWeight: '700', color: colors.headings }}>
                  <span>13 - 24</span>
                  <span style={{ transform: 'translateX(-10px)' }}>25 - 40</span>
                  <span>41 +</span>
                </div>
              </div>
            </div>

            {/* Widget 2: Mood / Context Input Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>Mood / Context</label>
              <input 
                type="text" 
                value={moodContext}
                onChange={(e) => setMoodContext(e.target.value)}
                placeholder="eg . Focus Time" 
                style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid ' + colors.border, backgroundColor: colors.white, outline: 'none', fontSize: '15px', fontWeight: '500', boxSizing: 'border-box' }}
              />
            </div>

          </div>

          {/* LOWER RUNTIME FOOTER BUTTON CONTROL ACTION BAR */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', width: '100%', maxWidth: '720px', margin: 'auto auto 0 auto', paddingBottom: '10px' }}>
            <button 
              onClick={onBack}
              style={{ flex: 1, height: '52px', border: '1px solid ' + colors.headings, backgroundColor: colors.white, color: colors.headings, borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              style={{ flex: 1, height: '52px', border: 'none', backgroundColor: colors.nextGreenButton, color: colors.white, borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: isSubmitting ? 'default' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}