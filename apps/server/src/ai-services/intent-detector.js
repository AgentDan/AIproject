import {
  INTENT_DETECTION_RULES,
  getIntentEntry,
  isIntentAllowedForScope
} from '@ai-product-scene-platform/ai';

export function detectIntent(command = '', scope) {
  for (const { intent, patterns } of INTENT_DETECTION_RULES) {
    const entry = getIntentEntry(intent);
    if (!isIntentAllowedForScope(entry, scope)) continue;

    if (patterns.some((pattern) => pattern.test(command))) {
      return {
        intent,
        confidence: 0.86,
        source: 'rule-based-mvp'
      };
    }
  }

  return {
    intent: 'unknown_command',
    confidence: 0.0,
    source: 'fallback-unknown'
  };
}
