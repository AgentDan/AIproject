/**

 * Canonical intent registry — single source of truth for ACTION_TYPES strings,

 * help copy, detection order, and pattern matching for the MVP intent detector.

 */

export type CommandScope = 'panel-lab' | 'configurator' | 'assistant';

export type CommandKind = 'scene' | 'knob' | 'creative' | 'meta';

export type KnobOp = 'set' | 'adjust' | 'toggle';



export interface IntentHelpParameter {

  readonly name: string;

  readonly description?: string;

}



export interface KnobVariant {

  readonly match: RegExp;

  readonly factor: number;

}



export interface KnobMeta {

  readonly paths: readonly string[];

  readonly op: KnobOp;

  readonly clamp?: readonly [number, number];

  readonly valueKind?: 'number' | 'color' | 'enum';

  readonly enumValues?: readonly string[];

  readonly setValue?: unknown;

  readonly variants?: readonly KnobVariant[];

}



export interface IntentRegistryEntry {

  readonly type: string;

  readonly description: string;

  readonly examples: readonly string[];

  readonly parameters: readonly IntentHelpParameter[];

  /** Used only by IntentDetector server-side — not exposed on help payloads. */

  readonly detectionPatterns: readonly RegExp[];

  readonly scopes?: readonly CommandScope[];

  readonly kind?: CommandKind;

  readonly knob?: KnobMeta;

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

    detectionPatterns: [/\bmove\b/i, /\bshift\b/i, /\btranslate\b/i],

    scopes: ['configurator', 'panel-lab'],

    kind: 'scene'

  },

  {

    type: 'change_object_color',

    description: 'Change diffuse / accent color on a preview object.',

    examples: ['Make it teal', 'Paint the product red', 'Change color to violet'],

    parameters: [

      { name: 'targetObjectId', description: 'Object to repaint.' },

      { name: 'color', description: 'CSS-style color literal or palette name.' }

    ],

    detectionPatterns: [/\bcolor\b/i, /\bcolour\b/i, /\bpaint\b/i],

    scopes: ['configurator', 'panel-lab'],

    kind: 'scene'

  },

  {

    type: 'show_bounding_boxes',

    description: 'Show simplified bounding volumes for meshes in the scene.',

    examples: ['Show bounding boxes', 'Outline the bounds'],

    parameters: [{ name: 'targetObjectIds', description: 'Optional subset of objects.' }],

    detectionPatterns: [/bounding box/i, /bounds/i, /\bbox\b/i],

    scopes: ['configurator', 'panel-lab'],

    kind: 'scene'

  },

  {

    type: 'measure_mesh_distance',

    description: 'Measure nominal distance along an axis between two objects.',

    examples: ['Measure the distance horizontally', 'How far apart are they vertically?'],

    parameters: [

      { name: 'fromObjectId', description: 'First mesh / object.' },

      { name: 'toObjectId', description: 'Second mesh / object.' }

    ],

    detectionPatterns: [/\bmeasure\b/i, /\bdistance\b/i],

    scopes: ['configurator', 'panel-lab'],

    kind: 'scene'

  },

  {

    type: 'download_updated_scene',

    description: 'Request an export descriptor for the current preview scene snapshot.',

    examples: ['Download the scene', 'Export glTF snapshot'],

    parameters: [{ name: 'format', description: 'Optional export hint (e.g. gltf, glb).' }],

    detectionPatterns: [/\bdownload\b/i, /\bexport\b/i],

    scopes: ['configurator', 'panel-lab'],

    kind: 'scene'

  },

  {

    type: 'panel_lab_light_intensity',

    description: 'Brighten or dim the main directional light.',

    examples: ['brighter', 'ярче', 'darker', 'темнее'],

    parameters: [],

    detectionPatterns: [/brighter|ярче|brigh?ten/i, /darker|темнее|dim\b/i],

    scopes: ['panel-lab'],

    kind: 'knob',

    knob: {

      paths: ['lighting.directional.intensity'],

      op: 'adjust',

      clamp: [0, 10],

      variants: [

        { match: /brighter|ярче|brigh?ten/i, factor: 1.25 },

        { match: /darker|темнее|dim\b/i, factor: 0.8 }

      ]

    }

  },

  {

    type: 'panel_lab_ambient_toggle',

    description: 'Toggle the ambient fill light.',

    examples: ['ambient light', 'fill light', 'заполняющий свет'],

    parameters: [],

    detectionPatterns: [/ambient|fill light|заполняющ/i],

    scopes: ['panel-lab'],

    kind: 'knob',

    knob: { paths: ['lighting.ambient.enabled'], op: 'toggle' }

  },

  {

    type: 'panel_lab_shadows_toggle',

    description: 'Toggle scene shadows.',

    examples: ['enable shadows', 'turn off shadows', 'включи тени', 'убери тени'],

    parameters: [],

    detectionPatterns: [/shadows?\b|тени|теней/i],

    scopes: ['panel-lab'],

    kind: 'knob',

    knob: {

      paths: ['renderer.shadowMap.enabled', 'lighting.shadows.enabled'],

      op: 'toggle'

    }

  },

  {

    type: 'panel_lab_soft_shadows',

    description: 'Switch to soft (VSM) shadow edges.',

    examples: ['soft shadows', 'мягкие тени'],

    parameters: [],

    detectionPatterns: [/soft shadows|мягкие тени/i],

    scopes: ['panel-lab'],

    kind: 'knob',

    knob: { paths: ['renderer.shadowMap.type'], op: 'set', setValue: 'VSMShadowMap' }

  },

  {

    type: 'panel_lab_background_color',

    description: 'Set the background color.',

    examples: ['white background', 'фон чёрный', 'background blue'],

    parameters: [{ name: 'color' }],

    detectionPatterns: [/background|фон\b/i],

    scopes: ['panel-lab'],

    kind: 'knob',

    knob: { paths: ['environment.background.color'], op: 'set', valueKind: 'color' }

  },

  {

    type: 'panel_lab_hdri_toggle',

    description: 'Toggle HDRI / studio environment lighting.',

    examples: ['enable hdri', 'studio lighting', 'студийный свет'],

    parameters: [],

    detectionPatterns: [/hdri|studio|студийн/i],

    scopes: ['panel-lab'],

    kind: 'knob',

    knob: { paths: ['environment.hdri.enabled'], op: 'toggle' }

  },

  {

    type: 'panel_lab_fog_toggle',

    description: 'Toggle fog.',

    examples: ['enable fog', 'туман'],

    parameters: [],

    detectionPatterns: [/\bfog\b|туман/i],

    scopes: ['panel-lab'],

    kind: 'knob',

    knob: { paths: ['environment.fog.enabled'], op: 'toggle' }

  },

  {

    type: 'panel_lab_fov',

    description: 'Set camera field of view.',

    examples: ['set field of view to 60', 'fov 35', 'угол обзора 50'],

    parameters: [{ name: 'fov' }],

    detectionPatterns: [/field of view|\bfov\b|угол обзора/i],

    scopes: ['panel-lab'],

    kind: 'knob',

    knob: { paths: ['camera.fov'], op: 'set', valueKind: 'number', clamp: [20, 90] }

  },

  {

    type: 'update_panel_lab',

    description: 'Apply a sparse panelLab settings patch to the scene.',

    examples: [],

    parameters: [{ name: 'patch', description: 'Sparse panelLab v1 patch object.' }],

    detectionPatterns: [],

    kind: 'scene'

  },

  {

    type: 'list_commands',

    description: 'List available commands for the current mode.',

    examples: ['list commands', 'what can i say', 'команды', 'что я могу', 'help'],

    parameters: [],

    detectionPatterns: [

      /list commands|what can i (say|do)|команды|что я могу|^help$|помощь/i

    ],

    kind: 'meta'

  },

  {

    type: 'unknown_command',

    description: 'Command was not recognized in the current mode.',

    examples: [],

    parameters: [],

    detectionPatterns: [],

    kind: 'meta'

  }

];



/** Same order as INTENT_REGISTRY — first matching pattern wins */

export interface IntentDetectionRule {

  intent: string;

  patterns: RegExp[];

}



export const INTENT_DETECTION_RULES: readonly IntentDetectionRule[] = INTENT_REGISTRY.filter(

  (entry) => entry.detectionPatterns.length > 0

).map((entry) => ({

  intent: entry.type,

  patterns: [...entry.detectionPatterns]

}));



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

    readonly PANEL_LAB_LIGHT_INTENSITY: string;

    readonly PANEL_LAB_AMBIENT_TOGGLE: string;

    readonly PANEL_LAB_SHADOWS_TOGGLE: string;

    readonly PANEL_LAB_SOFT_SHADOWS: string;

    readonly PANEL_LAB_BACKGROUND_COLOR: string;

    readonly PANEL_LAB_HDRI_TOGGLE: string;

    readonly PANEL_LAB_FOG_TOGGLE: string;

    readonly PANEL_LAB_FOV: string;

    readonly UPDATE_PANEL_LAB: string;

    readonly LIST_COMMANDS: string;

    readonly UNKNOWN_COMMAND: string;

  }

>;



export function getIntentEntry(type: string): IntentRegistryEntry | undefined {

  return INTENT_REGISTRY.find((e) => e.type === type);

}



export function listCommandTypes(scope?: CommandScope): string[] {
  return INTENT_REGISTRY.filter((e) => (e.kind ?? 'scene') !== 'meta')
    .filter((e) => e.type !== 'update_panel_lab')
    .filter((e) => !scope || !e.scopes || e.scopes.includes(scope))
    .map((e) => e.type);
}

