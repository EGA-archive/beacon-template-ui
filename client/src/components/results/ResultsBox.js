import { Box, Typography } from "@mui/material";
import ResultsFilters from "./ResultsFilters";
import ResultsTable from "./ResultsTable";
import { useSelectedEntry } from "../context/SelectedEntryContext";

export default function ResultsBox() {
  const { lastSearchedPathSegment } = useSelectedEntry();

  const shouldShowHiddenColumnsMessage = !["cohorts", "datasets"].includes(
    lastSearchedPathSegment
  );

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
        <Box
          sx={{
            pb: "5px",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 2,
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

          <Typography
            sx={{
              display: shouldShowHiddenColumnsMessage
                ? {
                    xs: "block",
                    sm: "block",
                    md: "block",
                    lg: "none",
                  }
                : "none",
              fontFamily: '"Open Sans", sans-serif',
              fontStyle: "italic",
              fontSize: "12px",
              fontWeight: 400,
              textAlign: "right",
              lineHeight: 1.3,
            }}
          >
            To view all columns, open this page on a larger screen.
          </Typography>
        </Box>
      </Box>
      <Box>
        <ResultsFilters />
        <ResultsTable />
      </Box>
    </Box>
  );
}
