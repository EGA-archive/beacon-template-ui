import { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

import { isLoginEnabled, safeSignIn } from "../pages/login/authHelpers";
import { useAuthSafe as useAuth } from "../pages/login/useAuthSafe";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};

export default function LoginModal({ open, onClose }) {
  const auth = useAuth();

  /**
   * Tracks the short period between clicking Log In
   * and being redirected to the identity provider.
   */
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isLoginEnabled()) return null;

  const handleLogin = async () => {
    // Prevent multiple login attempts.
    if (isLoggingIn) return;

    setIsLoggingIn(true);

    try {
      await Promise.resolve(safeSignIn(auth, onClose));
    } catch (error) {
      console.error("Unable to start login:", error);

      // Allow the user to try again if login could not start.
      setIsLoggingIn(false);
    }
  };

  /**
   * Do not allow the modal to be dismissed while
   * the login redirect is already being started.
   */
  const handleClose = () => {
    if (isLoggingIn) return;

    onClose?.();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Login Required
        </Typography>

        <Typography variant="body2" sx={{ mb: 3 }}>
          You need to be logged in to use this feature.
        </Typography>

        <Button
          onClick={handleLogin}
          className="login-button"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoggingIn}
          aria-busy={isLoggingIn}
          startIcon={
            isLoggingIn ? <CircularProgress size={18} color="inherit" /> : null
          }
          sx={{
            minHeight: "48px",
          }}
        >
          {isLoggingIn ? "Log In" : "Log In"}
        </Button>
      </Box>
    </Modal>
  );
}
