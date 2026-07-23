import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "oidc-react";
import { loadRuntimeConfig } from "./config/loadRuntimeConfig";
import { setRuntimeConfig } from "./config/runtimeConfig";
import "./index.css";

// Builds the OIDC configuration using the runtime configuration
function buildOidcConfig(config) {
  const ui = config.ui;

  // If login is disabled, do not load AuthProvider
  if (!ui?.showLogin) return null;

  const auth = ui.auth;

  if (!auth?.oidc) {
    console.error("Login is enabled but auth.oidc is missing in config.json.");
    return null;
  }

  const { oidc } = auth;
  const clientId = oidc.clientId;

  // Public clients use a client ID only.
  // No client secret should be stored or used in the browser.
  if (!clientId) {
    console.error("clientId is required but was not found in config.json.");
    return null;
  }

  return {
    onSignIn: async () => {
      window.history.replaceState(null, "", "/login");
    },
    authority: oidc.authority,
    clientId,
    autoSignIn: oidc.autoSignIn,
    responseType: oidc.responseType,
    automaticSilentRenew: oidc.automaticSilentRenew,
    redirectUri: oidc.redirectUri,
    scope: oidc.scope,
    revokeAccessTokenOnSignout: oidc.revokeAccessTokenOnSignout,
  };
}

async function bootstrap() {
  try {
    // 1. Load the latest runtime config from /config/config.json
    const config = await loadRuntimeConfig();

    // 2. Populate the shared runtime config object
    setRuntimeConfig(config);

    // 3. Load App only AFTER runtime config is available
    const { default: App } = await import("./App");

    // 4. Build authentication configuration
    const oidcConfig = buildOidcConfig(config);

    // 5. Start React
    const root = ReactDOM.createRoot(document.getElementById("root"));

    root.render(
      <React.StrictMode>
        {oidcConfig ? (
          <AuthProvider {...oidcConfig}>
            <App />
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
        "The application could not start because its configuration could not be loaded.";
    }
  }
}

bootstrap();
