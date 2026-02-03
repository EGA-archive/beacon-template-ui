import { Box } from "@mui/material";

/**
 * Generic renderer for `info` objects.
 * - Skips ontology-only fields
 * - Prefers human-readable text
 * - One value → inline
 * - Multiple values → custom bullets
 * - Safe inside tables
 */
export default function InfoCell({ value }) {
  if (!value || typeof value !== "object") return "-";

  const isSkippableKey = (key) => key.toLowerCase().includes("ontologyTerm");

  const renderInline = (val) => {
    if (val == null) return null;

    // Prefer label / text explicitly
    if (typeof val === "object") {
      if (val.label) return val.label;
      if (val.text) return val.text;

      return Object.entries(val)
        .filter(([k]) => !isSkippableKey(k))
        .map(([_, v]) => renderInline(v))
        .filter(Boolean)
        .join(", ");
    }

    return String(val);
  };

  const renderList = (items) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      {items.map((item, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "flex-start" }}>
          <Box sx={{ width: 12, lineHeight: "14px" }}>•</Box>
          <Box sx={{ flex: 1 }}>{item}</Box>
        </Box>
      ))}
    </Box>
  );

  const renderValue = (val, forceList = false) => {
    if (Array.isArray(val)) {
      const items = val.map((v) => renderValue(v, false)).filter(Boolean);
      return renderList(items);
    }

    if (typeof val === "object") {
      const entries = Object.entries(val)
        .filter(([k]) => !isSkippableKey(k))
        .map(([k, v]) => {
          const rendered = renderInline(v);
          return rendered ? `${formatLabel(k)}: ${rendered}` : null;
        })
        .filter(Boolean);

      if (entries.length === 1 && !forceList) return entries[0];
      return renderList(entries);
    }

    return String(val);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {Object.entries(value).map(([key, val]) => {
        const rendered = renderValue(val);
        if (!rendered) return null;

        return (
          <Box key={key}>
            <b>{formatLabel(key)}:</b> <Box component="span">{rendered}</Box>
          </Box>
        );
      })}
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
