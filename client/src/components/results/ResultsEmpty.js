import { Box, Typography } from "@mui/material";

export default function ResultsEmpty({ message }) {
  return (
    <Box
      sx={{
        height: "100%",
        minBlockSize: "400px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography
        sx={{
          color: "black",
          fontWeight: 700,
          fontSize: "16px",
        }}
      >
        {message || "We don't have results"}
      </Typography>
    </Box>
  );
}
