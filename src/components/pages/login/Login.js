import { useEffect } from "react";
import { useAuth } from "oidc-react";
import { CircularProgress, Box, Typography } from "@mui/material";

export default function Login() {
  const auth = useAuth();

  useEffect(() => {
    // Automatically trigger login redirect
    auth.signIn();
  }, [auth]);

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
        sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: "14px", mt: 4 }}
      >
        You will be redirected to the login shortly
      </Typography>
    </Box>
  );
}
