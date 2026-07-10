import { parseNodeName } from '../domain/parseNodeName.js';

/**
 * Raw group structure: nodes by groupId, each with label and array of nodes (Three.Object3D).
 * defaultNodes are not part of any variant group.
 *
 * @typedef {Object} RawGroup
 * @property {string} label
 * @property {import('three').Object3D[]} nodes
 */

/**
 * Result of traversing a Three.js scene and classifying nodes by naming convention.
 *
 * @typedef {Object} TraverseResult
 * @property {import('three').Object3D[]} defaultNodes
 * @property {Object.<number, RawGroup>} groups
 */

/**
 * Traverses a Three.js scene and builds defaultNodes + groups using domain parse rules.
 * Only this layer touches scene / node references.
 *
 * @param {import('three').Object3D} scene
 * @returns {TraverseResult}
 */
export function traverseSceneAndBuildRawGroups(scene) {
  const defaultNodes = [];
  const byGroup = {};

  scene.traverse((node) => {
    const name = node.name || '';
    const lowerName = name.toLowerCase();

    // Hide technical geometry like screw holes that should not be visible
    if (
      lowerName.includes('screw') ||
      lowerName.includes('bolt') ||
      lowerName.includes('fastener')
    ) {
      node.visible = false;
      return;
    }

    const p = parseNodeName(name);

    if (!p) return;
    if (p.type === 'default') {
      defaultNodes.push(node);
      return;
    }
    const { groupId, variantIndex, label } = p;
    if (!byGroup[groupId]) byGroup[groupId] = { label: label || `Group ${groupId}`, nodes: {} };
    byGroup[groupId].nodes[variantIndex] = node;
  });

  const groups = {};
  for (const [id, g] of Object.entries(byGroup)) {
    const indices = Object.keys(g.nodes).map(Number).sort((a, b) => a - b);
    groups[+id] = { label: g.label, nodes: indices.map((i) => g.nodes[i]) };
  }

  return { defaultNodes, groups };
}
