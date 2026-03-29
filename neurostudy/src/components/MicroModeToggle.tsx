'use client';

interface Props {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export default function MicroModeToggle({ enabled, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-3 group"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      {/* Track */}
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: 44,
          height: 24,
          borderRadius: 12,
          background: enabled ? 'var(--ember)' : 'var(--surface-3)',
          border: enabled ? '1px solid var(--ember)' : '1px solid var(--border)',
          transition: 'background 0.2s, border-color 0.2s',
          flexShrink: 0,
          boxShadow: enabled ? '0 0 10px rgba(255,91,29,0.25)' : 'none',
        }}
      >
        {/* Knob */}
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: enabled ? 22 : 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </span>
      {/* Label */}
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 500,
          color: enabled ? 'var(--ember)' : 'var(--text-secondary)',
          transition: 'color 0.2s',
          letterSpacing: '0.02em',
        }}
      >
        ✂️ Micro Mode
      </span>
    </button>
  );
}
