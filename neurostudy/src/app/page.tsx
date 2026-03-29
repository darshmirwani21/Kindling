import InputForm from "@/components/InputForm";
import NeuroShell from "@/components/NeuroShell";

export default function Home() {
  return (
    <NeuroShell>
      <main className="space-y-12">
        <header className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-violet-300/90 backdrop-blur-sm">
            <span className="text-base leading-none" aria-hidden>
              🧠
            </span>
            NeuroStudy
          </div>
          <h1 className="bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Study smarter, not longer
          </h1>
          <p className="mx-auto max-w-md text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
            Paste a YouTube link, upload a PDF, or drop an article URL. Pick a format and get material
            tuned to how you learn.
          </p>
        </header>

        <InputForm />
      </main>
    </NeuroShell>
  );
}
