
# KINDLING_REDESIGN.md
# Complete Frontend Gut & Redesign — "Ember" Aesthetic
# Agent: Execute ALL steps in order. This replaces the entire frontend.
# Do NOT touch: src/app/api/, src/lib/prompts.ts, src/lib/types.ts

---

## DESIGN DIRECTION

"Ember" — dark editorial luxury.
- Near-black warm canvas, ember orange as a single precise accent
- Display font: Fraunces (variable optical serif) + Outfit (geometric sans)
- Premium dark glass cards, hairline borders, no white surfaces
- Pill-shaped interactive elements, subtle glows on hover
- CSS keyframe stagger animations on hero load
- Feels like it came from a Figma file, not a template

---

## STEP 1 — Install Google Fonts in layout.tsx

Fully replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Kindling — Ignite the way you learn.',
  description:
    'Drop in any YouTube video, PDF, or article. Kindling turns it into flashcards, summaries, Q&A, or a flow diagram — instantly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

## STEP 2 — Replace globals.css entirely

Fully replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Design tokens ─────────────────────────────────────── */
:root {
  --canvas:       #0E0C0B;
  --surface:      #161210;
  --surface-2:    #1E1A17;
  --surface-3:    #272018;
  --border:       rgba(255,255,255,0.07);
  --border-hover: rgba(255, 91, 29, 0.35);
  --ember:        #FF5B1D;
  --ember-dim:    rgba(255, 91, 29, 0.15);
  --ember-glow:   rgba(255, 91, 29, 0.08);
  --text-primary: #F5F0EB;
  --text-secondary: #9E9086;
  --text-muted:   #5C5148;
  --font-display: var(--font-display);
  --font-body:    var(--font-body);
}

/* ── Base reset ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  background-color: var(--canvas);
  color: var(--text-primary);
  font-family: var(--font-body), 'Outfit', system-ui, sans-serif;
  min-height: 100svh;
  overflow-x: hidden;
}

/* ── Subtle noise grain overlay ─────────────────────────── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
  opacity: 0.028;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}

/* ── Ember radial ambient light ─────────────────────────── */
body::after {
  content: '';
  position: fixed;
  top: -20vh;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  height: 60vh;
  background: radial-gradient(ellipse at 50% 0%, rgba(255, 91, 29, 0.06) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
}

/* ── Selection ───────────────────────────────────────────── */
::selection { background: var(--ember); color: #fff; }

/* ── Scrollbar ───────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 4px; }

/* ── Hero word-stagger animation ─────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.word-reveal {
  display: inline-block;
  opacity: 0;
  animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* ── Ember pulse on submit button ─────────────────────────── */
@keyframes emberPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,91,29,0.35); }
  50%       { box-shadow: 0 0 0 8px rgba(255,91,29,0); }
}
.btn-ember-idle { animation: emberPulse 2.8s ease-in-out infinite; }

/* ── Format tab indicator slide ──────────────────────────── */
@keyframes slideIn {
  from { opacity: 0; transform: scaleX(0.6); }
  to   { opacity: 1; transform: scaleX(1); }
}
.tab-indicator { animation: slideIn 0.2s ease forwards; }

/* ── Spinner ─────────────────────────────────────────────── */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 0.8s linear infinite; }

/* ── Card flip ───────────────────────────────────────────── */
.flip-container { perspective: 1200px; }
.flip-card {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.flip-card.flipped { transform: rotateY(180deg); }
.flip-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.flip-back { transform: rotateY(180deg); }
```

---

## STEP 3 — Rebuild Header component

Fully replace `src/components/Header.tsx`:

```tsx
export default function Header() {
  return (
    <header
      style={{ position: 'relative', zIndex: 10 }}
      className="flex items-center justify-between px-6 py-5 md:px-12"
    >
      {/* Logo lockup */}
      <div className="flex items-center gap-3">
        {/* Flame SVG */}
        <svg width="28" height="34" viewBox="0 0 28 34" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="hfg1" x1="14" y1="2" x2="14" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#ef4444" />
              <stop offset="55%"  stopColor="#FF5B1D" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="hfg2" x1="14" y1="12" x2="14" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          <path d="M14 2C14 2 5 11 5 19.5a9 9 0 0018 0C23 14 20 9.5 17.5 6 16.5 12 15 14.5 14 14.5c-1 0-3-3-3-8.5z" fill="url(#hfg1)"/>
          <path d="M14 13c0 0-4 4.5-4 7.5a4 4 0 008 0c0-2-1.5-4-1.5-4s-.5 2-2 2.5c0 0 1-3-0.5-6z" fill="url(#hfg2)" opacity="0.9"/>
          <ellipse cx="14" cy="23.5" rx="2.2" ry="2.8" fill="#FEF9C3" opacity="0.85"/>
        </svg>
        <span
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
          className="text-xl tracking-tight"
          aria-label="Kindling"
        >
          <span style={{ color: 'var(--text-primary)' }}>kind</span>
          <span style={{ color: 'var(--ember)' }}>ling</span>
        </span>
      </div>

      {/* Tagline pill */}
      <span
        className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
        style={{
          background: 'var(--ember-dim)',
          color: 'var(--ember)',
          border: '1px solid var(--border-hover)',
          fontFamily: 'var(--font-body)',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ember)', display: 'inline-block' }} />
        Ignite the way you learn.
      </span>
    </header>
  );
}
```

---

## STEP 4 — Rebuild MicroModeToggle

Fully replace `src/components/MicroModeToggle.tsx`:

```tsx
'use client';

interface Props {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export default function MicroModeToggle({ enabled, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-3 group"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      {/* Track */}
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: 44,
          height: 24,
          borderRadius: 12,
          background: enabled ? 'var(--ember)' : 'var(--surface-3)',
          border: enabled ? '1px solid var(--ember)' : '1px solid var(--border)',
          transition: 'background 0.2s, border-color 0.2s',
          flexShrink: 0,
          boxShadow: enabled ? '0 0 10px rgba(255,91,29,0.25)' : 'none',
        }}
      >
        {/* Knob */}
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: enabled ? 22 : 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </span>
      {/* Label */}
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 500,
          color: enabled ? 'var(--ember)' : 'var(--text-secondary)',
          transition: 'color 0.2s',
          letterSpacing: '0.02em',
        }}
      >
        ✂️ Micro Mode
      </span>
    </button>
  );
}
```

---

## STEP 5 — Rebuild InputForm

Fully replace `src/components/InputForm.tsx`:

```tsx
'use client';

import { useState, useRef } from 'react';
import MicroModeToggle from './MicroModeToggle';

type Format = 'flashcards' | 'summary' | 'qa' | 'flowdiagram';

interface InputFormProps {
  onSubmit: (data: { url: string; file: File | null; format: Format; microMode: boolean }) => void;
  loading: boolean;
}

const FORMATS: { id: Format; label: string; icon: string }[] = [
  { id: 'flashcards',  label: 'Flashcards',   icon: '🃏' },
  { id: 'summary',     label: 'Summary',      icon: '📝' },
  { id: 'qa',          label: 'Q&A',          icon: '💬' },
  { id: 'flowdiagram', label: 'Flow Diagram', icon: '🔀' },
];

const borderStyle = '1px solid var(--border)';

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [url, setUrl]         = useState('');
  const [file, setFile]       = useState<File | null>(null);
  const [format, setFormat]   = useState<Format>('flashcards');
  const [micro, setMicro]     = useState(false);
  const [urlFocus, setUrlFocus] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSubmit = (url.trim() !== '' || file !== null) && !loading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── URL input ──────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Paste a link
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--surface-2)',
            border: urlFocus ? '1px solid var(--ember)' : borderStyle,
            borderRadius: 12,
            padding: '0 16px',
            transition: 'border-color 0.2s',
            boxShadow: urlFocus ? '0 0 0 3px var(--ember-glow)' : 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
            style={{ flexShrink: 0, color: urlFocus ? 'var(--ember)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="url"
            placeholder="YouTube, article, or any webpage URL…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setUrlFocus(true)}
            onBlur={() => setUrlFocus(false)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--text-primary)',
              padding: '14px 0',
            }}
          />
        </div>
      </div>

      {/* ── OR divider ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>or upload a PDF</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* ── PDF drop zone ──────────────────────────────── */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '24px 20px',
          background: file ? 'var(--ember-dim)' : 'var(--surface-2)',
          border: file ? '1px solid var(--ember)' : '1px dashed var(--border)',
          borderRadius: 12,
          cursor: 'pointer',
          transition: 'all 0.2s',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          if (!file) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,91,29,0.3)';
        }}
        onMouseLeave={(e) => {
          if (!file) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
        }}
      >
        {file ? (
          <>
            <span style={{ fontSize: 20 }}>📄</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ember)', fontWeight: 500 }}>
              {file.name}
            </span>
            <span
              style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              Remove ×
            </span>
          </>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"
              style={{ color: 'var(--text-muted)' }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
              Click to upload PDF
            </span>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </button>

      {/* ── Format selector — horizontal pill tabs ─────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>Output format</label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            background: 'var(--surface-2)',
            padding: 5,
            borderRadius: 12,
            border: borderStyle,
          }}
        >
          {FORMATS.map((f) => {
            const active = format === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 6px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  background: active ? 'var(--surface-3)' : 'transparent',
                  boxShadow: active ? '0 0 0 1px var(--border-hover), 0 2px 8px rgba(255,91,29,0.1)' : 'none',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{f.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--ember)' : 'var(--text-secondary)',
                  transition: 'color 0.18s',
                  whiteSpace: 'nowrap',
                }}>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom row — toggle + submit ───────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
        <MicroModeToggle enabled={micro} onChange={setMicro} />
        <button
          type="button"
          onClick={() => onSubmit({ url, file, format, microMode: micro })}
          disabled={!canSubmit}
          className={canSubmit && !loading ? 'btn-ember-idle' : ''}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 24px',
            borderRadius: 100,
            border: 'none',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: canSubmit ? '#fff' : 'var(--text-muted)',
            background: canSubmit
              ? 'linear-gradient(135deg, #FF5B1D 0%, #E0420A 100%)'
              : 'var(--surface-3)',
            transition: 'transform 0.15s, opacity 0.15s',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (canSubmit) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          {loading ? (
            <>
              <span
                className="spinner"
                style={{
                  width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                }}
              />
              Kindling…
            </>
          ) : (
            <>Ignite ✦</>
          )}
        </button>
      </div>
    </div>
  );
}
```

---

## STEP 6 — Rebuild FlashcardDeck

Fully replace `src/components/FlashcardDeck.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { Flashcard } from '@/lib/types';

export default function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex]     = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!cards.length) return null;
  const card = cards[index];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Card {index + 1} <span style={{ color: 'var(--border)' }}>/</span> {cards.length}
        </span>
        {/* Progress bar */}
        <div style={{ width: 120, height: 3, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${((index + 1) / cards.length) * 100}%`,
            background: 'var(--ember)',
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Card */}
      <div className="flip-container" style={{ minHeight: 220 }}>
        <div
          className={`flip-card${flipped ? ' flipped' : ''}`}
          style={{ position: 'relative', minHeight: 220 }}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front */}
          <div
            className="flip-face"
            style={{
              position: flipped ? 'absolute' : 'relative',
              inset: 0,
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 32px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ember)',
              marginBottom: 16,
            }}>Question</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {card.front}
            </p>
            <span style={{ marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
              Tap to reveal
            </span>
          </div>

          {/* Back */}
          <div
            className="flip-face flip-back"
            style={{
              position: 'absolute',
              inset: 0,
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 32px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-hover)',
              borderRadius: 16,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ember)',
              marginBottom: 16,
            }}>Answer</span>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => { setIndex(Math.max(0, index - 1)); setFlipped(false); }}
          disabled={index === 0}
          style={{
            flex: 1, padding: '12px 0', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            color: index === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
            cursor: index === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
          }}
        >← Prev</button>
        <button
          type="button"
          onClick={() => { setIndex(Math.min(cards.length - 1, index + 1)); setFlipped(false); }}
          disabled={index === cards.length - 1}
          style={{
            flex: 1, padding: '12px 0', borderRadius: 10,
            background: index === cards.length - 1 ? 'var(--surface-2)' : 'var(--ember)',
            border: '1px solid transparent',
            color: index === cards.length - 1 ? 'var(--text-muted)' : '#fff',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            cursor: index === cards.length - 1 ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
          }}
        >Next →</button>
      </div>
    </div>
  );
}
```

---

## STEP 7 — Rebuild SummaryView

Fully replace `src/components/SummaryView.tsx`:

```tsx
import { SummaryChunk } from '@/lib/types';

export default function SummaryView({ chunks }: { chunks: SummaryChunk[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {chunks.map((chunk, i) => (
        <article
          key={i}
          style={{
            padding: '20px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,91,29,0.2)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--ember-dim)', border: '1px solid var(--border-hover)',
              fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'var(--ember)',
            }}>{i + 1}</span>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 400, fontStyle: 'italic',
              color: 'var(--text-primary)', letterSpacing: 0,
            }}>{chunk.heading}</h3>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {chunk.body}
          </p>
        </article>
      ))}
    </div>
  );
}
```

---

## STEP 8 — Rebuild QAChat

Fully replace `src/components/QAChat.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { QAItem } from '@/lib/types';

export default function QAChat({ items }: { items: QAItem[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setRevealed((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => {
        const open = revealed.has(i);
        return (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: open ? '1px solid var(--border-hover)' : '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              style={{
                width: '100%',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}>{item.question}</span>
              <span style={{
                flexShrink: 0,
                width: 22, height: 22,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: open ? 'var(--ember)' : 'var(--surface-3)',
                color: open ? '#fff' : 'var(--text-muted)',
                fontSize: 11,
                transition: 'all 0.2s',
                transform: open ? 'rotate(180deg)' : 'none',
              }}>▾</span>
            </button>
            {open && (
              <div style={{
                padding: '0 20px 18px',
                borderTop: '1px solid var(--border)',
                paddingTop: 14,
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## STEP 9 — Rebuild FlowDiagram

Fully replace `src/components/FlowDiagram.tsx`:

```tsx
'use client';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#FF5B1D',
    primaryTextColor: '#F5F0EB',
    primaryBorderColor: '#E04510',
    lineColor: '#5C5148',
    background: '#0E0C0B',
    mainBkg: '#161210',
    nodeBorder: '#FF5B1D',
    clusterBkg: '#1E1A17',
    titleColor: '#F5F0EB',
    edgeLabelBackground: '#1E1A17',
  },
});

export default function FlowDiagram({ mermaidCode }: { mermaidCode: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !mermaidCode) return;
    (async () => {
      try {
        const { svg } = await mermaid.render(`mm-${Date.now()}`, mermaidCode);
        if (ref.current) ref.current.innerHTML = svg;
      } catch {
        if (ref.current)
          ref.current.innerHTML = `<pre style="color:var(--text-muted);font-size:12px;white-space:pre-wrap;word-break:break-all">${mermaidCode}</pre>`;
      }
    })();
  }, [mermaidCode]);

  return (
    <div style={{
      padding: 24,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflowX: 'auto',
    }}>
      <div
        ref={ref}
        style={{
          minHeight: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
        }}
      >Rendering diagram…</div>
    </div>
  );
}
```

---

## STEP 10 — Rebuild the main page (src/app/page.tsx)

Fully replace `src/app/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InputForm from '@/components/InputForm';
import dynamic from 'next/dynamic';

const FlashcardDeck = dynamic(() => import('@/components/FlashcardDeck'), { ssr: false });
const SummaryView   = dynamic(() => import('@/components/SummaryView'),   { ssr: false });
const QAChat        = dynamic(() => import('@/components/QAChat'),        { ssr: false });
const FlowDiagram   = dynamic(() => import('@/components/FlowDiagram'),   { ssr: false });

type Format = 'flashcards' | 'summary' | 'qa' | 'flowdiagram';

const FORMAT_LABELS: Record<Format, string> = {
  flashcards:  '🃏 Flashcard Deck',
  summary:     '📝 Chunked Summary',
  qa:          '💬 Q&A Quiz',
  flowdiagram: '🔀 Flow Diagram',
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [format,  setFormat]  = useState<Format>('flashcards');
  const [error,   setError]   = useState('');

  const handleSubmit = async ({
    url, file, format: fmt, microMode,
  }: { url: string; file: File | null; format: Format; microMode: boolean }) => {
    setLoading(true);
    setError('');
    setResults(null);
    setFormat(fmt);

    try {
      let ingestRes: Response;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        ingestRes = await fetch('/api/ingest', { method: 'POST', body: fd });
      } else {
        const inputType = url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' : 'article';
        ingestRes = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, inputType }),
        });
      }

      const ingestData = await ingestRes.json();
      if (!ingestRes.ok) throw new Error(ingestData.error || 'Ingestion failed');

      const synthRes = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: ingestData.rawText,
          format: fmt,
          microMode,
          sourceTitle: ingestData.sourceTitle,
        }),
      });
      const synthData = await synthRes.json();
      if (!synthRes.ok) throw new Error(synthData.error || 'Synthesis failed');

      setResults(synthData);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 80px' }}>

        {/* ── Hero ─────────────────────────────────────── */}
        {!results && (
          <div style={{ textAlign: 'center', maxWidth: 600, marginBottom: 52 }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ember)',
                marginBottom: 20,
              }}
            >
              Your AI-powered study companion
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 6vw, 58px)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.12,
                color: 'var(--text-primary)',
                marginBottom: 20,
                letterSpacing: '-0.01em',
              }}
            >
              {/* Word-by-word stagger via CSS */}
              {['Turn', 'anything', 'into', 'a', 'study', 'set.'].map((w, i) => (
                <span
                  key={i}
                  className="word-reveal"
                  style={{ animationDelay: `${i * 0.09}s`, marginRight: '0.28em' }}
                >
                  {w}
                </span>
              ))}
            </h1>
            <p
              className="word-reveal"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                animationDelay: '0.7s',
                maxWidth: 440,
                margin: '0 auto',
              }}
            >
              Paste a YouTube link, article URL, or PDF — Kindling transforms it into
              flashcards, summaries, Q&amp;A, or a flow diagram in seconds.
            </p>
          </div>
        )}

        {/* ── Input card ───────────────────────────────── */}
        {!results && (
          <div
            className="word-reveal"
            style={{
              width: '100%',
              maxWidth: 560,
              padding: '32px 32px 28px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              animationDelay: '0.55s',
            }}
          >
            <InputForm onSubmit={handleSubmit} loading={loading} />
          </div>
        )}

        {/* ── Loading ──────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 60 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '2px solid var(--surface-3)',
              borderTopColor: 'var(--ember)',
            }} className="spinner" />
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--text-secondary)' }}>
              Kindling your study set…
            </p>
          </div>
        )}

        {/* ── Error ────────────────────────────────────── */}
        {error && (
          <div style={{
            marginTop: 24,
            padding: '14px 20px',
            borderRadius: 10,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            maxWidth: 560,
            width: '100%',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#FCA5A5' }}>{error}</p>
          </div>
        )}

        {/* ── Results ──────────────────────────────────── */}
        {results && !loading && (
          <div style={{ width: '100%', maxWidth: 640 }}>
            {/* Result header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 24,
                  fontWeight: 300,
                  color: 'var(--text-primary)',
                  marginBottom: 4,
                }}>
                  {results.title}
                </h2>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ember)',
                }}>
                  {FORMAT_LABELS[format as Format]}
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setResults(null); setError(''); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 100,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--ember)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                }}
              >
                ← New study set
              </button>
            </div>

            {/* Result content */}
            {format === 'flashcards'  && <FlashcardDeck  cards={results.flashcards  || []} />}
            {format === 'summary'     && <SummaryView    chunks={results.summary     || []} />}
            {format === 'qa'          && <QAChat         items={results.qa           || []} />}
            {format === 'flowdiagram' && <FlowDiagram    mermaidCode={results.mermaidCode || ''} />}
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          Kindling — Ignite the way you learn.
        </span>
      </footer>
    </div>
  );
}
```

---

## STEP 11 — Delete stale files

Delete the following files if they exist (no longer needed):
- `src/components/NeuroShell.tsx`

Also delete `src/app/results/page.tsx` — results now render inline on the main page. If you want to keep a results route for future use, leave it; but it is no longer referenced.

---

## STEP 12 — Verify

Run:
```bash
npm run dev
```

Check:
- [ ] Page background is warm near-black (`#0E0C0B`)
- [ ] Header shows "kind**ling**" with ember-colored suffix, flame SVG, tagline pill
- [ ] Hero headline animates in word by word on load (Fraunces italic)
- [ ] Input card has dark glass surface, URL input glows orange on focus
- [ ] PDF drop zone highlights on hover, shows file name on upload
- [ ] 4 format buttons sit inside a dark pill container, active state glows ember
- [ ] Micro Mode toggle knob slides smoothly, track glows orange when on
- [ ] Ignite button is pill-shaped with ember gradient, pulses when idle & enabled
- [ ] Loading state shows spinner + italic "Kindling your study set…"
- [ ] Results render inline (no page navigation) with a "← New study set" pill button
- [ ] Flashcards: dark card flip with progress bar, prev/next buttons
- [ ] Summary: numbered articles with hover border glow
- [ ] Q&A: accordion with rotating indicator, ember open state
- [ ] Flow diagram: dark mermaid theme with ember node borders
- [ ] Subtle grain overlay and ambient ember glow behind hero visible
- [ ] No backend files changed

---

## DONE

The frontend is fully rebuilt with the "Ember" aesthetic.
All original functions preserved. No backend touched.
