import { normalizeGenomicRequestParameters } from "../../genomic/utils/normalizeGenomicRequestParameters";

export const buildDetailedTableQuery = (selectedFilters = []) => {
  const query = {
    meta: {
      apiVersion: "2.0",
    },
    query: {
      includeResultsetResponses: "HIT",
      pagination: {
        skip: 0,
        limit: 100,
      },
      testMode: false,
      requestedGranularity: "record",
    },
  };

  const filters = [];
  let requestParameters = {};

  selectedFilters.forEach((filter) => {
    if (filter.queryParams) {
      requestParameters = {
        ...requestParameters,
        ...normalizeGenomicRequestParameters(filter.queryParams),
      };

      return;
    }

    if (filter.operator) {
      filters.push({
        id: filter.id,
        operator: filter.operator,
        value: filter.value,
      });

      return;
    }

    filters.push({
      id: filter.id,
      ...(filter.scope ? { scope: filter.scope } : {}),
    });
  });

  if (filters.length > 0) {
    query.query.filters = filters;
  }

  if (Object.keys(requestParameters).length > 0) {
    query.query.requestParameters = requestParameters;
  }

  return query;
};
