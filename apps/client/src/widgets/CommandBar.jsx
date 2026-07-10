import CommandInput, { CommandInputShell } from './CommandInput.jsx';
import { useCommandBar } from '../hooks/useCommandBar.js';

/**
 * Command bar — identical UI/UX on Assistant and Configurator (fixed bottom, collapse/expand).
 *
 * @param {{
 *   inputId?: string,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   keyboardBlocked?: boolean,
 *   onSubmit: (args: { command: string, inputType: string }) => Promise<boolean>,
 * }} props
 * onSubmit returns true when command was accepted (clears field + collapses when voice enabled).
 */
export default function CommandBar({
  inputId = 'platform-command-input',
  placeholder = 'Type command',
  disabled = false,
  keyboardBlocked = false,
  onSubmit
}) {
  const {
    command,
    setCommand,
    setInputType,
    isListening,
    isSubmitting,
    canUseSpeech,
    showCommandField,
    commandBarRef,
    textInputRef,
    handleRoundButton
  } = useCommandBar({ onSubmit, disabled, keyboardBlocked });

  if (disabled) {
    return null;
  }

  return (
    <CommandInputShell>
      <CommandInput
        command={command}
        setCommand={setCommand}
        setInputType={setInputType}
        isListening={isListening}
        isSubmitting={isSubmitting}
        canUseSpeech={canUseSpeech}
        showCommandField={showCommandField}
        commandBarRef={commandBarRef}
        textInputRef={textInputRef}
        onRoundButton={handleRoundButton}
        inputId={inputId}
        placeholder={placeholder}
      />
    </CommandInputShell>
  );
}
