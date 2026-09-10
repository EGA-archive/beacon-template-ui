/**
 * Human-readable labels for the different Beacon result types.
 */
export const DATA_VISIBILITY_LABELS = {
  boolean: "Presence only (boolean)",
  count: "Count",
  record: "Detailed records",
};

const ENTRY_TYPE_LABELS = {
  g_variants: "Genomic Variations",
  individuals: "Individuals",
  biosamples: "Biosamples",
  analyses: "Analyses",
  cohorts: "Cohorts",
  datasets: "Datasets",
  runs: "Runs",
};

/**
 * Converts an entry type ID into the label displayed in the Results header.
 */
export const formatEntryTypeLabel = (entryType) =>
  ENTRY_TYPE_LABELS[entryType] || entryType;

/**
 * Normalizes Beacon environment values for display.
 */
export const getBeaconStatusLabel = (status) => {
  if (!status) return "Undefined";

  const normalizedStatus = String(status).toUpperCase();

  if (normalizedStatus.includes("PROD")) return "Production";
  if (normalizedStatus.includes("TEST")) return "Test";
  if (normalizedStatus.includes("DEV")) return "Development";

  return status;
};

/**
 * Returns the number of results that should be displayed
 * for a dataset according to the Beacon response type.
 */
export const getDisplayedDatasetCount = (item, dataset) => {
  if (typeof dataset.resultsCount === "number") {
    return dataset.resultsCount;
  }

  const totalResults = item.totalResultsCount || 0;
  const datasets = item.items || [];

  if (totalResults <= 100) {
    return dataset.results?.length || 0;
  }

  if (datasets.length === 1) {
    return totalResults;
  }

  return dataset.results?.length || "-";
};

/**
 * Finds the display name associated with a Beacon ID.
 */
export const findBeaconName = (beaconsInfo, beaconId) => {
  if (!beaconId || !Array.isArray(beaconsInfo)) {
    return null;
  }

  const beacon = beaconsInfo.find(
    (item) =>
      item?.meta?.beaconId === beaconId || item?.response?.id === beaconId
  );

  return beacon?.response?.name?.trim() || null;
};

/**
 * Finds the contact URL/email for a Beacon.
 */
export const findBeaconEmail = (beaconsInfo, beaconId, beaconType) => {
  if (!Array.isArray(beaconsInfo) || beaconsInfo.length === 0) {
    return null;
  }

  const beacon =
    beaconType === "singleBeacon"
      ? beaconsInfo[0]
      : beaconsInfo.find((item) => {
          const id = item.meta?.beaconId || item.id;
          return id === beaconId;
        });

  if (!beacon) return null;

  return (
    beacon.response?.organization?.contactUrl ||
    beacon.organization?.contactUrl ||
    null
  );
};

/**
 * Formats a Beacon error for the Results table tooltip.
 */
export const getBeaconError = (data) => {
  if (!data?.error) return null;

  return `error code: ${data.error.errorCode}; error message: ${data.error.errorMessage}`;
};
