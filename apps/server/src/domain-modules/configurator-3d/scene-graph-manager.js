function cloneObject(object) {
  return JSON.parse(JSON.stringify(object));
}

export function createSceneGraph(sceneContext) {
  return {
    sceneId: sceneContext.sceneId,
    objects: sceneContext.objects.map(cloneObject),
    hierarchy: sceneContext.hierarchy.map(cloneObject),
    materials: sceneContext.materials.map(cloneObject)
  };
}

export function findSceneObject(sceneGraph, objectId) {
  return sceneGraph.objects.find((object) => object.objectId === objectId) || null;
}

export function updateSceneObject(sceneGraph, objectId, updater) {
  const object = findSceneObject(sceneGraph, objectId);

  if (!object) {
    return null;
  }

  updater(object);
  return object;
}
