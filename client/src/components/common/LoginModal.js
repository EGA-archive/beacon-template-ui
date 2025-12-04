import { Modal, Box, Typography, Button } from "@mui/material";

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

  if (!isLoginEnabled()) return null;

  const handleLogin = () => {
    safeSignIn(auth, onClose);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Login Required
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          You need to be logged in to use this feature.
        </Typography>
        <Button
          onClick={handleLogin}
          variant="contained"
          color="primary"
          fullWidth
        >
          Log In
        </Button>
      </Box>
    </Modal>
  );
}
