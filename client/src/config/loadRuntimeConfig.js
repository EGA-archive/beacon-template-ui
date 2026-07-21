/**
 * Loads the application configuration at runtime.
 *
 * The config file lives in /public/config and is fetched by the browser
 * when the application starts.
 *
 * `cache: "no-store"` ensures that a refreshed page requests the latest
 * version of the configuration instead of using a cached copy.
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

  return response.json();
}
