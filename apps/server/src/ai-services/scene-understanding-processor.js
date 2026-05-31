const CONFIGURATOR_ROOT_OBJECT_ID = 'configurator-root';

function findTargetObject(sceneContext, command) {
  const normalizedCommand = command.toLowerCase();
  const configurator = sceneContext.metadata?.configurator;

  const namedObject = sceneContext.objects.find((object) => {
    const name = String(object.name || '').toLowerCase();
    const objectId = String(object.objectId || '').toLowerCase();
    if (name && name.length > 2 && normalizedCommand.includes(name)) {
      return true;
    }
    if (objectId.startsWith('group-')) {
      const groupToken = objectId.replace('group-', 'group ');
      return normalizedCommand.includes(objectId) || normalizedCommand.includes(groupToken);
    }
    return normalizedCommand.includes(objectId);
  });

  if (namedObject) {
    return namedObject;
  }

  const selection = configurator?.selection;
  if (selection && typeof selection === 'object') {
    const selectedGroupId = Object.keys(selection)[0];
    if (selectedGroupId) {
      const selectedObject = sceneContext.objects.find(
        (object) => object.objectId === `group-${selectedGroupId}`
      );
      if (selectedObject) {
        return selectedObject;
      }
    }
  }

  return (
    sceneContext.objects.find((object) => object.objectId === CONFIGURATOR_ROOT_OBJECT_ID) ||
    sceneContext.objects.find((object) => object.movable) ||
    sceneContext.objects[0] ||
    null
  );
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
      storageMode: sceneContext.metadata.storageMode,
      configuratorModelKey: sceneContext.metadata.configurator?.modelKey || null
    }
  };
}
