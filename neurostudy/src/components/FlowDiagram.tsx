"use client";
import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  themeVariables: {
    primaryColor: "#f97316",
    primaryTextColor: "#1c1917",
    primaryBorderColor: "#ea580c",
    lineColor: "#78716c",
    background: "#fafaf9",
    mainBkg: "#ffffff",
    nodeBorder: "#f97316",
    clusterBkg: "#f5f5f4",
    titleColor: "#1c1917",
    edgeLabelBackground: "#ffffff",
  },
});

export default function FlowDiagram({ mermaidCode }: { mermaidCode: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !mermaidCode) return;

    const render = async () => {
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<p class="text-red-500 text-sm">Could not render diagram. Raw output:<br/><pre class="mt-2 text-stone-600 text-xs whitespace-pre-wrap break-all">${mermaidCode.replace(/</g, "&lt;")}</pre></p>`;
        }
      }
    };

    render();
  }, [mermaidCode]);

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
      <div
        ref={containerRef}
        className="flex min-h-48 items-center justify-center text-sm text-stone-500 [&_svg]:mx-auto [&_svg]:max-w-none"
      >
        Rendering diagram…
      </div>
    </div>
  );
}
