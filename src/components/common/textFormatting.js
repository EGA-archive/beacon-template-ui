/* Contains helpers and fixed values used in the app for data formatting and validation of certain biological codes.
 */

// Capitalizes the first letter of a word and makes the rest lowercase
export function capitalize(word) {
  return word?.charAt(0).toUpperCase() + word?.slice(1).toLowerCase();
}

// Maps URL path segments to their corresponding entry type IDs
export const PATH_SEGMENT_TO_ENTRY_ID = {
  individuals: "individual",
  biosamples: "biosample",
  cohorts: "cohort",
  datasets: "dataset",
  g_variants: "genomicVariant",
  analysis: "analysis",
  runs: "run",
};

// List of valid single-letter amino acid codes (plus "*" for stop)
export const VALID_SINGLE_CODES = [
  "A",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "K",
  "L",
  "M",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "V",
  "W",
  "Y",
  "X",
  "*",
];

// List of valid three-letter amino acid codes
export const VALID_THREE_LETTER = [
  "Ala",
  "Cys",
  "Asp",
  "Glu",
  "Phe",
  "Gly",
  "His",
  "Ile",
  "Lys",
  "Leu",
  "Met",
  "Asn",
  "Pro",
  "Gln",
  "Arg",
  "Ser",
  "Thr",
  "Val",
  "Trp",
  "Tyr",
  "Ter",
];
