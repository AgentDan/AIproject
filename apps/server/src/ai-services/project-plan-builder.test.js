import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { inferProjectSelection, buildProjectStep } from './project-plan-builder.js';

const catalog = [
  { index: 0, modelKey: 'local:alpha.gltf', title: 'Alpha Studio' },
  { index: 1, modelKey: 'local:beta.gltf', title: 'Beta Kitchen' },
  { index: 2, modelKey: 'local:gamma.gltf', title: 'Gamma' }
];

describe('inferProjectSelection', () => {
  it('matches project title in utterance', () => {
    const result = inferProjectSelection('switch to Beta Kitchen', catalog);
    assert.equal(result?.modelKey, 'local:beta.gltf');
    assert.equal(result?.index, 1);
  });

  it('uses 1-based index for "project 2"', () => {
    const result = inferProjectSelection('select project 2', catalog);
    assert.equal(result?.modelKey, 'local:beta.gltf');
    assert.equal(result?.index, 1);
  });

  it('uses 0-based index fallback from first number', () => {
    const result = inferProjectSelection('open model 0', catalog);
    assert.equal(result?.modelKey, 'local:alpha.gltf');
    assert.equal(result?.index, 0);
  });

  it('returns null when catalog is empty', () => {
    assert.equal(inferProjectSelection('project 1', []), null);
  });
});

describe('buildProjectStep', () => {
  it('creates select_project step', () => {
    const step = buildProjectStep({
      requestId: 'req-1',
      utterance: 'project Gamma',
      projects: catalog
    });
    assert.equal(step?.type, 'select_project');
    assert.equal(step?.parameters.modelKey, 'local:gamma.gltf');
  });
});
