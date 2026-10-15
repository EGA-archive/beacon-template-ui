export const GENOMIC_LABELS_MAP = {
  geneId: "Gene ID",
  assemblyId: "Assembly",
  chromosome: "Chromosome",
  start: "Start Position",
  end: "End Position",
  variantType: "Variant Type",
  alternateBases: "Alternate Bases",
  referenceBases: "Reference Bases",
  referenceName: "Chromosome",
  refBases: "Reference Bases",
  altBases: "Alternate Bases",
  aminoacidChange: "Amino Acid Change",
  refAa: "Reference AA",
  altAa: "Alternate AA",
  aaPosition: "AA Position",
  minVariantLength: "Min Variant Length",
  maxVariantLength: "Max Variant Length",
  genomicHGVSshortForm: "HGVS ID",
  genomicAlleleShortForm: "HGVS ID",
  startMin: "Start Min",
  startMax: "Start Max",
  endMin: "End Min",
  endMax: "End Max",
};

export const buildGenomicLabel = (queryParams = {}) => {
  return Object.entries(queryParams)
    .filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "")
    )
    .map(([key, value]) => {
      const displayKey = GENOMIC_LABELS_MAP[key] || key;

      return `${displayKey}: ${value}`;
    })
    .join(" | ");
};

export const buildSequenceQueryLabel = (queryParams = {}) => {
  const orderedKeys = [
    "assemblyId",
    "referenceName",
    "start",
    "alternateBases",
    "referenceBases",
  ];

  return orderedKeys
    .filter(
      (key) => queryParams[key] !== undefined && queryParams[key] !== null
    )
    .map((key) => {
      const normalizedKey = key === "referenceName" ? "chromosome" : key;
      const displayKey = GENOMIC_LABELS_MAP[normalizedKey] || normalizedKey;

      const rawValue = queryParams[key];
      const displayValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;

      return `${displayKey}: ${displayValue}`;
    })
    .join(" | ")
    .replace(/\|{2,}/g, "|")
    .replace(/\|\s*\|/g, "|")
    .replace(/\|\s+$/, "")
    .replace(/^\s+\|/, "");
};
