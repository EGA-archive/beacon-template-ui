import { Button } from "@mui/material";
import config from "../../config/config.json";
import SearchIcon from "@mui/icons-material/Search";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { COMMON_MESSAGES } from "../common/CommonMessage";
import { PATH_SEGMENT_TO_ENTRY_ID } from "../../components/common/textFormatting";

// This button triggers a search when clicked. It builds a query from selected filters,
// sends a request to the Beacon API, handles grouping of results, and updates global state accordingly.
// If no filters are applied and they are required, it shows an error message instead.
export default function SearchButton({ setSelectedTool }) {
  // Access shared state and updater functions from context
  const {
    selectedPathSegment,
    setLoadingData,
    setResultData,
    setHasSearchResult,
    selectedFilter,
    entryTypesConfig,
    setMessage,
    setHasSearchBeenTriggered,
  } = useSelectedEntry();

  // Main logic executed when the user clicks "Search"
  const handleSearch = async () => {
    // Get the internal ID for the current path segment
    const entryTypeId = PATH_SEGMENT_TO_ENTRY_ID[selectedPathSegment];

    // Check if filters are mandatory for this entry type
    const configForEntry = entryTypesConfig?.[entryTypeId];
    const nonFilteredAllowed =
      configForEntry?.nonFilteredQueriesAllowed ?? true;

    // Block the search if filters are required but none are provided
    if (!nonFilteredAllowed && selectedFilter.length === 0) {
      console.log("🚫 Search blocked - filters are required");
      setMessage(COMMON_MESSAGES.addFilter); // Show warning
      setResultData([]); // Clear any previous results
      setHasSearchResult(true);
      return;
    }

    // Proceed with the search
    setMessage(null);
    setSelectedTool(null);
    setLoadingData(true);
    setResultData([]);
    setHasSearchBeenTriggered(true);

    try {
      const url = `${config.apiUrl}/${selectedPathSegment}`;
      let response;
      // If filters are selected, build a POST request
      if (selectedFilter.length > 0) {
        const query = queryBuilder(selectedFilter);
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        };
        response = await fetch(url, requestOptions);
      } else {
        // Otherwise, send a simple GET request
        response = await fetch(url);
      }

      // If request fails, show no results
      if (!response.ok) {
        console.error("Fetch failed:", response.status);
        setResultData([]);
        setHasSearchResult(true);
        return;
      }
      // Parse response data
      const data = await response.json();
      // console.log("Response data:", data);

      // group beacons
      // Group results by beaconId or dataset id
      const rawItems =
        data?.response?.resultSets ?? data?.response?.collections ?? [];

      const groupedArray = Object.values(
        Object.values(rawItems).reduce((acc, item) => {
          const isBeaconNetwork = !!item.beaconId;
          const key = isBeaconNetwork ? item.beaconId : item.id;

          // Initialize group if it doesn't exist
          if (!acc[key]) {
            acc[key] = {
              ...(isBeaconNetwork
                ? { beaconId: item.beaconId, id: item.id }
                : { id: item.id }),
              exists: item.exists,
              info: item.info || null,
              totalResultsCount: 0,
              setType: item.setType,
              items: [],
              description: item.description ?? "",
            };
          }

          // Add result count to the group
          const count = Number(item.resultsCount) || 0;
          acc[key].totalResultsCount += count;

          // Add result items to the group
          if (Array.isArray(item.results)) {
            acc[key].items.push({
              dataset: item.id,
              results: item.results,
            });
          }

          return acc;
        }, {})
      );

      // Save final grouped results
      setResultData(groupedArray);
      setHasSearchResult(true);
    } catch (error) {
      // Handle network or parsing errors
      setResultData([]);
      setHasSearchResult(true);
    } finally {
      // Always stop loading
      setHasSearchResult(true);
      setLoadingData(false);
    }
  };

  // Helper to build the Beacon API query object from the selected filters
  const queryBuilder = (params) => {
    let filter = {
      meta: {
        apiVersion: "2.0",
      },
      query: {
        filters: [],
      },
      includeResultsetResponses: "HIT",
      pagination: {
        skip: 0,
        limit: 10,
      },
      testMode: false,
      requestedGranularity: "record",
    };

    // Convert filters to Beacon-compatible format
    let filterData = params.map((item) => {
      if (item.operator) {
        // Advanced filter with operator and value
        return {
          id: item.field,
          operator: item.operator,
          value: item.value,
        };
      } else {
        // Simple filtering term
        return {
          id: item.key ?? item.id,
          scope: selectedPathSegment,
        };
      }
    });

    filter.query.filters = filterData;

    return filter;
  };

  // Render the button itself
  return (
    <Button
      variant="contained"
      fullWidth
      sx={{
        borderRadius: "999px",
        textTransform: "none",
        fontSize: "14px",
        // pl: 2,
        // ml: 2,
        backgroundColor: config.ui.colors.primary,
        border: `1px solid ${config.ui.colors.primary}`,
        boxShadow: "none",
        "&:hover": {
          backgroundColor: "white",
          border: `1px solid ${config.ui.colors.primary}`,
          color: config.ui.colors.primary,
        },
      }}
      startIcon={<SearchIcon />}
      onClick={handleSearch}
    >
      Search
    </Button>
  );
}
