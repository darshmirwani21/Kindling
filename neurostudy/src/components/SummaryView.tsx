import { SummaryChunk } from "@/lib/types";

export default function SummaryView({ chunks }: { chunks: SummaryChunk[] }) {
  return (
    <div className="space-y-4">
      {chunks.map((chunk, i) => (
        <article
          key={i}
          className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-violet-500/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" aria-hidden />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-300/90">{chunk.heading}</h3>
          </div>
          <p className="text-pretty leading-relaxed text-zinc-300">{chunk.body}</p>
        </article>
      ))}
    </div>
  );
}
