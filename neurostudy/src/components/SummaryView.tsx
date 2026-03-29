import { SummaryChunk } from "@/lib/types";

export default function SummaryView({ chunks }: { chunks: SummaryChunk[] }) {
  return (
    <div className="space-y-4">
      {chunks.map((chunk, i) => (
        <article
          key={i}
          className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500" aria-hidden />
            <h3 className="text-orange-600 font-semibold text-sm uppercase tracking-wide">{chunk.heading}</h3>
          </div>
          <p className="text-stone-700 leading-relaxed">{chunk.body}</p>
        </article>
      ))}
    </div>
  );
}
