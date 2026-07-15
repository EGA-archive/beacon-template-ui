const ALLELE_FREQUENCY_PREFIX = "alleleFrequency_";

export const openAlleleFrequencyPage = ({
  item,
  beaconId,
  beaconName,
  datasetId,
  entryTypeId,
  appliedQuery,
}) => {
  const queryId = crypto.randomUUID();
  const storageKey = `${ALLELE_FREQUENCY_PREFIX}${queryId}`;

  const selectedVariant = {
    beaconId,
    beaconName,
    datasetId,
    entryTypeId,
    appliedQuery,
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

  const params = new URLSearchParams({ queryId });

  window.open(`/allele-frequency?${params.toString()}`, "_blank");
};
