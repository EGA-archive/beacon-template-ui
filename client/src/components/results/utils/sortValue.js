export const getSortableValue = (value) => {
  const text = String(value ?? "");

  const genomicPosition = extractGenomicPosition(text);

  if (genomicPosition !== null) {
    return {
      type: "genomic",
      value: genomicPosition,
    };
  }

  const numericValue = Number(text);

  if (!Number.isNaN(numericValue) && text.trim() !== "") {
    return {
      type: "number",
      value: numericValue,
    };
  }

  return {
    type: "text",
    value: text.toLowerCase(),
  };
};

const extractGenomicPosition = (text) => {
  const match = text.match(/g\.(\d+)/i);

  if (!match) return null;

  return Number(match[1]);
};
