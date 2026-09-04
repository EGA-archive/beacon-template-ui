// import { useMemo } from "react";
// import { getDatasetDetailedContext } from "../utils/datasetDetailedTableUtils";

// const EMPTY_FILTERS = [];

// /**
// This hook collects all the information needed by the Dataset Detailed Table page.
//  * Some information comes from the page URL, while the full query context comes from localStorage.
//  * The hook combines both sources and returns one clean object for the page to use.
//  */
// export const useDatasetDetailedTableContext = () => {
//   /**
//    * Read the values included in the page URL.
//    * Example:
//    * /dataset-detailed-table?beaconId=...&datasetId=...&queryId=...
//    */
//   const searchParams = new URLSearchParams(window.location.search);
//   const beaconIdFromUrl = searchParams.get("beaconId");
//   const datasetIdFromUrl = searchParams.get("datasetId");
//   const entryTypeFromUrl = searchParams.get("entryType");
//   const queryId = searchParams.get("queryId");

//   /**
//    * Use the query ID to read the small saved context from localStorage.
//    * The saved context contains information such as:
//    * - selected filters;
//    * - applied query;
//    * - Beacon name;
//    * - dataset ID;
//    * - selected entry type.
//    */
//   const storedContext = useMemo(
//     () => getDatasetDetailedContext(queryId),
//     [queryId]
//   );

//   /**
//    * Use the stored filters when available.
//    * EMPTY_FILTERS is reused instead of creating a new empty array every time the component renders.
//    */
//   const selectedFilters = storedContext.selectedFilters || EMPTY_FILTERS;

//   /**
//    * Decide which entry type path should be used.
//    * The stored value is preferred because it contains the original search context. The URL value is used as a fallback.
//    */
//   const selectedEntryTypePath =
//     storedContext.selectedPathSegment ||
//     storedContext.appliedQuery?.entryType ||
//     entryTypeFromUrl ||
//     "";

//   /**
//    * Return one clear context object for the page.
//    * Stored values are preferred.
//    * URL values are used when the stored context is unavailable.
//    */
//   return {
//     queryId,
//     storedContext,
//     selectedFilters,
//     selectedEntryTypePath,

//     beaconId: storedContext.beaconId || beaconIdFromUrl,

//     datasetId: storedContext.datasetId || datasetIdFromUrl,

//     entryTypeId:
//       storedContext.entryTypeId ||
//       storedContext.appliedQuery?.entryType ||
//       entryTypeFromUrl ||
//       "",
//   };
// };

import { useMemo } from "react";

import { getDatasetDetailedContext } from "../utils/datasetDetailedTableUtils";

const EMPTY_FILTERS = [];

/**
 * Safely reads query filters from the URL.
 *
 * Invalid or missing values fall back to an empty filter list.
 */
const parseFilters = (value) => {
  if (!value) return EMPTY_FILTERS;

  try {
    const filters = JSON.parse(value);

    return Array.isArray(filters) ? filters : EMPTY_FILTERS;
  } catch {
    return EMPTY_FILTERS;
  }
};

/**
 * Collects the context required by the Dataset Detailed Table.
 *
 * localStorage is preferred when the page was opened from the
 * original Results tab.
 *
 * URL values are used as a fallback when the page is refreshed,
 * shared, or opened in another browser.
 */
export const useDatasetDetailedTableContext = () => {
  const search = window.location.search;

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const beaconIdFromUrl = searchParams.get("beaconId");

  const datasetIdFromUrl = searchParams.get("datasetId");

  const entryTypeFromUrl = searchParams.get("entryType");

  const queryId = searchParams.get("queryId");

  // const filtersFromUrl = parseFilters(searchParams.get("filters"));
  const filtersFromUrl = useMemo(
    () => parseFilters(searchParams.get("filters")),
    [searchParams]
  );

  /**
   * The original browser may contain a richer context.
   * Shared URLs normally have no matching localStorage entry.
   */
  const localContext = useMemo(
    () => getDatasetDetailedContext(queryId) || {},
    [queryId]
  );

  /**
   * Prefer locally stored filters when available.
   * Otherwise reconstruct them from the shared URL.
   */
  const selectedFilters = Array.isArray(localContext.selectedFilters)
    ? localContext.selectedFilters
    : filtersFromUrl;

  const selectedEntryTypePath =
    localContext.selectedPathSegment ||
    localContext.appliedQuery?.entryType ||
    entryTypeFromUrl ||
    "";

  /**
   * Build one normalized context object regardless of whether
   * its values came from localStorage or the URL.
   *
   * This allows DatasetDetailedTablePage to keep using
   * storedContext without caring where the data originated.
   */
  const storedContext = {
    ...localContext,

    beaconId: localContext.beaconId || beaconIdFromUrl,

    datasetId: localContext.datasetId || datasetIdFromUrl,

    entryTypeId:
      localContext.entryTypeId ||
      localContext.appliedQuery?.entryType ||
      entryTypeFromUrl ||
      "",

    selectedPathSegment:
      localContext.selectedPathSegment || entryTypeFromUrl || "",

    selectedFilters,

    appliedQuery: localContext.appliedQuery || {
      entryType: entryTypeFromUrl || "",
      filters: selectedFilters,
    },
  };

  return {
    queryId,
    storedContext,
    selectedFilters,
    selectedEntryTypePath,

    beaconId: storedContext.beaconId,
    datasetId: storedContext.datasetId,
    entryTypeId: storedContext.entryTypeId,
  };
};
