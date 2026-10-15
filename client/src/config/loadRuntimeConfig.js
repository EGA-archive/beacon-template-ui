import { validateRuntimeConfig } from "./validateRuntimeConfig";

/**
 * Loads and validates the application configuration at runtime.
 */
export async function loadRuntimeConfig() {
  const response = await fetch("/config/config.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load runtime configuration: ${response.status} ${response.statusText}`
    );
  }

  const config = await response.json();

  return validateRuntimeConfig(config);
}
