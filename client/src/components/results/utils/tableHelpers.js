/**
 * Parses and cleans JSON-like string values safely.
 * Returns null if parsing fails.
 */
export function cleanAndParseInfo(infoString) {
  try {
    if (typeof infoString !== "string") return null;

    const cleaned = infoString.replace(/"|"/g, '"');
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
}

/**
 * Recursively summarizes nested or complex values
 * (arrays, objects, labels, ids) into readable strings for table display.
 */
export function summarizeValue(value) {
  if (value == null) return "-";

  if (Array.isArray(value)) {
    return value.map((el) => summarizeValue(el)).join(", ");
  }

  if (typeof value === "object") {
    if (value.label) return value.label;
    if (value.id) return value.id;

    const nestedValues = Object.values(value)
      .map((v) => summarizeValue(v))
      .filter(Boolean);

    return nestedValues.length ? nestedValues.join(", ") : "-";
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return "-";
}

/**
 * Formats camelCase or PascalCase strings into readable labels.
 * Example: "geographicOrigin" → "Geographic Origin"
 */
export function formatHeaderName(header) {
  const withSpaces = header.replace(/([A-Z])/g, " $1");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Truncates long case-level data to avoid layout issues in the modal table.
 */
export function truncateCaseLevelData(value, limit = 20) {
  if (value == null) {
    return { entries: [], truncated: false };
  }

  // Normalize input to array of strings
  const entries = Array.isArray(value)
    ? value.map((v) => summarizeValue(v)).filter(Boolean)
    : [summarizeValue(value)].filter(Boolean);

  if (entries.length <= limit) {
    return {
      entries,
      truncated: false,
    };
  }

  return {
    entries: entries.slice(0, limit),
    truncated: true,
    total: entries.length,
  };
}
