export function formatCaseLevelData(value) {
  if (!Array.isArray(value) || value.length === 0) return "-";

  const lines = value
    .map((entry) => {
      const sampleId = entry?.biosampleId;
      const zygosity = entry?.zygosity?.label;
      if (!sampleId || !zygosity) return null;
      return `${sampleId}: ${zygosity}`;
    })
    .filter(Boolean);

  return lines.length ? lines.join("\n") : "-";
}
