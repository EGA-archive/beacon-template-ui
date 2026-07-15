import { useEffect, useState } from "react";
import {
  DATASET_DATA_MESSAGE,
  DATASET_READY_MESSAGE,
  PRELOADED_DATA_RETRY_TIME,
  PRELOADED_DATA_WAIT_TIME,
} from "../utils/datasetDetailedTableUtils";

/**
 * Receives already-loaded detailed records from the main results table.
 * Falls back to an API request when the main results table cannot provide them.
 */
export const useDatasetRecordsTransfer = ({
  queryId,
  setDataTable,
  setLoading,
  setFetchError,
}) => {
  const [waitingForTransfer, setWaitingForTransfer] = useState(true);
  const [receivedPreloadedData, setReceivedPreloadedData] = useState(false);
  const [shouldFetchFallback, setShouldFetchFallback] = useState(false);

  useEffect(() => {
    if (!queryId) {
      setWaitingForTransfer(false);
      setShouldFetchFallback(true);
      return undefined;
    }

    let retryTimer;
    let fallbackTimer;

    const notifyOriginalTab = () => {
      if (!window.opener) return;

      window.opener.postMessage(
        {
          type: DATASET_READY_MESSAGE,
          queryId,
        },
        window.location.origin
      );
    };

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      const message = event.data;

      if (
        message?.type !== DATASET_DATA_MESSAGE ||
        message?.queryId !== queryId ||
        !Array.isArray(message.dataTable)
      ) {
        return;
      }

      window.clearTimeout(retryTimer);
      window.clearTimeout(fallbackTimer);

      setDataTable(message.dataTable);
      setReceivedPreloadedData(true);
      setShouldFetchFallback(false);
      setWaitingForTransfer(false);
      setLoading(false);
      setFetchError("");
    };

    window.addEventListener("message", handleMessage);

    notifyOriginalTab();

    retryTimer = window.setTimeout(
      notifyOriginalTab,
      PRELOADED_DATA_RETRY_TIME
    );

    fallbackTimer = window.setTimeout(() => {
      setWaitingForTransfer(false);
      setShouldFetchFallback(true);
    }, PRELOADED_DATA_WAIT_TIME);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(retryTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [queryId, setDataTable, setLoading, setFetchError]);

  return {
    waitingForTransfer,
    receivedPreloadedData,
    shouldFetchFallback,
  };
};
