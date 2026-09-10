import { AUTH_RETURN_PATH_KEY } from "./authConstants";

/**
 * Returns the original local URL after authentication.
 */
function getAuthReturnPath() {
  const savedPath = sessionStorage.getItem(AUTH_RETURN_PATH_KEY);

  sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);

  return savedPath && savedPath.startsWith("/") && !savedPath.startsWith("//")
    ? savedPath
    : "/";
}

/**
 * Creates the OIDC configuration from runtime config.
 * Returns null only when login is disabled.
 * Throws when login is enabled but configuration is invalid.
 */
export function createOidcConfig(config) {
  const ui = config.ui;

  if (!ui?.showLogin) return null;

  const oidc = ui.auth?.oidc;

  if (!oidc) {
    throw new Error(
      "Login is enabled but auth.oidc is missing in config.json."
    );
  }

  if (!oidc.clientId) {
    throw new Error(
      "Login is enabled but auth.oidc.clientId is missing in config.json."
    );
  }

  if (!oidc.authority) {
    throw new Error(
      "Login is enabled but auth.oidc.authority is missing in config.json."
    );
  }

  if (!oidc.redirectUri) {
    throw new Error(
      "Login is enabled but auth.oidc.redirectUri is missing in config.json."
    );
  }

  return {
    authority: oidc.authority,
    clientId: oidc.clientId,
    autoSignIn: oidc.autoSignIn,
    responseType: oidc.responseType,
    automaticSilentRenew: oidc.automaticSilentRenew,
    redirectUri: oidc.redirectUri,
    scope: oidc.scope,
    revokeAccessTokenOnSignout: oidc.revokeAccessTokenOnSignout,

    onSignIn: async () => {
      window.location.replace(getAuthReturnPath());
    },
  };
}
