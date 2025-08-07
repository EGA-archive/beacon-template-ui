import { Box, Typography } from "@mui/material";
import config from "../../../config/config.json";
import GenomicInputBox from "../GenomicInputBox";
import { mainBoxTypography } from "../styling/genomicInputBoxStyling";

// This form is used when the user selects "Defined short variation (Sequence)"
// It collects basic info to describe a variation at a specific position on the genome
export default function DefinedVariationSequence() {
  return (
    <Box>
      {/* Wrapper Box for layout spacing */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        {/* Section title and explanation */}
        <Typography
          variant="h6"
          sx={{ ...mainBoxTypography, fontWeight: 700, fontSize: "14px" }}
        >
          Main Parameters
        </Typography>
        <Typography sx={mainBoxTypography}>
          You need to fill in the fields with a (*)
        </Typography>

        {/* Inputs are shown in a responsive grid (1 column on mobile, 2 on larger screens) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
            width: "100%",
          }}
        >
          {/* Optional: Assembly ID from config */}
          <GenomicInputBox
            name="assemblyId"
            label="Assembly ID"
            placeholder={config.assemblyId[0]}
            description={"Select your reference genome (Optional)"}
            options={config.assemblyId}
            required={false}
          />
          {/* Required: Chromosome where the variation occurs */}
          <GenomicInputBox
            name="chromosome"
            label="Chromosome"
            placeholder="ex. Chr 1 (NC_000001.11)"
            description={"Select the reference value:"}
            required={true}
          />
          {/* Required: Start position of the variation */}
          <GenomicInputBox
            name="start"
            label="Start"
            description="Single Value"
            placeholder="ex. 7572837"
            required={true}
          />
          {/* Required: Change in DNA bases, shown as two fields (ref and alt) */}
          <GenomicInputBox
            name="basesChange"
            label="Bases Change"
            required={true}
            customRefLabel="Reference Bases"
            customAltLabel="Alternate Bases"
            customRefPlaceholder="ex. T"
            customAltPlaceholder="ex. G"
            customPaddingTop="4%"
          />
        </Box>
      </Box>
    </Box>
  );
}
