import { useMemo } from "react";

const EMPTY_FILTERS = [];
const ALLELE_FREQUENCY_PREFIX = "alleleFrequency_";

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
 * Collects the information required by the Allele Frequency page.
 *
 * localStorage is used when the page was opened from the current
 * browser session.
 *
 * URL values allow the same query and selected variant to be
 * reconstructed when the link is shared or refreshed.
 */
export const useAlleleFrequencyContext = () => {
  const search = window.location.search;

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const queryId = searchParams.get("queryId");

  const beaconIdFromUrl = searchParams.get("beaconId");

  const datasetIdFromUrl = searchParams.get("datasetId");

  const entryTypeFromUrl = searchParams.get("entryType");

  const variantIdFromUrl = searchParams.get("variantId");

  const genomicHGVSIdFromUrl = searchParams.get("genomicHGVSId");

  /**
   * Memoizing this is important because JSON.parse creates
   * a new array. A stable reference prevents fallback effects
   * from firing repeatedly.
   */
  const filtersFromUrl = useMemo(
    () => parseFilters(searchParams.get("filters")),
    [searchParams]
  );

  const storedData = useMemo(() => {
    if (!queryId) return null;

    const rawData = localStorage.getItem(
      `${ALLELE_FREQUENCY_PREFIX}${queryId}`
    );

    if (!rawData) return null;

    try {
      return JSON.parse(rawData);
    } catch {
      return null;
    }
  }, [queryId]);

  const contactEmailFromUrl = searchParams.get("contactEmail");

  const selectedFilters = Array.isArray(storedData?.appliedQuery?.filters)
    ? storedData.appliedQuery.filters
    : filtersFromUrl;

  const entryTypeId =
    storedData?.entryTypeId ||
    storedData?.appliedQuery?.entryType ||
    entryTypeFromUrl ||
    "";

  const appliedQuery = storedData?.appliedQuery || {
    entryType: entryTypeId,
    filters: selectedFilters,
  };

  return {
    queryId,
    storedData,

    beaconId: storedData?.beaconId || beaconIdFromUrl,

    datasetId: storedData?.datasetId || datasetIdFromUrl,

    entryTypeId,

    selectedFilters,

    appliedQuery,

    variantId: storedData?.variantId || variantIdFromUrl,

    genomicHGVSId:
      storedData?.identifiers?.genomicHGVSId || genomicHGVSIdFromUrl,

    contactEmail: storedData?.contactEmail || contactEmailFromUrl || null,
  };
};
