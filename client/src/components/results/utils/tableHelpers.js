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
  if (value == null) return "-";

  // Case 1: array of case-level entries (most common)
  if (Array.isArray(value)) {
    const formattedEntries = value
      .map((entry) => summarizeValue(entry))
      .filter(Boolean);

    if (formattedEntries.length <= limit) {
      return formattedEntries.join(", ");
    }

    return (
      <>
        {formattedEntries.slice(0, limit).join(", ")} … ( +
        {formattedEntries.length - limit} more)
        <br></br>
        <b>
          List truncated for readability. The complete set of case-level records
          is not shown.
        </b>
      </>
    );
  }

  // Case 2: single value (string/number/object)
  const summarized = summarizeValue(value);

  if (typeof summarized !== "string") {
    return summarized;
  }

  const parts = summarized
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length <= limit) {
    return parts.join(", ");
  }

  return (
    <>
      {parts.slice(0, limit).join(", ")} … ( +{parts.length - limit} more){" "}
      <br></br>
      <b>
        List truncated for readability. The complete set of case-level records
        is not shown.
      </b>
    </>
  );
}
