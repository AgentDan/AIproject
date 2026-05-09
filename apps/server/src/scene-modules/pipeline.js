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

function cloneObjects(objects) {
  return JSON.parse(JSON.stringify(objects));
}

function executeStep(sceneGraph, step) {
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

export async function executeSceneModulesPipeline(sceneContext, actionPlan) {
  const sceneGraph = createSceneGraph(sceneContext);
  const beforeObjects = cloneObjects(sceneGraph.objects);
  const measurements = [];
  const stepUpdates = [];
  const errors = [];

  for (const step of actionPlan.steps) {
    const stepResult = executeStep(sceneGraph, step);
    measurements.push(...stepResult.measurements);

    if (stepResult.previewUpdate) {
      stepUpdates.push({
        stepId: step.stepId,
        type: step.type,
        update: stepResult.previewUpdate
      });
    }

    errors.push(...stepResult.errors);
  }

  const validation = validateSceneState(sceneGraph);
  const sceneDiff = generateSceneDiff(beforeObjects, sceneGraph.objects);
  const updatedSceneUri = createExportReference(sceneContext.sceneId, actionPlan.requestId);
  const sceneResult = createSceneResult({
    resultId: `result-${actionPlan.requestId}`,
    requestId: actionPlan.requestId,
    sceneId: actionPlan.sceneId,
    status: errors.length || !validation.valid
      ? SCENE_RESULT_STATUS.FAILED
      : SCENE_RESULT_STATUS.SUCCESS,
    updatedSceneUri,
    previewUpdate: {
      objects: sceneGraph.objects,
      stepUpdates
    },
    sceneDiff,
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
