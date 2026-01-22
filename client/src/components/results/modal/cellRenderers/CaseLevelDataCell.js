import { Box } from "@mui/material";
import { truncateCaseLevelData } from "../../utils/tableHelpers";

export default function CaseLevelDataCell({ value }) {
  if (!Array.isArray(value) || value.length === 0) return "-";

  const formatted = value
    .map((entry) => {
      const sampleId = entry?.biosampleId;
      const zygosity = entry?.zygosity?.label;
      if (!sampleId || !zygosity) return null;
      return `${sampleId}: ${zygosity}`;
    })
    .filter(Boolean);

  if (formatted.length === 0) return "-";

  const { entries, truncated } = truncateCaseLevelData(formatted, 20);

  // Single value → inline
  if (entries.length === 1) {
    return <Box sx={{ whiteSpace: "nowrap" }}>{entries[0]}</Box>;
  }

  return (
    <>
      {/* 3-column layout */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 16px",
          fontSize: "11px",
          width: "100%",
        }}
      >
        {entries.map((entry, i) => (
          <Box
            key={i}
            sx={{
              whiteSpace: "nowrap",
              flex: "0 0 calc(33.333% - 16px)",
              lineHeight: 1.3,
            }}
          >
            {entry}
            {truncated && i === entries.length - 1 ? " …" : ""}
          </Box>
        ))}
      </Box>

      {/* Truncation message */}
      {truncated && (
        <Box sx={{ mt: 0.5, fontSize: "11px" }}>
          <b>
            List truncated for readability. The complete set of case-level
            records is not shown.
          </b>
        </Box>
      )}
    </>
  );
}
