/** @param {{ intents?: unknown[] }} props */
function HelpIntentList({ intents = [] }) {
  if (!Array.isArray(intents) || intents.length === 0) {
    return <p className="mt-2 text-xs text-white/55">No intent entries returned.</p>;
  }

  return (
    <ul className="space-y-2 pr-1">
      {intents.map((raw, idx) => {
        const entry = raw && typeof raw === 'object' ? raw : {};
        const typeLabel = typeof entry.type === 'string' ? entry.type : `intent-${idx}`;

        return (
          <li key={`${typeLabel}-${idx}`}>
            <div className="rounded-xl border border-white/12 bg-black/35 px-3 py-2">
              <span className="font-mono text-[13px] font-semibold text-emerald-200/95">{typeLabel}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Toast / модалка с ответом API.
 * @param {{
 *   serverNotice: object | null,
 *   serverNoticeRef: import('react').RefObject<HTMLDivElement | null>
 * }} props
 */
export default function ResultViewer({ serverNotice, serverNoticeRef }) {
  if (!serverNotice) {
    return null;
  }

  return (
    <div
      ref={serverNoticeRef}
      className={`fixed left-1/2 top-[24%] z-50 flex w-[min(88vw,640px)] -translate-x-1/2 flex-col rounded-[2rem] border border-white/15 bg-white/15 px-8 py-6 text-sm text-white shadow-2xl shadow-black/40 backdrop-blur-2xl ${
        serverNotice.responseType === 'help' ? 'max-h-[min(78vh,560px)]' : ''
      }`}
    >
      <div
        className={`flex items-start gap-4 ${
          serverNotice.responseType === 'help' ? 'min-h-0 flex-1' : ''
        }`}
      >
        <span
          className={`mt-1.5 shrink-0 h-3.5 w-3.5 rounded-full shadow-lg ${
            serverNotice.type === 'error' ? 'bg-red-300' : 'bg-emerald-300'
          }`}
        />
        <div className={`flex min-h-0 flex-1 flex-col ${serverNotice.responseType === 'help' ? 'gap-0' : ''}`}>
          <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
            AI Response
          </p>
          <p className="mt-3 shrink-0 whitespace-pre-wrap leading-6 text-white/90">
            {serverNotice.message}
          </p>
          {serverNotice.responseType === 'help' ? (
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 pt-1">
              <HelpIntentList intents={serverNotice.helpIntents} />
            </div>
          ) : null}
          {serverNotice.responseType === 'help' ? (
            <div className="mt-4 flex shrink-0 flex-wrap gap-3 border-t border-white/10 pt-4">
              <div className="rounded-full bg-white/10 px-4 py-2">
                <p className="text-xs font-semibold text-white/75">help</p>
              </div>
            </div>
          ) : serverNotice.intent || serverNotice.resultStatus ? (
            <div className="mt-4 flex shrink-0 flex-wrap gap-3">
              {serverNotice.intent ? (
                <div className="rounded-full bg-white/10 px-4 py-2">
                  <p className="text-xs font-semibold text-white/75">{serverNotice.intent}</p>
                </div>
              ) : null}
              {serverNotice.resultStatus ? (
                <div className="rounded-full bg-white/10 px-4 py-2">
                  <p className="text-xs font-semibold text-white/75">{serverNotice.resultStatus}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
