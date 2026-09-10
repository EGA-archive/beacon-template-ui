import { useEffect } from "react";

import config from "../../../config/runtimeConfig";
import useAuthHeaders from "../../../hooks/useAuthHeaders";
import { buildDetailedTableQuery } from "../modal/buildDetailedTableQuery";

/**
 * Finds the result set belonging to the selected dataset.
 */
const findDatasetResultSet = (resultSets, beaconId, datasetId) =>
  resultSets.find(
    (resultSet) => resultSet.id === datasetId && resultSet.beaconId === beaconId
  ) || resultSets.find((resultSet) => resultSet.id === datasetId);

/**
 * Finds the selected variant inside the refreshed dataset records.
 * Record ID is preferred.
 * HGVS ID provides a second way of identifying the variant
 * when available.
 */
const findSelectedVariant = (records, variantId, genomicHGVSId) =>
  records.find((record) => variantId && record.id === variantId) ||
  records.find(
    (record) =>
      genomicHGVSId && record.identifiers?.genomicHGVSId === genomicHGVSId
  );

/**
 * Refetches the selected variant when Allele Frequency data
 * is unavailable in the current browser's localStorage.
 *
 * The request uses the current user's Bearer token so the
 * Beacon decides whether that user can access the dataset.
 */
export const useAlleleFrequencyFallback = ({
  shouldFetch,
  entryTypeId,
  selectedFilters,
  beaconId,
  datasetId,
  variantId,
  genomicHGVSId,
  setData,
  setLoading,
  setError,
}) => {
  const authHeaders = useAuthHeaders();

  useEffect(() => {
    if (!shouldFetch) {
      return undefined;
    }
    if (!entryTypeId || !datasetId || (!variantId && !genomicHGVSId)) {
      setLoading(false);
      setError("The allele frequency request context is incomplete.");
      return undefined;
    }
    const controller = new AbortController();

    const fetchAlleleFrequency = async () => {
      try {
        setLoading(true);
        setError("");

        const requestUrl = `${config.apiUrl}/${entryTypeId}`;

        const requestBody = buildDetailedTableQuery(selectedFilters);

        const response = await fetch(requestUrl, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (response.status === 403) {
          setData(null);

          setError("You do not have permission to access this dataset.");

          return;
        }

        if (response.status === 401) {
          setData(null);

          setError(
            "Your authentication session is no longer valid. Please log in again."
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            `Allele frequency request failed with status ${response.status}`
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

        const selectedVariant = findSelectedVariant(
          records,
          variantId,
          genomicHGVSId
        );

        if (!selectedVariant) {
          throw new Error(
            "The selected variant was not found in the refreshed results."
          );
        }

        setData(selectedVariant);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error(
          "[AlleleFrequency] Unable to fetch selected variant:",
          error
        );

        setData(null);

        setError("Unable to load the allele frequency data.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAlleleFrequency();

    return () => controller.abort();
  }, [
    shouldFetch,
    entryTypeId,
    selectedFilters,
    beaconId,
    datasetId,
    variantId,
    genomicHGVSId,
    authHeaders,
    setData,
    setLoading,
    setError,
  ]);
};
