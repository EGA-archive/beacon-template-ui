import { Box, Typography, Button, Tooltip } from "@mui/material";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import QueryAppliedItems from "./QueryAppliedItems";
import config from "../../config/runtimeConfig";
import deleteIcon from "../../assets/logos/delete.svg";
import { formatEntryLabel } from "../common/textFormatting";

// This component shows a summary of filters the user has applied.
// It allows them to remove individual filters or clear all at once.
export default function QueryApplied({ variant }) {
  // Get context functions to update filters and result states
  const {
    selectedFilter,
    setSelectedFilter,
    setQueryDirty,
    selectedPathSegment,
    entryTypes,
  } = useSelectedEntry();

  // Get the primary color from config file
  const primaryDarkColor = config.ui.colors.darkPrimary;

  // Function to remove one specific filter
  const handleFilterRemove = (item) => {
    setSelectedFilter((prevFilters) =>
      prevFilters.filter((filter) => filter.key !== item.key)
    );
    setQueryDirty(true);
    // setHasSearchResult(true);
  };

  // This clear all filters except for the Result Type (also called Entry Type one)
  const handleClearAll = () => {
    if (hasOnlyEntryTypeFilter) return;
    setSelectedFilter([]);
    setQueryDirty(true);
  };

  const activePathSegment =
    selectedPathSegment || entryTypes?.[0]?.pathSegment || "individuals";

  const resultTypeChip = {
    id: `result-type-${activePathSegment}`,
    key: `result-type-${activePathSegment}`,
    label: `${formatEntryLabel(activePathSegment)}`,
    scope: "entryType",
    type: "entryType",
    bgColor: "entryType",
  };

  const filtersWithoutEntryType = selectedFilter.filter(
    (filter) => filter.scope !== "entryType"
  );
  const hasOnlyEntryTypeFilter = filtersWithoutEntryType.length === 0;

  const hasMultipleEntryTypes = (entryTypes?.length ?? 0) > 1;

  const resultTypeTooltip = hasMultipleEntryTypes
    ? "The Result Type label cannot be cleared because queries need one Result Type selected. You can change the Result Type in the radio selector above."
    : "The Result Type label cannot be cleared because queries need one Result Type selected.";

  const intialEntryTypeFiltertoRender = [
    resultTypeChip,
    ...filtersWithoutEntryType,
  ];

  return (
    <Box
      sx={{
        display: "block",
        backgroundColor: "white",
        mt: "16px",
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
            <Tooltip
              arrow
              placement="top"
              title={hasOnlyEntryTypeFilter ? resultTypeTooltip : ""}
            >
              <Box component="span">
                <Button
                  onClick={handleClearAll}
                  disabled={hasOnlyEntryTypeFilter}
                  sx={{
                    textTransform: "none",
                    fontSize: "14px",
                    pl: 2,
                    ml: 2,
                    backgroundColor: "transparent",
                    color: hasOnlyEntryTypeFilter
                      ? "#9E9E9E"
                      : primaryDarkColor,

                    "&.Mui-disabled": {
                      color: "#9E9E9E",
                    },
                  }}
                  startIcon={
                    <img
                      src={deleteIcon}
                      alt="Delete"
                      style={{
                        width: 18,
                        height: 18,
                        marginRight: 4,
                        opacity: hasOnlyEntryTypeFilter ? 0.35 : 1,
                        filter: hasOnlyEntryTypeFilter
                          ? "grayscale(1)"
                          : "none",
                      }}
                    />
                  }
                >
                  Clear All
                </Button>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Render individual filter chips */}
        <QueryAppliedItems
          handleFilterRemove={handleFilterRemove} // Pass handler to remove a single filter
          variant={variant} // Used to distinguish between query types, if needed
          intialEntryTypeFiltertoRender={intialEntryTypeFiltertoRender}
        />
      </Box>
    </Box>
  );
}
