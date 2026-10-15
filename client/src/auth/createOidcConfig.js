import { AUTH_RETURN_PATH_KEY } from "./authConstants";

//  Returns the original local URL after authentication.
function getAuthReturnPath() {
  // Read the URL saved before the user was redirected to login.
  const savedPath = sessionStorage.getItem(AUTH_RETURN_PATH_KEY);

  // Remove the saved path so it is not reused later.
  sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);

  // Only allow local paths to prevent external redirects.
  return savedPath && savedPath.startsWith("/") && !savedPath.startsWith("//")
    ? savedPath
    : "/";
}

/**
 * Creates the OIDC configuration from runtime config.
 *
 * Returns null when login is disabled.
 * Throws an error if required authentication settings are missing.
 */
export function createOidcConfig(config) {
  const ui = config.ui;

  // Do not initialize authentication for public deployments.
  if (!ui?.showLogin) return null;

  // Read the OIDC settings from the validated configuration.
  const oidc = ui.auth?.oidc;

  // Check that the required OIDC configuration exists.
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

  // Build the configuration passed to oidc-react's AuthProvider.
  return {
    // Required connection settings.
    authority: oidc.authority,
    clientId: oidc.clientId,
    redirectUri: oidc.redirectUri,

    // Keep automatic login disabled unless explicitly enabled.
    autoSignIn: oidc.autoSignIn ?? false,
    responseType: "code",
    scope: oidc.scope,

    // Automatic token renewal.
    automaticSilentRenew: oidc.automaticSilentRenew,
    silentRedirectUri: oidc.silentRedirectUri,

    // Logout behavior.
    postLogoutRedirectUri: oidc.postLogoutRedirectUri,
    autoSignOut: oidc.autoSignOut,

    // Additional information about the authenticated user.
    loadUserInfo: oidc.loadUserInfo,

    // Optional popup authentication settings.
    popupRedirectUri: oidc.popupRedirectUri,
    popupWindowTarget: oidc.popupWindowTarget,

    // Additional provider-specific configuration.
    extraQueryParams: oidc.extraQueryParams,
    metadata: oidc.metadata,

    // Return to the previously requested page after login.
    onSignIn: async () => {
      window.location.replace(getAuthReturnPath());
    },
  };
}
