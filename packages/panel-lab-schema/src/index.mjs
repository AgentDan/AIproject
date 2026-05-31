export const PANEL_LAB_VERSION = 1;

/** Hard cap on annotation count (panel + glTF). */
export const ANNOTATIONS_MAX_ITEMS = 10;

function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Default camera position is [0,0,0] in schema; OrbitControls needs a non-zero offset from target.
 * If position and orbit target coincide, nudge camera along +Z (only in resolved panelLab).
 */
function finalizeCameraOrbit(panelLab) {
  const cam = panelLab?.camera;
  const ctl = panelLab?.controls;
  if (!isPlainObject(cam) || !Array.isArray(cam.position) || !isPlainObject(ctl) || !Array.isArray(ctl.target)) {
    return;
  }
  const c = cam.position.map((n) => Number(n) || 0);
  const t = ctl.target.map((n) => Number(n) || 0);
  const dx = c[0] - t[0];
  const dy = c[1] - t[1];
  const dz = c[2] - t[2];
  if (dx * dx + dy * dy + dz * dz < 1e-8) {
    cam.position = [0, 0, 6];
  }
}

export const DEFAULT_PANEL_LAB = {
  version: PANEL_LAB_VERSION,

  environment: {
    background: {
      type: 'color',
      color: '#e5e7eb',
      blur: 0,
      intensity: 1,
    },
    hdri: {
      enabled: false,
      url: '/hdri/studio_small_09.hdr',
      mapping: 'EquirectangularReflectionMapping',
      intensity: 1.2,
      rotation: [0, 0, 0],
      background: false,
      blur: 0,
      lod: 0,
    },
    fog: {
      enabled: false,
      type: 'linear',
      color: '#ffffff',
      near: 10,
      far: 100,
    },
  },

  lighting: {
    ambient: {
      enabled: false,
      intensity: 0.6,
      color: '#ffffff',
    },
    hemisphere: {
      enabled: false,
      skyColor: '#ffffff',
      groundColor: '#444444',
      intensity: 0.5,
    },
    directional: {
      enabled: false,
      /** Viewport overlay in Lab (position → target). */
      sceneHelper: false,
      /** When light + global shadows are on, meshes cast without an extra Panel Lab click. */
      castShadow: true,
      shadowIntensity: 1,
      color: '#ffffff',
      intensity: 2,
      position: [5, 10, 5],
      target: [0, 0, 0],
    },
    directionalLights: [],
    shadows: {
      enabled: false,
      mapSize: [2048, 2048],
      /** VSM: small depth bias; rely more on normalBias for contact artefacts. */
      bias: -0.00005,
      /** Higher default reduces self-shadow acne when meshes both cast and receive. */
      normalBias: 0.06,
      /** VSM blur strength; Three docs: values > 1 visibly soften edges. */
      radius: 8,
      blurSamples: 16,
      camera: {
        near: 0.5,
        far: 50,
        /** Tighter ortho frustum → better texel density (less blocky edges). */
        left: -6,
        right: 6,
        top: 6,
        bottom: -6,
      },
    },
    pointLights: [],
    spotLights: [],
  },

  ground: {
    enabled: false,
    type: 'shadowReceiver',
    size: 20,
    material: {
      color: '#ffffff',
      opacity: 0.4,
      roughness: 1,
    },
  },

  renderer: {
    physicallyCorrectLights: true,
    toneMapping: 'NoToneMapping',
    toneMappingExposure: 1,
    outputColorSpace: 'NoColorSpace',
    shadowMap: {
      enabled: false,
      /** PCFSoft is deprecated in Three r182 (treated as PCF). VSM enables radius + blurSamples. */
      type: 'VSMShadowMap',
    },
    antialias: true,
  },

  postprocessing: {
    enabled: false,
    bloom: {
      enabled: false,
      strength: 0.5,
      radius: 0.4,
      threshold: 0.8,
    },
    ssao: {
      enabled: false,
      radius: 0.5,
      intensity: 10,
      luminanceInfluence: 0.6,
    },
    colorGrading: {
      enabled: false,
      contrast: 1,
      saturation: 1,
      brightness: 1,
    },
    vignette: {
      enabled: false,
      offset: 0.5,
      darkness: 0.5,
    },
  },

  camera: {
    position: [0, 0, 0],
    fov: 50,
    near: 0.1,
    far: 1000,
  },

  controls: {
    /** OrbitControls.target — center the camera orbits around. */
    target: [0, 0, 0],
    /** World point the camera aims at (after orbit; independent of target). */
    lookTarget: [0, 0, 0],
    minDistance: 0,
    maxDistance: 10,
    dampingFactor: 0.05,
    enableDamping: true,
    enablePan: true,
    enableZoom: true,
    enableRotate: true,
    /** OrbitControls pointer sensitivities (Three.js defaults = 1). */
    rotateSpeed: 1,
    zoomSpeed: 1,
    panSpeed: 1,
    /** Polar angle limits (radians): 0 = +Y pole, π = −Y pole. */
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    /** Azimuth limits (radians) around target. ±2π default is effectively full horizontal spin for JSON-safe embeds. */
    minAzimuthAngle: -Math.PI * 2,
    maxAzimuthAngle: Math.PI * 2,
  },

  annotations: {
    enabled: false,
    items: [
      {
        id: 'ann-0',
        label: '',
        /** Markdown body (react-markdown in viewer). */
        text: '',
        position: [0, 0, 0],
        visible: true,
      },
    ],
  },
};

export function cloneDefaultPanelLab() {
  const o = JSON.parse(JSON.stringify(DEFAULT_PANEL_LAB));
  finalizeCameraOrbit(o);
  return o;
}

/** Deep merge objects recursively; arrays and primitives from patch replace. */
export function deepMerge(base, patch) {
  if (!isPlainObject(patch)) return base;
  if (!isPlainObject(base)) return JSON.parse(JSON.stringify(patch));
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const bv = base[key];
    if (Array.isArray(pv)) {
      out[key] = pv.slice();
    } else if (isPlainObject(pv) && isPlainObject(bv)) {
      out[key] = deepMerge(bv, pv);
    } else {
      out[key] = pv;
    }
  }
  return out;
}

const REQUIRED_TOP = [
  'environment',
  'lighting',
  'ground',
  'renderer',
  'postprocessing',
  'camera',
  'controls',
];

function isValidPanelLabShape(raw) {
  if (!isPlainObject(raw)) return false;
  // Treat missing version as legacy (merge with defaults). Only reject explicitly older integers.
  const ver = raw.version;
  if (ver != null && ver !== '' && Number(ver) < PANEL_LAB_VERSION) return false;
  for (const k of REQUIRED_TOP) {
    if (!isPlainObject(raw[k])) return false;
  }
  return true;
}

/**
 * Normalize extras.panelLab: invalid or legacy shape → defaults; otherwise deep-merge with defaults.
 */
export function normalizePanelLabToEmbedded(raw) {
  const defaults = cloneDefaultPanelLab();
  if (!isValidPanelLabShape(raw)) return defaults;
  const merged = deepMerge(defaults, raw);
  merged.version = PANEL_LAB_VERSION;
  if (merged.renderer?.shadowMap?.type === 'PCFSoftShadowMap') {
    merged.renderer = {
      ...merged.renderer,
      shadowMap: { ...merged.renderer.shadowMap, type: 'VSMShadowMap' },
    };
  }
  // BasicShadowMap is very blocky; embedded files often ship it by mistake.
  if (merged.renderer?.shadowMap?.enabled && merged.renderer?.shadowMap?.type === 'BasicShadowMap') {
    merged.renderer = {
      ...merged.renderer,
      shadowMap: { ...merged.renderer.shadowMap, type: 'VSMShadowMap' },
    };
  }
  if (typeof merged.lighting?.directional?.castShadow !== 'boolean') {
    const oldEnabled = merged.lighting?.directional?.shadow?.enabled;
    merged.lighting.directional.castShadow = typeof oldEnabled === 'boolean' ? oldEnabled : true;
  }
  if (!isPlainObject(merged.lighting?.shadows)) {
    merged.lighting.shadows = JSON.parse(JSON.stringify(defaults.lighting.shadows));
  }
  const oldShadow = merged.lighting?.directional?.shadow;
  if (isPlainObject(oldShadow)) {
    merged.lighting.shadows = deepMerge(merged.lighting.shadows, oldShadow);
    const { directional } = merged.lighting;
    const { shadow: _legacyShadow, ...restDirectional } = directional;
    merged.lighting.directional = restDirectional;
  }
  const gsh = merged.lighting?.shadows;
  if (gsh?.enabled && Array.isArray(gsh.mapSize)) {
    const w = Number(gsh.mapSize[0]);
    const h = Number(gsh.mapSize[1]);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 512 || h < 512) {
      gsh.mapSize = [2048, 2048];
    }
  }
  if (Array.isArray(merged.lighting?.pointLights)) {
    merged.lighting.pointLights = merged.lighting.pointLights.map((pl) =>
      isPlainObject(pl)
        ? {
            ...pl,
            castShadow: typeof pl.castShadow === 'boolean' ? pl.castShadow : true,
            shadowIntensity: Number.isFinite(Number(pl.shadowIntensity))
              ? Math.max(0, Math.min(1, Number(pl.shadowIntensity)))
              : 1,
          }
        : pl,
    );
  }
  if (Array.isArray(merged.lighting?.spotLights)) {
    merged.lighting.spotLights = merged.lighting.spotLights.map((sl) =>
      isPlainObject(sl)
        ? {
            ...sl,
            castShadow: typeof sl.castShadow === 'boolean' ? sl.castShadow : true,
            shadowIntensity: Number.isFinite(Number(sl.shadowIntensity))
              ? Math.max(0, Math.min(1, Number(sl.shadowIntensity)))
              : 1,
          }
        : sl,
    );
  }
  if (!Array.isArray(merged.lighting?.directionalLights)) {
    merged.lighting.directionalLights = [];
  } else {
    merged.lighting.directionalLights = merged.lighting.directionalLights.map((dl) =>
      isPlainObject(dl)
        ? {
            ...defaults.lighting.directional,
            ...dl,
            castShadow: typeof dl.castShadow === 'boolean' ? dl.castShadow : false,
            shadowIntensity: Number.isFinite(Number(dl.shadowIntensity))
              ? Math.max(0, Math.min(1, Number(dl.shadowIntensity)))
              : 1,
          }
        : JSON.parse(JSON.stringify(defaults.lighting.directional)),
    );
  }
  if (Number.isFinite(Number(merged.lighting?.directional?.shadowIntensity))) {
    merged.lighting.directional.shadowIntensity = Math.max(0, Math.min(1, Number(merged.lighting.directional.shadowIntensity)));
  } else if (merged.lighting?.directional) {
    merged.lighting.directional.shadowIntensity = 1;
  }
  // Legacy: camera.target → controls.target + controls.lookTarget; strip camera.target.
  if (isPlainObject(merged.camera) && Array.isArray(merged.camera.target)) {
    const legacy = merged.camera.target.slice();
    if (isPlainObject(merged.controls) && !Array.isArray(raw?.controls?.target)) {
      merged.controls.target = legacy.slice();
    }
    if (
      isPlainObject(merged.controls) &&
      !Array.isArray(raw?.controls?.lookTarget) &&
      !(isPlainObject(raw?.camera) && Array.isArray(raw.camera.lookTarget))
    ) {
      merged.controls.lookTarget = legacy.slice();
    }
    const { target: _legacyCamTarget, ...camRest } = merged.camera;
    merged.camera = camRest;
  }
  // Move look-at off camera onto controls (camera = lens + position only).
  if (isPlainObject(merged.camera) && isPlainObject(merged.controls)) {
    if (Array.isArray(merged.camera.lookTarget)) {
      if (!Array.isArray(raw?.controls?.lookTarget)) {
        merged.controls.lookTarget = merged.camera.lookTarget.slice();
      }
      const { lookTarget: _lt, ...camRest } = merged.camera;
      merged.camera = camRest;
    }
    if ('sceneHelper' in merged.camera) {
      const { sceneHelper: _csh, ...camRest2 } = merged.camera;
      merged.camera = camRest2;
    }
  }
  if (isPlainObject(merged.controls)) {
    const {
      orbitTargetHelper: _legacyOh,
      sceneHelper: _orbitH,
      lookAtHelper: _lookH,
      ...restControls
    } = merged.controls;
    merged.controls = restControls;
  }

  const defAnn = defaults.annotations;
  if (!isPlainObject(merged.annotations)) {
    merged.annotations = JSON.parse(JSON.stringify(defAnn));
  } else {
    merged.annotations.enabled = merged.annotations.enabled === true;
    const template = defAnn.items[0];
    const rawItems = Array.isArray(merged.annotations.items) ? merged.annotations.items : [];
    const capped = rawItems.slice(0, ANNOTATIONS_MAX_ITEMS);
    const normalizedItems = capped.map((it, idx) => {
      const o = isPlainObject(it) ? { ...template, ...it } : { ...template };
      const pos = Array.isArray(o.position) ? o.position.map((n) => Number(n) || 0) : [0, 0, 0];
      o.position = pos.slice(0, 3);
      if (o.position.length < 3) {
        while (o.position.length < 3) o.position.push(0);
      }
      o.id = typeof o.id === 'string' && o.id.trim() ? o.id.trim() : `ann-${idx}`;
      o.label = typeof o.label === 'string' ? o.label : '';
      o.text = typeof o.text === 'string' ? o.text : '';
      o.visible = o.visible !== false;
      return o;
    });
    merged.annotations.items =
      normalizedItems.length > 0 ? normalizedItems : JSON.parse(JSON.stringify(defAnn.items));
    const seenIds = new Set();
    merged.annotations.items = merged.annotations.items.map((o, idx) => {
      let id = o.id;
      if (seenIds.has(id)) {
        id = `ann-${idx}-${Math.random().toString(36).slice(2, 8)}`;
      }
      seenIds.add(id);
      return { ...o, id };
    });
  }

  finalizeCameraOrbit(merged);
  return merged;
}

/** Persistable glTF payload: full tree, no missing branches. */
export function toCleanEmbeddedPanelLab(panelLab) {
  return normalizePanelLabToEmbedded(panelLab);
}

/** Legacy export name for imports expecting SCHEMA_VERSION. */
export const SCHEMA_VERSION = PANEL_LAB_VERSION;
