import { useEffect } from "react";
import config from "../../../config/runtimeConfig";
import { buildDetailedTableQuery } from "../modal/buildDetailedTableQuery";

/**
 * Find the API result set belonging to the selected dataset.
 *
 * The Beacon ID is checked first because different Beacons may contain datasets with the same ID. If the response does not include a Beacon ID, the dataset ID alone is used as a fallback.
 */
const findDatasetResultSet = (resultSets, beaconId, datasetId) =>
  resultSets.find(
    (resultSet) => resultSet.id === datasetId && resultSet.beaconId === beaconId
  ) || resultSets.find((resultSet) => resultSet.id === datasetId);

/**
This hood loads the detailed dataset records from the Beacon API only when the original main Results table could not send its already-loaded records.
 *
 * This usually happens when:
 * - the user refreshes the Dataset Detailed Table page;
 * - the original Results tab was closed;
 * - the page was opened directly from its URL.
 *
 * While the request is running, the page displays a loader.
 * If the request fails, the page displays an error message.
 */
export const useDatasetDetailedRecordsFallback = ({
  shouldFetchRecords,
  hasTransferredRecords,
  entryTypePath,
  queryFilters,
  beaconId,
  datasetId,
  setRecords,
  setLoading,
  setError,
}) => {
  useEffect(() => {
    // Do nothing when the records were already received from the original tab.
    if (!shouldFetchRecords || hasTransferredRecords) {
      return undefined;
    }

    // The API request cannot be created without an entry type and dataset.
    if (!entryTypePath || !datasetId) {
      setLoading(false);
      setError("The detailed table request context is incomplete.");
      return undefined;
    }

    const controller = new AbortController();

    const fetchDetailedRecords = async () => {
      try {
        setLoading(true);
        setError("");
        setRecords([]);

        const requestUrl = `${config.apiUrl}/${entryTypePath}`;
        const requestBody = buildDetailedTableQuery(queryFilters);

        const response = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Detailed table request failed with status ${response.status}`
          );
        }

        const responseData = await response.json();
        const resultSets = responseData.response?.resultSets;

        if (!Array.isArray(resultSets)) {
          throw new Error("The API returned no result sets.");
        }

        const selectedResultSet = findDatasetResultSet(
          resultSets,
          beaconId,
          datasetId
        );

        if (!selectedResultSet) {
          throw new Error(
            `No result set was found for dataset "${datasetId}".`
          );
        }

        const records = Array.isArray(selectedResultSet.results)
          ? selectedResultSet.results
          : [];

        setRecords(records);
      } catch (error) {
        // Cancelling the request is expected when the page closes or changes.
        if (error.name === "AbortError") return;

        console.error(
          "[DatasetDetailedTable] Unable to fetch fallback records:",
          error
        );

        setRecords([]);
        setError("Unable to load the detailed table records.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDetailedRecords();

    // Cancel the request if the page closes before it finishes.
    return () => controller.abort();
  }, [
    shouldFetchRecords,
    hasTransferredRecords,
    entryTypePath,
    queryFilters,
    beaconId,
    datasetId,
    setRecords,
    setLoading,
    setError,
  ]);
};
