export function formatMolecularAttributes(value) {
  if (!value || typeof value !== "object") return "-";

  const formatLabel = (key) =>
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/^./, (c) => c.toUpperCase());

  const renderValue = (val) => {
    if (!Array.isArray(val)) return null;

    const items = val
      .map((item) => {
        if (item == null) return null;
        if (typeof item === "object") {
          return item.label || item.text || item.id || null;
        }
        return String(item);
      })
      .filter(Boolean);

    return items.length ? items.join(", ") : null;
  };

  const lines = Object.entries(value)
    .map(([key, val]) => {
      const rendered = renderValue(val);
      return rendered ? `${formatLabel(key)}: ${rendered}` : null;
    })
    .filter(Boolean);

  return lines.length ? lines.join("\n") : "-";
}
