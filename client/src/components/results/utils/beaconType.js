export function getBeaconAggregationInfo(item) {
  const datasets = Array.isArray(item.items) ? item.items : [];
  const datasetCount = datasets.length;

  // 1. Record Beacon: real datasets present
  if (datasetCount > 0) {
    return { type: "record", datasetCount };
  }

  // 2. Count Beacon: no datasets, but resultsCount > 0
  const hasCount =
    typeof item.totalResultsCount === "number" && item.totalResultsCount > 0;

  if (hasCount) {
    return { type: "count", datasetCount: 0 };
  }

  // 3. Boolean Beacon: no datasets, no count, only boolean exists
  return { type: "boolean", datasetCount: 0 };
}

export function getDatasetType(ds) {
  // 1. Real dataset with identifier → Record Beacon dataset
  if (ds.dataset) {
    return "record";
  }

  // 2. Dataset-less count → Count Beacon dataset
  if (typeof ds.resultsCount === "number" && ds.resultsCount > 0) {
    return "count";
  }

  // 3. Dataset-less boolean → Boolean Beacon dataset
  return "boolean";
}
