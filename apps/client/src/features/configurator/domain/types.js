/**
 * @typedef {Object} ParsedDefault
 * @property {'default'} type
 */

/**
 * @typedef {Object} ParsedGroup
 * @property {'group'} type
 * @property {number} groupId
 * @property {number} variantIndex
 * @property {string} label
 */

/**
 * @typedef {ParsedDefault | ParsedGroup | null} ParsedNodeName
 */

/**
 * @typedef {Object} GroupOption
 * @property {string} label
 * @property {number} count
 */

/**
 * @typedef {Object.<number, GroupOption>} GroupOptionsMap
 */

/**
 * @typedef {Object.<number, number>} Selection
 * Key: groupId, Value: variant index (0-based)
 */

/**
 * @typedef {Object.<number, number>} VisibilityMap
 * Key: groupId, Value: variant index to show
 */
