'use client';
import { useState, useEffect, useRef } from 'react';

const PRESETS = [
  { label: '25 min', seconds: 25 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '10 min', seconds: 10 * 60 },
];

export default function StudyTimer() {
  const [open, setOpen]           = useState(false);
  const [preset, setPreset]       = useState(PRESETS[0]);
  const [remaining, setRemaining] = useState(PRESETS[0].seconds);
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            setDone(true);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function reset(p = preset) {
    setRunning(false);
    setDone(false);
    setRemaining(p.seconds);
  }

  function selectPreset(p: typeof PRESETS[0]) {
    setPreset(p);
    reset(p);
  }

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  const progress = 1 - remaining / preset.seconds;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 30 }}>
      {open ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 24px', minWidth: 200,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: done ? 'emberPulse 1s ease-in-out infinite' : 'none',
        }}>
          {/* Close */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Study Timer
            </span>
            <button type="button" onClick={() => { setOpen(false); reset(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>×</button>
          </div>

          {/* Clock face */}
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300,
              color: done ? 'var(--ember)' : 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              {mins}:{secs}
            </span>
            {done && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ember)', marginTop: 6 }}>
                Break time! 🔥 You earned it.
              </p>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress * 100}%`,
              background: done ? 'var(--ember)' : 'linear-gradient(90deg, #FF5B1D, #ef4444)',
              borderRadius: 3, transition: 'width 1s linear',
            }} />
          </div>

          {/* Preset selector */}
          {!running && !done && (
            <div style={{ display: 'flex', gap: 4 }}>
              {PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => selectPreset(p)}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: preset.label === p.label ? 600 : 400,
                    background: preset.label === p.label ? 'var(--ember-dim)' : 'var(--surface-2)',
                    color: preset.label === p.label ? 'var(--ember)' : 'var(--text-muted)',
                  }}
                >{p.label}</button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: 8 }}>
            {done ? (
              <button type="button" onClick={() => reset()}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #FF5B1D, #E0420A)',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#fff',
                }}>Start again</button>
            ) : (
              <>
                <button type="button" onClick={() => setRunning((r) => !r)}
                  style={{
                    flex: 2, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: running ? 'var(--surface-3)' : 'linear-gradient(135deg, #FF5B1D, #E0420A)',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    color: running ? 'var(--text-secondary)' : '#fff',
                  }}>{running ? 'Pause' : 'Start'}</button>
                <button type="button" onClick={() => reset()}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)',
                  }}>Reset</button>
              </>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Study timer"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--surface)', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >⏱</button>
      )}
    </div>
  );
}
