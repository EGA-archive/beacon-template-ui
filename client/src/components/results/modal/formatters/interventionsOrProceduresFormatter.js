export function formatInterventionsOrProcedures(value) {
  if (!Array.isArray(value) || value.length === 0) return "-";

  const labels = value
    .map((entry) => entry?.procedureCode?.label)
    .filter(Boolean);

  if (labels.length === 0) return "-";

  return labels.join("\n");
}
