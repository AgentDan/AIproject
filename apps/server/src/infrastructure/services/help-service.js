/**
 * Help listing for list_commands meta-intent (static catalog from IntentRegistry).
 */
import { INTENT_REGISTRY } from '@ai-product-scene-platform/ai';
import {
  CLIENT_RESPONSE_STATUS,
  CLIENT_RESPONSE_TYPE,
  createClientResponse,
  createHelpResponse,
  createIntentHelpEntry
} from '@ai-product-scene-platform/contracts';

export class HelpService {
  static getIntentList() {
    const intents = INTENT_REGISTRY.filter((entry) => (entry.kind ?? 'scene') !== 'meta')
      .filter((entry) => entry.detectionPatterns.length > 0)
      .map((entry) =>
        createIntentHelpEntry({
          type: entry.type,
          description: entry.description,
          examples: [...entry.examples],
          parameters: [...entry.parameters]
        })
      );
    return createHelpResponse({ intents });
  }

  /**
   * @param {Record<string, unknown>} clientRequest
   * @param {unknown} storage
   */
  static createHelpListingPayload(clientRequest, storage) {
    const help = HelpService.getIntentList();
    const clientResponse = createClientResponse({
      requestId: clientRequest.requestId,
      sessionId: clientRequest.sessionId,
      sceneId: clientRequest.sceneId,
      status: CLIENT_RESPONSE_STATUS.OK,
      responseType: CLIENT_RESPONSE_TYPE.HELP,
      message: 'Available intents',
      explanation:
        'Listing all supported intents, example commands, and parameters. Submit a concrete command for planning and scene execution.',
      help
    });

    return {
      ...clientResponse,
      clientRequest,
      storage
    };
  }
}
