import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

// Reusable messages used across the app
export const COMMON_MESSAGES = {
  noMatch: "No match found. Try another filter.",
  loadingTerms: "Loading filtering terms...",
  filteringResults: "Filtering results...",
  doubleFilter:
    "This filter is already in use. Choose another one to continue.",
  doubleValue:
    "This value is already in use. Please change it to a different one.",
  loadingData: "Loading data...",
  fillFields: "Please fill in all the fields",
  addFilter: "Please apply at least one filter to run this search.",
  singleGenomicQuery: "Only one genomic query can be added at a time.",
  incompleteFilter:
    "Please fill in the current filter value before adding a new one.",
  invalidGenomicQuery:
    "This search bar only supports single nucleotide variants (SNVs/SNPs). To search by gene, range, bracket or HGVS queries, use the Genomic Query Builder (link).",
  invalidFormat:
    "Unrecognized genomic query format. Please use 22-16050527-C-A or 22:16050527C>A",
};

// Reusable component to display messages (error or success)
export default function CommonMessage({ text, type }) {
  // Determine alert style based on message type
  const severity =
    type === "error" ? "error" : type === "warning" ? "error" : "success";

  const isWarning = type === "warning";

  return (
    <Stack
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      spacing={2}
    >
      <Alert
        severity={severity}
        sx={{
          width: "80%",
          justifyContent: "center",
          alignItems: "center",
          ...(isWarning && {
            backgroundColor: "#fdead5",
            color: "#2B2B2B",
          }),
        }}
      >
        {text}
      </Alert>
    </Stack>
  );
}
