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
