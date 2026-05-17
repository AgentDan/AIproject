export function createIntentHelpEntry({
  type,
  description,
  examples = [],
  parameters = []
} = {}) {
  return {
    type,
    description,
    examples,
    parameters
  };
}

export function createHelpResponse({ intents = [] } = {}) {
  return {
    intents
  };
}

export function validateIntentHelpEntry(entry, indexPrefix = '') {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return [`${indexPrefix}Intent help entry must be an object.`];
  }

  if (!entry.type || typeof entry.type !== 'string') {
    errors.push(`${indexPrefix}Intent help entry requires type string.`);
  }
  if (!entry.description || typeof entry.description !== 'string') {
    errors.push(`${indexPrefix}Intent help entry requires description string.`);
  }
  if (!Array.isArray(entry.examples)) errors.push(`${indexPrefix}examples must be an array.`);
  else {
    entry.examples.forEach((ex, i) => {
      if (typeof ex !== 'string') errors.push(`${indexPrefix}example ${i} must be a string.`);
    });
  }
  if (!Array.isArray(entry.parameters)) errors.push(`${indexPrefix}parameters must be an array.`);
  else {
    entry.parameters.forEach((param, i) => {
      if (!param || typeof param !== 'object') {
        errors.push(`${indexPrefix}parameter ${i} must be an object.`);
      } else if (!param.name || typeof param.name !== 'string') {
        errors.push(`${indexPrefix}parameter ${i} requires name string.`);
      }
      if (
        param.description !== undefined &&
        typeof param.description !== 'string'
      ) {
        errors.push(`${indexPrefix}parameter ${i} description must be a string when provided.`);
      }
    });
  }

  return errors;
}

export function validateHelpResponse(help) {
  const errors = [];

  if (!help || typeof help !== 'object') {
    return ['Help payload must be an object.'];
  }

  if (!Array.isArray(help.intents)) errors.push('Help payload intents must be an array.');
  else {
    help.intents.forEach((entry, index) => {
      errors.push(...validateIntentHelpEntry(entry, `intents[${index}]: `));
    });
  }

  return errors;
}
