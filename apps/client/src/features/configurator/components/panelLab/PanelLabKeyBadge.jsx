export function PanelLabKeyBadge({ labKey, onResetClick }) {
  return (
    <div className="text-[11px]">
      <div className="text-gray-700 mb-0.5">Lab file (S3 key)</div>
      <button
        type="button"
        onClick={onResetClick}
        disabled={!onResetClick}
        title={
          onResetClick
            ? 'Reset all Panel Lab settings (extras) to schema defaults. Use Save to S3 to persist.'
            : undefined
        }
        className={`
          w-full rounded border border-gray-500/50 bg-white/80 px-2 py-1 text-left font-mono break-all text-gray-900
          ${onResetClick ? 'cursor-pointer hover:bg-amber-50/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600' : ''}
          disabled:cursor-default disabled:opacity-90
        `.trim()}
      >
        {labKey}
      </button>
      {onResetClick ? (
        <p className="m-0 mt-1 text-[10px] leading-snug text-gray-600">Click the file name to reset all parameters to defaults.</p>
      ) : null}
    </div>
  );
}