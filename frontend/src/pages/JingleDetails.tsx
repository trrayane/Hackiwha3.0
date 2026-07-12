import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import '../App.css';
import * as api from '../lib/api';
import type { JingleOut, GenerationRequestOut, GeneratedVariantOut } from '../lib/api';
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  Play,
  Pause,
  Download
} from 'lucide-react';

interface JingleDetailsProps {
  jingleId: string;
  onBack: () => void;
}

interface VersionEntry {
  id: string;
  label: string;
  timestamp: string;
  variant: GeneratedVariantOut;
}

export default function JingleDetails({ jingleId, onBack }: JingleDetailsProps) {
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

  const [activeTab, setActiveTab] = useState('library');
  const [isPlayingMain, setIsPlayingMain] = useState(false);
  const [playingVersionId, setPlayingVersionId] = useState<string | null>(null);

  const [jingle, setJingle] = useState<JingleOut | null>(null);
  const [generations, setGenerations] = useState<GenerationRequestOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.getJingle(jingleId), api.listGenerations(jingleId)])
      .then(([jingleRes, generationsRes]) => {
        if (cancelled) return;
        setJingle(jingleRes);
        setGenerations(generationsRes);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'failed to load jingle');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jingleId]);

  const versions: VersionEntry[] = generations
    .flatMap((g) => g.variants.map((v) => ({ generation: g, variant: v })))
    .sort((a, b) => new Date(b.variant.created_at).getTime() - new Date(a.variant.created_at).getTime())
    .map((entry, idx, arr) => ({
      id: entry.variant.id,
      label: `V${arr.length - idx} - ${idx === 0 ? 'Latest' : ''}`.trim(),
      timestamp: new Date(entry.variant.created_at).toLocaleString(),
      variant: entry.variant,
    }));

  const mainVariant = versions[0]?.variant ?? null;

  const waveformBars = [
    6, 12, 18, 10, 14, 22, 16, 24, 12, 18, 20, 14, 26, 10, 16, 22, 14, 20, 24, 12,
    18, 14, 22, 26, 16, 20, 24, 12, 18, 10, 22, 16, 24, 12, 18, 20, 14, 26, 10, 16,
    22, 14, 20, 24, 12, 18, 14, 22, 26, 16, 20, 24, 12, 18, 10, 22, 16, 24, 12, 18,
    20, 14, 26, 10, 16, 22, 14, 20, 24, 12, 18, 14, 22, 26, 16, 20, 24, 12, 18, 10
  ];

  const playVariant = (variant: GeneratedVariantOut | null, versionId: string | null) => {
    if (!variant?.audio_url) return;
    if (!audioRef.current) audioRef.current = new Audio();
    if (versionId === null) {
      if (isPlayingMain) {
        audioRef.current.pause();
        setIsPlayingMain(false);
        return;
      }
      audioRef.current.src = variant.audio_url;
      audioRef.current.play().catch(() => {});
      setIsPlayingMain(true);
      setPlayingVersionId(null);
    } else {
      if (playingVersionId === versionId) {
        audioRef.current.pause();
        setPlayingVersionId(null);
        return;
      }
      audioRef.current.src = variant.audio_url;
      audioRef.current.play().catch(() => {});
      setPlayingVersionId(versionId);
      setIsPlayingMain(false);
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
            <ArrowLeft size={22} color={colors.headings} strokeWidth={2.5} />
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

        {/* MAIN DISPLAY CONTAINER */}
        <div style={{
          flexGrow: 1,
          backgroundColor: colors.backgroundLightMode,
          border: '1px solid ' + colors.border,
          borderBottom: 'none',
          borderRadius: '36px 36px 0 0',
          padding: '44px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>

          {error && (
            <div style={{ backgroundColor: '#FDEDED', border: '1px solid #D9383A', color: '#D9383A', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontWeight: '600' }}>
              {error}
            </div>
          )}

          {/* TITLE HEADER BLOCK */}
          <div style={{ marginBottom: '8px' }}>
            <h1 style={{ fontSize: '32px', color: colors.headings, margin: '0 0 6px 0', fontWeight: '700', letterSpacing: '-0.5px' }}>
              {loading ? 'Loading…' : jingle?.brand_name ?? 'Jingle'}
            </h1>
            <p style={{ fontSize: '18px', color: colors.secondaryText, margin: 0, fontWeight: '500' }}>
              {jingle ? `${jingle.brand_tone} - ${jingle.platform ?? '—'}` : ''}
            </p>
          </div>

          {/* LINE 1: AUDIO WAVEFORM CARD + FEEDBACK SCORE CARD (EQUAL HEIGHT) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'stretch' }}>

            {/* SLIM WAVE AUDIO CARD */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '20px 24px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <button
                  onClick={() => playVariant(mainVariant, null)}
                  disabled={!mainVariant}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: colors.primaryAccent,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.white,
                    cursor: mainVariant ? 'pointer' : 'default',
                    opacity: mainVariant ? 1 : 0.5
                  }}
                >
                  {isPlayingMain ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
                </button>

                {/* THIN DYNAMIC WAVEFORM LINES */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexGrow: 1, paddingRight: '24px' }}>
                  {waveformBars.map((bHeight, idx) => (
                    <div
                      key={idx}
                      style={{
                        flexGrow: 1,
                        maxWidth: '2px',
                        height: `${bHeight}px`,
                        backgroundColor: colors.primaryAccent,
                        borderRadius: '1px'
                      }}
                    />
                  ))}
                </div>
              </div>

              <a
                href={mainVariant?.audio_url ?? undefined}
                download
                onClick={(e) => { if (!mainVariant?.audio_url) e.preventDefault(); }}
                style={{
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  border: '1px solid #EAE9E4',
                  backgroundColor: colors.white,
                  color: colors.headings,
                  cursor: mainVariant?.audio_url ? 'pointer' : 'default',
                  opacity: mainVariant?.audio_url ? 1 : 0.5
                }}>
                <Download size={16} strokeWidth={2.2} />
              </a>
            </div>

            {/* FEEDBACK SCORE CARD */}
            <div style={{
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '20px 24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.headings, margin: '0 0 8px 0' }}>
                Feedback score
              </h3>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.primaryAccent }}>
                {jingle?.feedback_score != null ? `${jingle.feedback_score.toFixed(1)} / 5` : 'No feedback yet'}
              </div>
            </div>

          </div>

          {/* LINE 2: VERSIONS HISTORY CARD + METADATA CARD (EQUAL HEIGHT) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'stretch' }}>

            {/* VERSIONS TIMELINE WRAPPER BOX */}
            <div style={{
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '24px 28px',
              boxSizing: 'border-box'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.headings, margin: '0 0 20px 0' }}>
                Versions History
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {versions.length === 0 && !loading && (
                  <span style={{ fontSize: '14px', color: colors.secondaryText }}>No generated versions yet.</span>
                )}
                {versions.map((ver) => (
                  <div
                    key={ver.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #EAE9E4',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      backgroundColor: '#FCFBF9'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: colors.headings }}>{ver.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#7E7E7A' }}>{ver.timestamp}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button
                        onClick={() => playVariant(ver.variant, ver.id)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: colors.primaryAccent,
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.white,
                          cursor: 'pointer'
                        }}
                      >
                        {playingVersionId === ver.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: '1px' }} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* METADATA PARAMETERS */}
            <div style={{
              backgroundColor: colors.white,
              border: '1px solid #D5D5D1',
              borderRadius: '16px',
              padding: '24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.headings, margin: 0 }}>
                Metadata
              </h3>

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#7E7E7A', marginBottom: '4px' }}>Brand</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: colors.headings }}>{jingle?.brand_name ?? '—'}</div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#7E7E7A', marginBottom: '4px' }}>Created</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: colors.headings }}>
                  {jingle ? new Date(jingle.created_at).toLocaleDateString() : '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#7E7E7A', marginBottom: '8px' }}>Tone</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>
                    {jingle?.brand_tone ?? '—'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
