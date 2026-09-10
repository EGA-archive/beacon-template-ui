import { Box } from "@mui/material";
import { highlightText } from "../../utils/highlightText";

export default function InterventionsOrProceduresCell({ value, searchTerm }) {
  if (!Array.isArray(value) || value.length === 0) {
    return "-";
  }

  const labels = value
    .map((entry) => entry?.procedureCode?.label)
    .filter(Boolean);

  if (labels.length === 0) return "-";

  if (labels.length === 1) {
    return <span>{highlightText(labels[0], searchTerm)}</span>;
  }

  return (
    <Box component="ul" sx={{ pl: 2, m: 0 }}>
      {labels.map((label, idx) => (
        <li key={idx}>{highlightText(label, searchTerm)}</li>
      ))}
    </Box>
  );
}
