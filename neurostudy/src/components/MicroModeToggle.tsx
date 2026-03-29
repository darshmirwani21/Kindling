"use client";

interface Props {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export default function MicroModeToggle({ enabled, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-100">✂️ Micro mode</p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
          Shorter chunks, simpler wording, tighter focus.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
          enabled ? "bg-violet-600" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
