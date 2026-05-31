import { useState } from 'react';
import {
  DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  LiquidGlassWorkspaceButton,
} from '../../../components/ui/LiquidGlass';
import { useConfigurator } from '../hooks/useConfigurator.js';

/** Compact glass-style buttons for variant indices (same language as models panel). */
const VARIANT_GLASS_TUNE = {
  ...DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  checkSizePx: 18,
  labelFontRem: 0.8125,
  scaleFontWithCheck: true,
};

const PANEL_W = 'min(13.75rem,calc(100% - 2rem))';

const panelChromeExpanded =
  'rounded-lg border border-gray-500 bg-gray-400/95 text-gray-950 shadow-lg shadow-black/25 pointer-events-auto transition-[width,max-width] duration-200 ease-out';
const panelChromeCollapsed =
  'rounded-lg border border-white/15 bg-gray-400/25 backdrop-blur-md backdrop-saturate-150 ' +
  'supports-[backdrop-filter]:bg-gray-400/20 shadow-none pointer-events-auto transition-[width,max-width] duration-200 ease-out';

export function VariantsPanel() {
  const { groupOptions, selection, setSelection } = useConfigurator();
  const [panelExpanded, setPanelExpanded] = useState(false);

  const entries = Object.entries(groupOptions).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <aside
      className={`
        absolute z-20 right-4 top-24 bottom-auto
        flex flex-col items-stretch
        ${panelExpanded ? 'gap-3 max-h-[min(72vh,calc(100%-7rem))] overflow-y-auto overflow-x-hidden' : 'overflow-hidden p-0'}
        ${panelExpanded ? 'px-3 pt-3 pb-3' : ''}
        ${panelExpanded ? panelChromeExpanded : panelChromeCollapsed}
      `}
      style={
        panelExpanded
          ? { width: PANEL_W, maxWidth: PANEL_W }
          : { width: '2.75rem', minWidth: '2.75rem', maxWidth: '2.75rem', height: '2.75rem', minHeight: '2.75rem' }
      }
    >
      <button
        type="button"
        onClick={() => setPanelExpanded((v) => !v)}
        aria-expanded={panelExpanded}
        aria-controls={panelExpanded ? 'variants-panel-body' : undefined}
        aria-label={panelExpanded ? 'Collapse variants panel' : 'Expand variants panel'}
        className={`
          flex shrink-0 items-center justify-center focus:outline-none focus-visible:ring-2
          ${panelExpanded
            ? 'rounded-md text-gray-800 hover:bg-gray-500/35 focus-visible:ring-gray-600 mx-auto mb-0 h-8 w-8'
            : 'h-full w-full min-h-0 rounded-lg text-slate-100 hover:bg-white/15 focus-visible:ring-white/40'}
        `}
      >
        {panelExpanded ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>

      {panelExpanded ? (
        <div id="variants-panel-body" className="min-w-0 text-gray-900">
          {entries.map(([groupId, { label, count }]) => (
            <div key={groupId} className="mb-4 last:mb-0">
              <span className="mb-1.5 block text-[0.8rem]">Group {groupId} ({label})</span>
              <div className="flex min-w-0 flex-col gap-2">
                {Array.from({ length: count }, (_, i) => (
                  <div key={i} className="min-w-0 w-full shrink-0">
                    <LiquidGlassWorkspaceButton
                      tune={VARIANT_GLASS_TUNE}
                      label={String(i)}
                      checked={(selection[Number(groupId)] ?? 0) === i}
                      onCheckedChange={(next) => {
                        if (next) setSelection({ [Number(groupId)]: i });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
