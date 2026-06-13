import {
  ACTION_TYPES,
  SCENE_RESULT_STATUS,
  createSceneResult,
  validateSceneResult
} from '@ai-product-scene-platform/contracts';
import {
  createSceneGraph,
  findSceneObject,
  updateSceneObject
} from './scene-graph-manager.js';
import { validateProductRules } from './product-rules-engine.js';
import { applyTransformStep } from './transform-engine.js';
import { applyMaterialStep } from './material-engine.js';
import { measureMeshDistance, showBoundingBoxes } from './mesh-analysis-engine.js';
import { validateSceneState } from './scene-validation-engine.js';
import { generateSceneDiff } from './scene-diff-generator.js';
import { createExportReference } from './gltf-glb-exporter.js';
import { applyPanelLabSteps } from './panel-lab-engine.js';

function cloneObjects(objects) {
  return JSON.parse(JSON.stringify(objects));
}

function executeStep(sceneGraph, step) {
  if (step.type === ACTION_TYPES.BUBBLE) {
    return {
      errors: [],
      measurements: [],
      previewUpdate: {
        assistantOverlay: { redCircle: true }
      }
    };
  }

  if (step.type === ACTION_TYPES.CLEAR_BUBBLE) {
    return {
      errors: [],
      measurements: [],
      previewUpdate: {
        assistantOverlay: { redCircle: false }
      }
    };
  }

  if (step.type === ACTION_TYPES.SELECT_VARIANT) {
    const { groupId, variantIndex } = step.parameters ?? {};
    return {
      errors: [],
      measurements: [],
      previewUpdate: {
        selectionUpdate: { [Number(groupId)]: Number(variantIndex) },
      },
    };
  }

  const targetObject = findSceneObject(sceneGraph, step.target?.objectId);
  const ruleErrors = validateProductRules(step, targetObject);

  if (ruleErrors.length > 0) {
    return {
      errors: ruleErrors,
      measurements: [],
      previewUpdate: null
    };
  }

  if (step.type === ACTION_TYPES.MOVE_OBJECT) {
    return {
      errors: [],
      measurements: [],
      previewUpdate: updateSceneObject(sceneGraph, targetObject.objectId, (object) => {
        applyTransformStep(object, step);
      })
    };
  }

  if (step.type === ACTION_TYPES.CHANGE_OBJECT_COLOR) {
    return {
      errors: [],
      measurements: [],
      previewUpdate: updateSceneObject(sceneGraph, targetObject.objectId, (object) => {
        applyMaterialStep(object, step);
      })
    };
  }

  if (step.type === ACTION_TYPES.SHOW_BOUNDING_BOXES) {
    return {
      errors: [],
      measurements: [],
      previewUpdate: {
        boundingBoxes: showBoundingBoxes(sceneGraph)
      }
    };
  }

  if (step.type === ACTION_TYPES.MEASURE_MESH_DISTANCE) {
    return {
      errors: [],
      measurements: [measureMeshDistance(sceneGraph, targetObject)],
      previewUpdate: null
    };
  }

  return {
    errors: [],
    measurements: [],
    previewUpdate: {
      exportRequested: true
    }
  };
}

/** Исполнение ActionPlan в домене Configurator-3D (GLTF / scene graph). */
export async function executeConfigurator3dPipeline(sceneContext, actionPlan) {
  const sceneGraph = createSceneGraph(sceneContext);
  const beforeObjects = cloneObjects(sceneGraph.objects);
  const measurements = [];
  const stepUpdates = [];
  const errors = [];
  /** @type {Record<number, number> | null} */
  let selectionUpdate = null;
  /** @type {{ redCircle?: boolean } | null} */
  let assistantOverlay = null;

  const panelLabSteps = actionPlan.steps.filter((s) => s.type === ACTION_TYPES.UPDATE_PANEL_LAB);
  const sceneSteps = actionPlan.steps.filter((s) => s.type !== ACTION_TYPES.UPDATE_PANEL_LAB);

  for (const step of sceneSteps) {
    const stepResult = executeStep(sceneGraph, step);
    measurements.push(...stepResult.measurements);

    if (stepResult.previewUpdate) {
      if (stepResult.previewUpdate.selectionUpdate) {
        selectionUpdate = {
          ...(selectionUpdate ?? {}),
          ...stepResult.previewUpdate.selectionUpdate
        };
      }
      if (stepResult.previewUpdate.assistantOverlay) {
        assistantOverlay = {
          ...(assistantOverlay ?? {}),
          ...stepResult.previewUpdate.assistantOverlay
        };
      }
      stepUpdates.push({
        stepId: step.stepId,
        type: step.type,
        update: stepResult.previewUpdate
      });
    }

    errors.push(...stepResult.errors);
  }

  let panelLabResult = null;
  if (panelLabSteps.length) {
    panelLabResult = applyPanelLabSteps(sceneContext, panelLabSteps);
    for (const step of panelLabSteps) {
      stepUpdates.push({
        stepId: step.stepId,
        type: step.type,
        update: panelLabResult.previewUpdate
      });
    }
    if (panelLabResult.panelLab) {
      sceneContext.panelLab = panelLabResult.panelLab;
    }
  }

  const validation = validateSceneState(sceneGraph);
  const sceneDiff = generateSceneDiff(beforeObjects, sceneGraph.objects);
  const updatedSceneUri = createExportReference(sceneContext.sceneId, actionPlan.requestId);
  const objectMutatingSteps = new Set([
    ACTION_TYPES.MOVE_OBJECT,
    ACTION_TYPES.CHANGE_OBJECT_COLOR
  ]);
  const includesObjectPreview = sceneSteps.some((step) => objectMutatingSteps.has(step.type));
  const sceneResult = createSceneResult({
    resultId: `result-${actionPlan.requestId}`,
    requestId: actionPlan.requestId,
    sceneId: actionPlan.sceneId,
    status: errors.length || !validation.valid
      ? SCENE_RESULT_STATUS.FAILED
      : SCENE_RESULT_STATUS.SUCCESS,
    updatedSceneUri,
    previewUpdate: {
      stepUpdates,
      ...(includesObjectPreview ? { objects: sceneGraph.objects } : {}),
      ...(panelLabResult ? { panelLab: panelLabResult.panelLab } : {}),
      ...(selectionUpdate ? { selectionUpdate } : {}),
      ...(assistantOverlay ? { assistantOverlay } : {})
    },
    sceneDiff: panelLabResult
      ? [...sceneDiff, ...panelLabResult.diff.map((d) => ({ ...d, kind: 'panelLab' }))]
      : sceneDiff,
    measurements,
    validation: {
      valid: validation.valid && errors.length === 0,
      errors: [...validation.errors, ...errors]
    }
  });
  const resultErrors = validateSceneResult(sceneResult);

  return {
    sceneGraph,
    sceneResult,
    validationErrors: resultErrors
  };
}
