import {
  CLIENT_RESPONSE_TYPE,
  createClientResponse
} from '@ai-product-scene-platform/contracts';

/**
 * Собирает успешный ответ клиенту из результата Scene Modules (Output Builder).
 * @param {{
 *   clientRequest: Record<string, unknown>,
 *   storage: unknown,
 *   sceneContext: unknown,
 *   aiServices: unknown,
 *   sceneModules: { sceneResult: object }
 * }} args
 */
export function buildAcceptedCommandPayload({
  clientRequest,
  storage,
  sceneContext,
  aiServices,
  sceneModules
}) {
  return {
    ...createClientResponse({
      requestId: clientRequest.requestId,
      sessionId: clientRequest.sessionId,
      sceneId: clientRequest.sceneId,
      responseType: CLIENT_RESPONSE_TYPE.SCENE,
      message: 'Команда принята.',
      explanation:
        'Запрос принят: команда сохранена, построен контекст сцены, сформирован проверенный план действий и выполнены модули сцены.',
      sceneResult: sceneModules.sceneResult
    }),
    clientRequest,
    storage,
    sceneContext,
    aiServices,
    sceneModules
  };
}
