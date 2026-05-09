export function createExportReference(sceneId, requestId) {
  return `local://exports/${sceneId}/${requestId}.glb`;
}
