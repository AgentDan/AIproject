/**
 * ACL по доменным модулям (схема: Permissions per module).
 * MVP: разрешено всем; позже — roles из clientState / auth.
 * @param {object} sceneContext
 * @param {string} domainId
 */
export function assertModulePermission(sceneContext, domainId) {
  const denied = sceneContext?.commandContext?.clientState?.denyDomains;
  if (Array.isArray(denied) && denied.includes(domainId)) {
    throw new Error(`Access denied for domain module: ${domainId}`);
  }
}
