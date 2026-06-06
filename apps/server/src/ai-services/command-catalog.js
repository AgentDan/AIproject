import { listCommandTypes } from '@ai-product-scene-platform/ai';

/** Terse command type list for the current mode — no descriptions. */
export function buildCommandList(mode) {
  return {
    kind: 'command_list',
    mode: mode || null,
    commands: listCommandTypes(mode)
  };
}
