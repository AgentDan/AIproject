function findTargetObject(sceneContext, command) {
  const normalizedCommand = command.toLowerCase();
  const namedObject = sceneContext.objects.find((object) =>
    normalizedCommand.includes(object.name.toLowerCase()) ||
    normalizedCommand.includes(object.objectId.toLowerCase())
  );

  return namedObject || sceneContext.objects.find((object) => object.movable) || sceneContext.objects[0] || null;
}

export function processSceneUnderstanding(sceneContext, intentResult) {
  const command = sceneContext.commandContext.command || '';
  const targetObject = findTargetObject(sceneContext, command);

  return {
    intent: intentResult.intent,
    targetObject,
    objectCount: sceneContext.objects.length,
    hasActionHistory: (sceneContext.metadata.actionHistory || []).length > 0,
    constraints: {
      targetIsMovable: targetObject?.movable !== false,
      storageMode: sceneContext.metadata.storageMode
    }
  };
}
