import { ACTION_TYPES } from '@ai-product-scene-platform/contracts';

const intentPatterns = [
  { intent: ACTION_TYPES.MOVE_OBJECT, patterns: [/\bmove\b/i, /\bshift\b/i, /\btranslate\b/i] },
  { intent: ACTION_TYPES.CHANGE_OBJECT_COLOR, patterns: [/\bcolor\b/i, /\bcolour\b/i, /\bpaint\b/i] },
  { intent: ACTION_TYPES.SHOW_BOUNDING_BOXES, patterns: [/bounding box/i, /bounds/i, /box/i] },
  { intent: ACTION_TYPES.MEASURE_MESH_DISTANCE, patterns: [/measure/i, /distance/i] },
  { intent: ACTION_TYPES.DOWNLOAD_UPDATED_SCENE, patterns: [/download/i, /export/i] }
];

export function detectIntent(command = '') {
  for (const { intent, patterns } of intentPatterns) {
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
