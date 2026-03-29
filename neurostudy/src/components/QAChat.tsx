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
