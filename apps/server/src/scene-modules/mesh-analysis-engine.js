function createBoundingBoxForObject(object) {
  const position = object.transform?.position || { x: 0, y: 0, z: 0 };

  return {
    objectId: object.objectId,
    min: { x: position.x - 0.5, y: position.y - 0.5, z: position.z - 0.5 },
    max: { x: position.x + 0.5, y: position.y + 0.5, z: position.z + 0.5 }
  };
}

export function showBoundingBoxes(sceneGraph) {
  return sceneGraph.objects.map(createBoundingBoxForObject);
}

export function measureMeshDistance(sceneGraph, targetObject) {
  const otherObject = sceneGraph.objects.find((object) => object.objectId !== targetObject.objectId);

  if (!otherObject) {
    return {
      type: 'mesh_distance',
      fromObjectId: targetObject.objectId,
      toObjectId: null,
      distance: 0,
      unit: 'meters'
    };
  }

  const from = targetObject.transform?.position || { x: 0, y: 0, z: 0 };
  const to = otherObject.transform?.position || { x: 0, y: 0, z: 0 };
  const distance = Math.sqrt(
    (from.x - to.x) ** 2 +
    (from.y - to.y) ** 2 +
    (from.z - to.z) ** 2
  );

  return {
    type: 'mesh_distance',
    fromObjectId: targetObject.objectId,
    toObjectId: otherObject.objectId,
    distance,
    unit: 'meters'
  };
}
