import { buildGenomicParams } from "./buildGenomicParams";
import { GENOMIC_LABELS_MAP } from "../genomicLabelHelper";

const MUTUALLY_EXCLUSIVE_GROUPS = {
  variantType: ["variantType"],
  alternateBases: ["alternateBases", "refBases", "altBases"],
  aminoacidChange: ["aminoacidChange", "refAa", "altAa", "aaPosition"],
};

const ALL_EXCLUSIVE_KEYS = new Set(
  Object.values(MUTUALLY_EXCLUSIVE_GROUPS).flat()
);

const hasValue = (value) =>
  value != null && (typeof value !== "string" || value.trim() !== "");

export const buildGenomicFilter = (
  selectedQueryType,
  values,
  selectedInput
) => {
  const normalizedValues = {
    ...values,
    chromosome: values.chromosome?.trim().toUpperCase() || "",
  };

  const queryParams = buildGenomicParams(
    selectedQueryType,
    normalizedValues,
    selectedInput
  );

  const allowedExclusiveKeys = new Set(
    MUTUALLY_EXCLUSIVE_GROUPS[selectedInput] || []
  );

  const validEntries = Object.entries(normalizedValues).filter(
    ([key, value]) =>
      hasValue(value) &&
      (selectedQueryType === "Sequence Query" ||
        !ALL_EXCLUSIVE_KEYS.has(key) ||
        !selectedInput ||
        allowedExclusiveKeys.has(key))
  );

  const idLabel = validEntries
    .map(([key, value]) => `${key}:${value}`)
    .join("-");

  const label = validEntries
    .map(([key, value]) => {
      const displayKey = GENOMIC_LABELS_MAP[key] || key;
      return `${displayKey}: ${value}`;
    })
    .join(" | ");

  return {
    id: `genomic-${selectedQueryType}-${idLabel}`,
    label,
    key: selectedQueryType,
    scope: "genomicQueryBuilder",
    bgColor: "genomic",
    type: "genomic",
    queryType: selectedQueryType,
    queryParams,
  };
};
