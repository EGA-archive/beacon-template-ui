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

// Format path segment into human-readable label
export const formatEntryLabel = (segment) => {
  if (!segment) return "Unknown";
  return segment === "g_variants" ? "Genomic Variants" : capitalize(segment);
};

// Order the entry types using the preferred config order
export const sortEntries = (entries, configOrder = []) =>
  configOrder?.length > 0 && entries.length > 1
    ? [...entries].sort(
        (a, b) =>
          configOrder.indexOf(a.pathSegment) -
          configOrder.indexOf(b.pathSegment)
      )
    : entries;

// Optional label override for single entry type layout
export const singleEntryCustomLabels = {
  g_variants: "Genomic Variants",
  individuals: "Individual Level Data",
  biosamples: "Biosamples",
  runs: "Runs",
  analyses: "Analysis",
  cohorts: "Cohorts",
  datasets: "Datasets",
};

// Descriptions for entry types (used in tooltips)
export const entryTypeDescriptions = {
  analyses: "query analysis metadata (e.g. analysis pipelines, methods)",
  biosamples: "query biosample data (e.g. histological samples)",
  cohorts: "query cohort-level data (e.g. shared traits, study groups)",
  datasets: "query datasets-level data (e.g. name, description)",
  g_variants: "query genomic variants across a population",
  individuals: "query individual-level data (e.g. phenotypes, treatment)",
  runs: "query sequencing run details (e.g. platform, run date)",
};
