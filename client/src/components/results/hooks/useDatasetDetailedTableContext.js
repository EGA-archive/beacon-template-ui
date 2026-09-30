import { useMemo } from "react";
import { useLocation } from "react-router-dom";
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
  const { search } = useLocation();

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
