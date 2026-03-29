export default function NeuroShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_95%_65%_at_50%_-25%,rgba(109,40,217,0.28),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_0%,rgba(124,58,237,0.14),transparent_52%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_45%_35%_at_0%_100%,rgba(59,130,246,0.06),transparent_50%)]"
      />
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-20">{children}</div>
    </div>
  );
}
