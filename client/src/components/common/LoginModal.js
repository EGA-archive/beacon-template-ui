import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "oidc-react";
import { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    auth.signIn();
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
    >
      <Box sx={style}>
        {!isLoading ? (
          <>
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
          </>
        ) : (
          <>
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
          </>
        )}
      </Box>
    </Modal>
  );
}
