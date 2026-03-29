interface HeaderProps {
  onHistoryOpen?: () => void;
}

export default function Header({ onHistoryOpen }: HeaderProps) {
  return (
    <header
      style={{ position: 'relative', zIndex: 10 }}
      className="flex items-center justify-between px-6 py-5 md:px-12"
    >
      {/* Logo lockup — shifted down and right, scaled up */}
      <div
        className="flex items-center gap-3"
        style={{ marginLeft: 18, marginTop: 10 }}
      >
        {/* Flame SVG — scaled up from 28×34 to 36×44 */}
        <svg width="36" height="44" viewBox="0 0 28 34" fill="none" aria-hidden="true">
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
        {/* Brand name — bumped from text-xl to text-2xl */}
        <span
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: '1.5rem' }}
          className="tracking-tight"
          aria-label="Kindling"
        >
          <span style={{ color: 'var(--text-primary)' }}>kind</span>
          <span style={{ color: 'var(--ember)' }}>ling</span>
        </span>
      </div>

      {/* History button — slightly larger */}
      {onHistoryOpen && (
        <button
          type="button"
          onClick={onHistoryOpen}
          title="Recent sessions"
          style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, cursor: 'pointer', padding: '9px 16px',
            color: 'var(--text-secondary)', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: 'var(--font-body)', fontSize: 14,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ember)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
          }}
        >
          🕐 History
        </button>
      )}

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