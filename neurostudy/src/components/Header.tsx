export default function Header() {
  return (
    <header
      style={{ position: 'relative', zIndex: 10 }}
      className="flex items-center justify-between px-6 py-5 md:px-12"
    >
      {/* Logo lockup */}
      <div className="flex items-center gap-3">
        {/* Flame SVG */}
        <svg width="28" height="34" viewBox="0 0 28 34" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="hfg1" x1="14" y1="2" x2="14" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#ef4444" />
              <stop offset="55%"  stopColor="#FF5B1D" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="hfg2" x1="14" y1="12" x2="14" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          <path d="M14 2C14 2 5 11 5 19.5a9 9 0 0018 0C23 14 20 9.5 17.5 6 16.5 12 15 14.5 14 14.5c-1 0-3-3-3-8.5z" fill="url(#hfg1)"/>
          <path d="M14 13c0 0-4 4.5-4 7.5a4 4 0 008 0c0-2-1.5-4-1.5-4s-.5 2-2 2.5c0 0 1-3-0.5-6z" fill="url(#hfg2)" opacity="0.9"/>
          <ellipse cx="14" cy="23.5" rx="2.2" ry="2.8" fill="#FEF9C3" opacity="0.85"/>
        </svg>
        <span
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
          className="text-xl tracking-tight"
          aria-label="Kindling"
        >
          <span style={{ color: 'var(--text-primary)' }}>kind</span>
          <span style={{ color: 'var(--ember)' }}>ling</span>
        </span>
      </div>

      {/* Tagline pill */}
      <span
        className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
        style={{
          background: 'var(--ember-dim)',
          color: 'var(--ember)',
          border: '1px solid var(--border-hover)',
          fontFamily: 'var(--font-body)',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ember)', display: 'inline-block' }} />
        Ignite the way you learn.
      </span>
    </header>
  );
}
