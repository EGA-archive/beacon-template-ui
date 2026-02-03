import { Button } from "@mui/material";
import config from "../../config/config.json";
import SearchIcon from "@mui/icons-material/Search";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { COMMON_MESSAGES } from "../common/CommonMessage";
import { PATH_SEGMENT_TO_ENTRY_ID } from "../../components/common/textFormatting";
import { queryBuilder } from "./utils/queryBuilder";
import { mockSingleBeaconResponse } from "./mockSingleBeaconResponse";

const buildHeaders = (results = []) => {
  const headerSet = new Set();
  results.forEach((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      Object.keys(row).forEach((key) => headerSet.add(key));
    }
  });
  return Array.from(headerSet);
};

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
    setQueryDirty,
    setLastSearchedFilters,
    setLastSearchedPathSegment,
    setRawItems,
    setResponseMeta,
    isExtraFilterValid,
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
    setLastSearchedFilters(selectedFilter);
    setLastSearchedPathSegment(selectedPathSegment);
    setQueryDirty(false);

    try {
      const url = `${config.apiUrl}/${selectedPathSegment}`;
      const query = queryBuilder(selectedFilter, entryTypeId);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      };

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        console.error("Fetch failed:", response.status);
        setResultData([]);
        setHasSearchResult(true);
        return;
      }

      const data = await response.json();

      // const data = mockSingleBeaconResponse;

      setResponseMeta(data.meta);

      // Group resultSets by beaconId (network) or by dataset id (single beacon)
      // Correctly identifies: Record Beacon / Count Beacon / Boolean Beacon
      const resultSets =
        data?.response?.resultSets ?? data?.response?.collections ?? [];
      const groupedArray = Object.values(
        resultSets.reduce((acc, item) => {
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

          const headers = buildHeaders(item.results || []);

          const count = Number(item.resultsCount) || 0;
          acc[key].totalResultsCount += count;

          const datasetIdentifier = item.id || item.datasetId;

          // Only push into items if this resultSet represents a real dataset
          if (datasetIdentifier) {
            const datasetEntry = {
              dataset: datasetIdentifier,
              exists: item.exists,
              setType: item.setType,
            };

            if ("results" in item) {
              datasetEntry.results = item.results;
              datasetEntry.headers = headers;
            }

            if ("resultsCount" in item) {
              datasetEntry.resultsCount = item.resultsCount;
            }

            acc[key].items.push(datasetEntry);
          }

          return acc;
        }, {})
      );

      groupedArray.forEach((group) => {
        group.items.forEach((ds) => {
          if (ds.headers?.length) {
          }
        });
      });

      setResultData(groupedArray);

      setRawItems(resultSets);
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
      data-cy="search-button"
      variant="contained"
      fullWidth
      disabled={!isExtraFilterValid}
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
        "&.Mui-disabled": {
          backgroundColor: "#d3d3d3w",
          color: "#888",
          border: "1px solid #ccc",
          opacity: 1,
        },
      }}
      startIcon={<SearchIcon />}
      onClick={handleSearch}
    >
      Search
    </Button>
  );
}
