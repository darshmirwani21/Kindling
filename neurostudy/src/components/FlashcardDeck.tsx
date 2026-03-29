"use client";
import { useState } from "react";
import { Flashcard } from "@/lib/types";

export default function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          Card <span className="font-medium text-zinc-300">{index + 1}</span> of{" "}
          <span className="font-medium text-zinc-300">{cards.length}</span>
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-500">Tap to flip</span>
      </div>

      <div className="[perspective:1200px]">
        <button
          type="button"
          onClick={() => setFlipped(!flipped)}
          className="relative min-h-[14rem] w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <div
            className="relative min-h-[14rem] w-full transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            <div className="absolute inset-0 flex min-h-[14rem] flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/95 to-zinc-950/95 p-8 text-center shadow-xl shadow-black/40 [backface-visibility:hidden]">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet-400/90">
                Question
              </p>
              <p className="text-pretty text-lg font-medium leading-snug text-zinc-100 sm:text-xl">{card.front}</p>
              <p className="mt-6 text-xs text-zinc-500">Tap to reveal answer</p>
            </div>
            <div className="absolute inset-0 flex min-h-[14rem] flex-col items-center justify-center rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-950/60 to-zinc-950/95 p-8 text-center shadow-xl shadow-violet-950/20 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-fuchsia-400/90">
                Answer
              </p>
              <p className="text-pretty text-lg font-medium leading-relaxed text-zinc-100 sm:text-xl">{card.back}</p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setIndex(Math.max(0, index - 1));
            setFlipped(false);
          }}
          disabled={index === 0}
          className="flex-1 rounded-2xl border border-white/10 bg-zinc-900/80 py-3.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-35"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => {
            setIndex(Math.min(cards.length - 1, index + 1));
            setFlipped(false);
          }}
          disabled={index === cards.length - 1}
          className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
