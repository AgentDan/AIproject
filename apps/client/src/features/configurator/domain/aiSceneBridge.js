export const CONFIGURATOR_ROOT_OBJECT_ID = 'configurator-root';

const OBJECT_SYNC_STEP_TYPES = new Set(['move_object', 'change_object_color']);

/** Only scene steps that mutate object transform/material should repaint meshes on the client. */
export function shouldSyncServerObjects(previewUpdate) {
  if (!Array.isArray(previewUpdate?.objects) || previewUpdate.objects.length === 0) {
    return false;
  }
  const steps = previewUpdate.stepUpdates;
  if (!Array.isArray(steps)) {
    return false;
  }
  return steps.some((step) => OBJECT_SYNC_STEP_TYPES.has(step?.type));
}

/** @type {Record<string, string>} */
const NAMED_COLORS = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  black: '#111827',
  white: '#f8fafc',
  yellow: '#eab308',
  cyan: '#22d3ee',
  purple: '#a855f7'
};

const defaultLocalState = {
  transform: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  },
  material: { color: 'cyan' }
};

export function groupObjectId(groupId) {
  return `group-${groupId}`;
}

export function colorNameToHex(name) {
  const key = String(name || 'cyan').toLowerCase();
  if (key.startsWith('#')) return key;
  return NAMED_COLORS[key] || NAMED_COLORS.cyan;
}

/**
 * @param {import('three').Object3D} node
 */
export function transformFromNode(node) {
  return {
    position: { x: node.position.x, y: node.position.y, z: node.position.z },
    rotation: { x: node.rotation.x, y: node.rotation.y, z: node.rotation.z },
    scale: { x: node.scale.x, y: node.scale.y, z: node.scale.z }
  };
}

/**
 * @param {import('three').Object3D} root
 * @param {import('../application/buildConfiguration.js').SceneData | null | undefined} sceneData
 * @param {Record<number, number>} selection
 */
export function tagAiObjectIds(root, sceneData, selection) {
  root.userData.configuratorRoot = true;
  root.userData.aiObjectId = CONFIGURATOR_ROOT_OBJECT_ID;

  if (!sceneData?.groups) {
    return;
  }

  for (const [groupIdStr, group] of Object.entries(sceneData.groups)) {
    const groupId = Number(groupIdStr);
    const variantIndex = selection[groupId] ?? 0;
    const node = group.nodes?.[variantIndex];
    if (node) {
      node.userData.aiObjectId = groupObjectId(groupId);
    }
  }
}

/**
 * @param {import('../application/buildConfiguration.js').SceneData | null | undefined} sceneData
 * @param {Record<number, number>} selection
 * @param {Record<string, { transform: object, material: object }>} localObjectStates
 */
export function buildConfiguratorObjectsFromSceneData(sceneData, selection, localObjectStates) {
  const states = localObjectStates || {};
  const rootState = states[CONFIGURATOR_ROOT_OBJECT_ID] || defaultLocalState;

  /** @type {object[]} */
  const objects = [
    {
      objectId: CONFIGURATOR_ROOT_OBJECT_ID,
      name: 'Model Root',
      type: 'product',
      movable: true,
      transform: rootState.transform,
      material: rootState.material
    }
  ];

  if (!sceneData?.groups) {
    return objects;
  }

  for (const [groupIdStr, group] of Object.entries(sceneData.groups)) {
    const groupId = Number(groupIdStr);
    const variantIndex = selection[groupId] ?? 0;
    const node = group.nodes?.[variantIndex];
    const objectId = groupObjectId(groupId);
    const stored = states[objectId];

    objects.push({
      objectId,
      name: group.label || `Group ${groupId}`,
      type: 'variant',
      movable: true,
      transform: stored?.transform || (node ? transformFromNode(node) : defaultLocalState.transform),
      material: stored?.material || defaultLocalState.material
    });
  }

  return objects;
}

/**
 * panel-lab when URL has ?labKey= (admin Lab editor); otherwise configurator.
 * @param {string} [search]
 * @returns {'panel-lab' | 'configurator'}
 */
export function resolveConfiguratorCommandMode(search = '') {
  const params = new URLSearchParams(search);
  const labKey = params.get('labKey');
  return labKey && labKey.trim() ? 'panel-lab' : 'configurator';
}

/**
 * @param {{ modelKey?: string, selection?: object, panelLab?: object, sceneData?: object, localObjectStates?: Record<string, object>, mode?: string }} args
 */
export function buildConfiguratorClientState({
  modelKey,
  selection,
  panelLab,
  sceneData,
  localObjectStates,
  mode
}) {
  const sel = /** @type {Record<number, number>} */ (selection || {});

  return {
    domain: 'configurator-3d',
    modelKey: modelKey || null,
    selection: sel,
    panelLab: panelLab || null,
    mode: mode || 'configurator',
    source: 'apps/client/configurator',
    objects: buildConfiguratorObjectsFromSceneData(sceneData, sel, localObjectStates || {})
  };
}

/**
 * @param {import('three').Object3D} node
 * @param {{ transform?: { position?: { x?: number, y?: number, z?: number } }, material?: { color?: string } }} data
 */
export function applyObjectStateToNode(node, data) {
  const p = data?.transform?.position;
  if (p) {
    node.position.set(p.x ?? node.position.x, p.y ?? node.position.y, p.z ?? node.position.z);
  }

  const color = data?.material?.color;
  if (!color) {
    return;
  }

  const hex = colorNameToHex(color);
  node.traverse((child) => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((mat) => {
      if (mat?.color) mat.color.set(hex);
    });
  });
}

/** @deprecated use applyObjectStateToNode */
export function applyObjectStateToRoot(root, data) {
  applyObjectStateToNode(root, data);
}

export function readObjectStateFromRoot(root) {
  return {
    transform: transformFromNode(root),
    material: { color: 'cyan' }
  };
}
