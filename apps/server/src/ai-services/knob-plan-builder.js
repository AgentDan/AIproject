import { ACTION_TYPES, createActionStep } from '@ai-product-scene-platform/contracts';

const COLOR_HEX = {
  red: '#ff0000',
  blue: '#0000ff',
  green: '#00aa00',
  black: '#000000',
  white: '#ffffff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  purple: '#800080',
  gray: '#808080',
  grey: '#808080'
};

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setSparse(path, value) {
  const keys = path.split('.');
  const root = {};
  let cur = root;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = value;
    else cur = cur[k] = {};
  });
  return root;
}

function deepMergeShallowPatches(a, b) {
  const out = { ...a };
  for (const k of Object.keys(b)) {
    out[k] =
      b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && out[k] && typeof out[k] === 'object'
        ? deepMergeShallowPatches(out[k], b[k])
        : b[k];
  }
  return out;
}

function clampNum(n, clamp) {
  if (!clamp) return n;
  return Math.max(clamp[0], Math.min(clamp[1], n));
}

function extractNumber(utterance) {
  const m = utterance.match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}

function extractColor(utterance) {
  const lc = utterance.toLowerCase();
  const word = Object.keys(COLOR_HEX).find((c) => lc.includes(c));
  if (word) return COLOR_HEX[word];
  const hex = utterance.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
  return hex ? hex[0] : undefined;
}

/** registryEntry (kind:'knob') + utterance + current panelLab → sparse patch | null */
export function knobToPatch(entry, utterance, panelLab) {
  const k = entry.knob;
  if (!k) return null;
  let nextValue;

  if (k.op === 'toggle') {
    const cur = getPath(panelLab, k.paths[0]);
    nextValue = !cur;
  } else if (k.op === 'set') {
    if (k.setValue !== undefined) nextValue = k.setValue;
    else if (k.valueKind === 'number') nextValue = clampNum(extractNumber(utterance), k.clamp);
    else if (k.valueKind === 'color') nextValue = extractColor(utterance);
    else if (k.valueKind === 'enum')
      nextValue = (k.enumValues || []).find((v) => utterance.toLowerCase().includes(v.toLowerCase()));
    if (nextValue === undefined || nextValue === null) return null;
  } else if (k.op === 'adjust') {
    const variant = (k.variants || []).find((v) => v.match.test(utterance));
    if (!variant) return null;
    const cur = Number(getPath(panelLab, k.paths[0])) || 0;
    nextValue = clampNum(cur * variant.factor, k.clamp);
  }

  return k.paths.map((p) => setSparse(p, nextValue)).reduce(deepMergeShallowPatches, {});
}

export function buildKnobStep({ requestId, entry, utterance, panelLab }) {
  const patch = knobToPatch(entry, utterance, panelLab);
  if (!patch) return null;
  return createActionStep({
    stepId: `step-${requestId}-1`,
    type: ACTION_TYPES.UPDATE_PANEL_LAB,
    target: { objectId: 'scene' },
    parameters: { patch },
    reason: `Knob "${entry.type}" → panelLab patch.`
  });
}
