/**
 * Builds a Beacon v2-compatible POST query object.
 * Supports both genomic and non-genomic filters.
 */

import { normalizeGenomicRequestParameters } from "../../genomic/utils/normalizeGenomicRequestParameters";

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
          id: item.id,
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
    // ...(hasGenomicParams
    //   ? { requestParameters: genomicQuery.queryParams }
    //   : {}),
    ...(hasGenomicParams
      ? {
          // requestParameters: (() => {
          //   const { refAa, aaPosition, altAa, ...rest } =
          //     genomicQuery.queryParams;

          //   if (refAa && aaPosition && altAa) {
          //     return {
          //       ...rest,
          //       aminoacidChange: `${refAa}${aaPosition}${altAa}`,
          //     };
          //   }

          //   return genomicQuery.queryParams;
          // })(),

          // Adapted for 0-based vs 1-based
          requestParameters: (() => {
            const { refAa, aaPosition, altAa, ...rest } =
              genomicQuery.queryParams;

            const requestParams =
              refAa && aaPosition && altAa
                ? {
                    ...rest,
                    aminoacidChange: `${refAa}${aaPosition}${altAa}`,
                  }
                : genomicQuery.queryParams;

            return normalizeGenomicRequestParameters(requestParams);
          })(),
        }
      : {}),
    includeResultsetResponses: "HIT",
    pagination: {
      skip: 0,
      limit: 100,
    },
    testMode: false,
    requestedGranularity: "record",
  };

  const filter = {
    meta: { apiVersion: "2.0" },
    query: queryBody,
  };

  return filter;
};
