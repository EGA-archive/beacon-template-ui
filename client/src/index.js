import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "oidc-react";
import { loadRuntimeConfig } from "./config/loadRuntimeConfig";
import { setRuntimeConfig } from "./config/runtimeConfig";
import { AUTH_RETURN_PATH_KEY } from "./auth/authConstants";
import OidcCallbackGate from "./auth/OidcCallbackGate";
import "./index.css";

/**
 * Builds the OIDC configuration from runtime config.
 * Authentication is completely skipped when login is disabled.
 */
function buildOidcConfig(config) {
  const ui = config.ui;

  if (!ui?.showLogin) return null;

  const auth = ui.auth;

  if (!auth?.oidc) {
    console.error("Login is enabled but auth.oidc is missing in config.json.");
    return null;
  }

  const { oidc } = auth;
  const clientId = oidc.clientId;

  // Browser clients use a client ID only.
  // Client secrets must never be stored in frontend configuration.
  if (!clientId) {
    console.error("clientId is required but was not found in config.json.");
    return null;
  }

  return {
    /**
     * After OIDC login, return the user to the protected URL
     * they originally tried to access.
     */
    onSignIn: async () => {
      const savedPath = sessionStorage.getItem(AUTH_RETURN_PATH_KEY);

      sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);

      // Only allow local application paths.
      const returnPath =
        savedPath && savedPath.startsWith("/") && !savedPath.startsWith("//")
          ? savedPath
          : "/";

      window.location.replace(returnPath);
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
    // Load runtime configuration before importing the application.
    const config = await loadRuntimeConfig();

    setRuntimeConfig(config);

    const { default: App } = await import("./App");

    const oidcConfig = buildOidcConfig(config);

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
        "The application could not start because its configuration could not be loaded.";
    }
  }
}

bootstrap();
