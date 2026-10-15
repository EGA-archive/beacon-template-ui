import schema from "./schema";

/**
 * Validates runtime configuration and applies schema defaults.
 */
export function validateRuntimeConfig(config) {
  const { error, value } = schema.validate(config, {
    abortEarly: false,
    convert: false,
  });

  if (error) {
    const details = error.details
      .map(({ message }) => `- ${message}`)
      .join("\n");

    throw new Error(`Invalid runtime configuration:\n${details}`);
  }

  return value;
}
