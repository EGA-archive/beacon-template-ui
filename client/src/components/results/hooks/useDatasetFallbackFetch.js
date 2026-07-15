import { useEffect } from "react";
import config from "../../../config/config.json";
import { buildDetailedTableQuery } from "../modal/buildDetailedTableQuery";

/**
 * Fetches detailed records after a refresh or when cross-tab transfer fails.
 */
export const useDatasetFallbackFetch = ({
  shouldFetchFallback,
  receivedPreloadedData,
  selectedPathSegment,
  selectedFilters,
  targetBeaconId,
  targetDatasetId,
  setDataTable,
  setLoading,
  setFetchError,
}) => {
  useEffect(() => {
    if (!shouldFetchFallback || receivedPreloadedData) return;

    if (!selectedPathSegment || !targetDatasetId) {
      setLoading(false);
      setFetchError("The detailed table request context is incomplete.");
      return;
    }

    const controller = new AbortController();

    const fetchRecords = async () => {
      try {
        setLoading(true);
        setFetchError("");
        setDataTable([]);

        const response = await fetch(
          `${config.apiUrl}/${selectedPathSegment}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(buildDetailedTableQuery(selectedFilters)),
            signal: controller.signal,
          }
        );

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

        const matchingResultSet =
          resultSets.find(
            (resultSet) =>
              resultSet.id === targetDatasetId &&
              resultSet.beaconId === targetBeaconId
          ) || resultSets.find((resultSet) => resultSet.id === targetDatasetId);

        if (!matchingResultSet) {
          throw new Error(
            `No result set was found for dataset "${targetDatasetId}".`
          );
        }

        setDataTable(
          Array.isArray(matchingResultSet.results)
            ? matchingResultSet.results
            : []
        );
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error(
          "[DatasetDetailedTablePage] Fallback fetch failed:",
          error
        );

        setDataTable([]);
        setFetchError("Unable to load the detailed table records.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRecords();

    return () => controller.abort();
  }, [
    shouldFetchFallback,
    receivedPreloadedData,
    selectedPathSegment,
    selectedFilters,
    targetBeaconId,
    targetDatasetId,
    setDataTable,
    setLoading,
    setFetchError,
  ]);
};
