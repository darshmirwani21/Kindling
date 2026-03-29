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
          className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm"
        >
          <button
            type="button"
            onClick={() => toggle(i)}
            className="w-full p-5 text-left flex justify-between items-start gap-4 hover:bg-stone-50 transition-colors"
          >
            <p className="text-stone-900 font-medium">{item.question}</p>
            <span
              className={`mt-0.5 shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-orange-500 transition ${
                revealed.has(i) ? "rotate-180" : ""
              }`}
              aria-hidden
            >
              ▼
            </span>
          </button>
          {revealed.has(i) && (
            <div className="border-t border-stone-200 px-5 pb-5 pt-0">
              <p className="mt-4 text-stone-600 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
