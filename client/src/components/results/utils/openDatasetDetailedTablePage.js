const DATASET_STORAGE_PREFIX = "datasetDetailedTable_";
const DATASET_CONTEXT_TTL = 24 * 60 * 60 * 1000;

/**
 * Removes expired or invalid Dataset Detailed Table contexts
 * from localStorage.
 */
const removeExpiredDatasetContexts = () => {
  const now = Date.now();

  Object.keys(localStorage)
    .filter((key) => key.startsWith(DATASET_STORAGE_PREFIX))
    .forEach((key) => {
      try {
        const context = JSON.parse(localStorage.getItem(key));

        if (!context?.expiresAt || context.expiresAt <= now) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    });
};

/**
 * Opens the Dataset Detailed Table in a new tab.
 *
 * The lightweight query context is saved in localStorage.
 * The detailed records are sent to the new tab through postMessage
 * once the destination page signals that it is ready.
 */
export const openDatasetDetailedTablePage = ({
  subRow,
  entryTypeId,
  selectedFilters = [],
  contactEmail,
}) => {
  const queryId = crypto.randomUUID();
  const storageKey = `${DATASET_STORAGE_PREFIX}${queryId}`;

  const storedContext = {
    beaconId: subRow.beaconId,
    beaconName: subRow.beaconName,
    datasetId: subRow.datasetId,
    displayedCount: subRow.displayedCount,
    contactEmail,
    entryTypeId,
    selectedPathSegment: entryTypeId,
    selectedFilters,

    appliedQuery: {
      entryType: entryTypeId,
      filters: selectedFilters,
    },

    expiresAt: Date.now() + DATASET_CONTEXT_TTL,
  };

  removeExpiredDatasetContexts();

  try {
    localStorage.setItem(storageKey, JSON.stringify(storedContext));
  } catch (error) {
    console.error("Unable to store Dataset Detailed Table context:", error);
    return;
  }

  const params = new URLSearchParams({
    beaconId: subRow.beaconId,
    datasetId: subRow.datasetId,
    entryType: entryTypeId,
    queryId,
  });

  let detailsWindow;
  let cleanupTimer;

  const cleanup = () => {
    window.removeEventListener("message", handleDetailsPageReady);

    if (cleanupTimer) {
      window.clearTimeout(cleanupTimer);
    }
  };

  /**
   * Wait until the new tab is mounted before sending
   * the detailed records to it.
   */
  const handleDetailsPageReady = (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.source !== detailsWindow) return;

    const message = event.data;

    if (
      message?.type !== "DATASET_DETAILED_TABLE_READY" ||
      message?.queryId !== queryId
    ) {
      return;
    }

    detailsWindow.postMessage(
      {
        type: "DATASET_DETAILED_TABLE_DATA",
        queryId,
        dataTable: Array.isArray(subRow.dataTable) ? subRow.dataTable : [],
      },
      window.location.origin
    );

    cleanup();
  };

  window.addEventListener("message", handleDetailsPageReady);

  detailsWindow = window.open(
    `/dataset-detailed-table?${params.toString()}`,
    "_blank"
  );

  if (!detailsWindow) {
    cleanup();

    console.error("The Dataset Detailed Table tab could not be opened.");

    return;
  }

  // Stop listening if the destination page never responds.
  cleanupTimer = window.setTimeout(cleanup, 10000);
};
