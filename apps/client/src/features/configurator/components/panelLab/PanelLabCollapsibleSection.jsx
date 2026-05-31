import { useId, useState } from 'react';

/** Collapsible settings block: title always visible, body toggles on click. */
export function PanelLabCollapsibleSection({ title, defaultOpen = false, children }) {
  const reactId = useId();
  const regionId = `panel-lab-section-${reactId.replace(/:/g, '')}`;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-md border border-gray-500/45 bg-white/25 overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-w-0 items-center justify-between gap-2 px-2 py-2 text-left text-[11px] font-semibold text-gray-800 hover:bg-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-600/50 rounded-md"
      >
        <span className="truncate">{title}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div
          id={regionId}
          role="region"
          className="border-t border-gray-500/35 px-2 pb-2 pt-2"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
