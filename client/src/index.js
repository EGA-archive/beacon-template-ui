// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import { AuthProvider } from "oidc-react";
// import config from "./config/runtimeConfig";
// import "./index.css";

// // Builds the OIDC configuration using settings from config.json
// function buildOidcConfig() {
//   const ui = config.ui;

//   // If login is disabled, do not load AuthProvider
//   if (!ui?.showLogin) return null;

//   const auth = ui.auth;
//   if (!auth?.oidc) {
//     console.error("Login is enabled but auth.oidc is missing in config.json.");
//     return null;
//   }

//   const { providerType = "public", oidc } = auth;
//   const isPrivate = providerType === "private";

//   // Prefer env variables; fallback to config
//   const clientId = process.env.REACT_APP_CLIENT_ID;
//   const clientSecret = process.env.REACT_APP_CLIENT_SECRET;

//   // Basic validation
//   if (!clientId) {
//     console.error("clientId is required but was not found.");
//     return null;
//   }

//   if (isPrivate && !clientSecret) {
//     console.error(
//       "providerType is 'private' but no clientSecret was found. Both clientId and clientSecret are required."
//     );
//     return null;
//   }

//   if (!isPrivate && clientSecret) {
//     console.warn(
//       "providerType is 'public', but a clientSecret was provided. It will not be used."
//     );
//   }

//   // OIDC configuration passed to AuthProvider
//   // Need to change here
//   // remove clientsecret keep client id
//   // No REACT_APP_CLIENT_SECRET in the browser side
//   return {
//     onSignIn: async () => {
//       window.history.replaceState(null, "", "/login");
//     },
//     authority: oidc.authority,
//     clientId,
//     ...(isPrivate ? { clientSecret } : {}),
//     autoSignIn: oidc.autoSignIn,
//     responseType: oidc.responseType,
//     automaticSilentRenew: oidc.automaticSilentRenew,
//     redirectUri: oidc.redirectUri,
//     scope: oidc.scope,
//     revokeAccessTokenOnSignout: oidc.revokeAccessTokenOnSignout,
//   };
// }

// const oidcConfig = buildOidcConfig();

// const root = ReactDOM.createRoot(document.getElementById("root"));

// root.render(
//   <React.StrictMode>
//     {oidcConfig ? (
//       <AuthProvider {...oidcConfig}>
//         <App />
//       </AuthProvider>
//     ) : (
//       <App />
//     )}
//   </React.StrictMode>
// );

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

  const { providerType = "public", oidc } = auth;
  const isPrivate = providerType === "private";

  // Keep existing environment-variable behavior for now.
  // We will review OIDC runtime configuration separately.
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET;

  if (!clientId) {
    console.error("clientId is required but was not found.");
    return null;
  }

  if (isPrivate && !clientSecret) {
    console.error(
      "providerType is 'private' but no clientSecret was found. Both clientId and clientSecret are required."
    );
    return null;
  }

  if (!isPrivate && clientSecret) {
    console.warn(
      "providerType is 'public', but a clientSecret was provided. It will not be used."
    );
  }

  return {
    onSignIn: async () => {
      window.history.replaceState(null, "", "/login");
    },
    authority: oidc.authority,
    clientId,
    ...(isPrivate ? { clientSecret } : {}),
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
    // 1. Load the latest config from /public/config/config.json
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
