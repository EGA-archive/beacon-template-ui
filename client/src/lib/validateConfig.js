const Joi = require("joi");
const schema = require("./schema"); // Your existing Joi schema

/**
 * Validates a config object against the schema
 * @param {object} config - The config object to validate
 * @returns {object} { isValid: boolean, error?: string, config?: object }
 */
function validateConfig(config) {
  const { error, value } = schema.validate(config, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
  });

  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join("\n");
    return { isValid: false, error: errorMessages };
  }

  return { isValid: true, config: value };
}

module.exports = validateConfig;
