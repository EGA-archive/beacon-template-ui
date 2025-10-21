// import { Button } from "@mui/material";
// import config from "../../config/config.json";
// import SearchIcon from "@mui/icons-material/Search";
// import { useSelectedEntry } from "../context/SelectedEntryContext";
// import { COMMON_MESSAGES } from "../common/CommonMessage";
// import { PATH_SEGMENT_TO_ENTRY_ID } from "../../components/common/textFormatting";
// import { queryBuilder } from "./utils/queryBuilder";

// // This button triggers a search when clicked. It builds a query from selected filters and/or genomic  queries,
// // sends a request to the Beacon API, handles grouping of results, and updates global state accordingly.
// // If no filters are applied and they are required, it shows an error message instead.
// export default function SearchButton({ setSelectedTool }) {
//   // Access shared state and updater functions from context
//   const {
//     selectedPathSegment,
//     setLoadingData,
//     setResultData,
//     setHasSearchResult,
//     selectedFilter,
//     entryTypesConfig,
//     setMessage,
//     setHasSearchBeenTriggered,
//   } = useSelectedEntry();

//   // Main logic executed when the user clicks "Search"
//   const handleSearch = async () => {
//     // Get the internal ID for the current path segment
//     const entryTypeId = PATH_SEGMENT_TO_ENTRY_ID[selectedPathSegment];

//     // Check if filters are mandatory for this entry type
//     const configForEntry = entryTypesConfig?.[entryTypeId];
//     const nonFilteredAllowed =
//       configForEntry?.nonFilteredQueriesAllowed ?? true;

//     // Block the search if filters are required but none are provided
//     if (!nonFilteredAllowed && selectedFilter.length === 0) {
//       setMessage(COMMON_MESSAGES.addFilter); // Show warning
//       setResultData([]); // Clear any previous results
//       setHasSearchResult(true);
//       return;
//     }

//     // Proceed with the search
//     setMessage(null);
//     setSelectedTool(null);
//     setLoadingData(true);
//     setResultData([]);
//     setHasSearchBeenTriggered(true);

//     // API request logic

//     console.log("[SearchButton] Starting search...");
//     try {
//       // Builds the full endpoint dynamically
//       const url = `${config.apiUrl}/${selectedPathSegment}`;
//       let response;

//       // If user applied filters
//       if (selectedFilter.length > 0) {
//         // The queryBuilder builds the Beacon-compliant POST body
//         const query = queryBuilder(selectedFilter, entryTypeId);
//         const requestOptions = {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(query),
//         };
//         response = await fetch(url, requestOptions);
//       } else {
//         // Otherwise, send a simple GET request to get all data
//         response = await fetch(url);
//       }

//       // If request fails, show no results
//       if (!response.ok) {
//         console.error("Fetch failed:", response.status);
//         setResultData([]);
//         setHasSearchResult(true);
//         return;
//       }
//       // Parse response data
//       const data = await response.json();
//       console.log("Response data:", data);

//       // This block groups raw Beacon responses by dataset or beacon.
//       // This ensures your final table doesn’t show duplicates for datasets that appear multiple times.
//       // DEBUG: Shows as no result but has response in the network - problem with the grouping
//       const rawItems =
//         data?.response?.resultSets ?? data?.response?.collections ?? [];

//       console.log("[SearchButton] rawItems ➜", rawItems);
//       const groupedArray = Object.values(
//         Object.values(rawItems).reduce((acc, item) => {
//           const isBeaconNetwork = !!item.beaconId;
//           const key = isBeaconNetwork ? item.beaconId : item.id;
//           console.log("[SearchButton] item ➜", item);
//           // Initialize group if it doesn't exist
//           if (!acc[key]) {
//             acc[key] = {
//               ...(isBeaconNetwork
//                 ? { beaconId: item.beaconId, id: item.id }
//                 : { id: item.id }),
//               exists: item.exists,
//               info: item.info || null,
//               totalResultsCount: 0,
//               setType: item.setType,
//               items: [],
//               description: item.description ?? "",
//             };
//           }

//           // Add result count to the group
//           const count = Number(item.resultsCount) || 0;
//           acc[key].totalResultsCount += count;

//           // Add result items to the group
//           if (Array.isArray(item.results)) {
//             acc[key].items.push({
//               dataset: item.id,
//               results: item.results,
//             });
//           }

//           return acc;
//         }, {})
//       );

//       // Save final grouped results
//       setResultData(groupedArray);
//       setHasSearchResult(true);
//     } catch (error) {
//       // Handle network or parsing errors
//       setResultData([]);
//       setHasSearchResult(true);
//     } finally {
//       // Always stop loading
//       setHasSearchResult(true);
//       setLoadingData(false);
//     }
//   };

//   // // Helper to build the Beacon API query object from the selected filters
//   // const queryBuilder = (params, entryId) => {
//   //   console.log("[SearchButton] queryBuilder.input ➜", { params, entryId });

//   //   // Identify genomic and non-genomic filters
//   //   // Looks for a filter object that is type genomic
//   //   const genomicQuery = params.find((f) => f.type === "genomic");
//   //   // Keeps all the other filters
//   //   const nonGenomicFilters = params.filter((f) => f.type !== "genomic");

//   //   // This builds the Beacon POST body
//   //   const filter = {
//   //     meta: { apiVersion: "2.0" },
//   //     query: {
//   //       // This is where Beacon expects all the query data.
//   //       // If a genomic query exists then add the .queryParams here
//   //       // Otherwise leave it as empty object
//   //       requestParameters: genomicQuery?.queryParams || {},
//   //       // Loops through all remaining filters and formats them for Beacon
//   //       // Scope: if there is no scope it is left empty
//   //       filters: nonGenomicFilters.map((item) => {
//   //         if (item.operator) {
//   //           // Advanced filter with operator and value
//   //           return {
//   //             id: item.field,
//   //             operator: item.operator,
//   //             value: item.value,
//   //           };
//   //         } else {
//   //           // Simple filtering term
//   //           return {
//   //             id: item.id,
//   //             ...(item.scope ? { scope: item.scope } : {}),
//   //           };
//   //         }
//   //       }),
//   //       includeResultsetResponses: "HIT",
//   //       pagination: { skip: 0, limit: 10 },
//   //       testMode: false,
//   //       requestedGranularity: "record",
//   //     },
//   //   };

//   // Helper to build the Beacon API query object from the selected filters
//   const queryBuilder = (params, entryId) => {
//     console.log("[SearchButton] queryBuilder.input ➜", { params, entryId });

//     // Identify genomic and non-genomic filters
//     const genomicQuery = params.find((f) => f.type === "genomic");
//     const nonGenomicFilters = params.filter((f) => f.type !== "genomic");

//     // ✅ Check if genomic query actually contains any parameters
//     const hasGenomicParams =
//       genomicQuery?.queryParams &&
//       Object.keys(genomicQuery.queryParams).length > 0;

//     // Build the base Beacon POST body
//     const queryBody = {
//       filters: nonGenomicFilters.map((item) => {
//         if (item.operator) {
//           // Advanced filter with operator and value
//           return {
//             id: item.field,
//             operator: item.operator,
//             value: item.value,
//           };
//         } else {
//           // Simple filtering term
//           return {
//             id: item.id,
//             ...(item.scope ? { scope: item.scope } : {}),
//           };
//         }
//       }),
//       // ⚙️ Only include requestParameters when genomic data exists
//       ...(hasGenomicParams
//         ? { requestParameters: genomicQuery.queryParams }
//         : {}),
//       includeResultsetResponses: "HIT",
//       pagination: { skip: 0, limit: 10 },
//       testMode: false,
//       requestedGranularity: "record",
//     };

//     const filter = {
//       meta: { apiVersion: "2.0" },
//       query: queryBody,
//     };

//     // Debugging logs
//     console.log("[SearchButton] hasGenomicParams ➜", hasGenomicParams);
//     console.log("[SearchButton] queryBuilder.output ➜", filter);

//     return filter;
//   };

//   //   console.log("[SearchButton] queryBuilder.output ➜", filter);
//   //   return filter;
//   // };

//   // Render the button itself
//   return (
//     <Button
//       variant="contained"
//       fullWidth
//       sx={{
//         borderRadius: "999px",
//         textTransform: "none",
//         fontSize: "14px",
//         // pl: 2,
//         // ml: 2,
//         backgroundColor: config.ui.colors.primary,
//         border: `1px solid ${config.ui.colors.primary}`,
//         boxShadow: "none",
//         "&:hover": {
//           backgroundColor: "white",
//           border: `1px solid ${config.ui.colors.primary}`,
//           color: config.ui.colors.primary,
//         },
//       }}
//       startIcon={<SearchIcon />}
//       onClick={handleSearch}
//     >
//       Search
//     </Button>
//   );
// }

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

    console.log("[SearchButton] Starting search...");
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

      console.log("[SearchButton] rawItems ➜", rawItems);

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
