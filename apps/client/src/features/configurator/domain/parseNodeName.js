/**
 * Parse a node name into domain shape (pure).
 * Convention: `default_*` = always visible; `XY_Label` = group X, variant Y (e.g. 11_Cone).
 *
 * @param {string} [name]
 * @returns {import('./types.js').ParsedNodeName}
 */
export function parseNodeName(name) {
  if (!name || typeof name !== 'string') return null;
  if (name.toLowerCase().startsWith('default_')) return { type: 'default' };
  const m = name.match(/^(\d)(\d)_([^_]+)$/);
  return m ? { type: 'group', groupId: +m[1], variantIndex: +m[2], label: m[3] } : null;
}
