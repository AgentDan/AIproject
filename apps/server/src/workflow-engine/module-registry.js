/** @typedef {{ id: string, execute: (sceneContext: object, actionPlan: object) => Promise<object> }} DomainModule */

/** @type {Map<string, DomainModule>} */
const registry = new Map();

/**
 * Регистрация доменного плагина (схема: registerModule).
 * @param {string} id
 * @param {DomainModule['execute']} execute
 */
export function registerModule(id, execute) {
  const key = String(id).trim();
  if (!key) {
    throw new Error('registerModule: id is required');
  }
  registry.set(key, { id: key, execute });
}

/** @param {string} id */
export function resolveModule(id) {
  return registry.get(String(id).trim()) ?? null;
}

export function listRegisteredModules() {
  return [...registry.keys()];
}
