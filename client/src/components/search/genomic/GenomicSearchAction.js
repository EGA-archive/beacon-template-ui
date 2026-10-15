import { Box } from "@mui/material";

export default function GenomicSearchAction({ action, hasEntryTypeSelector }) {
  if (!action) return null;

  return (
    <Box
      sx={{
        display: "none",
        justifyContent: "center",
        width: "100%",
        maxWidth: "220px",
        mx: "auto",
        mt: 1.5,

        "@media (max-width:870px)": {
          display: hasEntryTypeSelector ? "flex" : "none",
        },

        "@media (max-width:599px)": {
          display: "flex",
        },

        "& > *": {
          width: "100%",
        },

        "& .MuiButton-root": {
          width: "100%",
          whiteSpace: "nowrap",
        },
      }}
    >
      {action}
    </Box>
  );
}
