import { Box, Typography, Button } from "@mui/material";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import QueryAppliedItems from "./QueryAppliedItems";
import config from "../../config/config.json";
import deleteIcon from "../../assets/logos/delete.svg";

// This component shows a summary of filters the user has applied.
// It allows them to remove individual filters or clear all at once.
export default function QueryApplied({ variant }) {
  // Get context functions to update filters and result states
  const {
    setSelectedFilter,
    setLoadingData,
    setResultData,
    setHasSearchResult,
  } = useSelectedEntry();

  // Get the primary color from config file
  const primaryDarkColor = config.ui.colors.darkPrimary;

  // Function to remove one specific filter
  const handleFilterRemove = (item) => {
    // If something has changed, reload filter
    setLoadingData(false);
    setResultData([]);
    setHasSearchResult(false);

    // Only remove the filter with the exact id
    setSelectedFilter((prevFilters) =>
      prevFilters.filter((filter) => filter.key !== item.key)
    );
  };

  return (
    <Box
      sx={{
        display: "block",
        backgroundColor: "white",
        mt: 3,
        borderRadius: "10px",
        border: "1px solid #E0E0E0",
      }}
    >
      <Box
        sx={{
          padding: "5px 15px 15px",
        }}
      >
        {/* Header: title and Clear All button */}
        <Box
          data-cy="query-applied-container"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            paddingBottom: "1px",
          }}
        >
          {/* Section title */}
          <Typography
            data-cy="query-applied-title"
            sx={{
              mb: 2,
              pt: 1,
              fontWeight: 700,
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
            }}
          >
            Query Applied
          </Typography>
          <Box
            sx={{
              color: config.ui.colors.primary,
            }}
          >
            {/* Clear All button */}
            <Button
              onClick={() => {
                // Clear all filters and reset result state
                setSelectedFilter([]);
                setResultData([]);
                setLoadingData(false);
                setHasSearchResult(false);
              }}
              sx={{
                textTransform: "none",
                fontSize: "14px",
                pl: 2,
                ml: 2,
                backgroundColor: "transparent",
                color: primaryDarkColor,
              }}
              startIcon={
                <img
                  src={deleteIcon}
                  alt="Delete"
                  style={{ width: 18, height: 18, marginRight: 4 }}
                />
              }
            >
              Clear All
            </Button>
          </Box>
        </Box>

        {/* Render individual filter chips */}
        <QueryAppliedItems
          handleFilterRemove={handleFilterRemove} // Pass handler to remove a single filter
          variant={variant} // Used to distinguish between query types, if needed
        />
      </Box>
    </Box>
  );
}
