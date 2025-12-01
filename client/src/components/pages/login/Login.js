import { useEffect } from "react";
import { useAuthSafe as useAuth } from "../login/useAuthSafe";
import { CircularProgress, Box, Typography } from "@mui/material";
import config from "../../../config/config.json";

export default function Login() {
  // Safe useAuth(), this returns real auth when login is enabled, null otherwise
  const auth = useAuth();

  // Convenience flag so we don’t read config everywhere
  const loginEnabled = config.ui.showLogin;

  useEffect(() => {
    // If login is enabled and we have a signIn method, trigger login redirect
    if (loginEnabled && auth?.signIn) {
      auth.signIn();
    }
    // Effect runs again only if auth object or config changes
  }, [auth, loginEnabled]);

  // If login is disabled in config.json, this page renders nothing
  if (!loginEnabled) return null;

  // UI shown briefly while user is being redirected to OIDC login
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 10,
      }}
    >
      {/* Loader for pending redirection */}
      <Box data-cy="login-page-loader">
        <CircularProgress />
      </Box>

      {/* Text displayed during redirect */}
      <Typography
        variant="body1"
        sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: "14px", mt: 4 }}
      >
        You will be redirected to the login shortly
      </Typography>
    </Box>
  );
}
