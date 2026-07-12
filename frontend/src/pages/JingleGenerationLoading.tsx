import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface JingleGenerationLoadingProps {
  onCancel: () => void;
  onComplete: () => void;
  /** Fires the real (slow) generation request. Resolves once the backend is done. */
  run: () => Promise<void>;
  onError: (message: string) => void;
  platformName?: string;
}

export default function JingleGenerationLoading({
  onCancel,
  onComplete,
  run,
  onError,
  platformName = 'TikTok'
}: JingleGenerationLoadingProps) {
  const [progress, setProgress] = useState(0);
  const cancelledRef = useRef(false);

  // Dynamic status text matching the design phases
  let statusText = 'Analyzing brand tone...';
  if (progress >= 90) {
    statusText = 'Mixing final track...';
  } else if (progress >= 55) {
    statusText = `Adapting for ${platformName}...`;
  } else if (progress >= 25) {
    statusText = 'Composing jingle...';
  }

  useEffect(() => {
    cancelledRef.current = false;

    // Creeps toward 90% while the real request is in flight (generation takes
    // 1-3 minutes on CPU) — the last 10% only fills once the call resolves.
    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 2));
    }, 1200);

    run()
      .then(() => {
        if (cancelledRef.current) return;
        clearInterval(progressTimer);
        setProgress(100);
        setTimeout(() => {
          if (!cancelledRef.current) onComplete();
        }, 400);
      })
      .catch((err) => {
        if (cancelledRef.current) return;
        clearInterval(progressTimer);
        onError(err instanceof Error ? err.message : 'generation failed');
      });

    return () => {
      cancelledRef.current = true;
      clearInterval(progressTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Audio equalizer bars matching heights from your design
  const bars = [32, 22, 16, 11, 8, 11, 16, 22, 30];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#FCFBF6', // Design background canvas tint
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      {/* Dynamic Keyframes Injection for Sound wave animation */}
      <style>{`
        @keyframes dynamicWave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.55); }
        }
      `}</style>

      {/* AUDIO EQUALIZER GRADIENT BARS VISUALIZER */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        height: '140px',
        marginBottom: '28px'
      }}>
        {bars.map((barHeight, idx) => (
          <div
            key={idx}
            style={{
              width: '14px',
              height: `${barHeight * 3.5}px`, // Scaled projection matching screens
              background: 'linear-gradient(180deg, #B4D44D 0%, #337738 100%)',
              borderRadius: '20px',
              transformOrigin: 'bottom',
              animation: `dynamicWave 1.2s ease-in-out infinite alternate`,
              animationDelay: `${idx * 0.12}s`
            }}
          />
        ))}
      </div>

      {/* STEP PHASE LABEL */}
      <h2 style={{
        fontSize: '28px',
        fontWeight: '700',
        color: '#282900',
        margin: '0 0 16px 0',
        textAlign: 'center',
        letterSpacing: '-0.3px'
      }}>
        {statusText}
      </h2>

      {/* LARGE PERCENTAGE COUNTER TEXT */}
      <div style={{
        fontSize: '76px',
        fontWeight: '800',
        color: '#282900',
        lineHeight: '1',
        marginBottom: '36px',
        letterSpacing: '-1px'
      }}>
        {progress}%
      </div>

      {/* HORIZONTAL PROGRESS BAR TRACK */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        height: '10px',
        backgroundColor: '#E2E2DF',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '50px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #B4D44D 0%, #337738 100%)',
          borderRadius: '20px',
          transition: 'width 0.4s ease-out'
        }} />
      </div>

      {/* CANCEL GENERATION ACTION TRIGGER BUTTON */}
      <button
        onClick={() => {
          cancelledRef.current = true;
          onCancel();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#5C6B4D',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <X size={16} strokeWidth={2.5} />
        Cancel generation
      </button>
    </div>
  );
}
