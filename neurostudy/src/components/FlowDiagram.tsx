"use client";
import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#7c3aed",
    primaryTextColor: "#f4f4f5",
    primaryBorderColor: "#6d28d9",
    lineColor: "#a1a1aa",
    background: "#18181b",
    mainBkg: "#27272a",
    nodeBorder: "#7c3aed",
    clusterBkg: "#3f3f46",
    titleColor: "#f4f4f5",
    edgeLabelBackground: "#3f3f46",
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
          containerRef.current.innerHTML = `<p class="text-red-400 text-sm">Could not render diagram. Raw output:<br/><pre class="mt-2 text-zinc-400 text-xs whitespace-pre-wrap break-all">${mermaidCode.replace(/</g, "&lt;")}</pre></p>`;
        }
      }
    };

    render();
  }, [mermaidCode]);

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/10 bg-zinc-900/50 p-6 shadow-inner shadow-black/40 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="flex min-h-48 items-center justify-center text-sm text-zinc-500 [&_svg]:mx-auto [&_svg]:max-w-none"
      >
        Rendering diagram…
      </div>
    </div>
  );
}
