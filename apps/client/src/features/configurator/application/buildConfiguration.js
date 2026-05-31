import { traverseSceneAndBuildRawGroups } from '../infrastructure/sceneTraverse.js';

/**
 * Scene data: single source of truth for structure; holds Three.js node refs.
 *
 * @typedef {Object} SceneData
 * @property {import('three').Object3D[]} defaultNodes
 * @property {Object.<number, { label: string, nodes: import('three').Object3D[] }>} groups
 */

/**
 * Build scene data from a Three.js scene root.
 *
 * @param {import('three').Object3D} scene
 * @returns {{ sceneData: SceneData }}
 */
export function buildConfiguration(scene) {
  const { defaultNodes, groups } = traverseSceneAndBuildRawGroups(scene);
  return { sceneData: { defaultNodes, groups } };
}
