import config from "../../../config/config.json";

/**
 * Normalizes genomic coordinates before sending queries to the Beacon backend.
 *
 * Beacon backend ALWAYS expects 0-based coordinates.
 *
 * If the UI is configured as 1-based:
 * - subtract 1 from start/end coordinates
 *
 * If the UI is already 0-based:
 * - return params unchanged
 *
 * HGVS queries are intentionally ignored.
 */
export const normalizeGenomicRequestParameters = (requestParameters = {}) => {
  const is0Based = config.queryCoordinatesAre0Based ?? true;

  // UI already uses 0-based coordinates
  if (is0Based) {
    return requestParameters;
  }
  // Skip HGVS queries completely
  if (requestParameters.genomicAlleleShortForm) {
    return requestParameters;
  }

  const normalized = { ...requestParameters };

  const normalizeCoordinate = (value) => {
    // Array format: [100] or [100, 200]
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === "number" ? v - 1 : v));
    }

    // Single numeric value
    if (typeof value === "number") {
      return value - 1;
    }

    return value;
  };

  if (normalized.start !== undefined) {
    normalized.start = normalizeCoordinate(normalized.start);
  }

  if (normalized.end !== undefined) {
    normalized.end = normalizeCoordinate(normalized.end);
  }

  return normalized;
};
