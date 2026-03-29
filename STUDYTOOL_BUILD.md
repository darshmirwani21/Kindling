# 🧠 NeuroStudy — AI-Powered Study Tool MVP
### Cursor / Windsurf Agent Build Instructions
> **AI Agent:** Read this file top to bottom and execute every step in order. Create all files and folders exactly as specified. Do not skip sections. If a `.env` value is required, create the file with placeholder text and note it for the user.

---

## 0. WHAT WE'RE BUILDING

A Next.js web app where a student pastes a YouTube URL, uploads a PDF, or pastes a web article URL — and the app uses the **Google Gemini API (free tier)** to synthesize the content into one of four study formats:
- **Flashcards** (flippable, spaced-repetition style)
- **Chunked Summary** (short paragraphs with headers)
- **Q&A Chat** (Socratic mode — AI quizzes the student)
- **Flow Diagram** (Mermaid.js visual concept map rendered in the browser)

There is also a **✂️ Micro Mode toggle** that modifies the prompt to produce shorter, more focused, stripped-down output.

---

## 1. INITIALIZE THE PROJECT

Run the following commands in the terminal:

```bash
npx create-next-app@latest neurostudy --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd neurostudy
npm install pdf-parse@1.1.1 youtube-transcript @mozilla/readability node-fetch jsdom @google/generative-ai mermaid
npm install -D @types/pdf-parse @types/node @types/jsdom
```

**Why these versions:** `pdf-parse` **v2** removed the default export used in `api/ingest/route.ts`. Pin **`pdf-parse@1.1.1`** unless you rewrite ingestion for the v2 API. **`@types/jsdom`** is required for strict TypeScript when importing `jsdom`.

### 1b. `next.config` (bundling)

Add `serverExternalPackages` so Next.js does not bundle `pdf-parse` incorrectly:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
```

---

## 2. ENVIRONMENT VARIABLES

Create a file at the project root called `.env.local` with the following content:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **User note:** Get your free API key at https://aistudio.google.com/app/apikey — no credit card required. The free tier allows 1,500 requests/day with Gemini 2.0 Flash.

---

## 3. FILE STRUCTURE TO CREATE

Create all of the following files exactly as specified in Section 4 below:

```
src/
  app/
    page.tsx                        ← Home screen (input + preferences)
    results/
      page.tsx                      ← Output screen (renders study material)
    api/
      ingest/
        route.ts                    ← Extracts raw text from URL or PDF
      synthesize/
        route.ts                    ← Sends text to Gemini, returns study material
  components/
    FlashcardDeck.tsx               ← Renders flippable flashcard UI
    SummaryView.tsx                 ← Renders chunked summary
    QAChat.tsx                      ← Renders interactive Q&A quiz
    FlowDiagram.tsx                 ← Renders Mermaid.js flow diagram
    InputForm.tsx                   ← Main input form on home screen
    MicroModeToggle.tsx             ← ✂️ Micro Mode on/off toggle
    NeuroShell.tsx                  ← Optional: shared page background + width (reference implementation)
  lib/
    prompts.ts                      ← All Gemini prompt templates
    types.ts                        ← Shared TypeScript types
```

---

## 4. FILE CONTENTS — CREATE EACH FILE EXACTLY AS BELOW

---

### `src/lib/types.ts`

```typescript
export type StudyFormat = "flashcards" | "summary" | "qa" | "flowdiagram";

export type InputType = "youtube" | "pdf" | "article";

export interface Flashcard {
  front: string;
  back: string;
}

export interface SummaryChunk {
  heading: string;
  body: string;
}

export interface QAItem {
  question: string;
  answer: string;
}

export interface StudyOutput {
  format: StudyFormat;
  title: string;
  flashcards?: Flashcard[];
  summary?: SummaryChunk[];
  qa?: QAItem[];
  mermaidCode?: string;
}

export interface IngestRequest {
  url?: string;
  inputType: InputType;
}

export interface SynthesizeRequest {
  rawText: string;
  format: StudyFormat;
  microMode: boolean;
  sourceTitle?: string;
}
```

---

### `src/lib/prompts.ts`

```typescript
import { StudyFormat } from "./types";

export function buildPrompt(
  rawText: string,
  format: StudyFormat,
  microMode: boolean,
  sourceTitle?: string
): string {
  const microInstructions = microMode
    ? `
IMPORTANT — Micro Mode is ON. You MUST follow these rules:
- Keep every single piece of text SHORT. No sentence over 20 words.
- Use simple, direct language. No jargon unless absolutely necessary.
- Break everything into the smallest possible chunks.
- Use active voice. Make it engaging, not dry.
- Add a brief motivational nudge at the very end (1 sentence max).
`
    : "";

  const sourceLine = sourceTitle
    ? `The source material is titled: "${sourceTitle}".`
    : "";

  const formatInstructions: Record<StudyFormat, string> = {
    flashcards: `
Generate a set of 10-15 flashcards from the study material below.
Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
Each object must have exactly two fields: "front" (the question or term) and "back" (the answer or definition).
Example format:
[{"front": "What is mitosis?", "back": "Cell division producing two identical daughter cells."}]
`,
    summary: `
Generate a structured study summary from the material below.
Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
Each object must have exactly two fields: "heading" (a short section title, max 5 words) and "body" (2-4 sentences summarizing that section).
Aim for 5-8 chunks total.
Example format:
[{"heading": "What is Photosynthesis", "body": "Plants convert sunlight into glucose. This process happens in the chloroplasts."}]
`,
    qa: `
Generate 8-12 Socratic-style quiz questions from the material below.
Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
Each object must have exactly two fields: "question" (what you'd ask the student) and "answer" (the correct answer, 1-3 sentences).
Make questions progressively harder — start simple, end with application/analysis.
Example format:
[{"question": "What does DNA stand for?", "answer": "Deoxyribonucleic acid. It carries the genetic instructions for all living organisms."}]
`,
    flowdiagram: `
Generate a Mermaid.js flowchart that maps the key concepts and their relationships from the study material below.
Return ONLY the raw Mermaid syntax. No markdown fences, no explanation, no backticks, no "mermaid" label.
Start directly with "flowchart TD" on the first line.
Use short node labels (max 5 words each). Include 8-15 nodes. Show cause/effect, sequence, or hierarchy as appropriate.
Example format:
flowchart TD
  A[Photosynthesis] --> B[Light Reactions]
  A --> C[Calvin Cycle]
  B --> D[ATP + NADPH]
  C --> E[Glucose]
`,
  };

  return `${microInstructions}
${sourceLine}
${formatInstructions[format]}

--- STUDY MATERIAL START ---
${rawText.slice(0, 12000)}
--- STUDY MATERIAL END ---
`;
}
```

---

### `src/app/api/ingest/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Handle PDF upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await pdfParse(buffer);
      return NextResponse.json({
        rawText: parsed.text,
        sourceTitle: file.name.replace(".pdf", ""),
        inputType: "pdf",
      });
    }

    // Handle URL (YouTube or article)
    const { url, inputType } = await req.json();

    if (inputType === "youtube") {
      const videoId = extractYouTubeId(url);
      if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const rawText = transcript.map((t) => t.text).join(" ");
      return NextResponse.json({ rawText, sourceTitle: "YouTube Video", inputType: "youtube" });
    }

    if (inputType === "article") {
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      if (!article) return NextResponse.json({ error: "Could not parse article" }, { status: 400 });

      return NextResponse.json({
        rawText: article.textContent,
        sourceTitle: article.title,
        inputType: "article",
      });
    }

    return NextResponse.json({ error: "Unknown input type" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Ingestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/
  );
  return match ? match[1] : null;
}
```

---

### `src/app/api/synthesize/route.ts`

Validate `GEMINI_API_KEY` and non-empty `rawText` before calling Gemini (clear errors for missing env or empty ingestion).

```typescript
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPrompt } from "@/lib/prompts";
import { StudyFormat } from "@/lib/types";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY in .env.local" }, { status: 503 });
  }

  try {
    const { rawText, format, microMode, sourceTitle } = await req.json();
    if (typeof rawText !== "string" || !rawText.trim()) {
      return NextResponse.json({ error: "No text to study" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = buildPrompt(rawText, format as StudyFormat, microMode, sourceTitle);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Strip any accidental markdown code fences
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```mermaid\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Flow diagram returns raw Mermaid syntax, not JSON
    if (format === "flowdiagram") {
      return NextResponse.json({
        format,
        title: sourceTitle || "Study Session",
        mermaidCode: cleaned,
      });
    }

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      format,
      title: sourceTitle || "Study Session",
      [format === "flashcards" ? "flashcards" : format === "summary" ? "summary" : "qa"]: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Synthesis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

### `src/components/InputForm.tsx`

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudyFormat, InputType } from "@/lib/types";
import MicroModeToggle from "./MicroModeToggle";

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
    <div className="max-w-xl mx-auto space-y-6">
      {/* Input Type Selector */}
      <div className="flex gap-2">
        {(["youtube", "article", "pdf"] as InputType[]).map((type) => (
          <button
            key={type}
            onClick={() => setInputType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              inputType === type
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {type === "youtube" ? "YouTube" : type === "article" ? "Web Article" : "PDF Upload"}
          </button>
        ))}
      </div>

      {/* URL Input or File Upload */}
      {inputType === "pdf" ? (
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          className="w-full bg-zinc-800 text-zinc-200 rounded-xl p-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-violet-600 file:text-white"
        />
      ) : (
        <input
          type="url"
          placeholder={
            inputType === "youtube"
              ? "Paste a YouTube URL..."
              : "Paste an article URL..."
          }
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-zinc-800 text-zinc-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-500"
        />
      )}

      {/* Study Format Selector */}
      <div className="grid grid-cols-2 gap-2">
        {(["flashcards", "summary", "qa", "flowdiagram"] as StudyFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              format === f
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {f === "flashcards"
              ? "🃏 Flashcards"
              : f === "summary"
              ? "📋 Summary"
              : f === "qa"
              ? "🎯 Q&A Quiz"
              : "🗺️ Flow Diagram"}
          </button>
        ))}
      </div>

      {/* Micro Mode Toggle */}
      <MicroModeToggle enabled={microMode} onChange={setMicroMode} />

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || (inputType !== "pdf" && !url) || (inputType === "pdf" && !pdfFile)}
        className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold text-lg transition-colors"
      >
        {loading ? "Generating your study set..." : "Generate Study Material ✨"}
      </button>
    </div>
  );
}
```

---

### `src/components/MicroModeToggle.tsx`

```tsx
"use client";

interface Props {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export default function MicroModeToggle({ enabled, onChange }: Props) {
  return (
    <div className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3">
      <div>
        <p className="text-zinc-200 font-medium text-sm">✂️ Micro Mode</p>
        <p className="text-zinc-500 text-xs mt-0.5">Shorter chunks, simpler language, laser focus</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative ${
          enabled ? "bg-violet-600" : "bg-zinc-600"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
```

---

### `src/components/FlashcardDeck.tsx`

```tsx
"use client";
import { useState } from "react";
import { Flashcard } from "@/lib/types";

export default function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  return (
    <div className="space-y-6">
      <p className="text-zinc-400 text-sm text-center">
        Card {index + 1} of {cards.length}
      </p>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer min-h-48 bg-zinc-800 rounded-2xl p-8 flex items-center justify-center text-center transition-all hover:bg-zinc-700"
      >
        <div>
          <p className="text-xs text-violet-400 uppercase tracking-widest mb-3">
            {flipped ? "Answer" : "Question"}
          </p>
          <p className="text-zinc-100 text-xl font-medium">
            {flipped ? card.back : card.front}
          </p>
          {!flipped && (
            <p className="text-zinc-500 text-xs mt-4">Tap to reveal answer</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => { setIndex(Math.max(0, index - 1)); setFlipped(false); }}
          disabled={index === 0}
          className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-700"
        >
          ← Previous
        </button>
        <button
          onClick={() => { setIndex(Math.min(cards.length - 1, index + 1)); setFlipped(false); }}
          disabled={index === cards.length - 1}
          className="flex-1 py-3 rounded-xl bg-violet-600 text-white disabled:opacity-30 hover:bg-violet-500"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
```

---

### `src/components/SummaryView.tsx`

```tsx
import { SummaryChunk } from "@/lib/types";

export default function SummaryView({ chunks }: { chunks: SummaryChunk[] }) {
  return (
    <div className="space-y-4">
      {chunks.map((chunk, i) => (
        <div key={i} className="bg-zinc-800 rounded-2xl p-6">
          <h3 className="text-violet-400 font-semibold text-sm uppercase tracking-wide mb-2">
            {chunk.heading}
          </h3>
          <p className="text-zinc-200 leading-relaxed">{chunk.body}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### `src/components/QAChat.tsx`

```tsx
"use client";
import { useState } from "react";
import { QAItem } from "@/lib/types";

export default function QAChat({ items }: { items: QAItem[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-zinc-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggle(i)}
            className="w-full p-5 text-left flex justify-between items-start gap-4 hover:bg-zinc-700 transition-colors"
          >
            <p className="text-zinc-100 font-medium">{item.question}</p>
            <span className="text-violet-400 text-lg shrink-0">
              {revealed.has(i) ? "▲" : "▼"}
            </span>
          </button>
          {revealed.has(i) && (
            <div className="px-5 pb-5">
              <div className="h-px bg-zinc-700 mb-4" />
              <p className="text-zinc-300">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### `src/components/FlowDiagram.tsx`

```tsx
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
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<p class="text-red-400 text-sm">Could not render diagram. Raw output:<br/><pre class="mt-2 text-zinc-400 text-xs whitespace-pre-wrap">${mermaidCode}</pre></p>`;
        }
      }
    };

    render();
  }, [mermaidCode]);

  return (
    <div className="bg-zinc-800 rounded-2xl p-6 overflow-x-auto">
      <div ref={containerRef} className="min-h-48 flex items-center justify-center text-zinc-500 text-sm">
        Rendering diagram...
      </div>
    </div>
  );
}
```

---

### `src/app/page.tsx`

```tsx
import InputForm from "@/components/InputForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-16">
      <div className="max-w-xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            🧠 NeuroStudy
          </h1>
          <p className="text-zinc-400 text-lg">
            Drop in any YouTube video, PDF, or article.
            <br />
            Get a study set built for your brain.
          </p>
        </div>

        {/* Form */}
        <InputForm />
      </div>
    </main>
  );
}
```

---

### `src/app/results/page.tsx`

Read study data from `sessionStorage` on the client. Use a **state initializer** (not `setState` inside `useEffect`) so ESLint React 19 rules stay clean. Show a short loading state while redirecting if nothing is stored.

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudyOutput } from "@/lib/types";
import FlashcardDeck from "@/components/FlashcardDeck";
import SummaryView from "@/components/SummaryView";
import QAChat from "@/components/QAChat";
import FlowDiagram from "@/components/FlowDiagram";

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
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
        Loading…
      </main>
    );
  }

  const formatLabel = {
    flashcards: "🃏 Flashcard Deck",
    summary: "📋 Chunked Summary",
    qa: "🎯 Q&A Quiz",
    flowdiagram: "🗺️ Flow Diagram",
  }[output.format];

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-16">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-1">
          <button type="button" onClick={() => router.push("/")} className="text-zinc-500 text-sm hover:text-zinc-300">
            ← Back
          </button>
          <h2 className="text-2xl font-bold">{output.title}</h2>
          <p className="text-zinc-400 text-sm">{formatLabel}</p>
        </div>
        {output.format === "flashcards" && output.flashcards && (
          <FlashcardDeck cards={output.flashcards} />
        )}
        {output.format === "summary" && output.summary && (
          <SummaryView chunks={output.summary} />
        )}
        {output.format === "qa" && output.qa && <QAChat items={output.qa} />}
        {output.format === "flowdiagram" && output.mermaidCode && (
          <FlowDiagram mermaidCode={output.mermaidCode} />
        )}
      </div>
    </main>
  );
}
```

---

## 5. AFTER ALL FILES ARE CREATED

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 6. DEPLOYMENT (Vercel — one command)

```bash
npm install -g vercel
vercel
```

When prompted, add the environment variable:
- Key: `GEMINI_API_KEY`
- Value: your free key from https://aistudio.google.com/app/apikey

---

## 7. KNOWN LIMITATIONS / FUTURE IMPROVEMENTS

- **PDF ingestion** is server-side only; very large PDFs (>50 pages) may be slow — consider chunking
- **YouTube transcripts** may fail for videos with auto-generated captions disabled
- **Article scraping** may fail on paywalled sites — add a "paste text manually" fallback input
- **Session storage** is used to pass data between pages — replace with a database (Supabase) for persistence
- **No auth** — add Clerk or NextAuth for user accounts + history tracking in v2
- **Micro Mode** currently only affects prompt — future: add visual chunking, timer, break reminders in the UI
- **Flow Diagram** quality depends on Gemini's Mermaid output — add a "copy raw syntax" button as fallback

---

## 8. INTEGRATION CHECKLIST

- **Environment:** Replace the placeholder in `.env.local` with a real key from [Google AI Studio](https://aistudio.google.com/app/apikey). The synthesize API returns `503` if the key is missing or still set to `your_gemini_api_key_here`.
- **Build:** Run `npm run build` — it should compile with TypeScript strict checks (including `jsdom` types).
- **Flow:** Home → paste URL or PDF → **Generate** → `/results` shows the chosen format. Empty PDFs/transcripts/articles return `400` from `/api/ingest` with a clear message.
- **Deploy:** On Vercel, add `GEMINI_API_KEY` in **Project → Settings → Environment Variables** (same as section 6).

Optional UI polish in the reference repo: shared **`NeuroShell`** wrapper (gradients + max width), updated **`globals.css`** (Geist as body font), and stricter empty-text checks in ingest/synthesize routes.

---

## 9. DEMO SCRIPT (For Hackathon Judges)

1. Open the app
2. Select **YouTube**, paste: `https://www.youtube.com/watch?v=aircAruvnKk` (a known lecture video)
3. Select **Flashcards**, turn on **✂️ Micro Mode**
4. Hit **Generate** — show the flipping flashcard deck
5. Hit Back, switch to **🗺️ Flow Diagram**, regenerate
6. Show the live-rendered Mermaid concept map
7. Hit Back, switch to **🎯 Q&A Quiz**, regenerate
8. Show the accordion Q&A
9. Explain the vision: *"Any content, any learner, any format — built for the way students actually think."*
