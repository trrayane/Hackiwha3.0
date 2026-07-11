import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// --- IMAGE IMPORTS FROM YOUR SRC/ASSETS/ DIRECTORY ---
//import heroCharacter from '../assets/hero-character.png';
import heroAudio from '../assets/audio.png';
import step1Card from '../assets/step1-card.png';
import step2Card from '../assets/step2-card.png';
import step3Card from '../assets/step3-card.png';
import heroVideoWebm from '../assets/hero-character.webm';
import heroVideoMov from '../assets/hero-character.mov';

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Helper function to handle smooth in-page scrolling
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Intercept incoming navigation requests from other routes (like ExamplesPage)
  useEffect(() => {
    if (location.state && (location.state as any).scrollToId) {
      const targetElementId = (location.state as any).scrollToId;
      
      // Small delay guarantees the DOM elements are fully mounted before executing the scroll
      const timer = setTimeout(() => {
        scrollToSection(targetElementId);
      }, 150);

      // Clean history state so a normal user page reload doesn't trigger unexpected scroll jumps
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div style={{
      backgroundColor: colors.backgroundLightMode,
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: colors.headings,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      
      {/* 1. NAVBAR */}
      <header style={{
        backgroundColor: '#F3FAF1',
        borderBottom: '2px solid #2E6F40',
        width: '100%',
        height: '90px', 
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center', 
          padding: '0 100px',
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          {/* Left Side: Brand Name Only */}
          <div style={{ display: 'flex', alignItems: 'center', lineHeight: '1' }}>
            <span 
              onClick={() => navigate('/')}
              style={{ 
                fontWeight: '800', 
                fontSize: '22px', 
                color: '#282900', 
                letterSpacing: '-0.5px',
                cursor: 'pointer'
              }}
            >
              Name
            </span>
          </div>

          {/* Middle Center Section: Completely Centered Navigation Links */}
          <nav style={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)', 
            display: 'flex', 
            gap: '32px', 
            fontWeight: '700', 
            fontSize: '17px', 
            color: '#282900',
            alignItems: 'center'
          }}>
            <span onClick={() => scrollToSection('how-it-works')} style={{ cursor: 'pointer' }}>Product</span>
            <span onClick={() => scrollToSection('pricing-section')} style={{ cursor: 'pointer' }}>Pricing</span>
            <span onClick={() => navigate('/examples')} style={{ cursor: 'pointer' }}>Examples</span>
          </nav>

          {/* Right Side: Auth Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', lineHeight: '1' }}>
            <button 
              onClick={() => navigate('/login')} 
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                fontWeight: '700', 
                fontSize: '15px', 
                color: '#282900', 
                cursor: 'pointer',
                padding: 0,
                margin: 0
              }}
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/register')}
              style={{ 
                backgroundColor: '#337738', 
                color: '#FFFFFF', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '12px 24px', 
                fontWeight: '700', 
                fontSize: '15px', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Try it free
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section style={{ 
        padding: '120px 100px 100px 100px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        maxWidth: '1440px', 
        margin: '0 auto', 
        gap: '20px',
        backgroundColor: '#F3FAF1',
        boxSizing: 'border-box'
      }}>
        {/* Left Column Content */}
        <div style={{ 
          flex: '1',
          maxWidth: '580px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          gap: '24px' 
        }}>
          <h1 style={{ 
            fontSize: '64px', 
            fontWeight: '800', 
            lineHeight: '1.1', 
            letterSpacing: '-2.5px', 
            margin: 0, 
            color: '#282900',
            whiteSpace: 'nowrap'
          }}>
            Ads people actually<br />want to hear.
          </h1>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#5C6B4D', 
            fontWeight: '600', 
            lineHeight: '1.5', 
            margin: 0, 
            maxWidth: '520px' 
          }}>
            Name generates jingles that adapt to the platform, the audience, and the moment, so your brand sounds right everywhere, without a studio budget or a six-week turnaround.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '20px 0' }}>
            <button 
              onClick={() => navigate('/register')}
              style={{ 
                backgroundColor: '#337738', 
                color: '#FFFFFF', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '14px 24px', 
                fontWeight: '700', 
                fontSize: '15px', 
                cursor: 'pointer' 
              }}
            >
              Try it free
            </button>
            
            <button style={{ 
              backgroundColor: 'transparent', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontWeight: '700', 
              fontSize: '15px', 
              color: '#282900', 
              cursor: 'pointer' 
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
              </svg>
              Watch a demo
            </button>
          </div>

          <div style={{ width: '100%' }}>
            <img 
              src={heroAudio} 
              alt="Audio player preview" 
              style={{ width: '500px', height: 'auto', display: 'block' }} 
            />
          </div>
        </div>

       {/* Right Column Character Video */}
<div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
  <video 
    autoPlay
    loop
    muted
    playsInline
    style={{ 
      width: '795px', 
      height: '447px', 
      objectFit: 'contain',
      display: 'block',
      transform: 'translateX(-40px)' // Kept your layout nudge here!
    }} 
  >
    <source src={heroVideoMov} type="video/mp4;codecs=hvc1" /> 
    <source src={heroVideoWebm} type="video/webm" />
  </video>
</div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '100px 100px', borderTop: `2px solid ${colors.primaryAccent}`, backgroundColor: colors.backgroundLightMode }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          
          <span style={{ color: colors.primaryAccent, fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px', display: 'block' }}>How it works ?</span>
          <h2 style={{ fontSize: '38px', fontWeight: '700', margin: '12px 0 100px 0', letterSpacing: '-1.5px', color: colors.headings }}>From brief to broadcast-ready, in one flow.</h2>

          {/* STEP 1 */}
          <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '230px', 
              marginBottom: '140px' 
          }}>
            <div style={{ maxWidth: '460px' }}>
              <h3 style={{ fontSize: '45px', fontWeight: '700', margin: '0 0 16px 0', color: colors.headings, letterSpacing: '-1px' }}>Tell us the context</h3>
              <p style={{ fontSize: '20px', color: colors.secondaryText, lineHeight: '1.6', fontWeight: '500', margin: 0 }}>
                Pick the platform, the audience, the mood. A TikTok pre-roll and a retail store loop don't need the same energy. SonicFit knows the difference.
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <img src={step1Card} alt="Context step panel" style={{ width: '380px', height: 'auto', display: 'block' }} />
              <div style={{
                position: 'absolute', bottom: '-120px', left: '-100px', width: '180px', height: '120px',
                border: `2px dashed ${colors.secondaryText}`, borderTop: 'none', borderRight: 'none',
                borderRadius: '0 0 0 140px', opacity: 0.4, pointerEvents: 'none'
              }}></div>
            </div>
          </div>

          {/* STEP 2 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row-reverse', 
            justifyContent: 'center',
            alignItems: 'center', 
            gap: '230px', 
            marginBottom: '140px' 
          }}>
            <div style={{ maxWidth: '460px' }}>
              <h3 style={{ fontSize: '45px', fontWeight: '700', margin: '0 0 16px 0', color: colors.headings, letterSpacing: '-1px' }}>Get real variants, not one guess</h3>
              <p style={{ fontSize: '20px', color: colors.secondaryText, lineHeight: '1.6', fontWeight: '500', margin: 0 }}>
                Every brief generates 2-3 distinct directions. Compare them side by side before you commit.
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <img src={step2Card} alt="Variants step panel" style={{ width: '380px', height: 'auto', display: 'block' }} />
              <div style={{
                position: 'absolute', bottom: '-120px', right: '-100px', width: '180px', height: '120px',
                border: `2px dashed ${colors.secondaryText}`, borderTop: 'none', borderLeft: 'none',
                borderRadius: '0 0 140px 0', opacity: 0.4, pointerEvents: 'none'
              }}></div>
            </div>
          </div>

          {/* STEP 3 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '230px' }}>
            <div style={{ maxWidth: '460px' }}>
              <h3 style={{ fontSize: '45px', fontWeight: '700', margin: '0 0 16px 0', color: colors.headings, letterSpacing: '-1px' }}>Feedback that actually trains the next round</h3>
              <p style={{ fontSize: '20px', color: colors.secondaryText, lineHeight: '1.6', fontWeight: '500', margin: 0 }}>
                Pick the platform, the audience, the mood. A TikTok pre-roll and a retail store loop don't need the same energy. SonicFit knows the difference.
              </p>
            </div>
            <div>
              <img src={step3Card} alt="Feedback loops step panel" style={{ width: '380px', height: 'auto', display: 'block' }} />
            </div>
          </div>

        </div>
      </section>

      {/* 4. CHANNELS / WHERE IT PLAYS */}
      <section style={{ padding: '100px 100px', borderTop: `2px solid ${colors.primaryAccent}`, backgroundColor: '#F3FAF1' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <span style={{ color: colors.primaryAccent, fontWeight: '700', fontSize: '15px', display: 'block' }}>Where it plays?</span>
          <h2 style={{ fontSize: '38px', fontWeight: '700', margin: '12px 0 48px 0', letterSpacing: '-1.5px', color: colors.headings }}>One brief. Every format it needs to fit.</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {[
              { title: 'TikTok', duration: '5 - 9 sec' },
              { title: 'Instagram reels', duration: '5 - 9 sec' },
              { title: 'Spotify ads', duration: '5 - 9 sec' },
              { title: 'YouTube', duration: '5 - 9 sec' },
              { title: 'Classic radio', duration: '5 - 9 sec' },
              { title: 'In store', duration: '5 - 9 sec' }
            ].map((platform, index) => (
              <div key={index} style={{ backgroundColor: colors.cardBackgroundsMint, borderRadius: '8px', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: colors.white, opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', color: colors.headings }}>🎵</span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: colors.headings }}>{platform.title}</div>
                  <div style={{ fontSize: '12px', color: colors.secondaryText, fontWeight: '500', marginTop: '2px' }}>{platform.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing-section" style={{ padding: '100px 100px', borderTop: `2px solid ${colors.primaryAccent}`, backgroundColor: colors.backgroundLightMode }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}> 
          <span style={{ color: colors.primaryAccent, fontWeight: '700', fontSize: '15px', display: 'block' }}>Pricing</span>
          <h2 style={{ fontSize: '38px', fontWeight: '700', margin: '12px 0 60px 0', letterSpacing: '-1.5px', color: colors.headings }}>Start free. Upgrade when you outgrow it.</h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '40px' }}>
            <div style={{ width: '360px', height: '320px', backgroundColor: colors.cardBackgroundsMint, borderRadius: '16px' }}></div>
            <div style={{ width: '360px', height: '320px', backgroundColor: colors.cardBackgroundsMint, borderRadius: '16px' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '15px', fontWeight: '700', color: colors.primaryAccent, cursor: 'pointer' }}>
              See full pricing <ChevronRight size={16} style={{ marginTop: '1px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer style={{ padding: '80px 80px 40px 80px', backgroundColor: colors.cardBackgroundsMint, borderTop: `2px solid ${colors.primaryAccent}` }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '80px' }}>
          <div>
            <div style={{ width: '120px', height: '32px', backgroundColor: '#D4DDD0', marginBottom: '20px' }}></div> 
            <p style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', margin: '0 0 24px 0' }}>Ads people actually want to hear.</p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ display: 'inline-flex', width: '28px', height: '28px', border: `1px solid ${colors.border}`, backgroundColor: colors.white, borderRadius: '4px', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, cursor: 'pointer' }}>in</span>
              <span style={{ display: 'inline-flex', width: '28px', height: '28px', border: `1px solid ${colors.border}`, backgroundColor: colors.white, borderRadius: '4px', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, cursor: 'pointer' }}>ig</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '90px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: colors.headings }}>Product</span>
              <span onClick={() => scrollToSection('how-it-works')} style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Features</span>
              <span onClick={() => scrollToSection('pricing-section')} style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Pricing</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: colors.headings }}>Company</span>
              <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>About</span>
              <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Blog</span>
              <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Careers</span>
              <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Contact</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: colors.headings }}>Legal</span>
              <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Privacy</span>
              <span style={{ fontSize: '14px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Terms</span>
              <span style={{ fontSize: '14px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Cookie Policy</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: `1px solid ${colors.border}`, paddingTop: '24px', fontSize: '13px', fontWeight: '500', color: colors.secondaryText }}>
          <span>© 2026 name Made for Hackusha 3.0</span>
        </div>
      </footer>

    </div>
  );
}