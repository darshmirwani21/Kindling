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
