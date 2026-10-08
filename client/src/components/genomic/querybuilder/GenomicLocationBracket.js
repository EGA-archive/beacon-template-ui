import { Box, Typography } from "@mui/material";
import config from "../../../config/runtimeConfig";
import GenomicInputBox from "../GenomicInputBox";
import { mainBoxTypography } from "../styling/genomicInputBoxStyling";

/**
 * GenomicLocationBracket
 *
 * Renders the Genomic Query Builder form used for approximate genomic
 * locations using bracket coordinates.
 *
 * Primary responsibilities:
 * - Require Assembly ID, Chromosome, and Bracket Position.
 * - Allow the user to optionally specify a Variant Type.
 * - Present required and optional parameters in separate responsive columns.
 */
export default function GenomicLocationBracket() {
  return (
    <Box>
      {/* Main responsive layout: required parameters on the left,
          optional parameters on the right */}
      <Box
        sx={{
          mt: 0,
          display: "flex",
          gap: 6,
          width: "100%",
          "@media (max-width: 734px)": {
            flexDirection: "column",
          },
        }}
      >
        {/* Required genomic location parameters */}
        <Box
          sx={{
            width: "60%",
            "@media (max-width: 734px)": {
              width: "100%",
            },
          }}
        >
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

          <Typography
            sx={{
              ...mainBoxTypography,
              mt: 0,
            }}
          >
            Required (*)
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Reference genome assembly and chromosome */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: "120px" }}>
                <GenomicInputBox
                  name="assemblyId"
                  label="Assembly ID"
                  options={config.assemblyId}
                  placeholder="Select Assembly ID"
                  required
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: "120px" }}>
                <GenomicInputBox
                  name="chromosome"
                  label="Chromosome"
                  placeholder="ex. 22"
                  required
                />
              </Box>
            </Box>

            {/* Approximate genomic start/end position range */}
            <GenomicInputBox
              name="braketRangeFields"
              label="Bracket Position"
              isDisabled={false}
              required
            />
          </Box>
        </Box>

        {/* Optional query parameters */}
        <Box
          sx={{
            width: "40%",
            "@media (max-width: 734px)": {
              width: "100%",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              ...mainBoxTypography,
              mt: 0,
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Optional Parameters
          </Typography>

          <Typography
            sx={{
              ...mainBoxTypography,
              mt: 0,
            }}
          >
            You can add the Variant Type:
          </Typography>

          {/* Optional Variant Type filter */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="variantType"
                label="Variant Type"
                description="Select the Variant Type"
                placeholder="Select Variant Type"
                options={config.variantType}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
