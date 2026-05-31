/**
 * @typedef {import('./types.js').Selection} Selection
 * @typedef {import('./types.js').GroupOptionsMap} GroupOptionsMap
 * @typedef {import('./types.js').VisibilityMap} VisibilityMap
 */

/**
 * Returns initial empty selection (no group overrides).
 *
 * @returns {Selection}
 */
export function getDefaultSelection() {
  return {};
}

/**
 * Computes which variant index should be visible per group.
 * Missing selection for a group falls back to index 0.
 *
 * @param {Selection} selection
 * @param {GroupOptionsMap} groupOptions
 * @returns {VisibilityMap}
 */
export function computeVisibilityMap(selection, groupOptions) {
  const map = /** @type {VisibilityMap} */ ({});
  for (const [groupIdStr, opt] of Object.entries(groupOptions)) {
    const groupId = Number(groupIdStr);
    const variantIndex = selection[groupId] ?? 0;
    const clamped = Math.max(0, Math.min(variantIndex, (opt.count ?? 1) - 1));
    map[groupId] = clamped;
  }
  return map;
}

/**
 * Validates that selection only references existing groups and in-range indices.
 *
 * @param {Selection} selection
 * @param {GroupOptionsMap} groupOptions
 * @returns {{ valid: boolean, errors?: string[] }}
 */
export function validateConfiguration(selection, groupOptions) {
  const errors = [];
  for (const [groupIdStr, variantIndex] of Object.entries(selection)) {
    const groupId = Number(groupIdStr);
    const opt = groupOptions[groupId];
    if (!opt) {
      errors.push(`Unknown group: ${groupId}`);
      continue;
    }
    if (variantIndex < 0 || variantIndex >= (opt.count ?? 0)) {
      errors.push(`Group ${groupId}: variant index ${variantIndex} out of range [0, ${(opt.count ?? 1) - 1}]`);
    }
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}
