/**
 * Help listing for the literal `helper` command (static catalog from IntentRegistry).
 * Matches HelpService naming from the architecture diagram.
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
    const intents = INTENT_REGISTRY.map((entry) =>
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
   * @param {Record<string, unknown>} clientRequest - validated client request
   * @param {unknown} storage - MVP storage snapshot from recordCommandRequest
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
