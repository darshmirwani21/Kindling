interface MicroModeToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export default function MicroModeToggle({ enabled, onChange }: MicroModeToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-stone-600">Micro Mode</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
          enabled ? 'bg-orange-500' : 'bg-stone-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {enabled && (
        <span className="text-xs text-orange-500 font-medium">On</span>
      )}
    </div>
  );
}
