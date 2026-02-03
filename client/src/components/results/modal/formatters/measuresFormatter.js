export function formatMeasures(value) {
  if (!Array.isArray(value) || value.length === 0) return "-";

  const lines = value
    .map((measure) => {
      const label = measure?.assayCode?.label;
      const rawValue = measure?.measurementValue?.value;
      const unitLabel = measure?.measurementValue?.unit?.label;
      const date = measure?.date;

      if (!label || rawValue == null) return null;

      const roundedValue =
        typeof rawValue === "number" ? rawValue.toFixed(2) : rawValue;

      return (
        `${label}: ${roundedValue}` +
        (unitLabel ? ` ${unitLabel}` : "") +
        (date ? ` (${date})` : "")
      );
    })
    .filter(Boolean);

  return lines.length ? lines.join("\n") : "-";
}
