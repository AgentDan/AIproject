import * as THREE from 'three';

/** Three.js constant name as in JSON, e.g. ACESFilmicToneMapping. */
export function resolveToneMapping(name) {
  const v = THREE[name];
  return typeof v === 'number' ? v : THREE.ACESFilmicToneMapping;
}

export function resolveOutputColorSpace(name) {
  const v = THREE[name];
  return typeof v === 'number' ? v : THREE.SRGBColorSpace;
}

/** Map short / mistaken JSON values to THREE constant names. */
const SHADOW_TYPE_ALIASES = {
  VSM: 'VSMShadowMap',
  variance: 'VSMShadowMap',
  PCF: 'PCFShadowMap',
  percentage: 'PCFShadowMap',
  basic: 'BasicShadowMap',
  soft: 'PCFShadowMap',
};

export function resolveShadowMapType(name) {
  if (typeof name === 'number' && Number.isFinite(name)) return name;
  if (typeof name === 'string') {
    const key = SHADOW_TYPE_ALIASES[name] || name;
    const v = THREE[key];
    if (typeof v === 'number') return v;
  }
  // Never default to PCFSoft: Three r182 maps it to plain PCF (radius blur ignored).
  return THREE.VSMShadowMap;
}

export function resolveMapping(name) {
  const v = THREE[name];
  return typeof v === 'number' ? v : THREE.EquirectangularReflectionMapping;
}
