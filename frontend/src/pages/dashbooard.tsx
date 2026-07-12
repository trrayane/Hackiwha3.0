import React from 'react';
import { Sidebar } from '../components/Sidebar';
import '../App.css'; // Fixed relative path to step up into src/
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import * as api from '../lib/api';
import type { DashboardSummary, JingleOut } from '../lib/api';

import {
  Search,
  Moon,
  Sun,
  Bell,
  Activity,
  MessageSquare,
  Check
} from 'lucide-react';

const statusStyleMap: Record<string, string> = {
  approved: 'Approved',
  in_review: 'In Review',
  draft: 'Draft',
};

export default function Dashboard() {
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
    secondaryAccentlight: 'color-mix(in srgb, #B4D44D 14%, transparent)',
    borderLightMode: 'color-mix(in srgb, #6B6B80 14%, transparent)',
    dangerRed: '#D9383A',
  };

  const [activeTab, setActiveTab] = React.useState('dashboard');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [latestJingles, setLatestJingles] = React.useState<JingleOut[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.dashboardSummary(), api.listJingles(1, 5)])
      .then(([summaryRes, jinglesRes]) => {
        if (cancelled) return;
        setSummary(summaryRes);
        setLatestJingles(jinglesRes.items);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: colors.primaryAccentlight, color: colors.primaryAccent };
      case 'in_review':
        return { backgroundColor: colors.secondaryAccentlight, color: colors.secondaryAccent };
      default:
        return { backgroundColor: colors.borderLightMode, color: colors.secondaryText };
    }
  };

  const maxPlatformCount = summary ? Math.max(1, ...summary.top_platforms.map((p) => p.count)) : 1;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.white,
      // Applied Space Grotesk here
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#111111'
    }}>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />

      {/* WINDOW HUB LAYOUT CONTAINER */}
      <main style={{
  flexGrow: 1,
  padding: '24px 24px 0 24px', // Set bottom padding strictly to 0
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  height: '100vh' // Ensures the main track matches screen height
}}>
        {/* TOP SEARCH NAVBAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.backgroundLightMode, borderRadius: '40px', padding: '12px 28px', border: '1px solid ' + colors.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '50%' }}>
            <Search size={18} color={colors.headings} strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search for jungles"
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '15px', color: colors.headings, fontWeight: '500' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '95px', height: '51px', display: 'flex', backgroundColor: colors.primaryAccentlight, borderRadius: '40px', padding: '2px 4px', alignItems: 'center', gap: '4px', border: '1px solid ' + colors.border }}>
              <button style={{ border: 'none', backgroundColor: 'transparent', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Moon size={23} color={colors.primaryAccent} strokeWidth={2.2} />
              </button>
              <button style={{  width: '43px', height: '43px', border: 'none', backgroundColor: colors.white, borderRadius: '50%', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' }}>
                <Sun size={23} color={colors.headings} strokeWidth={2.2} />
              </button>
            </div>
            <div style={{ width: '51px', height: '51px', backgroundColor: colors.primaryAccentlight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EAE9E4', cursor: 'pointer' }}>
              <Bell size={23} color={colors.headings} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* MIDDLE BOX PANEL */}
        <div style={{
        flexGrow: 1,
        backgroundColor: colors.backgroundLightMode,
        border: '1px solid ' + colors.border,
          borderBottom: 'none', // Strips the bottom border line out entirely
        borderRadius: '36px 36px 0 0', // Keeps beautiful top rounded corners, flattens the bottom
        padding: '40px 44px 24px 44px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        boxSizing: 'border-box',
        overflowY: 'auto'
        }}>
          <div>
            <h1 style={{ fontSize: '36px', color: colors.headings, margin: '0 0 4px 0', fontWeight: '700', letterSpacing: '-0.5px' }}>
              Hello {user?.name?.split(' ')[0] ?? ''},
            </h1>
            <p style={{ fontSize: '18px', color: colors.secondaryText, margin: 0, fontWeight: '400' }}>Create sound your audience won't skip.</p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FDEDED', border: '1px solid #D9383A', color: '#D9383A', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontWeight: '600' }}>
              {error}
            </div>
          )}

          {/* SPLIT COLUMN LAYOUT ROW */}
          <div style={{ display: 'flex', gap: '36px', alignItems: 'flex-start' }}>

            {/* LEFT ROW WRAPPER: STATS & TABLE */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Stat Cards Matrix Grid */}
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { title: 'Jingles Created', value: summary?.total_generated_jingles ?? 0, bg: colors.cardBackgroundsLavender, color: colors.primaryAccent, icon: <Activity size={12} strokeWidth={2.5} /> },
                  { title: 'In Review', value: summary?.in_review_count ?? 0, bg: colors.cardBackgroundsPeach, color: colors.secondaryText, icon: <MessageSquare size={12} strokeWidth={2.5} /> },
                  { title: 'Approved', value: summary?.approved_count ?? 0, bg: colors.cardBackgroundsMint, color: colors.success, icon: <Check size={12} strokeWidth={3} /> }
                ].map((card, i) => (
                  <div key={i} style={{ backgroundColor: card.bg, borderRadius: '20px', padding: '20px', width: '100%', height: '115px', position: 'relative', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
                      <span style={{ fontSize: '14px', color: colors.headings, fontWeight: '600' }}>{card.title}</span>
                      <div style={{ width: '24px', height: '24px', backgroundColor: colors.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                        {card.icon}
                      </div>
                    </div>
                    <div style={{ fontSize: '34px', fontWeight: '700', zIndex: 2, color: colors.headings }}>{loading ? '…' : card.value}</div>

                    <div style={{ position: 'absolute', bottom: '0', right: '24px', display: 'flex', gap: '3px', alignItems: 'flex-end', opacity: 0.04 }}>
                      <div style={{ width: '10px', height: '16px', backgroundColor: colors.headings, borderRadius: '3px 3px 0 0' }}></div>
                      <div style={{ width: '10px', height: '36px', backgroundColor: colors.headings, borderRadius: '3px 3px 0 0' }}></div>
                      <div style={{ width: '10px', height: '24px', backgroundColor: colors.headings, borderRadius: '3px 3px 0 0' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* LATEST JINGLES TABLE CONTAINER CARD */}
              <div style={{ backgroundColor: colors.white, border: '1px solid ' + colors.border, borderRadius: '24px', overflow: 'hidden', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', padding: '24px 28px 16px 28px' }}>
                  Latest Jingles
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderTop: '1px solid ' + colors.border, borderBottom: '1px solid ' + colors.border }}>
                      <th style={{ padding: '14px 28px', fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>Jingle</th>
                      <th style={{ padding: '14px 16px', fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>Platform</th>
                      <th style={{ padding: '14px 16px', fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>Feedback</th>
                      <th style={{ padding: '14px 16px', fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>Status</th>
                      <th style={{ padding: '14px 28px', fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && latestJingles.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '24px 28px', fontSize: '14px', color: colors.secondaryText }}>
                          No jingles yet — create your first one!
                        </td>
                      </tr>
                    )}
                    {latestJingles.map((jingle) => {
                      const style = getStatusStyle(jingle.status);
                      return (
                        <tr key={jingle.id} onClick={() => navigate('/Library')} style={{ borderBottom: '1px solid ' + colors.border, cursor: 'pointer' }}>
                          <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: '700' }}>{jingle.brand_name}</td>
                          <td style={{ padding: '18px 16px', fontSize: '14px', color: colors.secondaryText, fontWeight: '500' }}>{jingle.platform ?? '—'}</td>
                          <td style={{ padding: '18px 16px', fontSize: '14px', fontWeight: '700' }}>{jingle.feedback_score?.toFixed(1) ?? '—'}</td>
                          <td style={{ padding: '18px 16px' }}>
                            <span style={{ backgroundColor: style.backgroundColor, color: style.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                              {statusStyleMap[jingle.status] ?? jingle.status}
                            </span>
                          </td>
                          <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: '700' }}>{new Date(jingle.updated_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ textAlign: 'center', padding: '20px 0 24px 0' }}>
                  <a href="#view" onClick={(e) => { e.preventDefault(); navigate('/Library'); }} style={{ fontSize: '14px', color: colors.primaryAccent, fontWeight: '700', textDecoration: 'none' }}>
                    View all generated sounds
                  </a>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN WRAPPER: CHARTS PANELS */}
            <div style={{ width: '310px', display: 'flex', flexDirection: 'column', gap: '32px', flexShrink: 0 }}>

              {/* Radial Usage Card */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid ' + colors.border, borderRadius: '24px', padding: '28px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Your Usage</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '12px solid ' + colors.border, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxSizing: 'border-box' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{summary?.jingles_used ?? 0}</div>
                      <div style={{ fontSize: '11px', color: colors.secondaryText, fontWeight: '500' }}>Of {summary?.jingle_quota ?? 0} jingles</div>
                    </div>
                  </div>
                </div>
                <button style={{ width: '100%', backgroundColor: colors.primaryAccent, color: colors.white, border: 'none', borderRadius: '12px', padding: '14px 0', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
                  Increase Limit
                </button>
              </div>

              {/* Top Platforms Metrics */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid ' + colors.border, borderRadius: '24px', padding: '28px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Top Platforms</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(summary?.top_platforms ?? []).length === 0 && (
                    <span style={{ fontSize: '13px', color: colors.secondaryText }}>No data yet</span>
                  )}
                  {(summary?.top_platforms ?? []).map((p, i) => (
                    <div key={p.platform} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '90px', fontSize: '13px', color: colors.secondaryText, fontWeight: '600' }}>{p.platform}</span>
                      <div style={{ flexGrow: 1, height: '12px', backgroundColor: '#FAF9F5', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(6, (p.count / maxPlatformCount) * 100)}%`, height: '100%', backgroundColor: i === 0 ? colors.primaryAccent : i === 1 ? colors.secondaryAccent : colors.success, borderRadius: '6px' }}></div>
                      </div>
                    </div>
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
