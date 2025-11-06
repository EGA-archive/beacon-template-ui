import { useEffect } from "react";
import { useAuth } from "oidc-react";
import { CircularProgress, Box, Typography } from "@mui/material";
import config from "../../../config/config.json";

export default function Login() {
  const auth = useAuth();

  useEffect(() => {
    if (config.ui.showLogin) {
      auth.signIn();
    }
  }, [auth]);

  if (!config.ui.showLogin) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 10,
      }}
    >
      <Box data-cy="login-page-loader">
        <CircularProgress />
      </Box>
      <Typography
        variant="body1"
        sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: "14px", mt: 4 }}
      >
        You will be redirected to the login shortly
      </Typography>
    </Box>
  );
}
