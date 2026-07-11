import React from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. IMPORT THIS
import { LayoutDashboard, SquarePlus, Folder, Settings } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  colors 
}: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
  colors: any; 
}) => {
  const navigate = useNavigate(); // <-- 2. INITIALIZE THIS
  const { logout } = useAuth();

   const navItems: { id: string; label: string; icon: any; path: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'new-jingle', label: 'New jingel', icon: SquarePlus, path: '/NewJingle1' },
    { id: 'library', label: 'Library', icon: Folder, path: '/Library' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/Settings' },
  ];

  return (
    <aside style={{ 
      width: '228px', 
      padding: '40px 24px', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between', 
      flexShrink: 0, 
      boxSizing: 'border-box',
      backgroundColor: colors.backgroundLightMode,
      borderRight: `1px solid ${colors.color}`,
      minHeight: '100vh'
    }}>
      <div>
        {/* Logo Container */}
        <div style={{ width: '135px', height: '44px', backgroundColor: colors.primaryAccent, borderRadius: '14px', marginBottom: '40px' }}></div>
        
        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id); // Maintains active visual state
                  navigate(item.path);   // <-- 4. TRIGGER ROUTER TRANSITION HERE
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '14px 20px', 
                  backgroundColor: isActive ? colors.cardBackgroundsMint : 'transparent', 
                  color: isActive ? colors.primaryAccent : colors.headings, 
                  borderRadius: '16px', 
                  fontWeight: '700', 
                  fontSize: '16px', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={20} strokeWidth={2.2} />
                {item.label}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Meter Panel */}
      <div>
        <div style={{ border: `1px solid ${colors.color}`, backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px 18px', marginBottom: '16px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: colors.headings }}>
            <span>Usage</span>
            <span style={{ color: colors.primaryAccent }}>2/5</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: colors.backgroundLightMode, borderRadius: '4px' }}>
            <div style={{ width: '40%', height: '100%', backgroundColor: colors.primaryAccent, borderRadius: '4px' }}></div>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/login'); }} // <-- 5. ALSO REDIRECTS LOGOUT
          style={{ width: '100%', border: `1px solid ${colors.dangerRed}`, backgroundColor: '#FFFFFF', color: colors.dangerRed, borderRadius: '12px', padding: '14px 0', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>
    </aside>
  );
};