/**
 * @typedef {import('./types.js').GroupOptionsMap} GroupOptionsMap
 */

/**
 * Group map without Three (UI only needs label + option count).
 * @typedef {Object.<number, { label: string, nodes: Array<unknown> }>} GroupsLike
 */

/**
 * Derive UI group options from raw groups. Pure; source of truth is `sceneData.groups`.
 *
 * @param {GroupsLike} groups
 * @returns {GroupOptionsMap}
 */
export function deriveGroupOptions(groups) {
  const map = /** @type {GroupOptionsMap} */ ({});
  for (const [id, g] of Object.entries(groups)) {
    if (g && typeof g.label === 'string' && Array.isArray(g.nodes)) {
      map[+id] = { label: g.label, count: g.nodes.length };
    }
  }
  return map;
}
