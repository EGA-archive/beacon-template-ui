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
  if (!ds) return "unavailable";

  const hasCount = typeof ds.resultsCount === "number";
  const hasResults = Array.isArray(ds.results);
  const hasNonEmptyResults = hasResults && ds.results.length > 0;

  // CASE 1: exists only → Boolean
  if (!hasCount && !hasResults && ds.exists === true) {
    return "boolean";
  }

  // CASE 2: exists + id only → Boolean
  if (!hasCount && !hasResults && ds.id && ds.exists === true) {
    return "boolean";
  }

  // CASE 3: exists + resultsCount only → Count
  if (hasCount && !hasResults) {
    return "count";
  }

  // CASE 4: exists + resultsCount + empty results → Count
  if (hasCount && hasResults && !hasNonEmptyResults) {
    return "count";
  }

  // CASE 5: exists + resultsCount + filled results → Record
  if (hasCount && hasNonEmptyResults) {
    return "record";
  }

  return "unavailable";
}
