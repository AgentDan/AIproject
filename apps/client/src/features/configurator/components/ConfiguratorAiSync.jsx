import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  CONFIGURATOR_ROOT_OBJECT_ID,
  applyObjectStateToNode
} from '../domain/aiSceneBridge.js';
import { useAiSceneStore } from '../store/aiSceneStore.js';

function findConfiguratorRoot(scene) {
  for (const child of scene.children) {
    if (child.userData?.configuratorRoot) {
      return child;
    }
  }
  return null;
}

function findNodeByAiObjectId(scene, objectId) {
  if (objectId === CONFIGURATOR_ROOT_OBJECT_ID) {
    return findConfiguratorRoot(scene);
  }

  let found = null;
  scene.traverse((child) => {
    if (child.userData?.aiObjectId === objectId) {
      found = child;
    }
  });
  return found;
}

export function ConfiguratorAiSync() {
  const pendingServerObjects = useAiSceneStore((s) => s.pendingServerObjects);
  const { scene } = useThree();

  useEffect(() => {
    if (!pendingServerObjects?.length) {
      return;
    }

    for (const obj of pendingServerObjects) {
      if (!obj?.objectId) continue;
      const node = findNodeByAiObjectId(scene, obj.objectId);
      if (node) {
        applyObjectStateToNode(node, obj);
      }
    }

    useAiSceneStore.getState().patchLocalFromServer(pendingServerObjects);
    useAiSceneStore.getState().consumePending();
  }, [pendingServerObjects, scene]);

  return null;
}
