/**
 * Canonical intent registry — single source of truth for ACTION_TYPES strings,
 * help copy, detection order, and pattern matching for the MVP intent detector.
 */
export interface IntentHelpParameter {
  readonly name: string;
  readonly description?: string;
}

export interface IntentRegistryEntry {
  readonly type: string;
  readonly description: string;
  readonly examples: readonly string[];
  readonly parameters: readonly IntentHelpParameter[];
  /** Used only by IntentDetector server-side — not exposed on help payloads. */
  readonly detectionPatterns: readonly RegExp[];
}

function screamingSnakeFromType(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map((segment) => segment.toUpperCase())
    .join('_');
}

export const INTENT_REGISTRY: readonly IntentRegistryEntry[] = [
  {
    type: 'move_object',
    description: 'Move or shift a movable object within the preview scene.',
    examples: ['Move it to the left', 'Shift the preview product upward', 'Translate slightly right'],
    parameters: [
      { name: 'targetObjectId', description: 'Object to move when multiple exist.' },
      { name: 'delta', description: 'Optional axis offsets for the MVP transform.' }
    ],
    detectionPatterns: [/\bmove\b/i, /\bshift\b/i, /\btranslate\b/i]
  },
  {
    type: 'change_object_color',
    description: 'Change diffuse / accent color on a preview object.',
    examples: ['Make it teal', 'Paint the product red', 'Change color to violet'],
    parameters: [
      { name: 'targetObjectId', description: 'Object to repaint.' },
      { name: 'color', description: 'CSS-style color literal or palette name.' }
    ],
    detectionPatterns: [/\bcolor\b/i, /\bcolour\b/i, /\bpaint\b/i]
  },
  {
    type: 'show_bounding_boxes',
    description: 'Show simplified bounding volumes for meshes in the scene.',
    examples: ['Show bounding boxes', 'Outline the bounds'],
    parameters: [{ name: 'targetObjectIds', description: 'Optional subset of objects.' }],
    detectionPatterns: [/bounding box/i, /bounds/i, /\bbox\b/i]
  },
  {
    type: 'measure_mesh_distance',
    description: 'Measure nominal distance along an axis between two objects.',
    examples: ['Measure the distance horizontally', 'How far apart are they vertically?'],
    parameters: [
      { name: 'fromObjectId', description: 'First mesh / object.' },
      { name: 'toObjectId', description: 'Second mesh / object.' }
    ],
    detectionPatterns: [/\bmeasure\b/i, /\bdistance\b/i]
  },
  {
    type: 'download_updated_scene',
    description: 'Request an export descriptor for the current preview scene snapshot.',
    examples: ['Download the scene', 'Export glTF snapshot'],
    parameters: [{ name: 'format', description: 'Optional export hint (e.g. gltf, glb).' }],
    detectionPatterns: [/\bdownload\b/i, /\bexport\b/i]
  }
];

/** Same order as INTENT_REGISTRY — first matching pattern wins */
export interface IntentDetectionRule {
  intent: string;
  patterns: RegExp[];
}

export const INTENT_DETECTION_RULES: readonly IntentDetectionRule[] = INTENT_REGISTRY.map(
  (entry) => ({
    intent: entry.type,
    patterns: [...entry.detectionPatterns]
  })
);

export const ACTION_TYPES = Object.freeze(
  Object.fromEntries(
    INTENT_REGISTRY.map((entry) => [screamingSnakeFromType(entry.type), entry.type])
  )
) as Readonly<
  Record<string, string> & {
    readonly MOVE_OBJECT: string;
    readonly SHOW_BOUNDING_BOXES: string;
    readonly MEASURE_MESH_DISTANCE: string;
    readonly CHANGE_OBJECT_COLOR: string;
    readonly DOWNLOAD_UPDATED_SCENE: string;
  }
>;
