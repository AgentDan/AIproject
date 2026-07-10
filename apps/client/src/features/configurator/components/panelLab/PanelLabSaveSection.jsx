/** Save Panel Lab settings to S3 and show status. */
export function PanelLabSaveSection({ labKey, isSaving, onSave, status, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 border-t border-gray-500/40 pt-3 ${className}`.trim()}>
      <button
        type="button"
        onClick={onSave}
        disabled={!labKey || isSaving}
        className="w-full px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium border border-emerald-900/30"
      >
        {isSaving ? 'Saving…' : 'Save to S3'}
      </button>

      {status ? (
        <p
          className={`m-0 text-[11px] leading-snug ${
            status.type === 'success' ? 'text-green-900' : 'text-red-800'
          }`}
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
