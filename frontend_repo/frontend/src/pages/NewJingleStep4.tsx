import React from 'react';
import { Sidebar } from '../components/Sidebar';
import '../App.css';
import JingleGenerationLoading from './JingleGenerationLoading';
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  CloudUpload
} from 'lucide-react';
import { GEMINI_VOICES, LANGUAGE_OPTIONS } from '../lib/api';
import type { Language } from '../lib/api';

export interface Step4Data {
  soundDescription: string;
  voiceEnabled: boolean;
  voiceGender: 'male' | 'female';
  voiceName: string | null;
  language: Language;
}

export default function NewJingleStep4({
  onSubmit,
  onBack,
  onComplete,
}: {
  /** Saves creative direction + kicks off the real (slow, 1-3min) generation call. */
  onSubmit: (data: Step4Data) => Promise<void>;
  onBack: () => void;
  /** Navigates away once generation has actually completed. */
  onComplete: () => void;
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
  
  // Widget states
  const [soundDescription, setSoundDescription] = React.useState('');
  const [voiceToggle, setVoiceToggle] = React.useState('in');
  const [voiceName, setVoiceName] = React.useState('');
  const [voiceGender, setVoiceGender] = React.useState<'male' | 'female'>('male');
  const [language, setLanguage] = React.useState<Language>('ar-darija');
  const [error, setError] = React.useState<string | null>(null);

  // Loading intercept state — true while the real (slow) generation call is in flight.
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = () => setIsGenerating(true);

  // While generating, run the real API call and let the loading screen
  // animate for however long it actually takes (1-3 min on CPU) rather than
  // a fixed fake timer.
  if (isGenerating) {
    return (
      <JingleGenerationLoading
        onCancel={() => setIsGenerating(false)}
        run={() => onSubmit({
          soundDescription,
          voiceEnabled: voiceToggle === 'in',
          voiceGender,
          voiceName: voiceName || null,
          language,
        })}
        onComplete={() => {
          setIsGenerating(false);
          onComplete();
        }}
        onError={(message) => {
          setIsGenerating(false);
          setError(message);
        }}
        platformName="TikTok"
      />
    );
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
          gap: '32px', 
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          
          <div>
            <h1 style={{ fontSize: '32px', color: colors.headings, margin: '0 0 6px 0', fontWeight: '700', letterSpacing: '-0.5px' }}>Create New Jingle</h1>
            <p style={{ fontSize: '18px', color: colors.secondaryText, margin: 0, fontWeight: '500' }}>Tell us about your brand and let the magic happen.</p>
          </div>

          {/* STEPPER PROGRESS TRACK */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '0 0 10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '70%', justifyContent: 'space-between' }}>
              <div style={{ position: 'absolute', top: '20px', left: 0, right: 0, height: '2px', backgroundColor: '#E2E2DF', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', top: '20px', left: 0, width: '100%', height: '2px', backgroundColor: colors.primaryAccent, zIndex: 1 }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: colors.primaryAccent, color: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>1</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.secondaryText, position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Brand basics</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: colors.primaryAccent, color: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>2</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.secondaryText, position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Audience & Context</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: colors.primaryAccent, color: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>3</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.secondaryText, position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Platform Selection</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', backgroundColor: colors.primaryAccent, color: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>4</div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: colors.primaryAccent, position: 'absolute', bottom: '-24px', whiteSpace: 'nowrap' }}>Creative Direction</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC FORM CONTEXT TARGET ELEMENTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px', width: '100%', margin: '20px auto 0 auto' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>Describe Your Sound (Optional)</label>
              <textarea 
                rows={4}
                value={soundDescription}
                onChange={(e) => setSoundDescription(e.target.value)}
                placeholder="eg ..................................." 
                style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid ' + colors.border, backgroundColor: colors.white, outline: 'none', fontSize: '15px', fontWeight: '500', boxSizing: 'border-box', resize: 'vertical', minHeight: '90px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>
                Voice Style <span style={{ fontWeight: '500', color: colors.secondaryText }}>(always uses a voice — this picks how it's performed)</span>
              </label>
              <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                <button
                  type="button"
                  onClick={() => setVoiceToggle('in')}
                  style={{
                    flex: 1,
                    height: '50px',
                    borderRadius: '12px',
                    border: '1px solid ' + (voiceToggle === 'in' ? colors.primaryAccent : colors.border),
                    backgroundColor: voiceToggle === 'in' ? colors.primaryAccentlight : 'transparent',
                    color: voiceToggle === 'in' ? colors.primaryAccent : colors.headings,
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: voiceToggle === 'in' ? '0px 2px 4px rgba(0,0,0,0.03)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Sung (chanté)
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceToggle('off')}
                  style={{
                    flex: 1,
                    height: '50px',
                    borderRadius: '12px',
                    border: '1px solid ' + (voiceToggle === 'off' ? colors.primaryAccent : colors.border),
                    backgroundColor: voiceToggle === 'off' ? colors.primaryAccentlight : 'transparent',
                    color: voiceToggle === 'off' ? colors.primaryAccent : colors.headings,
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: voiceToggle === 'off' ? '0px 2px 4px rgba(0,0,0,0.03)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Spoken (parlé)
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>Voice Language</label>
              <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLanguage(opt.value)}
                    style={{
                      flex: 1,
                      height: '50px',
                      borderRadius: '12px',
                      border: '1px solid ' + (language === opt.value ? colors.primaryAccent : colors.border),
                      backgroundColor: language === opt.value ? colors.primaryAccentlight : 'transparent',
                      color: language === opt.value ? colors.primaryAccent : colors.headings,
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: language === opt.value ? '0px 2px 4px rgba(0,0,0,0.03)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>Voice Gender</label>
                  <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceGender('male');
                        if (voiceName && !GEMINI_VOICES.find((v) => v.name === voiceName && v.gender === 'male')) setVoiceName('');
                      }}
                      style={{
                        flex: 1,
                        height: '50px',
                        borderRadius: '12px',
                        border: '1px solid ' + (voiceGender === 'male' ? colors.primaryAccent : colors.border),
                        backgroundColor: voiceGender === 'male' ? colors.primaryAccentlight : 'transparent',
                        color: voiceGender === 'male' ? colors.primaryAccent : colors.headings,
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: voiceGender === 'male' ? '0px 2px 4px rgba(0,0,0,0.03)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceGender('female');
                        if (voiceName && !GEMINI_VOICES.find((v) => v.name === voiceName && v.gender === 'female')) setVoiceName('');
                      }}
                      style={{
                        flex: 1,
                        height: '50px',
                        borderRadius: '12px',
                        border: '1px solid ' + (voiceGender === 'female' ? colors.primaryAccent : colors.border),
                        backgroundColor: voiceGender === 'female' ? colors.primaryAccentlight : 'transparent',
                        color: voiceGender === 'female' ? colors.primaryAccent : colors.headings,
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: voiceGender === 'female' ? '0px 2px 4px rgba(0,0,0,0.03)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>
                    Gemini Voice <span style={{ fontWeight: '500', color: colors.secondaryText }}>({voiceGender === 'male' ? 'male voices' : 'female voices'})</span>
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: '10px',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid ' + colors.border,
                    backgroundColor: colors.white,
                  }}>
                    <button
                      type="button"
                      onClick={() => setVoiceName('')}
                      style={{
                        height: '42px',
                        borderRadius: '10px',
                        border: '1px solid ' + (voiceName === '' ? colors.primaryAccent : colors.border),
                        backgroundColor: voiceName === '' ? colors.primaryAccentlight : colors.backgroundLightMode,
                        color: voiceName === '' ? colors.primaryAccent : colors.secondaryText,
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Auto
                    </button>
                    {GEMINI_VOICES.filter((v) => v.gender === voiceGender).map((v) => (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setVoiceName(v.name)}
                        style={{
                          height: '42px',
                          borderRadius: '10px',
                          border: '1px solid ' + (voiceName === v.name ? colors.primaryAccent : colors.border),
                          backgroundColor: voiceName === v.name ? colors.primaryAccentlight : colors.backgroundLightMode,
                          color: voiceName === v.name ? colors.primaryAccent : colors.headings,
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
            </>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>Reference Audio</label>
              <div style={{ 
                width: '100%', 
                height: '170px', 
                border: `2px dashed ${colors.primaryAccent}`, 
                borderRadius: '16px', 
                backgroundColor: '#E4EAE1', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}>
                <div style={{ 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  backgroundColor: colors.white, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: colors.primaryAccent
                }}>
                  <CloudUpload size={22} strokeWidth={2.2} />
                </div>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: colors.headings }}>Upload Inspiration</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#727E67' }}>MP3 up to 10MB</span>
                </div>
              </div>
            </div>

          </div>

          {/* LOWER ACTION CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', width: '100%', maxWidth: '720px', margin: 'auto auto 0 auto', paddingBottom: '10px' }}>
            <button 
              onClick={onBack}
              style={{ flex: 1, height: '52px', border: '1px solid ' + colors.headings, backgroundColor: colors.white, color: colors.headings, borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              Back
            </button>
            <button 
              // 4. Sets local state to render loading phase view
              onClick={() => setIsGenerating(true)} 
              style={{ flex: 1, height: '52px', border: 'none', backgroundColor: colors.nextGreenButton, color: colors.white, borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              Generate
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}