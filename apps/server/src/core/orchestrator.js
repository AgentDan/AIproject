/**

 * Platform orchestrator — главный flow платформы (схема: Orchestrator).

 * API layer только принимает HTTP и вызывает orchestrateCommand().

 */

import {

  CLIENT_RESPONSE_STATUS,

  CLIENT_RESPONSE_TYPE,

  createClientResponse,

  validateClientResponse

} from '@ai-product-scene-platform/contracts';

import { detectMetaIntent } from '@ai-product-scene-platform/ai';

import { HelpService } from '../infrastructure/services/help-service.js';

import { recordCommandRequest } from '../infrastructure/storage/local-storage.js';

import { runAiServicesPipeline } from '../ai-services/pipeline.js';

import { executeWorkflow } from '../workflow-engine/index.js';

import { buildSceneContext } from './scene-context-builder.js';

import { buildAcceptedCommandPayload, buildMetaCommandPayload } from './output-builder.js';



/**

 * Ранний выход (meta list_commands) до Context Builder / AI / Workflow.

 * @returns {{ completed: false } | { completed: true; statusCode: number; payload: object }}

 */

export function processRequest(clientRequest, storage) {

  const metaIntent = detectMetaIntent(clientRequest.command);



  if (metaIntent !== 'list_commands') {

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
        message: 'Ошибка валидации ответа help.',
        errors: validationErrors

      }),

      clientRequest,

      storage

    };

    return { completed: true, statusCode: 500, payload };

  }



  return { completed: true, statusCode: 202, payload };

}



/**

 * Полный pipeline: storage → early guards → Context → AI runtime → Workflow → Output.

 * @param {Record<string, unknown>} clientRequest

 * @returns {Promise<{ statusCode: number; payload: object }>}

 */

export async function orchestrateCommand(clientRequest) {

  let storage;



  try {

    storage = await recordCommandRequest(clientRequest);

  } catch (error) {

    return {

      statusCode: 500,

      payload: {

        ...createClientResponse({

          requestId: clientRequest.requestId,

          sessionId: clientRequest.sessionId,

          sceneId: clientRequest.sceneId,

          status: CLIENT_RESPONSE_STATUS.ERROR,

          message: 'Не удалось сохранить команду.',

          errors: [error instanceof Error ? error.message : String(error)]

        })

      }

    };

  }



  const earlyOutcome = processRequest(clientRequest, storage);

  if (earlyOutcome.completed) {

    return { statusCode: earlyOutcome.statusCode, payload: earlyOutcome.payload };

  }



  const { sceneContext, validationErrors: sceneContextErrors } =

    await buildSceneContext(clientRequest);



  if (sceneContextErrors.length > 0) {

    return {

      statusCode: 500,

      payload: {

        ...createClientResponse({

          requestId: clientRequest.requestId,

          sessionId: clientRequest.sessionId,

          sceneId: clientRequest.sceneId,

          status: CLIENT_RESPONSE_STATUS.ERROR,

          message: 'Ошибка валидации контекста сцены.',

          errors: sceneContextErrors

        }),

        clientRequest,

        storage

      }

    };

  }



  const aiServices = await runAiServicesPipeline(sceneContext);



  if (aiServices.meta) {

    return {

      statusCode: 202,

      payload: buildMetaCommandPayload({

        clientRequest,

        storage,

        sceneContext,

        aiServices

      })

    };

  }



  if (!aiServices.validation.valid) {

    return {

      statusCode: 500,

      payload: {

        ...createClientResponse({

          requestId: clientRequest.requestId,

          sessionId: clientRequest.sessionId,

          sceneId: clientRequest.sceneId,

          status: CLIENT_RESPONSE_STATUS.ERROR,

          message: 'Ошибка валидации конвейера AI-сервисов.',

          errors: aiServices.validation.errors

        }),

        clientRequest,

        storage,

        sceneContext,

        aiServices

      }

    };

  }



  let workflowResult;



  try {

    workflowResult = await executeWorkflow(sceneContext, aiServices.actionPlan);

  } catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    const isPermissionError = /not allowed/i.test(message);

    return {

      statusCode: isPermissionError ? 403 : 501,

      payload: {

        ...createClientResponse({

          requestId: clientRequest.requestId,

          sessionId: clientRequest.sessionId,

          sceneId: clientRequest.sceneId,

          status: CLIENT_RESPONSE_STATUS.ERROR,

          message: isPermissionError

            ? 'Недостаточно прав для выполнения команды.'

            : 'Ошибка workflow engine.',

          errors: [message]

        }),

        clientRequest,

        storage,

        sceneContext,

        aiServices

      }

    };

  }



  if (

    workflowResult.validationErrors.length > 0 ||

    !workflowResult.sceneResult.validation.valid

  ) {

    return {

      statusCode: 500,

      payload: {

        ...createClientResponse({

          requestId: clientRequest.requestId,

          sessionId: clientRequest.sessionId,

          sceneId: clientRequest.sceneId,

          status: CLIENT_RESPONSE_STATUS.ERROR,

          message: 'Ошибка валидации доменного модуля.',

          sceneResult: workflowResult.sceneResult,

          errors: [

            ...workflowResult.validationErrors,

            ...workflowResult.sceneResult.validation.errors

          ]

        }),

        clientRequest,

        storage,

        sceneContext,

        aiServices,

        sceneModules: workflowResult

      }

    };

  }



  return {

    statusCode: 202,

    payload: buildAcceptedCommandPayload({

      clientRequest,

      storage,

      sceneContext,

      aiServices,

      sceneModules: workflowResult

    })

  };

}


