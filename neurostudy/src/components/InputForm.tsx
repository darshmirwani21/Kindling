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
