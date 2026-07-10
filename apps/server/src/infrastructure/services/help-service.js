/**
 * Help listing for list_commands meta-intent (static catalog from IntentRegistry).
 */
import { listIntentsForScope } from '@ai-product-scene-platform/ai';
import {
  CLIENT_RESPONSE_STATUS,
  CLIENT_RESPONSE_TYPE,
  createClientResponse,
  createHelpResponse,
  createIntentHelpEntry
} from '@ai-product-scene-platform/contracts';

export class HelpService {
  /**
   * @param {string | null | undefined} scope — clientState.mode
   */
  static getIntentList(scope) {
    const intents = listIntentsForScope(scope).map((entry) =>
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
    const scope = clientRequest.clientState?.mode;
    const help = HelpService.getIntentList(scope);
    const clientResponse = createClientResponse({
      requestId: clientRequest.requestId,
      sessionId: clientRequest.sessionId,
      sceneId: clientRequest.sceneId,
      status: CLIENT_RESPONSE_STATUS.OK,
      responseType: CLIENT_RESPONSE_TYPE.HELP,
      message: 'Available intents',
      explanation: scope
        ? `Listing supported intents for mode "${scope}".`
        : 'Listing all supported intents, example commands, and parameters.',
      help
    });

    return {
      ...clientResponse,
      clientRequest,
      storage
    };
  }
}
