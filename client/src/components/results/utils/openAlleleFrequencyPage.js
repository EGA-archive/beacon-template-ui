const ALLELE_FREQUENCY_PREFIX = "alleleFrequency_";

/**
 * Opens the Allele Frequency page for one selected variant.
 *
 * The complete variant data is stored locally so the originating
 * browser can open the page immediately.
 *
 * The URL contains only the information required to reconstruct
 * the query when the link is refreshed, shared, or opened
 * by another authenticated user.
 */
export const openAlleleFrequencyPage = ({
  item,
  beaconId,
  beaconName,
  datasetId,
  entryTypeId,
  appliedQuery,
  contactEmail,
}) => {
  const queryId = crypto.randomUUID();
  const storageKey = `${ALLELE_FREQUENCY_PREFIX}${queryId}`;

  const selectedFilters = appliedQuery?.filters || [];

  const selectedVariant = {
    beaconId,
    beaconName,
    datasetId,
    entryTypeId,
    appliedQuery,
    contactEmail,
    variantId: item.id,
    identifiers: item.identifiers,
    variation: item.variation,
    frequencyInPopulations: item.frequencyInPopulations,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(selectedVariant));
  } catch (error) {
    console.error("[AlleleFrequency] Unable to store selected variant:", error);
    return;
  }

  const params = new URLSearchParams({
    beaconId,
    datasetId,
    entryType: entryTypeId,
    queryId,
    filters: JSON.stringify(selectedFilters),
  });

  /**
   * Include the record identifiers required to find the
   * selected variant again after a fresh Beacon request.
   */
  if (item.id) {
    params.set("variantId", item.id);
  }

  if (item.identifiers?.genomicHGVSId) {
    params.set("genomicHGVSId", item.identifiers.genomicHGVSId);
  }
  if (contactEmail) {
    params.set("contactEmail", contactEmail);
  }

  window.open(`/allele-frequency?${params.toString()}`, "_blank");
};
