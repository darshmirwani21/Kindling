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
            {format === 'flashcards'  && <FlashcardDeck  cards={results.flashcards || []} />}
            {format === 'summary'     && <SummaryView    chunks={results.summary || []} />}
            {format === 'qa'          && <QAChat         items={results.qa || []} />}
            {format === 'flowdiagram' && <FlowDiagram    mermaidCode={results.mermaidCode || ''} />}
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
