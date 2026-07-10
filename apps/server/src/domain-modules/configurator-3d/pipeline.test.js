import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_TYPES, createActionStep } from '@ai-product-scene-platform/contracts';
import { cloneDefaultPanelLab } from '@ai-product-scene-platform/panel-lab-schema';
import { executeConfigurator3dPipeline } from './pipeline.js';

describe('executeConfigurator3dPipeline previewUpdate', () => {
  const baseContext = {
    sceneId: 'test-scene',
    commandContext: { requestId: 'req-1', clientState: { mode: 'panel-lab' } },
    objects: [
      {
        objectId: 'configurator-root',
        type: 'product',
        movable: true,
        material: { color: 'cyan' }
      }
    ],
    hierarchy: [],
    materials: [],
    panelLab: cloneDefaultPanelLab()
  };

  it('omits objects for panel-lab-only knob steps', async () => {
    const actionPlan = {
      requestId: 'req-1',
      sceneId: 'test-scene',
      steps: [
        createActionStep({
          stepId: 'step-req-1-1',
          type: ACTION_TYPES.UPDATE_PANEL_LAB,
          target: { objectId: 'scene' },
          parameters: { patch: { environment: { fog: { enabled: true } } } }
        })
      ]
    };

    const { sceneResult } = await executeConfigurator3dPipeline(baseContext, actionPlan);
    assert.equal(sceneResult.previewUpdate.objects, undefined);
    assert.ok(sceneResult.previewUpdate.panelLab);
    assert.equal(sceneResult.previewUpdate.panelLab.environment.fog.enabled, true);
  });

  it('includes objects when a scene object step runs', async () => {
    const actionPlan = {
      requestId: 'req-2',
      sceneId: 'test-scene',
      steps: [
        createActionStep({
          stepId: 'step-req-2-1',
          type: ACTION_TYPES.CHANGE_OBJECT_COLOR,
          target: { objectId: 'configurator-root' },
          parameters: { color: 'red' }
        })
      ]
    };

    const { sceneResult } = await executeConfigurator3dPipeline(baseContext, actionPlan);
    assert.ok(Array.isArray(sceneResult.previewUpdate.objects));
    assert.equal(sceneResult.previewUpdate.objects[0].material.color, 'red');
  });
});
