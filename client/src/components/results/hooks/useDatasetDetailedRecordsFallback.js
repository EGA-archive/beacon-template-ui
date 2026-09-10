import { useEffect } from "react";

import config from "../../../config/runtimeConfig";
import useAuthHeaders from "../../../hooks/useAuthHeaders";
import { buildDetailedTableQuery } from "../modal/buildDetailedTableQuery";

/**
 * Finds the result set belonging to the selected dataset.
 *
 * Beacon ID is preferred because different Beacons may expose datasets
 * with the same ID. Dataset ID alone is used as a fallback.
 */
const findDatasetResultSet = (resultSets, beaconId, datasetId) =>
  resultSets.find(
    (resultSet) => resultSet.id === datasetId && resultSet.beaconId === beaconId
  ) || resultSets.find((resultSet) => resultSet.id === datasetId);

/**
 * Refetches detailed dataset records when they cannot be transferred
 * from the original Results tab.
 *
 * This is used when the page is refreshed or opened directly from a URL.
 * When authentication is enabled, the request includes the current
 * user's Bearer token so the backend can authorize dataset access.
 */
export const useDatasetDetailedRecordsFallback = ({
  shouldFetchRecords,
  hasTransferredRecords,
  entryTypePath,
  queryFilters,
  beaconId,
  datasetId,
  setRecords,
  setTotalResults,
  setLoading,
  setError,
}) => {
  const authHeaders = useAuthHeaders();

  useEffect(() => {
    // Records were already received from the original Results tab.
    if (!shouldFetchRecords || hasTransferredRecords) {
      return undefined;
    }

    // The request cannot be reconstructed without these values.
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
          headers: authHeaders,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        /**
         * Authentication succeeded, but the backend determined
         * that this user cannot access the requested dataset.
         */
        if (response.status === 403) {
          setRecords([]);
          setTotalResults(null);
          setError("You do not have permission to access this dataset.");
          return;
        }

        /**
         * The token is missing, invalid or no longer accepted.
         */
        if (response.status === 401) {
          setRecords([]);
          setTotalResults(null);
          setError(
            "Your authentication session is no longer valid. Please log in again."
          );
          return;
        }

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

        setTotalResults(
          Number.isFinite(selectedResultSet.resultsCount)
            ? selectedResultSet.resultsCount
            : null
        );
      } catch (error) {
        // Abort is expected when the component unmounts.
        if (error.name === "AbortError") return;

        console.error(
          "[DatasetDetailedTable] Unable to fetch fallback records:",
          error
        );

        setRecords([]);
        setTotalResults(null);
        setError("Unable to load the detailed table records.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDetailedRecords();

    return () => controller.abort();
  }, [
    shouldFetchRecords,
    hasTransferredRecords,
    entryTypePath,
    queryFilters,
    beaconId,
    datasetId,
    authHeaders,
    setRecords,
    setTotalResults,
    setLoading,
    setError,
  ]);
};
