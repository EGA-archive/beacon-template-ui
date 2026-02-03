import { Box } from "@mui/material";

/**
 * Renderer for `variation`
 * - Structured, readable, schema-aware
 * - Bulleted top-level attributes
 * - Nested interval rendered inline
 */
export default function VariationCell({ value }) {
  if (!value || typeof value !== "object") return "-";

  const bullets = [];

  // Location
  if (value.location) {
    const { type, sequence_id, interval } = value.location;

    if (type) {
      bullets.push(
        <Line
          key="location-type"
          label="Location type"
          value={humanize(type)}
        />
      );
    }

    if (sequence_id) {
      bullets.push(
        <Line key="sequence-id" label="Sequence Id" value={sequence_id} />
      );
    }

    if (interval?.start?.value != null && interval?.end?.value != null) {
      bullets.push(
        <Box key="interval">
          <b>Sequence interval:</b>
          <Box sx={{ pl: 2 }}>
            Start: {interval.start.value}
            <br />
            End: {interval.end.value}
          </Box>
        </Box>
      );
    }
  }

  // Bases + type
  if (value.alternateBases) {
    bullets.push(
      <Line key="alt" label="Alternate bases" value={value.alternateBases} />
    );
  }

  if (value.referenceBases) {
    bullets.push(
      <Line key="ref" label="Reference bases" value={value.referenceBases} />
    );
  }

  if (value.variantType) {
    bullets.push(
      <Line key="type" label="Variant type" value={value.variantType} />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      {bullets.map((item, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "flex-start" }}>
          <Box sx={{ width: 12 }}>•</Box>
          <Box sx={{ flex: 1 }}>{item}</Box>
        </Box>
      ))}
    </Box>
  );
}

function Line({ label, value }) {
  return (
    <Box>
      <b>{label}:</b> {value}
    </Box>
  );
}

function humanize(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}
