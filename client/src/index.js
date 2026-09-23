import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "oidc-react";
import { loadRuntimeConfig } from "./config/loadRuntimeConfig";
import { setRuntimeConfig } from "./config/runtimeConfig";
import { createOidcConfig } from "./auth/createOidcConfig";
import OidcCallbackGate from "./auth/OidcCallbackGate";
import "./index.css";
import schema from "./config/schema";

/**
 * Starts the application after runtime configuration is loaded.
 */
async function bootstrap() {
  try {
    const config = await loadRuntimeConfig();

    // Validate the runtime configuration before starting the application.
    const { error, value: validatedConfig } = schema.validate(config);

    if (error) {
      const validationErrors = error.details
        .map((detail) => detail.message)
        .join("\n");

      throw new Error(`Invalid runtime configuration:\n${validationErrors}`);
    }

    // Validate authentication only after the full config is valid.
    const oidcConfig = createOidcConfig(validatedConfig);

    setRuntimeConfig(validatedConfig);

    // Import App only after runtime configuration is available.
    const { default: App } = await import("./App");

    const root = ReactDOM.createRoot(document.getElementById("root"));

    root.render(
      <React.StrictMode>
        {oidcConfig ? (
          <AuthProvider {...oidcConfig}>
            <OidcCallbackGate>
              <App />
            </OidcCallbackGate>
          </AuthProvider>
        ) : (
          <App />
        )}
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to start the application:", error);

    const rootElement = document.getElementById("root");

    if (rootElement) {
      rootElement.textContent =
        "The application could not start because its configuration is invalid or could not be loaded.";
    }
  }
}

bootstrap();
