import { ACTION_TYPES, INTENT_DETECTION_RULES } from '@ai-product-scene-platform/ai';

export function detectIntent(command = '') {
  for (const { intent, patterns } of INTENT_DETECTION_RULES) {
    if (patterns.some((pattern) => pattern.test(command))) {
      return {
        intent,
        confidence: 0.86,
        source: 'rule-based-mvp'
      };
    }
  }

  return {
    intent: ACTION_TYPES.MOVE_OBJECT,
    confidence: 0.42,
    source: 'fallback-default'
  };
}
