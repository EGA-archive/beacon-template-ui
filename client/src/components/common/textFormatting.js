/* Contains helpers and fixed values used in the app for data formatting and validation of certain biological codes.
 */

import { Tooltip, Box } from "@mui/material";
import config from "../../config/config.json";

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

// Combine config-defined order with the rest of the fetched entry types.
export const prioritizeEntries = (entries, configOrder = []) => {
  const prioritized = [
    ...configOrder
      .map((type) => entries.find((e) => e.pathSegment === type))
      .filter(Boolean),
    ...entries
      .filter((e) => !configOrder.includes(e.pathSegment))
      .sort((a, b) => a.pathSegment.localeCompare(b.pathSegment)),
  ];
  return prioritized;
};

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

// Underlined inline label with tooltip
export const GenomicQueryLabel = (
  <Tooltip
    component="ul"
    title={
      <Box
        sx={{
          pl: { xs: "5px", lg: "20px" },
          fontFamily: '"Open Sans", sans-serif',
        }}
      >
        <div>
          <li>
            Query for variants at a specific genomic location or within a
            defined region.
          </li>
        </div>
        <div>
          <li>
            {" "}
            Compile complex genomic queries using the{" "}
            <b>“Genomic Query Builder”</b>.
          </li>
        </div>
      </Box>
    }
    placement="top-start"
    arrow
    componentsProps={{
      tooltip: {
        sx: {
          backgroundColor: "#fff",
          color: "#000",
          border: "1px solid black",
          minWidth: {
            xs: "361px",
            sm: "400px",
          },
        },
      },
      arrow: {
        sx: {
          color: "#fff",
          "&::before": { border: "1px solid black" },
        },
      },
    }}
  >
    <Box
      component="span"
      sx={{
        textDecoration: "underline",
        fontWeight: 600,
      }}
    >
      Genomic Query
    </Box>
  </Tooltip>
);

export const FilteringTermsLabel = (
  <Tooltip
    component="ul"
    title={
      <Box
        sx={{
          pl: { xs: "5px", lg: "20px" },
          fontFamily: '"Open Sans", sans-serif',
        }}
      >
        <div>
          <li> Use filtering terms to refine Beacon responses.</li>
        </div>
        <div>
          <li>
            {" "}
            Review all filtering terms available across datasets in{" "}
            <b>“All Filtering Terms”</b>.
          </li>
        </div>
      </Box>
    }
    placement="top-start"
    arrow
    componentsProps={{
      tooltip: {
        sx: {
          backgroundColor: "#fff",
          color: "#000",
          border: "1px solid black",
          minWidth: {
            xs: "361px",
            sm: "400px",
          },
        },
      },
      arrow: {
        sx: {
          color: "#fff",
          "&::before": { border: "1px solid black" },
        },
      },
    }}
  >
    <Box
      component="span"
      sx={{
        textDecoration: "underline",
        fontWeight: 600,
      }}
    >
      Filtering Terms
    </Box>
  </Tooltip>
);
