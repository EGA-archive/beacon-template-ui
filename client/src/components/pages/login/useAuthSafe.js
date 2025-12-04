import { useAuth } from "oidc-react";
import config from "../../../config/config.json";

// If login is enabled → returns the real auth object from oidc-react
// If login is disabled → returns null

export const useAuthSafe = () => {
  const loginEnabled = config?.ui?.showLogin === true;
  return loginEnabled ? useAuth() : null;
};
