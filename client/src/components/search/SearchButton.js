import { Button } from "@mui/material";
import config from "../../config/config.json";
import SearchIcon from "@mui/icons-material/Search";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { COMMON_MESSAGES } from "../common/CommonMessage";
import { PATH_SEGMENT_TO_ENTRY_ID } from "../../components/common/textFormatting";
import { queryBuilder } from "./utils/queryBuilder";

// This button triggers a search when clicked. It builds a query from selected filters and/or genomic queries,
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
    const entryTypeId = PATH_SEGMENT_TO_ENTRY_ID[selectedPathSegment];
    const configForEntry = entryTypesConfig?.[entryTypeId];
    const nonFilteredAllowed =
      configForEntry?.nonFilteredQueriesAllowed ?? true;

    // Block the search if filters are required but none are provided
    if (!nonFilteredAllowed && selectedFilter.length === 0) {
      setMessage(COMMON_MESSAGES.addFilter);
      setResultData([]);
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

      if (selectedFilter.length > 0) {
        // ✅ Use shared query builder
        const query = queryBuilder(selectedFilter, entryTypeId);
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        };
        response = await fetch(url, requestOptions);
      } else {
        response = await fetch(url);
      }

      if (!response.ok) {
        console.error("Fetch failed:", response.status);
        setResultData([]);
        setHasSearchResult(true);
        return;
      }

      const data = await response.json();
      console.log("Response data:", data);

      // Group raw Beacon results by beacon or dataset
      const rawItems =
        data?.response?.resultSets ?? data?.response?.collections ?? [];

      // console.log("[SearchButton] rawItems ➜", rawItems);

      const groupedArray = Object.values(
        Object.values(rawItems).reduce((acc, item) => {
          const isBeaconNetwork = !!item.beaconId;
          const key = isBeaconNetwork ? item.beaconId : item.id;

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

          const count = Number(item.resultsCount) || 0;
          acc[key].totalResultsCount += count;

          if (Array.isArray(item.results)) {
            acc[key].items.push({
              dataset: item.id,
              results: item.results,
            });
          }

          return acc;
        }, {})
      );

      setResultData(groupedArray);
      setHasSearchResult(true);
    } catch (error) {
      console.error("❌ SearchButton error:", error);
      setResultData([]);
      setHasSearchResult(true);
    } finally {
      setHasSearchResult(true);
      setLoadingData(false);
    }
  };

  // Render the Search button
  return (
    <Button
      variant="contained"
      fullWidth
      sx={{
        borderRadius: "999px",
        textTransform: "none",
        fontSize: "14px",
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
