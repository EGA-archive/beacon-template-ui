import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "oidc-react";
import configData from "./auth.config.json";
import "./index.css";

const oidcConfig = {
  onSignIn: async () => {
    window.history.replaceState(null, "", "/login");
  },

  authority: "https://login.aai.lifescience-ri.eu/oidc",
  clientId: process.env.REACT_APP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  autoSignIn: false,
  responseType: "code",
  automaticSilentRenew: true,
  redirectUri:
    process.env.NODE_ENV === "development" && configData.REDIRECT_URL,
  // postLogoutRedirectUri:
  // process.env.NODE_ENV === "development" &&
  // configData.POST_LOGOUT_REDIRECT_URL,
  // process.env.NODE_ENV === "development" && configData.REDIRECT_URL,
  scope: "openid profile email ga4gh_passport_v1 offline_access",
  revokeAccessTokenOnSignout: true,
};

console.log("OIDC Config:", oidcConfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
