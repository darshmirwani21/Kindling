# REBUFF_FRONTEND.md
# Kindling — Frontend Rebuild Instructions
# Agent: Execute ALL steps in order. Do not skip any step.

---

## OVERVIEW

This file rebuilds the entire frontend of the Kindling app from scratch.
The goal is a clean, minimal, light-mode UI that carries all existing functionality.
Do NOT change any backend logic, API routes, or data flow — only UI/layout files.

Branding:
- App name: Kindling
- Tagline: Ignite the way you learn.
- Theme: Light mode, clean, minimal — warm fire accents (orange/amber) on white/stone backgrounds
- Flame emblem: SVG, rendered inline in the header

---

## STEP 1 — Reset globals.css

Replace the full contents of `app/globals.css` with the following:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #fafaf9;
  --foreground: #1c1917;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Inter', sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}
```

---

## STEP 2 — Rebuild layout.tsx

Replace the full contents of `app/layout.tsx` with the following:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kindling',
  description: 'Ignite the way you learn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
```

---

## STEP 3 — Rebuild the Header component

Create or fully replace `components/Header.tsx` with the following:

```tsx
export default function Header() {
  return (
    <header className="w-full border-b border-stone-200 bg-white px-6 py-4 flex items-center gap-3">
      {/* Flame Emblem */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer flame body */}
        <path
          d="M16 2C16 2 8 10 8 18a8 8 0 0016 0c0-4-2-7-2-7s-1 3-3 4c0 0 1-6-3-13z"
          fill="url(#flameOuter)"
        />
        {/* Inner highlight */}
        <path
          d="M16 10C16 10 12 15 12 19a4 4 0 008 0c0-2-1-4-1-4s-0.5 2-2 2.5c0 0 1-4-1-7.5z"
          fill="url(#flameInner)"
        />
        {/* Core glow */}
        <ellipse cx="16" cy="21" rx="2" ry="2.5" fill="#FDE68A" opacity="0.9" />
        <defs>
          <linearGradient id="flameOuter" x1="16" y1="2" x2="16" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="60%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="flameInner" x1="16" y1="10" x2="16" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>
      </svg>

      {/* Brand name */}
      <span className="text-2xl font-extrabold tracking-tight text-stone-900">
        Kindling
      </span>

      {/* Tagline — hidden on small screens */}
      <span className="hidden sm:inline text-sm text-stone-400 font-normal ml-1 mt-0.5">
        Ignite the way you learn.
      </span>
    </header>
  );
}
```

---

## STEP 4 — Rebuild the MicroModeToggle component

Create or fully replace `components/MicroModeToggle.tsx` with the following:

```tsx
interface MicroModeToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export default function MicroModeToggle({ enabled, onChange }: MicroModeToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-stone-600">Micro Mode</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
          enabled ? 'bg-orange-500' : 'bg-stone-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {enabled && (
        <span className="text-xs text-orange-500 font-medium">On</span>
      )}
    </div>
  );
}
```

---

## STEP 5 — Rebuild the InputForm component

Create or fully replace `components/InputForm.tsx` with the following:

```tsx
'use client';

import { useState } from 'react';
import MicroModeToggle from './MicroModeToggle';

type Format = 'flashcards' | 'summary' | 'qa' | 'flowdiagram';

interface InputFormProps {
  onSubmit: (data: {
    url: string;
    file: File | null;
    format: Format;
    microMode: boolean;
  }) => void;
  loading: boolean;
}

const FORMAT_OPTIONS: { id: Format; label: string; icon: string }[] = [
  { id: 'flashcards', label: 'Flashcards', icon: '🃏' },
  { id: 'summary',    label: 'Summary',    icon: '📝' },
  { id: 'qa',         label: 'Q&A',        icon: '💬' },
  { id: 'flowdiagram',label: 'Flow Diagram',icon: '🔀' },
];

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [url, setUrl]           = useState('');
  const [file, setFile]         = useState<File | null>(null);
  const [format, setFormat]     = useState<Format>('flashcards');
  const [microMode, setMicro]   = useState(false);

  const handleSubmit = () => {
    if (!url && !file) return;
    onSubmit({ url, file, format, microMode });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">

      {/* URL Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700">
          Paste a link
        </label>
        <input
          type="url"
          placeholder="YouTube, article, or any webpage URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 text-xs text-stone-400">
        <div className="flex-1 h-px bg-stone-200" />
        or upload a PDF
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      {/* PDF Upload */}
      <div>
        <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-stone-300 bg-white cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition">
          <span className="text-sm text-stone-500">
            {file ? `📄 ${file.name}` : 'Click to upload PDF'}
          </span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {/* Format Selector — horizontal row */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700">Output format</label>
        <div className="grid grid-cols-4 gap-2">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFormat(opt.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg border py-3 px-2 text-xs font-medium transition ${
                format === opt.id
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              <span className="text-lg">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row — Micro Mode + Submit */}
      <div className="flex items-center justify-between">
        <MicroModeToggle enabled={microMode} onChange={setMicro} />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || (!url && !file)}
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Kindling...' : 'Ignite ✨'}
        </button>
      </div>
    </div>
  );
}
```

---

## STEP 6 — Rebuild the main page (app/page.tsx)

Create or fully replace `app/page.tsx` with the following:

```tsx
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InputForm from '@/components/InputForm';
import dynamic from 'next/dynamic';

const FlashcardDeck  = dynamic(() => import('@/components/FlashcardDeck'),  { ssr: false });
const SummaryView    = dynamic(() => import('@/components/SummaryView'),    { ssr: false });
const QAChat         = dynamic(() => import('@/components/QAChat'),         { ssr: false });
const FlowDiagram    = dynamic(() => import('@/components/FlowDiagram'),    { ssr: false });

type Format = 'flashcards' | 'summary' | 'qa' | 'flowdiagram';

export default function Home() {
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState<any>(null);
  const [format, setFormat]     = useState<Format>('flashcards');
  const [error, setError]       = useState('');

  const handleSubmit = async ({
    url, file, format: fmt, microMode,
  }: {
    url: string;
    file: File | null;
    format: Format;
    microMode: boolean;
  }) => {
    setLoading(true);
    setError('');
    setResults(null);
    setFormat(fmt);

    try {
      // 1. Ingest
      const ingestForm = new FormData();
      if (url)  ingestForm.append('url', url);
      if (file) ingestForm.append('file', file);

      const ingestRes = await fetch('/api/ingest', { method: 'POST', body: ingestForm });
      const { text } = await ingestRes.json();

      // 2. Synthesize
      const synthRes = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, format: fmt, microMode }),
      });
      const data = await synthRes.json();
      setResults(data);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 py-12 gap-12">

        {/* Hero */}
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 mb-3">
            Turn anything into a study set.
          </h1>
          <p className="text-stone-500 text-base">
            Paste a YouTube link, article, or PDF — Kindling turns it into flashcards,
            summaries, Q&amp;A, or a flow diagram in seconds.
          </p>
        </div>

        {/* Input card */}
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <InputForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-3 text-stone-500">
            <div className="h-8 w-8 rounded-full border-4 border-orange-300 border-t-orange-500 animate-spin" />
            <span className="text-sm">Kindling your study set…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="w-full max-w-2xl">
            {format === 'flashcards'  && <FlashcardDeck  data={results} />}
            {format === 'summary'     && <SummaryView    data={results} />}
            {format === 'qa'          && <QAChat         data={results} />}
            {format === 'flowdiagram' && <FlowDiagram    data={results} />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-stone-400 py-6">
        Kindling — Ignite the way you learn.
      </footer>
    </div>
  );
}
```

---

## STEP 7 — Verify no inline styles or fire-theme overrides remain

After executing all steps above, search the codebase for the following and remove any matches that are NOT part of this file:

- `radial-gradient`
- `#1a0a00`
- `#2d1200`
- `from-red-` combined with `globals.css`
- Any `style={{ background:` that references dark fire colors

These were injected by a previous aesthetic pass and must be cleared.

---

## DONE

The frontend is now rebuilt. All functions are preserved:
- URL input (YouTube, articles)
- PDF upload
- 4 format buttons in a horizontal row (Flashcards, Summary, Q&A, Flow Diagram)
- Micro Mode toggle (fixed, animates correctly)
- Loading state, error handling, results rendering
- Kindling branding (flame SVG, orange accents, tagline)

No backend files were touched.
