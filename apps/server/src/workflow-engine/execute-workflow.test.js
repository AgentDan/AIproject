import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { executeWorkflow } from './execute-workflow.js';

describe('executeWorkflow', () => {
  it('routes configurator-3d and returns a sceneResult', async () => {
    const sceneContext = {
      sceneId: 'test-scene',
      commandContext: {
        clientState: { domain: 'configurator-3d', auth: { role: 'editor' } }
      },
      objects: [{ objectId: 'configurator-root', type: 'product', movable: true }],
      hierarchy: [],
      materials: []
    };

    const actionPlan = {
      version: 1,
      actions: [{
        type: 'CHANGE_OBJECT_COLOR',
        targetId: 'configurator-root',
        params: { color: 'red' }
      }],
      steps: []
    };

    const result = await executeWorkflow(sceneContext, actionPlan);
    assert.ok(result, 'result must be defined');
    assert.ok(result.sceneResult, 'sceneResult must be present');
  });

  it('throws for unknown domain', async () => {
    const sceneContext = {
      commandContext: { clientState: { domain: 'unknown-domain', auth: { role: 'administrator' } } },
      objects: []
    };
    await assert.rejects(
      () => executeWorkflow(sceneContext, { version: 1, actions: [] }),
      /Domain module is not registered/
    );
  });

  it('allows configurator-3d for authenticated user role', async () => {
    const sceneContext = {
      sceneId: 'test-scene',
      commandContext: {
        clientState: { domain: 'configurator-3d', auth: { role: 'user' } }
      },
      objects: [{ objectId: 'configurator-root', type: 'product', movable: true }],
      hierarchy: [],
      materials: []
    };

    const actionPlan = {
      version: 1,
      actions: [{
        type: 'CHANGE_OBJECT_COLOR',
        targetId: 'configurator-root',
        params: { color: 'blue' }
      }],
      steps: []
    };

    const result = await executeWorkflow(sceneContext, actionPlan);
    assert.ok(result.sceneResult);
  });

  it('routes assistant domain for anonymous users', async () => {
    const sceneContext = {
      sceneId: 'preview-scene',
      commandContext: {
        clientState: { domain: 'assistant', source: 'apps/client' }
      },
      objects: [{ objectId: 'preview-product', type: 'product', movable: true }],
      hierarchy: [],
      materials: []
    };

    const result = await executeWorkflow(sceneContext, {
      version: 1,
      actions: [],
      steps: []
    });
    assert.ok(result.sceneResult);
  });

  it('throws for restricted domain with wrong role', async () => {
    const sceneContext = {
      commandContext: { clientState: { domain: 'configurator-3d', auth: { role: 'anonymous' } } },
      objects: []
    };
    await assert.rejects(
      () => executeWorkflow(sceneContext, { version: 1, actions: [] }),
      /not allowed/
    );
  });
});
