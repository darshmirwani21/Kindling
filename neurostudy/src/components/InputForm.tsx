"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudyFormat, InputType } from "@/lib/types";
import MicroModeToggle from "./MicroModeToggle";

const pillActive =
  "bg-violet-600 text-white shadow-lg shadow-violet-600/25 ring-1 ring-white/10";
const pillIdle =
  "bg-zinc-900/80 text-zinc-300 ring-1 ring-white/5 hover:bg-zinc-800/90 hover:ring-white/10";

export default function InputForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [inputType, setInputType] = useState<InputType>("youtube");
  const [format, setFormat] = useState<StudyFormat>("flashcards");
  const [microMode, setMicroMode] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      let ingestRes;

      if (inputType === "pdf" && pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        ingestRes = await fetch("/api/ingest", { method: "POST", body: formData });
      } else {
        ingestRes = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, inputType }),
        });
      }

      const ingestData = await ingestRes.json();
      if (!ingestRes.ok) throw new Error(ingestData.error);

      const synthRes = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: ingestData.rawText,
          format,
          microMode,
          sourceTitle: ingestData.sourceTitle,
        }),
      });

      const synthData = await synthRes.json();
      if (!synthRes.ok) throw new Error(synthData.error);

      sessionStorage.setItem("studyOutput", JSON.stringify(synthData));
      router.push("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
      <div className="space-y-8">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Source</p>
          <div className="flex flex-wrap gap-2">
            {(["youtube", "article", "pdf"] as InputType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setInputType(type)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
                  inputType === type ? pillActive : pillIdle
                }`}
              >
                {type === "youtube" ? "YouTube" : type === "article" ? "Web article" : "PDF upload"}
              </button>
            ))}
          </div>
        </section>

        {inputType === "pdf" ? (
          <label className="block cursor-pointer space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">File</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full cursor-pointer rounded-2xl border border-dashed border-white/15 bg-zinc-950/50 px-4 py-6 text-sm text-zinc-300 transition-colors file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-violet-600 file:px-5 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-violet-500/40"
            />
            {pdfFile && (
              <p className="text-xs text-zinc-500">
                Selected: <span className="text-zinc-300">{pdfFile.name}</span>
              </p>
            )}
          </label>
        ) : (
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">URL</span>
            <input
              type="url"
              placeholder={
                inputType === "youtube" ? "https://www.youtube.com/watch?v=…" : "https://…"
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/30"
            />
          </label>
        )}

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Output format</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            {(["flashcards", "summary", "qa", "flowdiagram"] as StudyFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  format === f ? pillActive : pillIdle
                }`}
              >
                {f === "flashcards"
                  ? "🃏 Flashcards"
                  : f === "summary"
                    ? "📋 Summary"
                    : f === "qa"
                      ? "🎯 Q&A quiz"
                      : "🗺️ Flow diagram"}
              </button>
            ))}
          </div>
        </section>

        <MicroModeToggle enabled={microMode} onChange={setMicroMode} />

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || (inputType !== "pdf" && !url) || (inputType === "pdf" && !pdfFile)}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-base font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generating your study set…
            </span>
          ) : (
            "Generate study material"
          )}
        </button>
      </div>
    </div>
  );
}
