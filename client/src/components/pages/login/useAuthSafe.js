import { useAuth } from "oidc-react";
import { isLoginEnabled } from "./authHelpers";

// Return authentication only when login is enabled.
export const useAuthSafe = () => {
  const loginEnabled = isLoginEnabled();

  return loginEnabled ? useAuth() : null;
};
