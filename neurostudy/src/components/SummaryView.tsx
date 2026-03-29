import { SummaryChunk } from '@/lib/types';

export default function SummaryView({ chunks }: { chunks: SummaryChunk[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {chunks.map((chunk, i) => (
        <article
          key={i}
          style={{
            padding: '20px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,91,29,0.2)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--ember-dim)', border: '1px solid var(--border-hover)',
              fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'var(--ember)',
            }}>{i + 1}</span>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 400, fontStyle: 'italic',
              color: 'var(--text-primary)', letterSpacing: 0,
            }}>{chunk.heading}</h3>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {chunk.body}
          </p>
        </article>
      ))}
    </div>
  );
}
