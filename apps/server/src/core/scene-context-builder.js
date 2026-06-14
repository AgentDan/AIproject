import {
  createSceneContext,
  validateSceneContext
} from '@ai-product-scene-platform/contracts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getActionHistory,
  getSceneMetadata,
  getSession
} from '../infrastructure/storage/local-storage.js';
import { normalizePanelLabToEmbedded } from '@ai-product-scene-platform/panel-lab-schema';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const gltfDir = path.resolve(__dir, '..', '..', 'gltf');

function buildPreviewObjects(sceneMetadata, clientState) {
  const fromClient = clientState?.objects;
  if (Array.isArray(fromClient) && fromClient.length > 0) {
    return fromClient;
  }

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

async function loadPanelLabFromLocalGltf(modelKey) {
  const key = String(modelKey || '').trim();
  if (!key || !/\.gltf$/i.test(key) || key.includes('/') || key.includes('\\')) {
    return null;
  }
  try {
    const raw = await readFile(path.join(gltfDir, key), 'utf8');
    const json = JSON.parse(raw);
    return json?.extras?.panelLab || null;
  } catch {
    return null;
  }
}

export async function buildSceneContext(clientRequest) {
  const clientState =
    clientRequest.clientState && typeof clientRequest.clientState === 'object'
      ? clientRequest.clientState
      : {};

  const [session, sceneMetadata, actionHistory] = await Promise.all([
    getSession(clientRequest.sessionId),
    getSceneMetadata(clientRequest.sceneId),
    getActionHistory(clientRequest.sessionId)
  ]);
  const objects = buildPreviewObjects(sceneMetadata, clientState);
  let panelLab = clientState.panelLab || null;
  if (!panelLab && clientState.domain === 'configurator-3d' && clientState.modelKey) {
    panelLab = await loadPanelLabFromLocalGltf(clientState.modelKey);
  }

  const sceneContext = createSceneContext({
    sceneId: clientRequest.sceneId,
    sessionId: clientRequest.sessionId,
    sourceUri:
      clientState.modelKey ||
      sceneMetadata?.sourceUri ||
      sceneMetadata?.source ||
      'preview-scene',
    objects,
    hierarchy: buildPreviewHierarchy(objects),
    materials: buildPreviewMaterials(objects),
    metadata: {
      session,
      scene: sceneMetadata,
      actionHistory,
      storageMode: 'local-json',
      configurator: {
        domain: clientState.domain || null,
        modelKey: clientState.modelKey || null,
        panelLab,
        selection: clientState.selection || null,
        projects: Array.isArray(clientState.projects) ? clientState.projects : null
      }
    },
    commandContext: {
      requestId: clientRequest.requestId,
      inputType: clientRequest.inputType,
      command: clientRequest.command,
      clientState
    }
  });
  if (panelLab) {
    sceneContext.panelLab = normalizePanelLabToEmbedded(panelLab);
  }

  const validationErrors = validateSceneContext(sceneContext);

  return {
    sceneContext,
    validationErrors
  };
}
