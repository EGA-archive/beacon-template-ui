import { Box, Typography, CircularProgress, Fade } from "@mui/material";
import config from "../../config/config.json";

/**
 * Shows a spinning loader and a message while data is loading.
 * Can be displayed in "default" or "inline" mode.
 */
export default function Loader({ message, variant = "default" }) {
  const loaderColor = config.ui.colors.primary; // color from config
  const isInline = variant === "inline"; // check variant type

  return (
    <Fade in timeout={500}>
      {/* Main container for loader */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={isInline ? 150 : 300} // smaller height if inline
        width="100%"
        textAlign="center"
        sx={{
          backgroundColor: "transparent",
          borderRadius: 2,
          p: 2, // padding
        }}
      >
        {/* Spinning progress circle */}
        <CircularProgress
          size={48}
          thickness={4}
          sx={{
            color: loaderColor,
            mb: 2,
            animation: "spin 2s linear infinite", // spin animation
          }}
        />
        {/* Loading message */}
        <Typography
          translate="no"
          sx={{
            fontSize: "18px",
            fontWeight: 500,
            color: "#555",
            fontStyle: "italic",
            maxWidth: "80%",
          }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
}
