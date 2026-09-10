import { Box, Typography } from "@mui/material";
import ResultsFilters from "./ResultsFilters";

export default function ResultsEmpty({ message }) {
  return (
    <Box
      sx={{
        height: "100%",
        minBlockSize: "400px",
        px: 4,
        py: 3,
      }}
    >
      <ResultsFilters />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          minHeight: "250px",
        }}
      >
        <Typography
          sx={{
            color: "black",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          {message || "No results"}
        </Typography>
      </Box>
    </Box>
  );
}
