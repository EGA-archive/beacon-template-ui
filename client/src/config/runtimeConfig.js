/**
 * Holds the configuration loaded at runtime.
 *
 * The object is populated before the React application is loaded,
 * so components can safely read config values during module initialization.
 */
const runtimeConfig = {};

/**
 * Populates the shared runtime configuration object.
 *
 * We mutate the existing object instead of replacing it so every module
 * importing `runtimeConfig` keeps the same shared reference.
 */
export function setRuntimeConfig(config) {
  Object.assign(runtimeConfig, config);
}

export default runtimeConfig;
