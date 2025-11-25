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
    // console.log("Failed to parse item.info:", error);
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
