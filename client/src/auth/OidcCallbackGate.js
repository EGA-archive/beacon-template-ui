import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * Prevents the normal application page from appearing while
 * the OIDC provider is processing the authentication callback.
 *
 * After authentication finishes, onSignIn redirects the user
 * to the protected URL they originally requested.
 */
export default function OidcCallbackGate({ children }) {
  const searchParams = new URLSearchParams(window.location.search);

  const isOidcCallback = searchParams.has("code") && searchParams.has("state");

  if (!isOidcCallback) {
    return children;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 3,
      }}
    >
      <CircularProgress />

      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "16px",
            mb: 1,
          }}
        >
          Completing sign in...
        </Typography>

        <Typography
          sx={{
            fontSize: "14px",
          }}
        >
          You will be redirected to the requested page shortly.
        </Typography>
      </Box>
    </Box>
  );
}
