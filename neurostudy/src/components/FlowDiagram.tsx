'use client';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#FF5B1D',
    primaryTextColor: '#F5F0EB',
    primaryBorderColor: '#E04510',
    lineColor: '#5C5148',
    background: '#0E0C0B',
    mainBkg: '#161210',
    nodeBorder: '#FF5B1D',
    clusterBkg: '#1E1A17',
    titleColor: '#F5F0EB',
    edgeLabelBackground: '#1E1A17',
  },
});

export default function FlowDiagram({ mermaidCode }: { mermaidCode: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(mermaidCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    if (!ref.current || !mermaidCode) return;
    (async () => {
      try {
        const { svg } = await mermaid.render(`mm-${Date.now()}`, mermaidCode);
        if (ref.current) ref.current.innerHTML = svg;
      } catch {
        if (ref.current)
          ref.current.innerHTML = `<pre style="color:var(--text-muted);font-size:12px;white-space:pre-wrap;word-break:break-all">${mermaidCode}</pre>`;
      }
    })();
  }, [mermaidCode]);

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          Mermaid.js
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface-2)',
            border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
            borderRadius: 6, cursor: 'pointer', padding: '4px 10px',
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
            color: copied ? '#4ade80' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ Copied' : 'Copy syntax'}
        </button>
      </div>
      {/* Diagram */}
      <div style={{ padding: 24, overflowX: 'auto' }}>
        <div ref={ref} style={{
          minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 13,
        }}>Rendering diagram…</div>
      </div>
    </div>
  );
}
