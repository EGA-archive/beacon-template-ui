import config from "../../../config/config.json";

/**
 * Helper to check if login is enabled in the configuration file.
 * Returns true if showLogin is true, false otherwise.
 */
export const isLoginEnabled = () => {
  const showLogin = config?.ui?.showLogin === true;
  const disableLogin = config?.ui?.disableLogin === true;

  return showLogin && !disableLogin;
};

export const safeSignIn = (auth, onDisabledLogin) => {
  if (!isLoginEnabled()) {
    console.warn("Login is disabled in config.json. Skipping auth.signIn().");
    if (typeof onDisabledLogin === "function") onDisabledLogin();
    return;
  }
  auth.signIn();
};
