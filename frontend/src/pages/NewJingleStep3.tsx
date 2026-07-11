import React from 'react';
import { Sidebar } from '../components/Sidebar';
import '../App.css'; 
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Bell, 
  Music, 
  Camera, 
  AudioLines, 
  Video, 
  Radio, 
  ShoppingBag 
} from 'lucide-react';

export default function NewJingleStep3({ 
  onNext, 
  onBack 
}: { 
  onNext: () => void; 
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
    nextGreenButton: '#2E6F40'
  };

  const [activeTab, setActiveTab] = React.useState('new-jingle');
  
  // State to track which platform grid item is clicked/active
  const [selectedPlatform, setSelectedPlatform] = React.useState('TikTok');

  const platforms = [
    { id: 'TikTok', name: 'TikTok', duration: '6 - 9 sec', icon: <Music size={20} /> },
    { id: 'Instagram reels', name: 'Instagram reels', duration: '6 - 9 sec', icon: <Camera size={20} /> },
    { id: 'Spotify ads', name: 'Spotify ads', duration: '6 - 9 sec', icon: <AudioLines size={20} /> },
    { id: 'Youtube', name: 'Youtube', duration: '6 - 9 sec', icon: <Video size={20} /> },
    { id: 'Classic radio', name: 'Classic radio', duration: '6 - 9 sec', icon: <Radio size={20} /> },
    { id: 'In store', name: 'In store', duration: '6 - 9 sec', icon: <ShoppingBag size={20} /> },
  ];

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

          {/* STEPPER PROGRESS TRACK (Step 3 Active) */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '10px 0 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '70%', justifyContent: 'space-between' }}>
              
              {/* Stepper Base Line */}
              <div style={{ position: 'absolute', top: '20px', left: 0, right: 0, height: '2px', backgroundColor: '#E2E2DF', zIndex: 1 }}></div>
              {/* Green filled line covering nodes 1 to 3 */}
              <div style={{ position: 'absolute', top: '20px', left: 0, width: '66.6%', height: '2px', backgroundColor: colors.primaryAccent, zIndex: 1 }}></div>
              
              {/* Step 1 Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: colors.primaryAccent, color: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>1</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.secondaryText, position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Brand basics</span>
              </div>

              {/* Step 2 Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: colors.primaryAccent, color: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>2</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.secondaryText, position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Audience & Context</span>
              </div>

              {/* Step 3 Node (Active Highlighted Green) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: colors.primaryAccent, color: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>3</div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: colors.primaryAccent, position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Platform Selection</span>
              </div>

              {/* Step 4 Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: '#EBEBE8', color: colors.secondaryText, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>4</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#A1A19D', position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Creative Direction</span>
              </div>

            </div>
          </div>

          {/* PLATFORM GRID SELECTION AREA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px', width: '100%', margin: '20px auto 0 auto' }}>
            <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>Select Target Platform</label>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '20px', 
              width: '100%' 
            }}>
              {platforms.map((platform) => {
                const isSelected = selectedPlatform === platform.id;
                return (
                  <div 
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    style={{
                      backgroundColor: colors.white,
                      border: isSelected ? `2px solid ${colors.primaryAccent}` : `1px solid ${colors.border}`,
                      borderRadius: '16px',
                      padding: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease-in-out',
                      boxShadow: isSelected ? '0px 4px 12px rgba(51, 119, 56, 0.1)' : 'none'
                    }}
                  >
                    {/* Icon Square */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: colors.headings,
                      color: colors.white,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {platform.icon}
                    </div>

                    {/* Meta info labels */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>{platform.name}</span>
                      <span style={{ fontSize: '12px', color: '#8A8A85', fontWeight: '500' }}>{platform.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LOWER ACTION ACTION BUTTONS ROW */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', width: '100%', maxWidth: '720px', margin: 'auto auto 0 auto', paddingBottom: '10px' }}>
            <button 
              onClick={onBack}
              style={{ flex: 1, height: '52px', border: '1px solid ' + colors.headings, backgroundColor: colors.white, color: colors.headings, borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              Back
            </button>
            <button 
              onClick={onNext}
              style={{ flex: 1, height: '52px', border: 'none', backgroundColor: colors.nextGreenButton, color: colors.white, borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              Next
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}