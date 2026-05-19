/**
 * @param {{ sceneContext: object, intent: object, chunks?: object[] }} args
 */
export function buildPrompt({ sceneContext, intent, chunks = [] }) {
  const knowledgeSection =
    chunks.length > 0
      ? `### Relevant knowledge\n${chunks
          .map((c) => `- (${c.source}) ${c.text}`)
          .join('\n')}`
      : '';

  const commandText = sceneContext.commandContext.command;
  const user =
    knowledgeSection.length > 0
      ? `${knowledgeSection}\n\n${commandText}`
      : commandText;

  return {
    system:
      'You are an AI planner for 3D product scenes. Return a validated Action Plan only.',
    user,
    context: {
      sceneId: sceneContext.sceneId,
      sessionId: sceneContext.sessionId,
      intent,
      retrievedChunks: chunks,
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
