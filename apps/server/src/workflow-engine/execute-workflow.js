import { executeConfigurator3dPipeline } from '../domain-modules/configurator-3d/pipeline.js';

/** Зарегистрированные доменные модули (расширяются без правки core). */
export const DOMAIN_IDS = Object.freeze({
  CONFIGURATOR_3D: 'configurator-3d'
});

/**
 * Выбор домена по clientState (MVP: только configurator-3d).
 * @param {object} sceneContext
 */
function resolveDomainModuleId(sceneContext) {
  const raw = sceneContext?.commandContext?.clientState?.domain;
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.trim();
  }
  return DOMAIN_IDS.CONFIGURATOR_3D;
}

/**
 * Workflow engine: ActionPlan → зарегистрированный domain module.
 * @param {object} sceneContext
 * @param {object} actionPlan
 */
export async function executeWorkflow(sceneContext, actionPlan) {
  const domainId = resolveDomainModuleId(sceneContext);

  if (domainId === DOMAIN_IDS.CONFIGURATOR_3D) {
    return executeConfigurator3dPipeline(sceneContext, actionPlan);
  }

  throw new Error(
    `Domain module is not implemented: "${domainId}". Available: ${DOMAIN_IDS.CONFIGURATOR_3D}.`
  );
}
