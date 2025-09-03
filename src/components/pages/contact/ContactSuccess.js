import { Box, Typography, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Founders from "../../Founders";
import config from "../../../config/config.json";
import contactSuccessImg from "../../../assets/logos/contact-success.svg";

/**
 * Contact success page for Beacon Template UI.
 * Displays a success message and button to return home.
 */
export default function ContactSuccess() {
  const bgColor = alpha(config.ui.colors.primary, 0.05);
  const navigate = useNavigate();

  return (
    <>
      <Founders />
      {/* Centered wrapper for the whole page content */}
      <Box
        sx={{
          pb: "2rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Main card container */}
        <Box
          sx={{
            p: 3,
            bgcolor: "#fff",
            boxShadow: 3,
            borderRadius: 2,
            width: 1500,
            mt: 2,
          }}
        >
          {/* Image section */}
          <Box
            sx={{
              pb: "2rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img src={contactSuccessImg} />
          </Box>
          {/* Text messages and thanks */}
          <Box
            sx={{
              pb: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              textAlign: "center",
              p: 3,
            }}
          >
            {/* Heading */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: config.ui.colors.primary,
                fontSize: "18px",
              }}
            >
              Thank you for contacting us!
            </Typography>
            {/* Additional messages for clarity */}
            <Typography
              sx={{
                fontWeight: 400,
                color: "#203241",
                fontSize: "14px",
              }}
            >
              We have received your message.
            </Typography>
            <Typography
              sx={{
                fontWeight: 400,
                color: "#203241",
                fontSize: "14px",
              }}
            >
              We will respond as soon as possible.
            </Typography>
          </Box>
          {/* Button to return to homepage */}
          <Box
            sx={{
              pb: "2rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontSize: "14px",
                px: 3,
                boxShadow: "none",
                backgroundColor: "white",
                border: `1px solid ${config.ui.colors.primary}`,
                color: config.ui.colors.primary,
                "&:hover": {
                  backgroundColor: config.ui.colors.primary,
                  border: `1px solid ${config.ui.colors.primary}`,
                  color: "white",
                },
              }}
            >
              Back to Homepage
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
