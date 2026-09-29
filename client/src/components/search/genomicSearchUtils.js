import { COMMON_MESSAGES } from "../common/CommonMessage";

const IUPAC_BASE_CLASS = "ACGTRYSWKMBDHVN";
const IUPAC_BASE_PATTERN = new RegExp(`^[${IUPAC_BASE_CLASS}]+$`, "i");

/**
 * Detects and normalizes a Sequence Query.
 */
export const detectAndCleanVariant = (
  input = "",
  assemblies = [],
  chromosomeLibrary = []
) => {
  if (!input?.trim()) {
    return {
      isVariant: false,
      cleanedValue: "",
      detectedAssembly: null,
    };
  }

  let value = input.trim();
  let detectedAssembly = null;

  // Detect and remove assembly ID from the query.
  for (const assembly of assemblies) {
    const assemblyRegex = new RegExp(
      `(?:\\s|\\||-|_)*${assembly.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "i"
    );

    if (assemblyRegex.test(value)) {
      detectedAssembly = assembly;
      value = value.replace(assemblyRegex, "").trim();
      break;
    }
  }

  // Normalize common Sequence Query formats.
  value = value
    .replace(/^chr/i, "")
    .replace(/\s+/g, "-")
    .replace(/:/g, "-")
    .replace(/>/g, "-")
    .replace(/\./g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Handle formats such as 22-16050527G-A.
  const stuckBaseRegex = new RegExp(
    `(\\d+)([${IUPAC_BASE_CLASS}]+)-([${IUPAC_BASE_CLASS}]+)$`,
    "i"
  );

  value = value.replace(stuckBaseRegex, "$1-$2-$3");

  const parts = value.split("-");

  if (parts.length !== 4) {
    return {
      isVariant: false,
      cleanedValue: value,
      detectedAssembly,
    };
  }

  const [chromosome, position, referenceBases, alternateBases] = parts;

  const normalizedChromosome = chromosome.replace(/^chr/i, "").toUpperCase();

  const allowedChromosomes = chromosomeLibrary.map((item) =>
    String(item).replace(/^chr/i, "").toUpperCase()
  );

  const chromosomeIsValid =
    allowedChromosomes.length === 0 ||
    allowedChromosomes.includes(normalizedChromosome);

  const positionIsValid = /^\d+$/.test(position);

  const referenceIsValid = IUPAC_BASE_PATTERN.test(referenceBases);
  const alternateIsValid = IUPAC_BASE_PATTERN.test(alternateBases);

  const isVariant =
    chromosomeIsValid &&
    positionIsValid &&
    referenceIsValid &&
    alternateIsValid;

  const cleanedValue = [
    normalizedChromosome,
    position,
    referenceBases.toUpperCase(),
    alternateBases.toUpperCase(),
  ].join("-");

  return {
    isVariant,
    cleanedValue,
    detectedAssembly,
  };
};

/**
 * Checks whether the user may still be typing a Sequence Query.
 */
export const isPossibleSequenceQuery = (input = "", chromosomeLibrary = []) => {
  const value = input.trim();

  if (!value) return false;

  const chromosomes = chromosomeLibrary
    .map((chromosome) =>
      String(chromosome)
        .replace(/^chr/i, "")
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    )
    .filter(Boolean);

  if (chromosomes.length === 0) return false;

  const chromosomePattern = chromosomes.join("|");

  const possibleSequenceRegex = new RegExp(
    `^(?:CHR)?(?:${chromosomePattern})(?:$|[-:]|\\s)`,
    "i"
  );

  return possibleSequenceRegex.test(value);
};

/**
 * Validates an already-normalized Sequence Query.
 */
export const validateGenomicVariant = (
  cleanedValue,
  chromosomeLibrary = []
) => {
  const [chromosome, position, referenceBases, alternateBases] =
    cleanedValue.split("-");

  if (!chromosome || !position || !referenceBases || !alternateBases) {
    return COMMON_MESSAGES.invalidGenomicQuery;
  }

  const allowedChromosomes = chromosomeLibrary.map((item) =>
    String(item).replace(/^chr/i, "").toUpperCase()
  );

  const normalizedChromosome = chromosome.replace(/^chr/i, "").toUpperCase();

  if (
    allowedChromosomes.length > 0 &&
    !allowedChromosomes.includes(normalizedChromosome)
  ) {
    return COMMON_MESSAGES.invalidGenomicQuery;
  }

  if (!/^\d+$/.test(position)) {
    return COMMON_MESSAGES.invalidGenomicQuery;
  }

  if (
    !IUPAC_BASE_PATTERN.test(referenceBases) ||
    !IUPAC_BASE_PATTERN.test(alternateBases)
  ) {
    return COMMON_MESSAGES.invalidGenomicQuery;
  }

  return null;
};

export const GENOMIC_QUERY_BUILDER_OPTIONS = [
  {
    configKey: "geneId",
    ctaLabel: "Gene ID",
    warningLabel: "gene",
  },
  {
    configKey: "rangeQuery",
    ctaLabel: "Range",
    warningLabel: "range",
  },
  {
    configKey: "bracketQuery",
    ctaLabel: "Bracket",
    warningLabel: "bracket",
  },
  {
    configKey: "hgvsQuery",
    ctaLabel: "HGVS",
    warningLabel: "HGVS",
  },
];

export const STRING_QUERY_OPTIONS = [
  {
    configKey: "geneId",
    queryType: "Gene ID",
    label: "Gene ID",
  },
  {
    configKey: "hgvsQuery",
    queryType: "Genomic Allele Query (HGVS)",
    label: "HGVS ID",
  },
];

export const getGenomicInputExamples = (example) => {
  if (!example) return [];

  const { referenceName, position, referenceBases, alternateBases } = example;

  if (
    !referenceName ||
    position === undefined ||
    !referenceBases ||
    !alternateBases
  ) {
    return [];
  }

  return [
    `${referenceName}-${position}-${referenceBases}-${alternateBases}`,
    `${referenceName}:${position}${referenceBases}>${alternateBases}`,
  ];
};

export const formatQueryList = (labels = []) => {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) {
    return `${labels[0]} or ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")} or ${labels.at(-1)}`;
};

export const buildGenomicFilterId = (queryType, queryParams = {}) => {
  const idLabel = Object.entries(queryParams)
    .filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "")
    )
    .map(([key, value]) => `${key}:${value}`)
    .join("-");

  return `genomic-${queryType}-${idLabel}`;
};
