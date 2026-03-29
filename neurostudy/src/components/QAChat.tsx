"use client";
import { useState } from "react";
import { QAItem } from "@/lib/types";

export default function QAChat({ items }: { items: QAItem[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 shadow-md shadow-black/20 backdrop-blur-sm transition hover:border-white/15"
        >
          <button
            type="button"
            onClick={() => toggle(i)}
            className="flex w-full items-start justify-between gap-4 p-5 text-left transition hover:bg-white/[0.03]"
          >
            <p className="font-medium leading-snug text-zinc-100">{item.question}</p>
            <span
              className={`mt-0.5 shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-violet-300 transition ${
                revealed.has(i) ? "rotate-180" : ""
              }`}
              aria-hidden
            >
              ▼
            </span>
          </button>
          {revealed.has(i) && (
            <div className="border-t border-white/5 px-5 pb-5 pt-0">
              <p className="mt-4 text-pretty leading-relaxed text-zinc-400">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
