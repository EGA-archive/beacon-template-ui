import { Box } from "@mui/material";

/**
 * Renders Molecular Attributes in a flat, readable list.
 * - One bullet per attribute
 * - Prefers human-readable labels
 * - No nested bullets
 */
export default function MolecularAttributesCell({ value }) {
  if (!value || typeof value !== "object") return "-";

  const renderValue = (val) => {
    if (!Array.isArray(val)) return null;

    return val
      .map((item) => {
        if (item == null) return null;
        if (typeof item === "object") {
          return item.label || item.text || item.id || null;
        }
        return String(item);
      })
      .filter(Boolean)
      .join(", ");
  };

  const entries = Object.entries(value)
    .map(([key, val]) => {
      const rendered = renderValue(val);
      if (!rendered) return null;
      return `${formatLabel(key)}: ${rendered}`;
    })
    .filter(Boolean);

  if (entries.length === 0) return "-";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      {entries.map((entry, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "flex-start" }}>
          <Box sx={{ width: 12 }}>•</Box>
          <Box sx={{ flex: 1 }}>
            <b>{entry.split(":")[0]}:</b>
            {entry.slice(entry.indexOf(":") + 1)}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// Humanize keys
function formatLabel(key) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}
