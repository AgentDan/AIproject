import { registerModule } from './module-registry.js';
import { executeConfigurator3dPipeline } from '../domain-modules/configurator-3d/pipeline.js';

export const DOMAIN_IDS = Object.freeze({
  CONFIGURATOR_3D: 'configurator-3d',
  FOOD_DELIVERY: 'food-delivery',
  BOATS: 'boats',
  FURNITURE: 'furniture',
  WAREHOUSE: 'warehouse'
});

/** Регистрация реализованных domain modules при старте процесса. */
export function bootstrapDomainModules() {
  registerModule(DOMAIN_IDS.CONFIGURATOR_3D, executeConfigurator3dPipeline);
}
