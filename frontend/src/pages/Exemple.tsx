
import { useNavigate } from 'react-router-dom';

export default function ExamplesPage() {
  const navigate = useNavigate();

  // Using the exact color variables you established in your project
  const colors = {
    backgroundLightMode: '#FCFBF6',
    primaryAccent: '#337738',
    headings: '#282900',
    secondaryText: '#5C6B4D',
    border: '#2E6F40',
    white: '#FFFFFF'
  };

  // Mock array to map through the 6 identical cards cleanly
  const cards = Array(6).fill({
    title: "Name",
    tag: "Tiktok",
    subtitle: "Coffee brand • TikTok • morning scroll"
  });

  return (
    <div style={{ 
      backgroundColor: '#F3FAF1', 
      minHeight: '100vh', 
      width: '100%',               
      display: 'flex', 
      flexDirection: 'column',
      boxSizing: 'border-box',
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
    }}>
      
      {/* 1. NAVBAR */}
      <header style={{
        backgroundColor: '#F3FAF1',
        borderBottom: `2px solid ${colors.border}`,
        width: '100%',
        height: '90px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
          <div style={{ display: 'flex', alignItems: 'center', lineHeight: '1' }}>
            <span 
              onClick={() => navigate('/')}
              style={{ fontWeight: '800', fontSize: '22px', color: colors.headings, letterSpacing: '-0.5px', cursor: 'pointer' }}
            >
              Name
            </span>
          </div>

          <nav style={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', 
            gap: '32px', 
            fontWeight: '700', 
            fontSize: '17px', 
            color: colors.headings,
            alignItems: 'center'
          }}>
            {/* Passes custom target element strings to the router history layer */}
            <span 
              onClick={() => navigate('/', { state: { scrollToId: 'how-it-works' } })} 
              style={{ cursor: 'pointer' }}
            >
              Product
            </span>
            <span 
              onClick={() => navigate('/', { state: { scrollToId: 'pricing-section' } })} 
              style={{ cursor: 'pointer' }}
            >
              Pricing
            </span>
            <span onClick={() => navigate('/examples')} style={{ cursor: 'pointer', color: colors.primaryAccent }}>Examples</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', lineHeight: '1' }}>
            <button 
              onClick={() => navigate('/login')} 
              style={{ backgroundColor: 'transparent', border: 'none', fontWeight: '700', fontSize: '15px', color: colors.headings, cursor: 'pointer' }}
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/register')}
              style={{ backgroundColor: colors.primaryAccent, color: colors.white, border: 'none', borderRadius: '6px', padding: '12px 24px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}
            >
              Try it free
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN HERO & CARDS GRID SECTION */}
      <section style={{ 
        backgroundColor: colors.backgroundLightMode, 
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <main style={{ flex: 1, padding: '80px 100px', maxWidth: '1440px', width: '100%', boxSizing: 'border-box' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            textAlign: 'center',
            color: colors.headings,
            marginBottom: '64px',
            letterSpacing: '-1px'
          }}>
            See what Name_app generates
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {cards.map((card, index) => (
              <div key={index} style={{
                backgroundColor: 'transparent',
                border: `1.5px solid ${colors.border}`,
                borderRadius: '24px',
                padding: '24px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '18px', color: colors.headings }}>{card.title}</span>
                  <span style={{
                    backgroundColor: colors.headings,
                    color: colors.white,
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '6px'
                  }}>
                    {card.tag}
                  </span>
                </div>

                <div style={{
                  backgroundColor: '#1E2501',
                  borderRadius: '50px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#B2E24D',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1E2501">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <svg viewBox="0 0 200 40" fill="none" stroke="#B2E24D" strokeWidth="2.5" strokeLinecap="round" style={{ width: '100%', height: '24px' }}>
                    <path d="M10 20v0 M20 12v16 M30 15v10 M40 8v24 M50 18v4 M60 5v30 M70 14v12 M80 10v20 M90 16v8 M100 7v26 M110 12v16 M120 15v10 M130 8v24 M140 18v4 M150 5v30 M160 14v12 M170 10v20 M180 16v8 M190 20v0" />
                  </svg>
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText, fontWeight: '600' }}>
                  {card.subtitle}
                </p>
              </div>
            ))}
          </div>
        </main>
      </section>

      {/* 3. SITE FOOTER SECTION */}
      <section style={{ 
        backgroundColor:'#F3FAF1', 
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <footer style={{
          borderTop: `2px solid ${colors.primaryAccent}`,
          padding: '64px 100px 32px 100px',
          maxWidth: '1440px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '64px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
              <div style={{ width: '130px', height: '36px', backgroundColor: '#D9D9D9', borderRadius: '4px' }}></div>
              <p style={{ fontSize: '15px', color: colors.primaryAccent, fontWeight: '600', margin: 0, marginTop: '8px' }}>
                Ads people actually want to hear.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#D9D9D9' }}></div>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#D9D9D9' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '100px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontWeight: '700', color: colors.primaryAccent, fontSize: '15px' }}>Product</span>
                <span style={{ fontSize: '15px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Features</span>
                <span style={{ fontSize: '15px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Pricing</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontWeight: '700', color: colors.primaryAccent, fontSize: '15px' }}>Company</span>
                <span style={{ fontSize: '15px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>About</span>
                <span style={{ fontSize: '15px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Blog</span>
                <span style={{ fontSize: '15px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Careers</span>
                <span style={{ fontSize: '15px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Contact</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontWeight: '700', color: colors.primaryAccent, fontSize: '15px' }}>Legal</span>
                <span style={{ fontSize: '15px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Privacy</span>
                <span style={{ fontSize: '15px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Terms</span>
                <span style={{ fontSize: '15px', color: colors.secondaryText, fontWeight: '500', cursor: 'pointer' }}>Cookie Policy</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E3ECE0', paddingTop: '24px', fontSize: '14px', color: colors.secondaryText, fontWeight: '500' }}>
            © 2026 Name Made for Hackiwha3.0
          </div>
        </footer>
      </section>

    </div>
  );
}