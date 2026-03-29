'use client';

import { useState, useRef } from 'react';
import MicroModeToggle from './MicroModeToggle';

type Format = 'flashcards' | 'summary' | 'qa' | 'flowdiagram';

interface InputFormProps {
  onSubmit: (data: { url: string; file: File | null; format: Format; microMode: boolean; pasteText?: string }) => void;
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
  const [inputType, setInputType] = useState<'youtube' | 'article' | 'pdf' | 'paste'>('youtube');
  const [pasteText, setPasteText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const canSubmit = (
    (inputType === 'youtube' && url.trim() !== '') ||
    (inputType === 'article' && url.trim() !== '') ||
    (inputType === 'pdf' && file !== null) ||
    (inputType === 'paste' && pasteText.trim().length > 50)
  ) && !loading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Input type selector ─────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Input source
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          background: 'var(--surface-2)',
          padding: 5,
          borderRadius: 12,
          border: borderStyle,
        }}>
          {[
            { id: 'youtube', label: 'YouTube', icon: '🎥' },
            { id: 'article', label: 'Web Article', icon: '🌐' },
            { id: 'pdf', label: 'PDF Upload', icon: '📄' },
            { id: 'paste', label: 'Paste Text', icon: '📋' },
          ].map((type) => {
            const active = inputType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setInputType(type.id as any)}
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
                <span style={{ fontSize: 18, lineHeight: 1 }}>{type.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--ember)' : 'var(--text-secondary)',
                  transition: 'color 0.18s',
                  whiteSpace: 'nowrap',
                }}>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── URL input ──────────────────────────────────── */}
      {inputType !== 'paste' && (
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
            {inputType === 'youtube' ? 'Paste a link' : 'Paste a link'}
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

      {/* ── Paste textarea ─────────────────────────── */}
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
          onClick={() => onSubmit({ url, file, format, microMode: micro, pasteText: inputType === 'paste' ? pasteText : undefined })}
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
