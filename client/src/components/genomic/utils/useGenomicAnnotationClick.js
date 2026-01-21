import { COMMON_MESSAGES } from "../../common/CommonMessage";

// Centralizes the click logic for genomic annotation labels
export function useGenomicAnnotationClick({
  selectedFilter,
  setMessage,
  setQueryDirty,
  hasSearchResults,
  setGenomicPrefill,
  openGenomicQueryBuilder,
}) {
  // This function is called when the user clicks on a genomic annotation example label
  return function handleGenomicAnnotationClick(item) {
    // When the label gets clicked the Genomic Query Builder opens
    if (item.type === "genomic" && item.queryParams) {
      // Check if a genomic query has already been added
      const alreadyHasGenomic = selectedFilter?.some(
        (f) => f.type === "genomic"
      );

      // Only one genomic query is allowed at a time
      // If one already exists, show a message and stop here
      if (alreadyHasGenomic) {
        setMessage(COMMON_MESSAGES.singleGenomicQuery);
        setTimeout(() => setMessage(null), 5000);
        return;
      }

      // Prepare the selected example and open the query builder
      setGenomicPrefill(item);
      openGenomicQueryBuilder();
      return;
    }

    // If the user clicks something after results are already shown, mark the search as "changed" so the UI can react accordingly
    if (hasSearchResults) setQueryDirty(true);
  };
}
