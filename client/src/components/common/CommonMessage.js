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
  invalidChromosome: "Invalid chromosome name in the query.",
  invalidBases: "Invalid DNA base. Only A, C, G, or T are allowed.",
  invalidFormat:
    "Unrecognized genomic query format. Please use 17-7674945-G-A or 17:7674945G>A",
};

// Reusable component to display messages (error or success)
export default function CommonMessage({ text, type }) {
  // Determine alert style based on message type
  const severity = type === "error" ? "error" : "success";

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
        sx={{ width: "80%", justifyContent: "center", alignItems: "center" }}
      >
        {text}
      </Alert>
    </Stack>
  );
}
