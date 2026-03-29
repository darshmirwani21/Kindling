'use client';
import { useEffect, useRef } from 'react';
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
      padding: 24,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflowX: 'auto',
    }}>
      <div
        ref={ref}
        style={{
          minHeight: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
        }}
      >Rendering diagram…</div>
    </div>
  );
}
