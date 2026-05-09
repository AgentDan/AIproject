export function buildPrompt(sceneContext) {
  return {
    system: 'You are an AI planner for 3D product scenes. Return a validated Action Plan only.',
    user: sceneContext.commandContext.command,
    context: {
      sceneId: sceneContext.sceneId,
      sessionId: sceneContext.sessionId,
      objects: sceneContext.objects.map((object) => ({
        objectId: object.objectId,
        name: object.name,
        type: object.type,
        movable: object.movable
      })),
      actionHistory: sceneContext.metadata.actionHistory?.slice(-5) || []
    }
  };
}
