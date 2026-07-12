import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import '../App.css';
import { useAuth } from '../lib/AuthContext';
import * as api from '../lib/api';
import type { DashboardSummary, UserOut } from '../lib/api';
import {
  Search,
  Moon,
  Sun,
  Bell,
  User as UserIcon,
  Gauge,
  KeyRound,
  ShieldAlert,
  Trash2,
  Mail,
  Calendar,
} from 'lucide-react';

export default function Settings() {
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
    primaryAccentlight: 'color-mix(in srgb, #337738 14%, transparent)',
    dangerRed: '#D9383A',
    dangerRedlight: 'color-mix(in srgb, #D9383A 10%, transparent)',
  };

  const [activeTab, setActiveTab] = React.useState('settings');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [user, setUser] = React.useState<UserOut | null>(null);
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [resetSent, setResetSent] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetError, setResetError] = React.useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState('');
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([api.me(), api.dashboardSummary()])
      .then(([userRes, summaryRes]) => {
        if (cancelled) return;
        setUser(userRes);
        setSummary(summaryRes);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'failed to load settings'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const handleSendResetEmail = async () => {
    if (!user) return;
    setResetLoading(true);
    setResetError(null);
    try {
      await api.forgotPassword(user.email);
      setResetSent(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.deleteAccount(deletePassword);
      await logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const initials = (user?.name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const usagePct = summary && summary.jingle_quota > 0
    ? Math.min(100, (summary.jingles_used / summary.jingle_quota) * 100)
    : 0;

  const sectionCardStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    border: '1px solid ' + colors.border,
    borderRadius: '20px',
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const iconBadgeStyle = (bg: string, fg: string): React.CSSProperties => ({
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    backgroundColor: bg,
    color: fg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid ' + colors.backgroundLightMode,
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.white,
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#111111',
    }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />

      <main style={{
        flexGrow: 1,
        padding: '24px 24px 0 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100vh',
      }}>
        {/* TOP BAR — matches Dashboard for visual consistency */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.backgroundLightMode, borderRadius: '40px', padding: '12px 28px', border: '1px solid ' + colors.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '50%' }}>
            <Search size={18} color={colors.headings} strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search settings"
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '15px', color: colors.headings, fontWeight: '500' }}
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

        {/* MAIN PANEL */}
        <div style={{
          flexGrow: 1,
          backgroundColor: colors.backgroundLightMode,
          border: '1px solid ' + colors.border,
          borderBottom: 'none',
          borderRadius: '36px 36px 0 0',
          padding: '40px 44px 24px 44px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: colors.primaryAccent,
              color: colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '700',
              flexShrink: 0,
            }}>
              {loading ? '' : initials}
            </div>
            <div>
              <h1 style={{ fontSize: '32px', color: colors.headings, margin: '0 0 4px 0', fontWeight: '700', letterSpacing: '-0.5px' }}>
                {loading ? 'Settings' : (user?.name || 'Settings')}
              </h1>
              <p style={{ fontSize: '16px', color: colors.secondaryText, margin: 0, fontWeight: '500' }}>
                Manage your account and subscription.
              </p>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FDEDED', border: '1px solid #D9383A', color: '#D9383A', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontWeight: '600' }}>
              {error}
            </div>
          )}

          {loading ? (
            <p style={{ color: colors.secondaryText }}>Loading...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', maxWidth: '980px' }}>
              <div style={sectionCardStyle}>
                <div style={sectionHeaderStyle}>
                  <div style={iconBadgeStyle(colors.primaryAccentlight, colors.primaryAccent)}>
                    <UserIcon size={19} strokeWidth={2.3} />
                  </div>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', color: colors.headings, margin: 0 }}>Account</h2>
                </div>
                <div>
                  <div style={rowStyle}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.secondaryText, fontWeight: '600', fontSize: '14px' }}>
                      <Mail size={15} /> Email
                    </span>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{user?.email}</span>
                  </div>
                  <div style={{ ...rowStyle, borderBottom: 'none' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.secondaryText, fontWeight: '600', fontSize: '14px' }}>
                      <Calendar size={15} /> Member since
                    </span>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>
                      {user ? new Date(user.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div style={sectionCardStyle}>
                <div style={sectionHeaderStyle}>
                  <div style={iconBadgeStyle(colors.primaryAccentlight, colors.primaryAccent)}>
                    <Gauge size={19} strokeWidth={2.3} />
                  </div>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', color: colors.headings, margin: 0 }}>Usage</h2>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <span style={{ color: colors.secondaryText, fontWeight: '600', fontSize: '14px' }}>Jingles this period</span>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: colors.primaryAccent }}>
                      {summary?.jingles_used} / {summary?.jingle_quota}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: colors.backgroundLightMode, borderRadius: '4px', marginBottom: '20px' }}>
                    <div style={{ width: `${usagePct}%`, height: '100%', backgroundColor: colors.primaryAccent, borderRadius: '4px', transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ ...rowStyle, borderBottom: 'none' }}>
                    <span style={{ color: colors.secondaryText, fontWeight: '600', fontSize: '14px' }}>Total jingles created</span>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{summary?.total_generated_jingles}</span>
                  </div>
                </div>
              </div>

              <div style={sectionCardStyle}>
                <div style={sectionHeaderStyle}>
                  <div style={iconBadgeStyle(colors.primaryAccentlight, colors.primaryAccent)}>
                    <KeyRound size={19} strokeWidth={2.3} />
                  </div>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', color: colors.headings, margin: 0 }}>Password</h2>
                </div>
                <p style={{ color: colors.secondaryText, fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                  We'll send a secure password reset link to <strong>{user?.email}</strong>.
                </p>
                {resetError && <p style={{ color: colors.dangerRed, fontSize: '14px', margin: 0, fontWeight: '600' }}>{resetError}</p>}
                {resetSent ? (
                  <div style={{
                    backgroundColor: colors.primaryAccentlight,
                    color: colors.primaryAccent,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}>
                    Reset email sent — check your inbox.
                  </div>
                ) : (
                  <button
                    onClick={handleSendResetEmail}
                    disabled={resetLoading}
                    style={{
                      alignSelf: 'flex-start',
                      border: 'none',
                      backgroundColor: colors.primaryAccent,
                      color: colors.white,
                      borderRadius: '12px',
                      padding: '12px 22px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: resetLoading ? 'default' : 'pointer',
                      opacity: resetLoading ? 0.6 : 1,
                      boxShadow: '0px 2px 6px rgba(51,119,56,0.25)',
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    {resetLoading ? 'Sending…' : 'Send reset email'}
                  </button>
                )}
              </div>

              <div style={{ ...sectionCardStyle, borderColor: colors.dangerRed }}>
                <div style={sectionHeaderStyle}>
                  <div style={iconBadgeStyle(colors.dangerRedlight, colors.dangerRed)}>
                    <ShieldAlert size={19} strokeWidth={2.3} />
                  </div>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', color: colors.dangerRed, margin: 0 }}>Danger zone</h2>
                </div>
                <p style={{ color: colors.secondaryText, fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                  Permanently delete your account and all your jingles. This cannot be undone.
                </p>
                {deleteError && <p style={{ color: colors.dangerRed, fontSize: '14px', margin: 0, fontWeight: '600' }}>{deleteError}</p>}
                {!deleteOpen ? (
                  <button
                    onClick={() => setDeleteOpen(true)}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid ' + colors.dangerRed,
                      backgroundColor: colors.white,
                      color: colors.dangerRed,
                      borderRadius: '12px',
                      padding: '12px 22px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} strokeWidth={2.3} /> Delete account
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: colors.headings }}>
                      Confirm your password to permanently delete your account
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Password"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid ' + colors.border,
                        outline: 'none',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading || !deletePassword}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: 'none',
                          backgroundColor: colors.dangerRed,
                          color: colors.white,
                          borderRadius: '12px',
                          padding: '12px 22px',
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: deleteLoading || !deletePassword ? 'default' : 'pointer',
                          opacity: deleteLoading || !deletePassword ? 0.6 : 1,
                        }}
                      >
                        <Trash2 size={16} strokeWidth={2.3} /> {deleteLoading ? 'Deleting…' : 'Permanently delete'}
                      </button>
                      <button
                        onClick={() => { setDeleteOpen(false); setDeletePassword(''); setDeleteError(null); }}
                        style={{
                          border: '1px solid ' + colors.border,
                          backgroundColor: colors.white,
                          color: colors.headings,
                          borderRadius: '12px',
                          padding: '12px 22px',
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
