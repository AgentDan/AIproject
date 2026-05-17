/**
 * Platform orchestrator (JS module). Early guards live here before Context Builder / AI / Scene Executor.
 */
import {
  CLIENT_RESPONSE_STATUS,
  CLIENT_RESPONSE_TYPE,
  createClientResponse,
  validateClientResponse
} from '@ai-product-scene-platform/contracts';
import { HelpService } from '../services/help-service.js';

export function isHelpListingCommand(command = '') {
  return command.trim().toLowerCase() === 'helper';
}

/**
 * @param {Record<string, unknown>} clientRequest
 * @param {unknown} storage
 * @returns {{ completed: false } | { completed: true; statusCode: number; payload: Record<string, unknown> }}
 */
export function processRequest(clientRequest, storage) {
  if (!isHelpListingCommand(clientRequest.command)) {
    return { completed: false };
  }

  let payload = HelpService.createHelpListingPayload(clientRequest, storage);
  const validationErrors = validateClientResponse(payload);

  if (validationErrors.length > 0) {
    payload = {
      ...createClientResponse({
        requestId: clientRequest.requestId,
        sessionId: clientRequest.sessionId,
        sceneId: clientRequest.sceneId,
        status: CLIENT_RESPONSE_STATUS.ERROR,
        responseType: CLIENT_RESPONSE_TYPE.SCENE,
        message: 'Help response validation failed.',
        errors: validationErrors
      }),
      clientRequest,
      storage
    };
    return {
      completed: true,
      statusCode: 500,
      payload
    };
  }

  return {
    completed: true,
    statusCode: 202,
    payload
  };
}
