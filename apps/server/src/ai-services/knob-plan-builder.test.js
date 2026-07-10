import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getIntentEntry } from '@ai-product-scene-platform/ai';
import { cloneDefaultPanelLab } from '@ai-product-scene-platform/panel-lab-schema';
import { knobToPatch } from './knob-plan-builder.js';

describe('knobToPatch', () => {
  it('adjusts light intensity for "brighter"', () => {
    const entry = getIntentEntry('panel_lab_light_intensity');
    const panelLab = cloneDefaultPanelLab();
    panelLab.lighting.directional.intensity = 2;

    const patch = knobToPatch(entry, 'brighter', panelLab);
    assert.deepEqual(patch, { lighting: { directional: { intensity: 2.5 } } });
  });

  it('toggles both shadow flags for "enable shadows"', () => {
    const entry = getIntentEntry('panel_lab_shadows_toggle');
    const panelLab = cloneDefaultPanelLab();
    panelLab.renderer.shadowMap.enabled = false;
    panelLab.lighting.shadows.enabled = false;

    const patch = knobToPatch(entry, 'enable shadows', panelLab);
    assert.equal(patch.renderer.shadowMap.enabled, true);
    assert.equal(patch.lighting.shadows.enabled, true);
  });

  it('clamps fov to 90 for "set fov to 200"', () => {
    const entry = getIntentEntry('panel_lab_fov');
    const panelLab = cloneDefaultPanelLab();

    const patch = knobToPatch(entry, 'set fov to 200', panelLab);
    assert.deepEqual(patch, { camera: { fov: 90 } });
  });
});
