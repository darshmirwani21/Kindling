"use client";
import { useState } from "react";
import { Flashcard } from "@/lib/types";

export default function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>
          Card <span className="font-medium text-stone-700">{index + 1}</span> of{" "}
          <span className="font-medium text-stone-700">{cards.length}</span>
        </span>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">Tap to flip</span>
      </div>

      <div className="[perspective:1200px]">
        <button
          type="button"
          onClick={() => setFlipped(!flipped)}
          className="relative min-h-[14rem] w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <div
            className="relative min-h-[14rem] w-full transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            <div className="absolute inset-0 flex min-h-[14rem] flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm [backface-visibility:hidden]">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-orange-500">
                Question
              </p>
              <p className="text-pretty text-lg font-medium leading-snug text-stone-900 sm:text-xl">{card.front}</p>
              <p className="mt-6 text-xs text-stone-500">Tap to reveal answer</p>
            </div>
            <div className="absolute inset-0 flex min-h-[14rem] flex-col items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 p-8 text-center shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-orange-600">
                Answer
              </p>
              <p className="text-pretty text-lg font-medium leading-relaxed text-stone-900 sm:text-xl">{card.back}</p>
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
          className="flex-1 rounded-xl border border-stone-200 bg-white py-3.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
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
          className="flex-1 rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
