import { computeVisibilityMap } from '../domain/selection.js';
import { applyVisibilityToScene } from '../infrastructure/applyVisibility.js';

/**
 * @typedef {import('../domain/types.js').Selection} Selection
 * @typedef {import('../domain/types.js').GroupOptionsMap} GroupOptionsMap
 * @typedef {import('./buildConfiguration.js').SceneData} SceneData
 */

/**
 * Updates visible variants in the scene from current selection.
 *
 * @param {Selection} selection
 * @param {GroupOptionsMap} groupOptions
 * @param {SceneData} sceneData
 */
export function updateConfiguration(selection, groupOptions, sceneData) {
  const visibilityMap = computeVisibilityMap(selection, groupOptions);
  applyVisibilityToScene(sceneData.defaultNodes, sceneData.groups, visibilityMap);
}
