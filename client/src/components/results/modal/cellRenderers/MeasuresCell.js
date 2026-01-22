import { Box } from "@mui/material";

/**
 * Renders Measures in a strict, canonical format:
 * - One item → inline
 * - Multiple items → bullet list
 *
 * Format:
 * <b>Assay label</b>: value (2 decimals) unit label (date)
 */
export default function MeasuresCell({ value }) {
  if (!Array.isArray(value) || value.length === 0) return "-";

  const formatMeasure = (measure) => {
    const label = measure?.assayCode?.label;
    const rawValue = measure?.measurementValue?.value;
    const unitLabel = measure?.measurementValue?.unit?.label;
    const date = measure?.date;

    if (!label || rawValue == null) return null;

    const roundedValue =
      typeof rawValue === "number" ? rawValue.toFixed(2) : rawValue;

    return (
      <>
        <b>{label}</b>: {roundedValue}
        {unitLabel ? ` ${unitLabel}` : ""}
        {date ? ` (${date})` : ""}
      </>
    );
  };

  // Single measure → no bullets
  if (value.length === 1) {
    return <Box>{formatMeasure(value[0])}</Box>;
  }

  // Multiple measures → bullets
  return (
    <Box
      component="ul"
      sx={{ m: 0, listStyleType: "disc", listStylePosition: "inside" }}
    >
      {value.map((measure, index) => {
        const content = formatMeasure(measure);
        if (!content) return null;

        return <li key={index}>{content}</li>;
      })}
    </Box>
  );
}
