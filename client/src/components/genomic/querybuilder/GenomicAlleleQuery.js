import { Box, Typography } from "@mui/material";
import GenomicInputBox from "../GenomicInputBox";
import { mainBoxTypography } from "../styling/genomicInputBoxStyling";

// This form is used when the user selects "Genomic Allele Query (HGVS)"
// It displays a single required field: the HGVS short form input
export default function GenomicAlleleQuery() {
  return (
    // Outer container for spacing and layout
    <Box>
      {/* Inner layout box to define spacing and flex structure */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 6, // Space between columns (if more were added)
          width: "100%",
        }}
      >
        {/* This form only has one full-width section */}
        <Box sx={{ width: "100%" }}>
          {/* Title shown above the input field */}
          <Typography
            variant="h6"
            sx={{
              ...mainBoxTypography,
              mt: 0,
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Main Parameters
          </Typography>

          {/* Informational text for the user */}
          <Typography
            sx={{
              ...mainBoxTypography,
              mt: 0,
            }}
          >
            Required (*)
          </Typography>

          {/* Single required input field: HGVS short form */}
          <GenomicInputBox
            name="genomicHGVSshortForm" // Key used in Formik values
            label="Genomic HGVS short form" // Label shown to the user
            placeholder="ex. NM_004006.2:c.4375C>T" // Hint text
            required={true} // Marked as required in validation
          />
        </Box>
      </Box>
    </Box>
  );
}
