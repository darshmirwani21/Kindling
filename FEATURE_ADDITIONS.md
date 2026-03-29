# 🔥 Kindling — Recommended Feature Additions
### Cursor / Windsurf Agent Instructions
> **AI Agent:** This file adds new features to an existing, fully-built Kindling Next.js project. Each feature is self-contained. Execute them in any order, but read the full spec for each feature before writing any code. Do NOT touch `src/app/api/`, `src/lib/prompts.ts`, or `src/lib/types.ts` unless explicitly told to in a specific section.

---

## FEATURE INDEX

1. **Manual Text Paste** — Fallback input for paywalled articles
2. **Session History** — Remember the last 10 study sets, resumable
3. **Flashcard Self-Scoring** — Know / Still Learning buttons with session stats
4. **Keyboard Navigation** — Arrow keys + spacebar for flashcards
5. **Export to Markdown** — Download any study set as a `.md` file
6. **Study Timer** — Optional Pomodoro-style countdown with break nudges
7. **Copy Raw Mermaid** — Fallback button on Flow Diagram render failure
8. **Toast Notification System** — Lightweight global feedback for actions

---

## FEATURE 1 — Manual Text Paste

### What it does
Adds a third input option: a textarea where users paste raw text directly. Useful for paywalled articles, proprietary documents, or any content that can't be scraped.

### Files to modify
- `src/components/InputForm.tsx`
- `src/app/api/ingest/route.ts`

### Step-by-step

**Step 1.1 — Update `src/lib/types.ts`**

Find:
```typescript
export type InputType = "youtube" | "pdf" | "article";
```
Replace with:
```typescript
export type InputType = "youtube" | "pdf" | "article" | "paste";
```

**Step 1.2 — Update `src/app/api/ingest/route.ts`**

Inside the `POST` handler, before the final `return NextResponse.json({ error: "Unknown input type" })` line, add:

```typescript
if (inputType === "paste") {
  const { rawText: pastedText, sourceTitle: pastedTitle } = await req.json().catch(() => ({}));
  // Note: req.json() was already called above for url/inputType — refactor to parse once at top
  // Instead, the paste path sends rawText directly to synthesize, bypassing ingest entirely.
  // See Step 1.3 for how InputForm handles this path.
  return NextResponse.json({ error: "Paste is handled client-side" }, { status: 400 });
}
```

> **Note:** The paste path bypasses `/api/ingest` entirely. The client sends `rawText` directly to `/api/synthesize`. No server change is needed for this path.

**Step 1.3 — Update `src/components/InputForm.tsx`**

Add `'paste'` to the `Format` type imports and to the FORMATS-equivalent input type list.

Find the section that defines the input type buttons (YouTube / Web Article / PDF Upload) and add a fourth button:

```tsx
{ id: 'paste', label: 'Paste Text', icon: '📋' }
```

Add a new state variable:
```tsx
const [pasteText, setPasteText] = useState('');
```

After the PDF drop zone JSX block, add a conditional textarea that shows when `inputType === 'paste'`:

```tsx
{inputType === 'paste' && (
  <textarea
    placeholder="Paste any text here — article, lecture notes, textbook excerpt…"
    value={pasteText}
    onChange={(e) => setPasteText(e.target.value)}
    rows={6}
    style={{
      width: '100%',
      background: 'var(--surface-2)',
      border: pasteText ? '1px solid var(--ember)' : '1px solid var(--border)',
      borderRadius: 12,
      padding: '14px 16px',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text-primary)',
      resize: 'vertical',
      outline: 'none',
      transition: 'border-color 0.2s',
      lineHeight: 1.6,
    }}
  />
)}
```

Update the `canSubmit` check to include paste:
```tsx
const canSubmit = (
  (inputType === 'youtube' && url.trim() !== '') ||
  (inputType === 'article' && url.trim() !== '') ||
  (inputType === 'pdf' && file !== null) ||
  (inputType === 'paste' && pasteText.trim().length > 50)
) && !loading;
```

Update the `handleSubmit` (or `onSubmit` call) to short-circuit ingest for paste:

Find the section that calls `fetch('/api/ingest', ...)` and wrap it with:

```tsx
if (inputType === 'paste') {
  // Skip ingest — send text directly to synthesize
  const synthRes = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawText: pasteText,
      format,
      microMode: micro,
      sourceTitle: 'Pasted Text',
    }),
  });
  const synthData = await synthRes.json();
  if (!synthRes.ok) throw new Error(synthData.error || 'Synthesis failed');
  onSubmit({ url: '', file: null, format, microMode: micro });
  // Store results directly — parent needs to handle this. See note below.
  return;
}
```

> **Architecture note for agent:** The paste path needs to set results on the parent (`page.tsx`). The cleanest way is to lift `handleSubmit` entirely into `page.tsx` and have it check `inputType === 'paste'` before calling ingest. Refactor accordingly: move the full fetch logic out of `InputForm.tsx` and into `page.tsx`'s `handleSubmit`, passing `pasteText` up via the `onSubmit` callback by adding it to the callback signature:
> ```tsx
> onSubmit: (data: { url: string; file: File | null; format: Format; microMode: boolean; pasteText?: string }) => void
> ```

---

## FEATURE 2 — Session History

### What it does
Stores the last 10 generated study sets in `localStorage`. A "History" drawer in the header lets users reopen any previous session without regenerating it.

### Files to create
- `src/components/HistoryDrawer.tsx`
- `src/lib/history.ts`

### Files to modify
- `src/components/Header.tsx`
- `src/app/page.tsx`

### Step-by-step

**Step 2.1 — Create `src/lib/history.ts`**

```typescript
import { StudyOutput } from "./types";

const HISTORY_KEY = "kindling_history";
const MAX_ENTRIES = 10;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  output: StudyOutput;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(output: StudyOutput): void {
  if (typeof window === "undefined") return;
  const history = getHistory();
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    output,
  };
  const updated = [entry, ...history].slice(0, MAX_ENTRIES);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
```

**Step 2.2 — Create `src/components/HistoryDrawer.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getHistory, clearHistory, formatRelativeTime, HistoryEntry } from '@/lib/history';
import { StudyOutput } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (output: StudyOutput) => void;
}

const FORMAT_ICONS: Record<string, string> = {
  flashcards: '🃏',
  summary: '📝',
  qa: '💬',
  flowdiagram: '🔀',
};

export default function HistoryDrawer({ open, onClose, onSelect }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setEntries(getHistory());
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 360, zIndex: 50,
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-24px 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Recent Sessions
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => { clearHistory(); setEntries([]); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)',
                  padding: '4px 8px', borderRadius: 6,
                }}
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 18, lineHeight: 1,
                padding: '4px 6px',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>
                No sessions yet.<br />Generate your first study set!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => { onSelect(entry.output); onClose(); }}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 6,
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{FORMAT_ICONS[entry.output.format] || '📚'}</span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                    color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {entry.output.title}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--ember)', padding: '2px 6px',
                    background: 'var(--ember-dim)', borderRadius: 4,
                  }}>
                    {entry.output.format}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
```

**Step 2.3 — Update `src/components/Header.tsx`**

Add a history icon button to the header, right before the tagline pill. It should receive an `onHistoryOpen` prop:

```tsx
interface HeaderProps {
  onHistoryOpen?: () => void;
}

export default function Header({ onHistoryOpen }: HeaderProps) {
```

Add this button inside the header, between the logo lockup and the tagline pill:

```tsx
{onHistoryOpen && (
  <button
    type="button"
    onClick={onHistoryOpen}
    title="Recent sessions"
    style={{
      background: 'none', border: '1px solid var(--border)',
      borderRadius: 8, cursor: 'pointer', padding: '6px 10px',
      color: 'var(--text-secondary)', transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-body)', fontSize: 12,
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
    🕐 History
  </button>
)}
```

**Step 2.4 — Update `src/app/page.tsx`**

Add imports:
```tsx
import { saveToHistory } from '@/lib/history';
import HistoryDrawer from '@/components/HistoryDrawer';
```

Add state:
```tsx
const [historyOpen, setHistoryOpen] = useState(false);
```

Inside `handleSubmit`, after `setResults(synthData)`, add:
```tsx
saveToHistory(synthData);
```

Update the `<Header />` call:
```tsx
<Header onHistoryOpen={() => setHistoryOpen(true)} />
```

Add the drawer anywhere inside the returned JSX (e.g., just before `</div>`):
```tsx
<HistoryDrawer
  open={historyOpen}
  onClose={() => setHistoryOpen(false)}
  onSelect={(output) => {
    setResults(output);
    setFormat(output.format as Format);
    setError('');
  }}
/>
```

---

## FEATURE 3 — Flashcard Self-Scoring

### What it does
Adds **Know it ✓** / **Still learning ↺** buttons below each flashcard. Tracks a per-session score. Shows a summary screen when all cards are marked.

### Files to modify
- `src/components/FlashcardDeck.tsx`

### Step-by-step

**Step 3.1 — Replace `src/components/FlashcardDeck.tsx` entirely**

```tsx
'use client';
import { useState } from 'react';
import { Flashcard } from '@/lib/types';

type CardStatus = 'unseen' | 'known' | 'learning';

export default function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex]       = useState(0);
  const [flipped, setFlipped]   = useState(false);
  const [statuses, setStatuses] = useState<CardStatus[]>(() => Array(cards.length).fill('unseen'));
  const [done, setDone]         = useState(false);

  if (!cards.length) return null;

  const card    = cards[index];
  const known   = statuses.filter((s) => s === 'known').length;
  const learning = statuses.filter((s) => s === 'learning').length;

  function markCard(status: 'known' | 'learning') {
    const updated = [...statuses];
    updated[index] = status;
    setStatuses(updated);
    setFlipped(false);

    if (index < cards.length - 1) {
      setIndex(index + 1);
    } else {
      setDone(true);
    }
  }

  function restart() {
    setIndex(0);
    setFlipped(false);
    setStatuses(Array(cards.length).fill('unseen'));
    setDone(false);
  }

  // Completion screen
  if (done) {
    const pct = Math.round((known / cards.length) * 100);
    return (
      <div style={{
        textAlign: 'center', padding: '48px 32px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {pct >= 80 ? '🔥' : pct >= 50 ? '⚡' : '💪'}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 24, fontWeight: 300, color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Session complete
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
          {known} of {cards.length} cards marked as known ({pct}%)
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            padding: '8px 16px', borderRadius: 20,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#4ade80',
          }}>
            ✓ {known} known
          </div>
          <div style={{
            padding: '8px 16px', borderRadius: 20,
            background: 'var(--ember-dim)', border: '1px solid var(--border-hover)',
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ember)',
          }}>
            ↺ {learning} to review
          </div>
        </div>
        <button
          type="button"
          onClick={restart}
          style={{
            padding: '11px 28px', borderRadius: 100,
            background: 'linear-gradient(135deg, #FF5B1D 0%, #E0420A 100%)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            color: '#fff',
          }}
        >
          Go again ↺
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Counter + progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Card {index + 1} <span style={{ color: 'var(--border)' }}>/</span> {cards.length}
        </span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#4ade80' }}>✓ {known}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: '0 4px' }}>·</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ember)' }}>↺ {learning}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${((known + learning) / cards.length) * 100}%`,
          background: 'var(--ember)', borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Card */}
      <div className="flip-container" style={{ minHeight: 220 }}>
        <div
          className={`flip-card${flipped ? ' flipped' : ''}`}
          style={{ position: 'relative', minHeight: 220 }}
          onClick={() => setFlipped(!flipped)}
        >
          <div className="flip-face" style={{
            position: flipped ? 'absolute' : 'relative', inset: 0, minHeight: 220,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '36px 32px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, cursor: 'pointer', textAlign: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 16 }}>Question</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.4 }}>{card.front}</p>
            <span style={{ marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>Tap to reveal</span>
          </div>
          <div className="flip-face flip-back" style={{
            position: 'absolute', inset: 0, minHeight: 220,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '36px 32px', background: 'var(--surface-2)', border: '1px solid var(--border-hover)',
            borderRadius: 16, cursor: 'pointer', textAlign: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 16 }}>Answer</span>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.6 }}>{card.back}</p>
          </div>
        </div>
      </div>

      {/* Scoring buttons — only show after flipping */}
      {flipped ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => markCard('learning')}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 10,
              background: 'var(--ember-dim)', border: '1px solid var(--border-hover)',
              color: 'var(--ember)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >↺ Still learning</button>
          <button
            type="button"
            onClick={() => markCard('known')}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 10,
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >✓ Know it</button>
        </div>
      ) : (
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
              cursor: index === 0 ? 'not-allowed' : 'pointer',
            }}
          >← Prev</button>
          <button
            type="button"
            onClick={() => setFlipped(true)}
            style={{
              flex: 2, padding: '12px 0', borderRadius: 10,
              background: 'linear-gradient(135deg, #FF5B1D 0%, #E0420A 100%)',
              border: 'none', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >Reveal answer</button>
        </div>
      )}
    </div>
  );
}
```

---

## FEATURE 4 — Keyboard Navigation for Flashcards

### What it does
Spacebar flips the card. Left/Right arrows navigate between cards. `k` marks as known, `l` marks as still learning (only when flipped).

### Files to modify
- `src/components/FlashcardDeck.tsx` (requires Feature 3 to be implemented first)

### Step-by-step

**Step 4.1 — Add a `useEffect` for keyboard events inside `FlashcardDeck`**

Add this import at the top of the file:
```tsx
import { useState, useEffect } from 'react';
```

Add this `useEffect` inside the component, before the `return` statement:

```tsx
useEffect(() => {
  function handleKey(e: KeyboardEvent) {
    if (done) return;
    // Don't fire if user is typing in an input/textarea
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setFlipped((f) => !f);
    }
    if (e.key === 'ArrowRight' && !flipped) {
      e.preventDefault();
      if (index < cards.length - 1) { setIndex(index + 1); setFlipped(false); }
    }
    if (e.key === 'ArrowLeft' && !flipped) {
      e.preventDefault();
      if (index > 0) { setIndex(index - 1); setFlipped(false); }
    }
    if (e.key === 'k' && flipped) markCard('known');
    if (e.key === 'l' && flipped) markCard('learning');
  }

  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, [index, flipped, done, cards.length]);
```

**Step 4.2 — Add keyboard hint below the card**

After the scoring/nav buttons block, add:

```tsx
<p style={{
  fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)',
  textAlign: 'center', letterSpacing: '0.06em',
}}>
  Space to flip · ← → to navigate · K = know it · L = still learning
</p>
```

---

## FEATURE 5 — Export to Markdown

### What it does
Adds a **Download .md** button on the results view. Generates clean Markdown from any study format and triggers a browser download.

### Files to create
- `src/lib/exportMarkdown.ts`

### Files to modify
- `src/app/page.tsx`

### Step-by-step

**Step 5.1 — Create `src/lib/exportMarkdown.ts`**

```typescript
import { StudyOutput } from "./types";

export function generateMarkdown(output: StudyOutput): string {
  const lines: string[] = [];
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  lines.push(`# ${output.title}`);
  lines.push(`*Generated by Kindling · ${date}*`);
  lines.push("");

  if (output.format === "flashcards" && output.flashcards) {
    lines.push("## Flashcards");
    lines.push("");
    output.flashcards.forEach((card, i) => {
      lines.push(`### Card ${i + 1}`);
      lines.push(`**Q:** ${card.front}`);
      lines.push("");
      lines.push(`**A:** ${card.back}`);
      lines.push("");
      lines.push("---");
      lines.push("");
    });
  }

  if (output.format === "summary" && output.summary) {
    lines.push("## Summary");
    lines.push("");
    output.summary.forEach((chunk) => {
      lines.push(`### ${chunk.heading}`);
      lines.push(chunk.body);
      lines.push("");
    });
  }

  if (output.format === "qa" && output.qa) {
    lines.push("## Q&A");
    lines.push("");
    output.qa.forEach((item, i) => {
      lines.push(`**${i + 1}. ${item.question}**`);
      lines.push("");
      lines.push(`> ${item.answer}`);
      lines.push("");
    });
  }

  if (output.format === "flowdiagram" && output.mermaidCode) {
    lines.push("## Flow Diagram");
    lines.push("");
    lines.push("```mermaid");
    lines.push(output.mermaidCode);
    lines.push("```");
    lines.push("");
  }

  lines.push("---");
  lines.push("*Made with [Kindling](https://kindling.app) — Ignite the way you learn.*");

  return lines.join("\n");
}

export function downloadMarkdown(output: StudyOutput): void {
  const md = generateMarkdown(output);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${output.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_kindling.md`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Step 5.2 — Update `src/app/page.tsx`**

Add import:
```tsx
import { downloadMarkdown } from '@/lib/exportMarkdown';
```

In the results section, find the "← New study set" button and add a download button next to it:

```tsx
<button
  type="button"
  onClick={() => results && downloadMarkdown(results)}
  style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 100,
    background: 'var(--surface-2)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', fontFamily: 'var(--font-body)',
    fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
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
  ↓ Export .md
</button>
```

---

## FEATURE 6 — Study Timer (Pomodoro-style)

### What it does
A small collapsible timer widget (default 25 min) that counts down. When it hits zero, a soft pulsing animation and message prompt a break. Designed for Micro Mode users but available to all.

### Files to create
- `src/components/StudyTimer.tsx`

### Files to modify
- `src/app/page.tsx`

### Step-by-step

**Step 6.1 — Create `src/components/StudyTimer.tsx`**

```tsx
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
```

**Step 6.2 — Update `src/app/page.tsx`**

Add import:
```tsx
import StudyTimer from '@/components/StudyTimer';
```

Add `<StudyTimer />` as the last child inside the outermost wrapper `<div>`, after the footer:

```tsx
<StudyTimer />
```

---

## FEATURE 7 — Copy Raw Mermaid Button

### What it does
Adds a **Copy syntax** button to the `FlowDiagram` component. Always visible, so users can paste the Mermaid code into https://mermaid.live if rendering fails or they want to edit it.

### Files to modify
- `src/components/FlowDiagram.tsx`

### Step-by-step

**Step 7.1 — Update `src/components/FlowDiagram.tsx`**

Add `useState` to the React import:
```tsx
import { useEffect, useRef, useState } from 'react';
```

Add state inside the component:
```tsx
const [copied, setCopied] = useState(false);

function handleCopy() {
  navigator.clipboard.writeText(mermaidCode).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  });
}
```

Add a header bar above the diagram div:

```tsx
return (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    overflow: 'hidden',
  }}>
    {/* Toolbar */}
    <div style={{
      padding: '10px 16px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
        Mermaid.js
      </span>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface-2)',
          border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
          borderRadius: 6, cursor: 'pointer', padding: '4px 10px',
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
          color: copied ? '#4ade80' : 'var(--text-muted)',
          transition: 'all 0.2s',
        }}
      >
        {copied ? '✓ Copied' : 'Copy syntax'}
      </button>
    </div>
    {/* Diagram */}
    <div style={{ padding: 24, overflowX: 'auto' }}>
      <div ref={ref} style={{
        minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 13,
      }}>Rendering diagram…</div>
    </div>
  </div>
);
```

---

## FEATURE 8 — Toast Notification System

### What it does
A lightweight global toast system (no library needed). Used by other features (copy success, export success, history saved) to show subtle non-blocking feedback.

### Files to create
- `src/components/Toast.tsx`
- `src/lib/toast.ts`

### Files to modify
- `src/app/page.tsx`

### Step-by-step

**Step 8.1 — Create `src/lib/toast.ts`**

```typescript
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners: Listener[] = [];

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function showToast(message: string, type: ToastType = 'success', duration = 3000) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  toasts = [{ id, message, type }, ...toasts].slice(0, 5);
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, duration);
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i > -1) listeners.splice(i, 1);
  };
}
```

**Step 8.2 — Create `src/components/Toast.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { subscribeToasts } from '@/lib/toast';

interface ToastItem { id: string; message: string; type: 'success' | 'error' | 'info'; }

const COLORS = {
  success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' },
  error:   { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#FCA5A5' },
  info:    { bg: 'var(--ember-dim)', border: 'var(--border-hover)', text: 'var(--ember)' },
};

export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts(setItems);
  }, []);

  if (!items.length) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
      pointerEvents: 'none',
    }}>
      {items.map((item) => {
        const c = COLORS[item.type];
        return (
          <div key={item.id} style={{
            padding: '10px 18px', borderRadius: 10,
            background: c.bg, border: `1px solid ${c.border}`,
            fontFamily: 'var(--font-body)', fontSize: 13, color: c.text,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            animation: 'fadeUp 0.25s ease forwards',
            whiteSpace: 'nowrap',
          }}>
            {item.message}
          </div>
        );
      })}
    </div>
  );
}
```

**Step 8.3 — Update `src/app/page.tsx`**

Add imports:
```tsx
import ToastContainer from '@/components/Toast';
import { showToast } from '@/lib/toast';
```

Add `<ToastContainer />` as the last child inside the outermost wrapper `<div>`.

After the `saveToHistory(synthData)` call in `handleSubmit`, add:
```tsx
showToast('Study set generated ✦', 'success');
```

In the `exportMarkdown` handler in step 5.2, after calling `downloadMarkdown(results)`, add:
```tsx
showToast('Exported to Markdown ↓', 'info');
```

---

## FINAL VERIFICATION CHECKLIST

After implementing all features, run:

```bash
npm run build
```

Then `npm run dev` and verify:

- [ ] Manual paste textarea appears when "Paste Text" tab is selected
- [ ] Pasted text flows through synthesize and renders results
- [ ] History drawer opens with 🕐 History button in header
- [ ] Generating a set saves it to history; reopening works
- [ ] Clear all empties the drawer and localStorage
- [ ] Flashcards show "Know it" / "Still learning" buttons after flipping
- [ ] Completion screen shows score breakdown and "Go again" button
- [ ] Space flips cards; ← → navigate; K/L score when flipped
- [ ] Keyboard hint row is visible below the buttons
- [ ] "↓ Export .md" downloads a clean Markdown file
- [ ] `.md` file opens in any Markdown viewer with proper structure
- [ ] Study timer FAB appears bottom-right; opens a timer panel
- [ ] Timer counts down, pauses, resets; completion message fires at 0
- [ ] Flow diagram has a toolbar with "Copy syntax" button
- [ ] Copy button turns green with ✓ Copied for 2 seconds
- [ ] Toast appears on study set generation and export
- [ ] `npm run build` completes with zero TypeScript errors
