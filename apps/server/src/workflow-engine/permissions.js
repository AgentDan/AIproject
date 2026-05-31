/**
 * ACL по доменным модулям (схема: Permissions per module).
 * @param {object} sceneContext
 * @param {string} domainId
 */
export function assertModulePermission(sceneContext, domainId) {
  // Server-side denyDomains (not client-controlled)
  const auth = sceneContext?.commandContext?.clientState?.auth;
  const role = auth?.role ?? 'anonymous';

  // Destructive domain modules require at least editor role
  const restrictedDomains = ['configurator-3d'];
  const allowedRoles = ['editor', 'administrator'];

  if (restrictedDomains.includes(domainId) && !allowedRoles.includes(role)) {
    throw new Error(
      `Role "${role}" is not allowed to execute domain module "${domainId}". Required: editor or administrator.`
    );
  }
}
