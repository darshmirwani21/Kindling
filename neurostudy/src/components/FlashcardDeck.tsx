'use client';
import { useState, useEffect } from 'react';
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
    <>
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

    {/* Keyboard hint */}
    <p style={{
      fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)',
      textAlign: 'center', letterSpacing: '0.06em',
    }}>
      Space to flip · ← → to navigate · K = know it · L = still learning
    </p>
    </>
  );
}