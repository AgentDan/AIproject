import { listRegisteredModules, resolveModule } from './module-registry.js';
import { assertModulePermission } from './permissions.js';
import { DOMAIN_IDS, bootstrapDomainModules } from './bootstrap.js';

bootstrapDomainModules();

/**
 * Выбор домена: clientState.domain или configurator-3d по умолчанию.
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
 * Workflow engine: intent → route → execute в domain module (схема v2).
 * @param {object} sceneContext
 * @param {object} actionPlan
 */
export async function executeWorkflow(sceneContext, actionPlan) {
  const domainId = resolveDomainModuleId(sceneContext);
  assertModulePermission(sceneContext, domainId);

  const module = resolveModule(domainId);
  if (!module) {
    const available = listRegisteredModules().join(', ') || 'none';
    throw new Error(
      `Domain module is not registered: "${domainId}". Registered: ${available}.`
    );
  }

  return module.execute(sceneContext, actionPlan);
}
