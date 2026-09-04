import { Box, CircularProgress, Typography } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";

import config from "../config/runtimeConfig";
import { useAuthSafe as useAuth } from "../components/pages/login/useAuthSafe";

import { AUTH_RETURN_PATH_KEY } from "./authConstants";

/**
 * Protects pages when login is enabled.
 *
 * When login is disabled, the page remains publicly accessible.
 * When login is enabled, unauthenticated users are sent to /login
 * and returned to the exact original URL after authentication.
 */
export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();

  // Public Beacon deployments do not require authentication.
  if (!config.ui.showLogin) {
    return children;
  }

  // Login is enabled but the AuthProvider is unavailable.
  // Fail closed instead of exposing the protected page.
  if (!auth) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography>Authentication is currently unavailable.</Typography>
      </Box>
    );
  }

  // Wait until OIDC has finished checking the current session.
  if (auth.isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // No authenticated user: remember the complete URL before login.
  if (!auth.userData) {
    const returnPath = `${location.pathname}${location.search}${location.hash}`;

    sessionStorage.setItem(AUTH_RETURN_PATH_KEY, returnPath);

    return <Navigate to="/login" replace />;
  }

  // Authentication succeeded. The protected page may now render.
  return children;
}
