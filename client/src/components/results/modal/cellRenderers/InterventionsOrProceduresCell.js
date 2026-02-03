import { Box } from "@mui/material";

export default function InterventionsOrProceduresCell({ value }) {
  if (!Array.isArray(value) || value.length === 0) {
    return "-";
  }
  const labels = value
    .map((entry) => entry?.procedureCode?.label)
    .filter(Boolean);
  if (labels.length === 0) return "-";
  if (labels.length === 1) {
    return <span>{labels[0]}</span>;
  }
  return (
    <Box component="ul" sx={{ pl: 2, m: 0 }}>
      {labels.map((label, idx) => (
        <li key={idx}>{label}</li>
      ))}
    </Box>
  );
}
