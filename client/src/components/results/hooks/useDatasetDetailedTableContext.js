import { useMemo } from "react";
import { getDatasetDetailedContext } from "../utils/datasetDetailedTableUtils";

const EMPTY_FILTERS = [];

/**
This hook collects all the information needed by the Dataset Detailed Table page.
 * Some information comes from the page URL, while the full query context comes from localStorage.
 * The hook combines both sources and returns one clean object for the page to use.
 */
export const useDatasetDetailedTableContext = () => {
  /**
   * Read the values included in the page URL.
   * Example:
   * /dataset-detailed-table?beaconId=...&datasetId=...&queryId=...
   */
  const searchParams = new URLSearchParams(window.location.search);
  const beaconIdFromUrl = searchParams.get("beaconId");
  const datasetIdFromUrl = searchParams.get("datasetId");
  const entryTypeFromUrl = searchParams.get("entryType");
  const queryId = searchParams.get("queryId");

  /**
   * Use the query ID to read the small saved context from localStorage.
   * The saved context contains information such as:
   * - selected filters;
   * - applied query;
   * - Beacon name;
   * - dataset ID;
   * - selected entry type.
   */
  const storedContext = useMemo(
    () => getDatasetDetailedContext(queryId),
    [queryId]
  );

  /**
   * Use the stored filters when available.
   * EMPTY_FILTERS is reused instead of creating a new empty array every time the component renders.
   */
  const selectedFilters = storedContext.selectedFilters || EMPTY_FILTERS;

  /**
   * Decide which entry type path should be used.
   * The stored value is preferred because it contains the original search context. The URL value is used as a fallback.
   */
  const selectedEntryTypePath =
    storedContext.selectedPathSegment ||
    storedContext.appliedQuery?.entryType ||
    entryTypeFromUrl ||
    "";

  /**
   * Return one clear context object for the page.
   * Stored values are preferred.
   * URL values are used when the stored context is unavailable.
   */
  return {
    queryId,
    storedContext,
    selectedFilters,
    selectedEntryTypePath,

    beaconId: storedContext.beaconId || beaconIdFromUrl,

    datasetId: storedContext.datasetId || datasetIdFromUrl,

    entryTypeId:
      storedContext.entryTypeId ||
      storedContext.appliedQuery?.entryType ||
      entryTypeFromUrl ||
      "",
  };
};
