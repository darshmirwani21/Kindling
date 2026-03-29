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
