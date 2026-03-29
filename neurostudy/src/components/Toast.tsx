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
