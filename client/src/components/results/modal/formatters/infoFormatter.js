export function formatInfo(value) {
  if (!value || typeof value !== "object") return "-";

  const isSkippableKey = (key) => key.toLowerCase().includes("ontologyterm");

  const formatLabel = (key) =>
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/^./, (c) => c.toUpperCase());

  const renderInline = (val) => {
    if (val == null) return null;

    if (typeof val === "object") {
      if (val.label) return val.label;
      if (val.text) return val.text;

      return Object.entries(val)
        .filter(([k]) => !isSkippableKey(k))
        .map(([, v]) => renderInline(v))
        .filter(Boolean)
        .join(", ");
    }

    return String(val);
  };

  const renderValue = (val) => {
    if (Array.isArray(val)) {
      return val
        .map((v) => renderValue(v))
        .filter(Boolean)
        .join("\n");
    }

    if (typeof val === "object") {
      return Object.entries(val)
        .filter(([k]) => !isSkippableKey(k))
        .map(([k, v]) => {
          const rendered = renderInline(v);
          return rendered ? `${formatLabel(k)}: ${rendered}` : null;
        })
        .filter(Boolean)
        .join("\n");
    }

    return String(val);
  };

  const lines = Object.entries(value)
    .map(([key, val]) => {
      const rendered = renderValue(val);
      if (!rendered) return null;

      if (!rendered.includes("\n")) {
        return `${formatLabel(key)}: ${rendered}`;
      }

      return `${formatLabel(key)}:\n${rendered}`;
    })
    .filter(Boolean);

  return lines.length ? lines.join("\n") : "-";
}
