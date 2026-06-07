import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectIntent } from './intent-detector.js';
import { HelpService } from '../infrastructure/services/help-service.js';

describe('detectIntent scope', () => {
  it('matches knob only in panel-lab mode', () => {
    assert.equal(detectIntent('brighter', 'panel-lab').intent, 'panel_lab_light_intensity');
    assert.equal(detectIntent('brighter', 'configurator').intent, 'unknown_command');
  });

  it('matches scene commands in configurator mode', () => {
    assert.equal(detectIntent('move left', 'configurator').intent, 'move_object');
  });
});

describe('HelpService scope', () => {
  it('lists only scene commands for configurator mode', () => {
    const help = HelpService.getIntentList('configurator');
    const types = help.intents.map((e) => e.type);
    assert.ok(types.includes('move_object'));
    assert.ok(!types.includes('panel_lab_light_intensity'));
    assert.equal(types.length, 5);
  });

  it('lists scene and knob commands for panel-lab mode', () => {
    const help = HelpService.getIntentList('panel-lab');
    const types = help.intents.map((e) => e.type);
    assert.ok(types.includes('move_object'));
    assert.ok(types.includes('panel_lab_light_intensity'));
    assert.equal(types.length, 13);
  });
});
