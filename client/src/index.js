// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import { AuthProvider } from "oidc-react";
// import configData from "./auth.config.json";
// import "./index.css";

// const oidcConfig = {
//   onSignIn: async () => {
//     window.history.replaceState(null, "", "/login");
//   },

//   authority: "https://login.aai.lifescience-ri.eu/oidc",
//   clientId: process.env.REACT_APP_CLIENT_ID,
//   clientSecret: process.env.REACT_APP_CLIENT_SECRET,
//   autoSignIn: false,
//   responseType: "code",
//   automaticSilentRenew: true,
//   redirectUri:
//     process.env.NODE_ENV === "development" && configData.REDIRECT_URL,
//   // postLogoutRedirectUri:
//   // process.env.NODE_ENV === "development" &&
//   // configData.POST_LOGOUT_REDIRECT_URL,
//   // process.env.NODE_ENV === "development" && configData.REDIRECT_URL,
//   scope: "openid profile email ga4gh_passport_v1 offline_access",
//   revokeAccessTokenOnSignout: true,
// };

// // console.log("OIDC Config:", oidcConfig);

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <AuthProvider {...oidcConfig}>
//       <App />
//     </AuthProvider>
//   </React.StrictMode>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "oidc-react";
import config from "./config/config.json";
import "./index.css";

// Builds the OIDC configuration using settings from config.json
function buildOidcConfig() {
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

  // Prefer env variables; fallback to config
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET;

  // Basic validation
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

  // OIDC configuration passed to AuthProvider
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

const oidcConfig = buildOidcConfig();

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
