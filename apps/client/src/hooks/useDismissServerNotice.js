import { useEffect } from 'react';

/**
 * Dismiss AI Response notice: click outside, Escape, or Enter.
 */
export function useDismissServerNotice(serverNotice, setServerNotice, serverNoticeRef) {
  useEffect(() => {
    if (!serverNotice) {
      return undefined;
    }

    function handlePointerDown(/** @type {PointerEvent} */ event) {
      if (
        !serverNoticeRef.current ||
        serverNoticeRef.current.contains(/** @type {Node | null} */ (event.target))
      ) {
        return;
      }
      setServerNotice(null);
    }

    function handleKeyDown(/** @type {KeyboardEvent} */ event) {
      if (event.key !== 'Escape' && event.key !== 'Enter') {
        return;
      }
      event.preventDefault();
      setServerNotice(null);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [serverNotice, setServerNotice, serverNoticeRef]);
}
