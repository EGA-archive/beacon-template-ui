import { useMemo } from "react";
import { getDatasetDetailedContext } from "../utils/datasetDetailedTableUtils";

/**
 * Resolves the detailed-table context from the URL and localStorage.
 */
export const useDatasetDetailedPageContext = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const urlBeaconId = searchParams.get("beaconId");
  const urlDatasetId = searchParams.get("datasetId");
  const urlEntryType = searchParams.get("entryType");
  const queryId = searchParams.get("queryId");

  const data = useMemo(() => getDatasetDetailedContext(queryId), [queryId]);

  const selectedFilters = useMemo(
    () => data.selectedFilters || [],
    [data.selectedFilters]
  );

  const selectedPathSegment =
    data.selectedPathSegment ||
    data.appliedQuery?.entryType ||
    urlEntryType ||
    "";

  return {
    queryId,
    data,
    selectedFilters,
    selectedPathSegment,
    targetBeaconId: data.beaconId || urlBeaconId,
    targetDatasetId: data.datasetId || urlDatasetId,
    entryTypeId:
      data.entryTypeId || data.appliedQuery?.entryType || urlEntryType || "",
  };
};
