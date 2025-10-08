import { Box, Typography } from "@mui/material";
import config from "../../../config/config.json";
import GenomicInputBox from "../GenomicInputBox";
import { mainBoxTypography } from "../styling/genomicInputBoxStyling";

// This form is used when the user selects "Genetic location approx (Bracket)"
// It shows fields for approximate start/end location and other optional filters
export default function GenomicLocationBracket() {
  return (
    <Box>
      {/* Main layout: two columns (left for required, right for optional fields) */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 6,
          width: "100%",
          "@media (max-width: 734px)": {
            flexDirection: "column",
          },
        }}
      >
        {/* LEFT COLUMN: Required Fields */}
        <Box
          sx={{
            width: "60%",
            "@media (max-width: 734px)": {
              width: "100%",
            },
          }}
        >
          {/* Section title and guidance text */}
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

          {/* Required inputs: Assembly, Chromosome, Start, End */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Assembly ID and Chromosome */}
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
                  placeholder="ex. Chr 1 (NC_000001.11)"
                  required
                />
              </Box>
            </Box>

            {/* Approximate position range */}
            {/* <GenomicInputBox
              name="start"
              label="Start Braket"
              placeholder="ex. 5000000"
              required
              endAdornmentLabel="(Min)"
            />
            <GenomicInputBox
              name="end"
              label="End Braket"
              placeholder="ex. 7676592"
              required
              endAdornmentLabel="(Min)"
            /> */}

            <GenomicInputBox
              name="braketRangeFields"
              label="Bracket Position"
              isDisabled={false}
              required
            />
          </Box>
        </Box>

        {/* RIGHT COLUMN: Optional Fields */}
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
            You can add the Variant Length:
          </Typography>

          {/* Optional: Variation Type dropdown */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="variationType"
                label="Variation Type"
                description="Select the Variation Type"
                placeholder="Select Variation Type"
                options={config.variationType}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
