# 🔥 Kindling — Fire Aesthetic Overhaul
### Cursor / Windsurf Agent Instructions
> **AI Agent:** This file makes visual and aesthetic changes to an existing Next.js project. Do not recreate files from scratch. Open each specified file, find the exact strings shown, and replace them. Execute every step in order.

---

## WHAT THIS EDIT DOES

- Replaces the violet/zinc color palette with a **fire-themed** palette (amber, orange, red, warm black)
- Adds a **custom flame SVG emblem** as the Kindling logo mark
- Makes the **Kindling heading larger** with a fire gradient text effect
- **Fixes the Micro Mode toggle** (broken anchor point on the knob + missing animation duration)
- Updates all accent colors app-wide to match the fire theme

---

## COLOR REFERENCE (fire palette)

| Role             | Tailwind Class          | Usage                          |
|------------------|-------------------------|-------------------------------|
| Page background  | `bg-stone-950`          | Deepest dark warm black        |
| Card surface     | `bg-stone-900`          | Input fields, cards            |
| Card hover       | `bg-stone-800`          | Hover states                   |
| Primary accent   | `bg-orange-500`         | Buttons, active states         |
| Primary hover    | `bg-orange-400`         | Button hover                   |
| Highlight accent | `text-amber-400`        | Labels, section headings       |
| Danger/warm      | `text-red-400`          | Error states                   |
| Body text        | `text-stone-100`        | Primary readable text          |
| Muted text       | `text-stone-400`        | Subtitles, placeholders        |
| Dimmed text      | `text-stone-500`        | Timestamps, labels             |
| Focus ring       | `ring-orange-500`       | Input focus states             |
| Gradient start   | `from-orange-400`       | Heading gradient               |
| Gradient end     | `to-red-600`            | Heading gradient               |

---

## 1. `src/app/globals.css`

Find the `body` block (or the `:root` / `body` section). Replace the entire file content with the following:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground: #f7f3f0;
  --background: #0c0a09;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: inherit;
}

/* Subtle warm glow on the page background */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 80% 40% at 50% 0%,
    rgba(251, 146, 60, 0.07) 0%,
    transparent 70%
  );
  z-index: 0;
}

* {
  position: relative;
  z-index: 1;
}
```

---

## 2. `src/app/page.tsx`

Replace the entire file with the following:

```tsx
import InputForm from "@/components/InputForm";

function FlameEmblem() {
  return (
    <svg
      width="48"
      height="56"
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer flame */}
      <path
        d="M24 2C24 2 10 16 10 28C10 37.4 16.3 44 24 44C31.7 44 38 37.4 38 28C38 20 32 14 29 9C27.5 16 25.5 19 24 19C22.5 19 19 15 18 9C14 15 10 20 10 28"
        fill="url(#flameGradientOuter)"
      />
      {/* Inner flame highlight */}
      <path
        d="M24 18C24 18 18 25 18 31C18 35.4 20.7 38 24 38C27.3 38 30 35.4 30 31C30 26 27 23 26 20C25.2 24 24 26 24 26C24 26 21 23 21 20C19.5 23 18 26 18 31"
        fill="url(#flameGradientInner)"
        opacity="0.85"
      />
      {/* Core glow */}
      <ellipse
        cx="24"
        cy="34"
        rx="4"
        ry="5"
        fill="url(#flameGradientCore)"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="flameGradientOuter" x1="24" y1="2" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="flameGradientInner" x1="24" y1="18" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="flameGradientCore" x1="24" y1="29" x2="24" y2="39" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-16">
      <div className="max-w-xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FlameEmblem />
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-b from-orange-400 to-red-600 bg-clip-text text-transparent">
            Kindling
          </h1>
          <p className="text-stone-400 text-lg">
            Ignite the way you learn.
          </p>
          <p className="text-stone-500 text-sm">
            Drop in any video, PDF, or article — get a study set in seconds.
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

## 3. `src/components/MicroModeToggle.tsx`

Replace the entire file with the following:

> **Bug fix:** The toggle knob (`<span>`) was `absolute` without a `left-0` anchor, causing the `translate-x` values to calculate from an undefined origin. This version anchors it correctly and adds `duration-200` for smooth animation. Colors are updated to fire theme.

```tsx
"use client";

interface Props {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export default function MicroModeToggle({ enabled, onChange }: Props) {
  return (
    <div className="flex items-center justify-between bg-stone-900 rounded-xl px-4 py-3 border border-stone-800">
      <div>
        <p className="text-stone-100 font-medium text-sm">✂️ Micro Mode</p>
        <p className="text-stone-500 text-xs mt-0.5">
          Shorter chunks, simpler language, laser focus
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-stone-950 ${
          enabled ? "bg-orange-500" : "bg-stone-600"
        }`}
      >
        <span
          className={`absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            enabled ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
```

---

## 4. `src/components/InputForm.tsx`

Make the following targeted replacements. **Do not rewrite the entire file.**

**4a. Update PDF file input accent:**

Find:
```tsx
className="w-full bg-zinc-800 text-zinc-200 rounded-xl p-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-violet-600 file:text-white"
```
Replace with:
```tsx
className="w-full bg-stone-900 text-stone-200 rounded-xl p-4 border border-stone-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-orange-500 file:text-white"
```

**4b. Update URL text input:**

Find:
```tsx
className="w-full bg-zinc-800 text-zinc-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-500"
```
Replace with:
```tsx
className="w-full bg-stone-900 text-stone-200 rounded-xl p-4 outline-none border border-stone-800 focus:ring-2 focus:ring-orange-500 placeholder:text-stone-500"
```

**4c. Update input type selector buttons (active state):**

Find:
```tsx
inputType === type
  ? "bg-violet-600 text-white"
  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
```
Replace with:
```tsx
inputType === type
  ? "bg-orange-500 text-white"
  : "bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-800"
```

**4d. Update study format selector buttons (active state):**

Find:
```tsx
format === f
  ? "bg-violet-600 text-white"
  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
```
Replace with:
```tsx
format === f
  ? "bg-orange-500 text-white"
  : "bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-800"
```

**4e. Update submit button:**

Find:
```tsx
className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold text-lg transition-colors"
```
Replace with:
```tsx
className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:opacity-40 text-white font-bold text-lg transition-all shadow-lg shadow-orange-900/30"
```

---

## 5. `src/components/FlashcardDeck.tsx`

**5a. Update card background:**

Find:
```tsx
className="cursor-pointer min-h-48 bg-zinc-800 rounded-2xl p-8 flex items-center justify-center text-center transition-all hover:bg-zinc-700"
```
Replace with:
```tsx
className="cursor-pointer min-h-48 bg-stone-900 border border-stone-800 rounded-2xl p-8 flex items-center justify-center text-center transition-all hover:bg-stone-800 hover:border-orange-900"
```

**5b. Update card label color:**

Find:
```tsx
className="text-xs text-violet-400 uppercase tracking-widest mb-3"
```
Replace with:
```tsx
className="text-xs text-amber-400 uppercase tracking-widest mb-3"
```

**5c. Update card body text:**

Find:
```tsx
className="text-zinc-100 text-xl font-medium"
```
Replace with:
```tsx
className="text-stone-100 text-xl font-medium"
```

**5d. Update hint text:**

Find:
```tsx
className="text-zinc-500 text-xs mt-4"
```
Replace with:
```tsx
className="text-stone-500 text-xs mt-4"
```

**5e. Update nav buttons:**

Find:
```tsx
className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-700"
```
Replace with:
```tsx
className="flex-1 py-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-30 hover:bg-stone-800"
```

Find:
```tsx
className="flex-1 py-3 rounded-xl bg-violet-600 text-white disabled:opacity-30 hover:bg-violet-500"
```
Replace with:
```tsx
className="flex-1 py-3 rounded-xl bg-orange-500 text-white disabled:opacity-30 hover:bg-orange-400"
```

---

## 6. `src/components/SummaryView.tsx`

**6a. Update card background:**

Find:
```tsx
className="bg-zinc-800 rounded-2xl p-6"
```
Replace with:
```tsx
className="bg-stone-900 border border-stone-800 rounded-2xl p-6"
```

**6b. Update heading color:**

Find:
```tsx
className="text-violet-400 font-semibold text-sm uppercase tracking-wide mb-2"
```
Replace with:
```tsx
className="text-amber-400 font-semibold text-sm uppercase tracking-wide mb-2"
```

**6c. Update body text:**

Find:
```tsx
className="text-zinc-200 leading-relaxed"
```
Replace with:
```tsx
className="text-stone-200 leading-relaxed"
```

---

## 7. `src/components/QAChat.tsx`

**7a. Update card container:**

Find:
```tsx
className="bg-zinc-800 rounded-2xl overflow-hidden"
```
Replace with:
```tsx
className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden"
```

**7b. Update question button hover:**

Find:
```tsx
className="w-full p-5 text-left flex justify-between items-start gap-4 hover:bg-zinc-700 transition-colors"
```
Replace with:
```tsx
className="w-full p-5 text-left flex justify-between items-start gap-4 hover:bg-stone-800 transition-colors"
```

**7c. Update question text:**

Find:
```tsx
className="text-zinc-100 font-medium"
```
Replace with:
```tsx
className="text-stone-100 font-medium"
```

**7d. Update chevron color:**

Find:
```tsx
className="text-violet-400 text-lg shrink-0"
```
Replace with:
```tsx
className="text-amber-400 text-lg shrink-0"
```

**7e. Update divider:**

Find:
```tsx
className="h-px bg-zinc-700 mb-4"
```
Replace with:
```tsx
className="h-px bg-stone-700 mb-4"
```

**7f. Update answer text:**

Find:
```tsx
className="text-zinc-300"
```
Replace with:
```tsx
className="text-stone-300"
```

---

## 8. `src/components/FlowDiagram.tsx`

Update the mermaid theme variables to match the fire palette.

Find:
```tsx
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
```
Replace with:
```tsx
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#f97316",
    primaryTextColor: "#fafaf9",
    primaryBorderColor: "#ea580c",
    lineColor: "#a8a29e",
    background: "#0c0a09",
    mainBkg: "#1c1917",
    nodeBorder: "#f97316",
    clusterBkg: "#292524",
    titleColor: "#fafaf9",
    edgeLabelBackground: "#292524",
  },
});
```

---

## 9. `src/app/results/page.tsx`

**9a. Update page background and text:**

Find:
```tsx
<main className="min-h-screen bg-zinc-950 text-white px-4 py-16">
```
Replace with:
```tsx
<main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-16">
```

**9b. Update back button:**

Find:
```tsx
className="text-zinc-500 text-sm hover:text-zinc-300"
```
Replace with:
```tsx
className="text-stone-500 text-sm hover:text-orange-400 transition-colors"
```

**9c. Update format label color:**

Find:
```tsx
<p className="text-zinc-400 text-sm">{formatLabel}</p>
```
Replace with:
```tsx
<p className="text-amber-400 text-sm font-medium">{formatLabel}</p>
```

---

## 10. AFTER ALL EDITS ARE APPLIED

Run the dev server to verify:

```bash
npm run dev
```

Check the following:
- [ ] Page background is warm dark (near-black with subtle warm orange glow at top)
- [ ] `🔥 Kindling` flame SVG emblem appears centered above the heading
- [ ] "Kindling" heading is large (`text-6xl`), bold, with orange-to-red gradient text
- [ ] Submit button has an orange→red gradient
- [ ] Micro Mode toggle knob slides smoothly left/right with no jump
- [ ] All cards use `stone-900` surfaces with `stone-800` borders
- [ ] All accent labels (flashcard side, summary headings, chevrons) are `amber-400`
- [ ] Flow diagram renders with orange node borders
