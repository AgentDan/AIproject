/**
 * Canonical intent registry — single source of truth for ACTION_TYPES strings,
 * help copy, detection order, and pattern matching for the MVP intent detector.
 */

/**
 * Режим клиента (`clientState.mode`): определяет, какие intent'ы доступны и что показывает help.
 * @typedef {'panel-lab' | 'configurator' | 'assistant'} CommandScope
 * @description
 * - `configurator` — обычный 3D-конфигуратор (только scene-команды).
 * - `panel-lab` — редактор Panel Lab (`?labKey=`); scene + knob-команды.
 * - `assistant` — страница AI Assistant; только overlay-команды Bubble и Clear bubble.
 */

/**
 * Категория команды: влияет на маршрутизацию в orchestrator / AI pipeline.
 * @typedef {'scene' | 'knob' | 'creative' | 'meta'} CommandKind
 * @description
 * - `scene` — изменение объектов сцены или внутренний шаг workflow (`update_panel_lab`).
 * - `knob` — голосовые «ручки» Panel Lab → sparse patch в `panelLab`.
 * - `creative` — зарезервировано под генеративные команды (пока не используется).
 * - `meta` — служебные команды (help, unknown); без Action Plan и workflow.
 */

/**
 * Операция knob над значением в `panelLab`.
 * @typedef {'set' | 'adjust' | 'toggle'} KnobOp
 * @description
 * - `toggle` — инвертировать boolean по `paths[0]`.
 * - `set` — задать значение (из utterance, `setValue` или `valueKind`).
 * - `adjust` — умножить число на `factor` из подходящего `variants`.
 */

/**
 * Параметр intent'а для help-ответа (`list_commands`).
 * @typedef {Object} IntentHelpParameter
 * @property {string} name — имя параметра в Action Plan / API.
 * @property {string} [description] — пояснение для пользователя в help.
 */

/**
 * Вариант adjust-knob: какой множитель применить при совпадении фразы.
 * @typedef {Object} KnobVariant
 * @property {RegExp} match — regex по utterance; первый совпавший вариант побеждает.
 * @property {number} factor — множитель для текущего числового значения (`op: 'adjust'`).
 */

/**
 * Метаданные knob-intent'а: как собрать sparse patch для `UPDATE_PANEL_LAB`.
 * @typedef {Object} KnobMeta
 * @property {string[]} paths — dot-path в `panelLab` (несколько путей → одно значение в каждый).
 * @property {KnobOp} op — способ вычисления нового значения.
 * @property {[number, number]} [clamp] — min/max для числовых `set` и `adjust`.
 * @property {'number' | 'color' | 'enum'} [valueKind] — как извлечь значение из utterance при `op: 'set'`.
 * @property {string[]} [enumValues] — допустимые строки при `valueKind: 'enum'`.
 * @property {unknown} [setValue] — фиксированное значение при `op: 'set'` (без парсинга utterance).
 * @property {KnobVariant[]} [variants] — список множителей при `op: 'adjust'`.
 */

/**
 * Одна запись реестра intent'ов.
 * @typedef {Object} IntentRegistryEntry
 * @property {string} type — уникальный snake_case id; становится значением в `ACTION_TYPES`.
 * @property {string} description — краткое описание для help и документации.
 * @property {string[]} examples — примеры фраз пользователя (показываются в help).
 * @property {IntentHelpParameter[]} parameters — ожидаемые параметры Action Plan.
 * @property {RegExp[]} detectionPatterns — regex по utterance; порядок в `INTENT_REGISTRY` важен (first match wins).
 * @property {CommandScope[]} [scopes] — режимы, где intent разрешён; без поля — доступен везде.
 * @property {CommandKind} [kind] — категория; по умолчанию `'scene'`.
 * @property {KnobMeta} [knob] — обязателен при `kind: 'knob'`; используется `knobToPatch()`.
 */

/**
 * Упрощённое правило для MVP intent detector (без meta и без пустых patterns).
 * @typedef {Object} IntentDetectionRule
 * @property {string} intent — значение `type` из `IntentRegistryEntry`.
 * @property {RegExp[]} patterns — копия `detectionPatterns` для быстрого перебора.
 */

/** `move_object` → `MOVE_OBJECT` для ключей `ACTION_TYPES`. */
function screamingSnakeFromType(snakeCase) {
  return snakeCase
    .split('_')
    .map((segment) => segment.toUpperCase())
    .join('_');
}

/**
 * Полный каталог intent'ов. Порядок массива = приоритет детектора (раньше = выше).
 *
 * Общие поля каждой записи:
 * - `type` — id команды
 * - `description` / `examples` / `parameters` — help (`list_commands`)
 * - `detectionPatterns` — распознавание utterance
 * - `scopes` — фильтр по `clientState.mode`
 * - `kind` — scene | knob | meta
 * - `knob` — только для knob: patch panelLab
 *
 * @type {IntentRegistryEntry[]}
 */
export const INTENT_REGISTRY = [
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
    type: 'select_variant',
    description: 'Select a specific variant index within a named group.',
    examples: [
      'select variant 1 in group 2',
      'switch cone to option 0',
      'group 3 variant 2',
      'выбери вариант 1 группы 2',
      'переключи группу 1 на вариант 0',
    ],
    parameters: [
      { name: 'groupId', description: 'Numeric group id (0-based or 1-based from utterance).' },
      { name: 'variantIndex', description: 'Numeric variant index to activate.' },
    ],
    detectionPatterns: [
      /select variant|switch.*variant|variant\s+\d|вариант\s+\d/i,
      /group\s+\d.*variant|variant.*group\s+\d/i,
      /переключи группу|выбери вариант/i,
    ],
    scopes: ['configurator'],
    kind: 'scene',
  },
  {
    type: 'select_project',
    description: 'Switch the active 3D project / model by list index or project title.',
    examples: [
      'select project 1',
      'switch to project 2',
      'open model 0',
      'project Kitchen',
      'выбери проект 2',
      'переключи проект Studio',
    ],
    parameters: [
      { name: 'projectIndex', description: 'Index in the client project catalog.' },
      { name: 'modelKey', description: 'Resolved model key for navigation.' },
      { name: 'title', description: 'Display title when matched by name.' },
    ],
    detectionPatterns: [
      /select project|switch.*project|open project|project\s+\d|project\s+[a-zа-яё]/i,
      /select model|switch.*model|open model|model\s+\d/i,
      /выбери проект|переключи проект|проект\s+\d/i,
    ],
    scopes: ['configurator'],
    kind: 'scene',
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
    type: 'bubble',
    description: 'Show a red circle overlay in the center of the assistant preview.',
    examples: ['Bubble', 'bubble'],
    parameters: [],
    detectionPatterns: [/^bubble$/i],
    scopes: ['assistant'],
    kind: 'scene'
  },
  {
    type: 'clear_bubble',
    description: 'Remove the red circle overlay from the assistant preview.',
    examples: ['Clear bubble', 'clear bubble'],
    parameters: [],
    detectionPatterns: [/^clear bubble$/i],
    scopes: ['assistant'],
    kind: 'scene'
  },
  {
    type: 'list_commands',
    description: 'List available commands for the current mode.',
    examples: ['list commands', 'what can i say', 'команды', 'что я могу', 'help'],
    parameters: [],
    detectionPatterns: [
      /list commands|what can i (say|do)|команды|что я могу|^help$|^helper$|помощь/i
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

/**
 * Правила детектора: meta исключены, пустые `detectionPatterns` пропущены.
 * Порядок как в `INTENT_REGISTRY` — первое совпадение побеждает.
 * @type {IntentDetectionRule[]}
 */
export const INTENT_DETECTION_RULES = INTENT_REGISTRY.filter(
  (entry) => (entry.kind ?? 'scene') !== 'meta'
)
  .filter((entry) => entry.detectionPatterns.length > 0)
  .map((entry) => ({
    intent: entry.type,
    patterns: [...entry.detectionPatterns]
  }));

/**
 * Meta-команды без контекста сцены (сейчас только `list_commands`).
 * Вызывается в orchestrator до `buildSceneContext`.
 * @param {string} command — utterance пользователя.
 * @returns {string|null} — `type` meta-intent'а или `null`, если не meta.
 */
export function detectMetaIntent(command = '') {
  for (const entry of INTENT_REGISTRY) {
    if ((entry.kind ?? 'scene') !== 'meta') continue;
    if (!entry.detectionPatterns || entry.detectionPatterns.length === 0) continue;
    if (entry.detectionPatterns.some((p) => p.test(command))) return entry.type;
  }
  return null;
}

/**
 * Константы типов шагов Action Plan: ключ SCREAMING_SNAKE → значение `type` из реестра.
 * Автогенерируется из `INTENT_REGISTRY`; единый источник правды для `@ai-product-scene-platform/contracts`.
 * @type {Readonly<Record<string, string>>}
 */
export const ACTION_TYPES = Object.freeze(
  Object.fromEntries(
    INTENT_REGISTRY.map((entry) => [screamingSnakeFromType(entry.type), entry.type])
  )
);

/**
 * @param {string} type — `IntentRegistryEntry.type` (snake_case).
 * @returns {IntentRegistryEntry | undefined}
 */
export function getIntentEntry(type) {
  return INTENT_REGISTRY.find((e) => e.type === type);
}

/**
 * Проверяет, разрешён ли intent в текущем `clientState.mode`.
 * @param {IntentRegistryEntry | undefined} entry — запись реестра.
 * @param {CommandScope | string | null | undefined} scope — `configurator` | `panel-lab` | `assistant`; `null` → всё разрешено.
 * @returns {boolean}
 */
export function isIntentAllowedForScope(entry, scope) {
  if (!entry) return false;
  if (!scope) return true;
  if (!entry.scopes || entry.scopes.length === 0) return true;
  return entry.scopes.includes(/** @type {CommandScope} */ (scope));
}

/**
 * Список intent'ов для help и scope-guard (без meta и `update_panel_lab`).
 * @param {CommandScope | string | null | undefined} scope — режим клиента; без scope — все non-meta.
 * @returns {IntentRegistryEntry[]}
 */
export function listIntentsForScope(scope) {
  return INTENT_REGISTRY.filter((e) => (e.kind ?? 'scene') !== 'meta')
    .filter((e) => e.type !== 'update_panel_lab')
    .filter((e) => e.detectionPatterns.length > 0)
    .filter((e) => isIntentAllowedForScope(e, scope));
}

/**
 * Только `type` строки для кратких списков команд.
 * @param {CommandScope} [scope] — режим клиента.
 * @returns {string[]}
 */
export function listCommandTypes(scope) {
  return listIntentsForScope(scope).map((e) => e.type);
}
