/**
 * Builds a Beacon v2-compatible POST query object.
 * Supports both genomic and non-genomic filters.
 */
export const queryBuilder = (params = [], entryId) => {
  const genomicQuery = params.find((f) => f.type === "genomic");
  const nonGenomicFilters = params.filter((f) => f.type !== "genomic");

  const hasGenomicParams =
    genomicQuery?.queryParams &&
    Object.keys(genomicQuery.queryParams).length > 0;

  const queryBody = {
    filters: nonGenomicFilters.map((item) => {
      if (item.operator) {
        return {
          id: item.field,
          operator: item.operator,
          value: item.value,
        };
      } else {
        return {
          id: item.id,
          ...(item.scope ? { scope: item.scope } : {}),
        };
      }
    }),
    ...(hasGenomicParams
      ? { requestParameters: genomicQuery.queryParams }
      : {}),
    includeResultsetResponses: "HIT",
    pagination: { skip: 0, limit: 10 },
    testMode: false,
    requestedGranularity: "record",
  };

  const filter = {
    meta: { apiVersion: "2.0" },
    query: queryBody,
  };
  return filter;
};
