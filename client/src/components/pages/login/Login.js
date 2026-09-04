import { useEffect, useRef } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Navigate } from "react-router-dom";

import config from "../../../config/runtimeConfig";
import { useAuthSafe as useAuth } from "../login/useAuthSafe";

/**
 * Starts the OIDC login flow when authentication is enabled.
 * Protected routes redirect unauthenticated users here.
 * After a successful login, index.js returns the user to the original URL stored before authentication.
 */
export default function Login() {
  const auth = useAuth();
  const loginStarted = useRef(false);

  const loginEnabled = config.ui.showLogin;

  useEffect(() => {
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

    loginStarted.current = true;
    auth.signIn();
  }, [auth, loginEnabled]);

  // Public deployments do not use the login page.
  if (!loginEnabled) {
    return null;
  }

  // Fail safely if login is enabled but AuthProvider is unavailable.
  if (!auth) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 10,
        }}
      >
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

  // An authenticated user does not need to visit the login page.
  if (auth.userData) {
    return <Navigate to="/" replace />;
  }

  // Shown while OIDC checks the session or redirects to the provider.
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
