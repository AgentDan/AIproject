import {
  createSceneContext,
  validateSceneContext
} from '@ai-product-scene-platform/contracts';
import {
  getActionHistory,
  getSceneMetadata,
  getSession
} from '../infrastructure/storage/local-storage.js';

function buildPreviewObjects(sceneMetadata) {
  const objects = sceneMetadata?.objects;

  if (Array.isArray(objects) && objects.length > 0) {
    return objects;
  }

  return [
    {
      objectId: 'preview-product',
      name: 'Preview Product',
      type: 'product',
      movable: true,
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      },
      material: {
        color: '#22d3ee'
      }
    }
  ];
}

function buildPreviewHierarchy(objects) {
  return objects.map((object) => ({
    objectId: object.objectId,
    parentId: null,
    children: []
  }));
}

function buildPreviewMaterials(objects) {
  return objects.map((object) => ({
    objectId: object.objectId,
    material: object.material || {}
  }));
}

export async function buildSceneContext(clientRequest) {
  const [session, sceneMetadata, actionHistory] = await Promise.all([
    getSession(clientRequest.sessionId),
    getSceneMetadata(clientRequest.sceneId),
    getActionHistory(clientRequest.sessionId)
  ]);
  const objects = buildPreviewObjects(sceneMetadata);
  const sceneContext = createSceneContext({
    sceneId: clientRequest.sceneId,
    sessionId: clientRequest.sessionId,
    sourceUri: sceneMetadata?.sourceUri || sceneMetadata?.source || 'preview-scene',
    objects,
    hierarchy: buildPreviewHierarchy(objects),
    materials: buildPreviewMaterials(objects),
    metadata: {
      session,
      scene: sceneMetadata,
      actionHistory,
      storageMode: 'local-json'
    },
    commandContext: {
      requestId: clientRequest.requestId,
      inputType: clientRequest.inputType,
      command: clientRequest.command,
      clientState: clientRequest.clientState
    }
  });
  const validationErrors = validateSceneContext(sceneContext);

  return {
    sceneContext,
    validationErrors
  };
}
