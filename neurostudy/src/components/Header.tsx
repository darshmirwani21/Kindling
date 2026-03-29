export default function Header() {
  return (
    <header className="w-full border-b border-stone-200 bg-white px-6 py-4 flex items-center gap-3">
      {/* Flame Emblem */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer flame body */}
        <path
          d="M16 2C16 2 8 10 8 18a8 8 0 0016 0c0-4-2-7-2-7s-1 3-3 4c0 0 1-6-3-13z"
          fill="url(#flameOuter)"
        />
        {/* Inner highlight */}
        <path
          d="M16 10C16 10 12 15 12 19a4 4 0 008 0c0-2-1-4-1-4s-0.5 2-2 2.5c0 0 1-4-1-7.5z"
          fill="url(#flameInner)"
        />
        {/* Core glow */}
        <ellipse cx="16" cy="21" rx="2" ry="2.5" fill="#FDE68A" opacity="0.9" />
        <defs>
          <linearGradient id="flameOuter" x1="16" y1="2" x2="16" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="60%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="flameInner" x1="16" y1="10" x2="16" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>
      </svg>

      {/* Brand name */}
      <span className="text-2xl font-extrabold tracking-tight text-stone-900">
        Kindling
      </span>

      {/* Tagline — hidden on small screens */}
      <span className="hidden sm:inline text-sm text-stone-400 font-normal ml-1 mt-0.5">
        Ignite the way you learn.
      </span>
    </header>
  );
}
