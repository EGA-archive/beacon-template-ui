import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Navigate } from "react-router-dom";

import config from "../../../config/runtimeConfig";
import { useAuthSafe as useAuth } from "./useAuthSafe";

/**
 * Handles the login page for OIDC authentication.
 *
 * When login is enabled, unauthenticated users are
 * automatically redirected to the identity provider.
 *
 * After successful authentication, createOidcConfig.js
 * handles returning users to their previously requested URL.
 */
export default function Login() {
  // Get the authentication object when login is enabled.
  const auth = useAuth();

  // Prevent repeated sign-in attempts during re-renders.
  const loginStarted = useRef(false);

  // Track errors that occur when starting authentication.
  const [loginError, setLoginError] = useState(false);

  // Read whether authentication is enabled in config.json.
  const loginEnabled = config.ui.showLogin;

  /**
   * Start the OIDC login process.
   * Wait until authentication has finished checking
   * the current session before attempting sign-in.
   */
  useEffect(() => {
    // Skip sign-in if login is disabled or authentication is unavailable, loading, or already completed.
    if (
      !loginEnabled ||
      !auth ||
      auth.isLoading ||
      auth.userData ||
      !auth.signIn ||
      loginStarted.current
    ) {
      return;
    }

    // Mark login as started to avoid duplicate requests.
    loginStarted.current = true;

    // Start sign-in and handle failures to initiate it.
    // Promise.resolve().then() catches both synchronous errors and rejected promises from auth.signIn().
    Promise.resolve()
      .then(() => auth.signIn())
      .catch((error) => {
        console.error("OIDC login failed:", error);
        setLoginError(true);
      });
  }, [auth, loginEnabled]);

  // Public deployments do not require a login page.
  if (!loginEnabled) {
    return null;
  }

  // Display an error if the authentication provider is unexpectedly unavailable.
  if (!auth) {
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: '"Open Sans", sans-serif',
            fontSize: "14px",
          }}
        >
          Authentication is currently unavailable.
        </Typography>
      </Box>
    );
  }

  // Authenticated users do not need the login page.
  if (auth.userData) {
    return <Navigate to="/" replace />;
  }

  // Display a message if starting the login process failed.
  if (loginError) {
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: '"Open Sans", sans-serif',
            fontSize: "14px",
          }}
        >
          Unable to start the login process. Please refresh the page and try
          again.
        </Typography>
      </Box>
    );
  }

  // Display a loading spinner while checking the session or redirecting the user to the identity provider.
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 10,
      }}
    >
      <CircularProgress />

      <Typography
        variant="body1"
        sx={{
          fontFamily: '"Open Sans", sans-serif',
          fontSize: "14px",
          mt: 4,
        }}
      >
        You will be redirected to the login shortly
      </Typography>
    </Box>
  );
}
