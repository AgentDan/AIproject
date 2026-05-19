/**
 * Ввод команды: голос + текст, кнопка отправки.
 */
export default function CommandInput({
  command,
  setCommand,
  setInputType,
  isListening,
  isSubmitting,
  canUseSpeech,
  showCommandField,
  commandBarRef,
  textInputRef,
  onRoundButton
}) {
  return (
    <div
      ref={commandBarRef}
      className={`fixed bottom-7 left-1/2 z-40 flex max-w-[min(92vw,520px)] -translate-x-1/2 items-center rounded-full border border-white/15 bg-black/35 shadow-2xl shadow-black/30 backdrop-blur-2xl transition-[padding,width] duration-300 ease-out focus-within:border-white/30 ${
        showCommandField ? 'w-[min(92vw,520px)] gap-3 px-4 py-2.5' : 'w-auto gap-0 px-2 py-2'
      }`}
    >
      {showCommandField ? (
        <>
          <span
            className={`ml-1 h-2.5 w-2.5 shrink-0 rounded-full ${
              isListening ? 'animate-pulse bg-emerald-400/90' : 'bg-white/35'
            }`}
          />
          <input
            ref={textInputRef}
            aria-label={
              isListening
                ? 'Voice and keyboard command — speech fills this field as you talk'
                : 'Type command'
            }
            value={command}
            onChange={(event) => {
              setInputType('text');
              setCommand(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') {
                return;
              }
              event.preventDefault();
              onRoundButton();
            }}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            placeholder="Type command"
          />
        </>
      ) : null}
      <button
        type="button"
        aria-label={
          isListening
            ? 'Stop recording'
            : command.trim()
              ? 'Send command'
              : canUseSpeech
                ? 'Open command line and start voice'
                : 'Send command'
        }
        aria-expanded={showCommandField}
        title={
          canUseSpeech
            ? isListening
              ? 'Stop recording'
              : command.trim()
                ? 'Send this command'
                : 'Speak — opens the command line'
            : 'Send command'
        }
        className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border text-sm font-black tracking-tight transition ${
          isListening
            ? 'border-white/50 bg-white/65 text-slate-950'
            : command.trim()
              ? 'border-emerald-400/55 bg-emerald-500/25 text-emerald-100 shadow-lg shadow-emerald-500/20 hover:border-emerald-300/70 hover:bg-emerald-500/35'
              : 'border-white/15 bg-white/10 text-white/80 hover:bg-white/20'
        } disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={isSubmitting || (!canUseSpeech && !command.trim())}
        onClick={onRoundButton}
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/80 text-slate-900">
          {isListening ? '...' : '●'}
        </span>
      </button>
    </div>
  );
}
