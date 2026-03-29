'use client';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
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

/**
 * Clean up common LLM-generated Mermaid syntax issues.
 */
function sanitizeMermaid(raw: string): string {
  let code = raw.trim();

  // Strip markdown code fences if present
  code = code.replace(/^```(?:mermaid)?\s*/i, '').replace(/\s*```$/, '').trim();

  // Ensure it starts with a valid diagram type; default to flowchart TD
  const validStarts = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|quadrantChart|xychart)/i;
  if (!validStarts.test(code)) {
    code = 'flowchart TD\n' + code;
  }

  // Normalize Windows line endings
  code = code.replace(/\r\n/g, '\n');

  // Replace curly quotes with straight quotes
  code = code.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

  // Remove any lines that are just whitespace
  code = code
    .split('\n')
    .filter((line) => line.trim() !== '' || line === '')
    .join('\n');

  // Strip inline HTML tags that break mermaid parsing
  code = code.replace(/<[^>]+>/g, '');

  // Escape parentheses inside node labels e.g. A(foo (bar)) -> A(foo bar)
  // Only inside node definition brackets: [], (), {}, (())
  code = code.replace(/(\[|\(|\{)([^)\]}\n]+)(\]|\)|\})/g, (match, open, content, close) => {
    const cleaned = content.replace(/[()]/g, '');
    return `${open}${cleaned}${close}`;
  });

  return code;
}

export default function FlowDiagram({ mermaidCode }: { mermaidCode: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(mermaidCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    if (!ref.current || !mermaidCode) return;
    setRenderError(false);

    const cleaned = sanitizeMermaid(mermaidCode);

    (async () => {
      try {
        const id = `mm-${Date.now()}`;
        const { svg } = await mermaid.render(id, cleaned);
        if (ref.current) ref.current.innerHTML = svg;
      } catch (err) {
        console.warn('Mermaid render failed:', err);
        setRenderError(true);
        if (ref.current) ref.current.innerHTML = '';
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
        {renderError ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 12, padding: '32px 20px', textAlign: 'center',
          }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 380,
            }}>
              The diagram couldn't be rendered — the AI generated slightly malformed syntax.
              Try regenerating, or switch to a different output format.
            </p>
            <details style={{ width: '100%', marginTop: 8 }}>
              <summary style={{
                fontFamily: 'var(--font-body)', fontSize: 11,
                color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none',
              }}>
                Show raw syntax
              </summary>
              <pre style={{
                marginTop: 12, padding: '12px 16px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 11, color: 'var(--text-muted)',
                whiteSpace: 'pre-wrap', wordBreak: 'break-all', textAlign: 'left',
              }}>
                {sanitizeMermaid(mermaidCode)}
              </pre>
            </details>
          </div>
        ) : (
          <div
            ref={ref}
            style={{
              minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 13,
            }}
          >
            Rendering diagram…
          </div>
        )}
      </div>
    </div>
  );
}