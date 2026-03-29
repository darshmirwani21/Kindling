# 🔥 Kindling — Aesthetic & Branding Edit
### Cursor / Windsurf Agent Instructions
> **AI Agent:** This file contains targeted find-and-replace edits to an existing Next.js project. Do not recreate files from scratch. Open each file specified below, locate the exact strings, and replace them as instructed. Execute every step in order.

---

## WHAT THIS EDIT DOES

- Renames the app from **NeuroStudy** to **Kindling**
- Updates the tagline to **"Ignite the way you learn."**
- Updates the browser tab title and metadata
- Updates all user-facing text references throughout the app

---

## 1. `src/app/page.tsx`

Find:
```tsx
<h1 className="text-4xl font-bold tracking-tight">
  🧠 NeuroStudy
</h1>
<p className="text-zinc-400 text-lg">
  Drop in any YouTube video, PDF, or article.
  <br />
  Get a study set built for your brain.
</p>
```

Replace with:
```tsx
<h1 className="text-4xl font-bold tracking-tight">
  🔥 Kindling
</h1>
<p className="text-zinc-400 text-lg">
  Ignite the way you learn.
  <br />
  Drop in any video, PDF, or article — get a study set in seconds.
</p>
```

---

## 2. `src/app/layout.tsx`

> **Note:** If this file does not exist yet, create it at `src/app/layout.tsx` with the full content in the block below. If it already exists, find and replace the `title` and `description` metadata fields as shown.

Full file content (create or overwrite):
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kindling — Ignite the way you learn.",
  description:
    "Drop in any YouTube video, PDF, or article. Kindling turns it into flashcards, summaries, quizzes, or a flow diagram — instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## 3. `src/app/results/page.tsx`

Find:
```tsx
<h2 className="text-2xl font-bold">{output.title}</h2>
```

This line is fine as-is since `output.title` is dynamic. No change needed here.

However, find the back button and add the app name as a subtle brand anchor:

Find:
```tsx
<button onClick={() => router.push("/")} className="text-zinc-500 text-sm hover:text-zinc-300">
  ← Back
</button>
```

Replace with:
```tsx
<button onClick={() => router.push("/")} className="text-zinc-500 text-sm hover:text-zinc-300">
  ← Back to Kindling
</button>
```

---

## 4. `src/components/InputForm.tsx`

Find:
```tsx
{loading ? "Generating your study set..." : "Generate Study Material ✨"}
```

Replace with:
```tsx
{loading ? "Kindling your study set..." : "Ignite ✨"}
```

---

## 5. `package.json`

Find:
```json
"name": "neurostudy",
```

Replace with:
```json
"name": "kindling",
```

---

## 6. AFTER ALL EDITS ARE APPLIED

Run the dev server to verify all changes render correctly:

```bash
npm run dev
```

Check the following:
- [ ] Browser tab reads: `Kindling — Ignite the way you learn.`
- [ ] Home screen heading shows: `🔥 Kindling`
- [ ] Subheading shows: `Ignite the way you learn.`
- [ ] Submit button reads: `Ignite ✨`
- [ ] Results back button reads: `← Back to Kindling`
- [ ] Loading state reads: `Kindling your study set...`
