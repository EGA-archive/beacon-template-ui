import { Box, Typography } from "@mui/material";
import ResultsFilters from "./ResultsFilters";
import ResultsTable from "./ResultsTable";

export default function ResultsBox() {
  return (
    <Box
      sx={{
        p: "32px",
      }}
    >
      <Box
        sx={{
          pb: "5px",
        }}
      >
        <Typography
          sx={{
            color: "black",
            fontSize: "17px",
            fontFamily: '"Open Sans", sans-serif',
            minWidth: "80px",
            fontWeight: "bold",
          }}
        >
          Results
        </Typography>
      </Box>
      <Box>
        <ResultsFilters />
        <ResultsTable />
      </Box>
    </Box>
  );
}
