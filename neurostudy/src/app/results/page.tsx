"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudyOutput } from "@/lib/types";
import FlashcardDeck from "@/components/FlashcardDeck";
import SummaryView from "@/components/SummaryView";
import QAChat from "@/components/QAChat";
import FlowDiagram from "@/components/FlowDiagram";
import NeuroShell from "@/components/NeuroShell";

export default function ResultsPage() {
  const router = useRouter();
  const [output] = useState<StudyOutput | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("studyOutput");
    return stored ? (JSON.parse(stored) as StudyOutput) : null;
  });

  useEffect(() => {
    if (!output) router.replace("/");
  }, [output, router]);

  if (!output) {
    return (
      <NeuroShell>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400"
            aria-hidden
          />
          <p className="text-sm text-zinc-500">Loading your study set…</p>
        </div>
      </NeuroShell>
    );
  }

  const formatLabel = {
    flashcards: "🃏 Flashcard deck",
    summary: "📋 Chunked summary",
    qa: "🎯 Q&A quiz",
    flowdiagram: "🗺️ Flow diagram",
  }[output.format];

  return (
    <NeuroShell>
      <main className="space-y-10">
        <header className="space-y-3 border-b border-white/10 pb-8">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            <span className="transition group-hover:-translate-x-0.5">←</span> Back home
          </button>
          <div>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">{output.title}</h1>
            <p className="mt-2 text-sm text-violet-300/80">{formatLabel}</p>
          </div>
        </header>

        {output.format === "flashcards" && output.flashcards && <FlashcardDeck cards={output.flashcards} />}
        {output.format === "summary" && output.summary && <SummaryView chunks={output.summary} />}
        {output.format === "qa" && output.qa && <QAChat items={output.qa} />}
        {output.format === "flowdiagram" && output.mermaidCode && (
          <FlowDiagram mermaidCode={output.mermaidCode} />
        )}
      </main>
    </NeuroShell>
  );
}
