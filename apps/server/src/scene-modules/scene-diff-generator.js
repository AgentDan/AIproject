function getComparableState(object) {
  return {
    transform: object.transform || null,
    material: object.material || null
  };
}

export function generateSceneDiff(beforeObjects, afterObjects) {
  return afterObjects.flatMap((afterObject) => {
    const beforeObject = beforeObjects.find((object) => object.objectId === afterObject.objectId);

    if (!beforeObject) {
      return [{ type: 'object_added', objectId: afterObject.objectId, after: afterObject }];
    }

    const beforeState = getComparableState(beforeObject);
    const afterState = getComparableState(afterObject);

    if (JSON.stringify(beforeState) === JSON.stringify(afterState)) {
      return [];
    }

    return [{
      type: 'object_updated',
      objectId: afterObject.objectId,
      before: beforeState,
      after: afterState
    }];
  });
}
