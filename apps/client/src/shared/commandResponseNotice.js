/**
 * Build serverNotice fields from a successful POST /api/commands payload.
 * @param {Record<string, unknown>} payload
 */
export function buildServerNoticeFromPayload(payload) {
  const commandList = payload?.data?.commands;
  if (Array.isArray(commandList)) {
    return {
      type: 'success',
      responseType: 'command_list',
      message:
        (typeof payload.explanation === 'string' && payload.explanation.trim()) ||
        (typeof payload.message === 'string' && payload.message.trim()) ||
        'Available commands.',
      commandList
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
