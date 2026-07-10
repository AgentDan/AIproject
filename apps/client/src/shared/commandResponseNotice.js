/**
 * Build serverNotice fields from a successful POST /api/commands payload.
 * @param {Record<string, unknown>} payload
 */
export function buildServerNoticeFromPayload(payload) {
  if (payload?.responseType === 'help') {
    return {
      type: 'success',
      responseType: 'help',
      message:
        (typeof payload.message === 'string' && payload.message.trim()) ||
        'Supported intents.',
      helpIntents: payload.help?.intents ?? []
    };
  }

  if (payload?.data?.kind === 'unknown') {
    return {
      type: 'success',
      message:
        (typeof payload.data.message === 'string' && payload.data.message) ||
        (typeof payload.message === 'string' && payload.message) ||
        'Command not recognized.'
    };
  }

  return {
    type: 'success',
    responseType: payload.responseType,
    message: payload.explanation || payload.message || 'The server processed the command.',
    intent: payload.aiServices?.actionPlan?.intent,
    resultStatus: payload.sceneResult?.status
  };
}
