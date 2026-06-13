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

  it('matches assistant overlay commands only in assistant mode', () => {
    assert.equal(detectIntent('Bubble', 'assistant').intent, 'bubble');
    assert.equal(detectIntent('clear bubble', 'assistant').intent, 'clear_bubble');
    assert.equal(detectIntent('move left', 'assistant').intent, 'unknown_command');
    assert.equal(detectIntent('Bubble', 'configurator').intent, 'unknown_command');
    assert.equal(detectIntent('clear bubble', 'configurator').intent, 'unknown_command');
  });
});

describe('HelpService scope', () => {
  it('lists only scene commands for configurator mode', () => {
    const help = HelpService.getIntentList('configurator');
    const types = help.intents.map((e) => e.type);
    assert.ok(types.includes('move_object'));
    assert.ok(!types.includes('panel_lab_light_intensity'));
    assert.equal(types.length, 6);
  });

  it('lists scene and knob commands for panel-lab mode', () => {
    const help = HelpService.getIntentList('panel-lab');
    const types = help.intents.map((e) => e.type);
    assert.ok(types.includes('move_object'));
    assert.ok(types.includes('panel_lab_light_intensity'));
    assert.equal(types.length, 13);
  });

  it('lists only Bubble and Clear bubble for assistant mode', () => {
    const help = HelpService.getIntentList('assistant');
    const types = help.intents.map((e) => e.type);
    assert.ok(types.includes('bubble'));
    assert.ok(types.includes('clear_bubble'));
    assert.ok(!types.includes('move_object'));
    assert.equal(types.length, 2);
  });
});
