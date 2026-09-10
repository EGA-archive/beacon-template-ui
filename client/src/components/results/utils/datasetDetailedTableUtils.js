export const DATASET_CONTEXT_PREFIX = "datasetDetailedTable_";

export const DATASET_READY_MESSAGE = "DATASET_DETAILED_TABLE_READY";

export const DATASET_DATA_MESSAGE = "DATASET_DETAILED_TABLE_DATA";

export const PRELOADED_DATA_RETRY_TIME = 200;
export const PRELOADED_DATA_WAIT_TIME = 700;

export const getDatasetDetailedContext = (queryId) => {
  if (!queryId) return {};

  const storageKey = `${DATASET_CONTEXT_PREFIX}${queryId}`;
  const storedContext = localStorage.getItem(storageKey);

  if (!storedContext) return {};

  try {
    const context = JSON.parse(storedContext);

    if (context.expiresAt && context.expiresAt <= Date.now()) {
      localStorage.removeItem(storageKey);
      return {};
    }

    return context;
  } catch (error) {
    console.error(
      "[DatasetDetailedTable] Unable to read stored context:",
      error
    );

    localStorage.removeItem(storageKey);
    return {};
  }
};
