export function getBeaconAggregationInfo(item) {
  const datasets = Array.isArray(item.items) ? item.items : [];
  const datasetCount = datasets.length;

  // Aggregate all visibility types exposed by the datasets.
  if (datasetCount > 0) {
    const types = [
      ...new Set(
        datasets.map(getDatasetType).filter((type) => type !== "unavailable")
      ),
    ];

    return { types, datasetCount };
  }

  // No datasets, but a result count is available.
  const hasCount =
    typeof item.totalResultsCount === "number" && item.totalResultsCount > 0;

  if (hasCount) {
    return { types: ["count"], datasetCount: 0 };
  }

  // No datasets or count, so this is a boolean response.
  return { types: ["boolean"], datasetCount: 0 };
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

export function getDatasetResponse(ds) {
  if (typeof ds.resultsCount === "number" && ds.resultsCount > 0) {
    return ds.resultsCount;
  }
  return "Yes";
}
