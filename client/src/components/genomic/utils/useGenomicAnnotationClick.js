import { COMMON_MESSAGES } from "../../common/CommonMessage";
import { GENOMIC_LABELS_MAP } from "../genomicLabelHelper";

// Custom hook that centralizes the click logic for Genomic Annotation examples
//  When a user clicks on a genomic example this function:
// 1. Prevents adding more than one genomic query at a time
// 2. Builds a filter object identical to the one in the Genomic Query Builder
// 3. Adds that filter directly to the applied filters list
export function useGenomicAnnotationClick({
  selectedFilter,
  setSelectedFilter,
  setMessage,
  setQueryDirty,
  hasSearchResults,
}) {
  // Main handler executed when a genomic annotation example is clicked
  return function handleGenomicAnnotationClick(item) {
    // Only process items that represent genomic queries
    if (item.type === "genomic" && item.queryParams) {
      // Check if a genomic query already exists
      const alreadyHasGenomic = selectedFilter.some(
        (f) => f.type === "genomic" && f.scope !== "editing"
      );

      // If one already exists, show an error message and stop
      if (alreadyHasGenomic) {
        setMessage(COMMON_MESSAGES.singleGenomicQuery);
        setTimeout(() => setMessage(null), 5000);
        return;
      }

      // Recreate the same label-building logic used in the Genomic Query Builder
      // We extract all valid parameters from the example query and convert them into readable label components
      const validEntries = Object.entries(item.queryParams).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          !(typeof value === "string" && value.trim() === "")
      );

      // Build a unique identifier string for the filter
      const idLabel = validEntries
        .map(([key, value]) => `${key}:${value}`)
        .join("-");

      // Build the human-readable label shown in the "Applied Queries" UI
      const combinedLabel = validEntries
        .map(([key, value]) => {
          const displayKey = GENOMIC_LABELS_MAP[key] || key;
          return `${displayKey}: ${value}`;
        })
        .join(" | ");

      // Construct the genomic filter object exactly as the GQB would generate it
      const newFilter = {
        id: `genomic-${item.queryType}-${idLabel}`,
        label: combinedLabel,
        key: item.queryType,
        scope: "genomicQueryBuilder",
        bgColor: "genomic",
        type: "genomic",
        queryType: item.queryType,
        queryParams: item.queryParams,
      };

      //Add the new genomic filter to the list of applied filters
      setSelectedFilter((prev) => [...prev, newFilter]);

      return;
    }

    // If results are already visible and the user clicks a new annotation, mark the query as "dirty" so the UI knows the search parameters changed
    if (hasSearchResults) setQueryDirty(true);
  };
}
