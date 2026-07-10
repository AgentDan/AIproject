/**
 * Applies visibility to scene nodes. Only layer that mutates node.visible.
 *
 * @param {import('three').Object3D[]} defaultNodes - always visible
 * @param {Object.<number, { label: string, nodes: import('three').Object3D[] }>} groups
 * @param {Object.<number, number>} visibilityMap - groupId -> variant index to show
 */
export function applyVisibilityToScene(defaultNodes, groups, visibilityMap) {
  defaultNodes.forEach((n) => (n.visible = true));
  for (const [groupIdStr, group] of Object.entries(groups)) {
    const groupId = Number(groupIdStr);
    const variantIndex = visibilityMap[groupId] ?? 0;
    const nodes = group.nodes;
    if (!Array.isArray(nodes)) continue;
    nodes.forEach((node, i) => node && (node.visible = i === variantIndex));
  }
}
