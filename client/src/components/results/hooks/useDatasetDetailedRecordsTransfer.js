import { useEffect, useState } from "react";
import {
  DATASET_DATA_MESSAGE,
  DATASET_READY_MESSAGE,
  PRELOADED_DATA_RETRY_TIME,
  PRELOADED_DATA_WAIT_TIME,
} from "../utils/datasetDetailedTableUtils";

/**
This hook tries to receive the detailed dataset records that are already loaded
 * in the main Results tab.
 *
 * This is faster than making another API request and avoids saving a large
 * amount of data in localStorage.
 *
 * The detailed-table page tells the original tab that it is ready.
 * The original tab then sends the records directly to this page.
 *
 * If the records are not received after a short wait, the page is allowed
 * to request them again from the Beacon API.
 */
export const useDatasetDetailedRecordsTransfer = ({
  queryId,
  setRecords,
  setLoading,
  setError,
}) => {
  /**
   * isWaitingForTransferredRecords:
   * The page is waiting for the original Results tab to send the records.
   *
   * hasTransferredRecords:
   * The records were successfully received from the original tab.
   *
   * shouldFetchRecords:
   * The transfer did not work, so the records must be requested from the API.
   */
  const [isWaitingForTransferredRecords, setIsWaitingForTransferredRecords] =
    useState(true);

  const [hasTransferredRecords, setHasTransferredRecords] = useState(false);
  const [shouldFetchRecords, setShouldFetchRecords] = useState(false);

  useEffect(() => {
    /**
     * Without a query ID, the page cannot identify the correct records.
     * It therefore skips the tab transfer and uses the API request instead.
     */
    if (!queryId) {
      setIsWaitingForTransferredRecords(false);
      setShouldFetchRecords(true);
      return undefined;
    }

    let retryRequestTimer;
    let fallbackRequestTimer;

    /**
     * Tell the original Results tab that this page is ready to receive the already-loaded records.
     */
    const requestRecordsFromOriginalTab = () => {
      if (!window.opener) return;

      window.opener.postMessage(
        {
          type: DATASET_READY_MESSAGE,
          queryId,
        },
        window.location.origin
      );
    };

    /**
     * Listen for the records sent by the original Results tab.
     *
     * The message is accepted only when:
     * - it comes from the same website;
     * - it contains the correct message type;
     * - it belongs to this page's query ID;
     * - the received table data is an array.
     */
    const handleTransferredRecords = (event) => {
      if (event.origin !== window.location.origin) return;

      const message = event.data;

      if (
        message?.type !== DATASET_DATA_MESSAGE ||
        message?.queryId !== queryId ||
        !Array.isArray(message.dataTable)
      ) {
        return;
      }

      // The records arrived, so the retry and API fallback are no longer needed.
      window.clearTimeout(retryRequestTimer);
      window.clearTimeout(fallbackRequestTimer);

      setRecords(message.dataTable);
      setHasTransferredRecords(true);
      setShouldFetchRecords(false);
      setIsWaitingForTransferredRecords(false);
      setLoading(false);
      setError("");
    };

    // Start listening before asking the original tab for the records.
    window.addEventListener("message", handleTransferredRecords);

    requestRecordsFromOriginalTab();

    /**
     * Ask one more time after a short delay.
     * This protects against the first message being sent before the original tab is ready to receive it.
     */
    retryRequestTimer = window.setTimeout(
      requestRecordsFromOriginalTab,
      PRELOADED_DATA_RETRY_TIME
    );

    /**
     * Allow the API fallback request when the original tab does not send the records within the expected time.
     */
    fallbackRequestTimer = window.setTimeout(() => {
      setIsWaitingForTransferredRecords(false);
      setShouldFetchRecords(true);
    }, PRELOADED_DATA_WAIT_TIME);

    /**
     * Stop listening and clear the timers when this page closes or when the query changes.
     */
    return () => {
      window.removeEventListener("message", handleTransferredRecords);
      window.clearTimeout(retryRequestTimer);
      window.clearTimeout(fallbackRequestTimer);
    };
  }, [queryId, setRecords, setLoading, setError]);

  return {
    isWaitingForTransferredRecords,
    hasTransferredRecords,
    shouldFetchRecords,
  };
};
